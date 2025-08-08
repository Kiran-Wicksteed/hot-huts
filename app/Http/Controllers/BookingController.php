<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\EventOccurrence;
use App\Models\Service;
use App\Models\Timeslot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Shaz3e\PeachPayment\Helpers\PeachPayment;

class BookingController extends Controller
{
    /* --------------------------------------------------- show */
    public function show(Booking $booking)
    {
        $booking->load([
            'services',
            'timeslot.schedule.location',
            'eventOccurrence.location',
            'user',
        ]);

        return Inertia::render('Booking/ConfirmedPage', [
            'booking' => $booking,
        ]);
    }

    /* --------------------------------------------------- store */
    public function store(Request $request)
    {
        /* 1. Validate -------------------------------------------------- */
        $data = $request->validate([
            'booking_type'        => ['required', 'in:sauna,event'],
            'timeslot_id'         => ['required', 'exists:timeslots,id'],
            'event_occurrence_id' => ['nullable', 'exists:event_occurrences,id', 'required_if:booking_type,event'],
            'people'              => ['required', 'integer', 'between:1,8'],
            'services'            => ['array'],
            'services.*'          => ['integer', 'min:0'],
        ]);

        /* 2. Transaction: lock capacity & build booking ---------------- */
        $booking = DB::transaction(function () use ($data) {

            /* 2A. Lock & capacity checks ------------------------------ */
            $slot = Timeslot::lockForUpdate()->find($data['timeslot_id']);

            $slotBooked = $slot->bookings()->sum('people');
            if ($slotBooked + $data['people'] > $slot->capacity) {
                abort(409, 'Chosen sauna slot is already full.');
            }

            if ($data['booking_type'] === 'event') {
                $occ = EventOccurrence::lockForUpdate()->find($data['event_occurrence_id']);

                if (!$occ->is_active) {
                    abort(409, 'Event is no longer bookable.');
                }

                $occBooked = $occ->bookings()->sum('people');
                $occCap    = $occ->effective_capacity ?? 8;

                if ($occBooked + $data['people'] > $occCap) {
                    abort(409, 'Event capacity reached.');
                }
            }

            /* 2B. Create booking header ------------------------------ */
            $booking = Booking::create([
                'user_id'             => Auth::id(),
                'timeslot_id'         => $slot->id,
                'event_occurrence_id' => $data['booking_type'] === 'event'
                    ? $occ->id
                    : null,
                'people'   => $data['people'],
                'status'   => 'pending',
                'amount'   => 0, // update below
            ]);

            $total = 0;

            /* 2C. Main line item ------------------------------------- */
            if ($data['booking_type'] === 'sauna') {
                $sessionSvc = Service::where('code', 'SAUNA_SESSION')->firstOrFail();
                $line = $data['people'] * $sessionSvc->price;

                $booking->services()->attach($sessionSvc->id, [
                    'quantity'   => $data['people'],
                    'price_each' => $sessionSvc->price,
                    'line_total' => $line,
                ]);

                $total += $line;
            } else { // event package (price stored on occurrence)
                $pkgSvc = Service::where('code', 'EVENT_PACKAGE')->firstOrFail();
                $line   = $data['people'] * $occ->effective_price;

                $booking->services()->attach($pkgSvc->id, [
                    'quantity'   => $data['people'],
                    'price_each' => $occ->effective_price,
                    'line_total' => $line,
                    'meta'       => json_encode(['event_occurrence_id' => $occ->id]),
                ]);

                $total += $line;
            }

            /* 2D. Add‑ons ------------------------------------------- */
            foreach ($data['services'] ?? [] as $code => $qty) {
                if ($qty < 1) continue;

                $svc  = Service::where('code', $code)->firstOrFail();
                $line = $qty * $svc->price;

                $booking->services()->attach($svc->id, [
                    'quantity'   => $qty,
                    'price_each' => $svc->price,
                    'line_total' => $line,
                ]);

                $total += $line;
            }

            $booking->update(['amount' => $total]);

            return $booking;
        });

        /* 3. Peach Payment checkout ---------------------------------- */
        $peach   = new PeachPayment();
        $entity  = config('peach-payment.entity_id');
        $cbUrl   = 'order/callback';

        $checkout = $peach->createCheckout($booking->amount, $cbUrl);

        $booking->update(['peach_payment_checkout_id' => $checkout['checkoutId']]);

        return Inertia::render('Payment/RedirectToGateway', [
            'entityId'          => $entity,
            'checkoutId'        => $checkout['checkoutId'],
            'checkoutScriptUrl' =>
            config('peach-payment.' . config('peach-payment.environment') . '.embedded_checkout_url'),
        ]);
    }
}
