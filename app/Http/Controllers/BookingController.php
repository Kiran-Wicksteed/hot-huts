<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\EventOccurrence;
use App\Models\Service;
use App\Models\Timeslot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
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
        /* ---------- 1. Validate ------------------------------------------------ */
        $data = $request->validate([
            'booking_type'        => ['required', Rule::in(['sauna', 'event'])],
            'timeslot_id'         => ['required', 'exists:timeslots,id'], // always
            'event_occurrence_id' => [
                'nullable',
                'required_if:booking_type,event',
                'exists:event_occurrences,id',
            ],
            'people'       => ['required', 'integer', 'between:1,8'],
            'services'     => ['array'],
            'services.*'   => ['integer', 'min:0'],
        ]);

        /* ---------- 2. Lock core records & basic capacity checks --------------- */
        $slot = Timeslot::lockForUpdate()->findOrFail($data['timeslot_id']);

        $occ = null;
        if ($data['booking_type'] === 'event') {
            $occ = EventOccurrence::with('event')
                ->lockForUpdate()
                ->findOrFail($data['event_occurrence_id']);

            // Guard against missing price (accessor never returns null, but belt-and-braces)
            if (! $occ->effective_price) {
                abort(500, "Price missing for event occurrence #{$occ->id}");
            }
        }

        /* slot capacity */
        $slotBooked = $slot->bookings()->sum('people');
        if ($slotBooked + $data['people'] > $slot->capacity) {
            abort(409, 'Chosen sauna slot is already full.');
        }

        /* event capacity */
        if ($occ) {
            if (! $occ->is_active) {
                abort(409, 'Event is no longer bookable.');
            }

            $occBooked = $occ->bookings()->sum('people');
            $occCap    = $occ->effective_capacity ?? 8;

            if ($occBooked + $data['people'] > $occCap) {
                abort(409, 'Event capacity reached.');
            }
        }

        /* ---------- 3. Build booking inside a transaction ---------------------- */
        $booking = DB::transaction(function () use ($data, $slot, $occ) {

            /* 3A. header -------------------------------------------------------- */
            $booking = Booking::create([
                'user_id'             => Auth::id(),
                'timeslot_id'         => $slot->id,
                'event_occurrence_id' => $occ?->id,
                'people'              => $data['people'],
                'status'              => 'pending',
                'amount'              => 0, // updated below
            ]);

            $total = 0;

            /* 3B. main line item ----------------------------------------------- */
            if ($data['booking_type'] === 'sauna') {
                $sessionSvc = Service::whereCode('SAUNA_SESSION')->firstOrFail();
                $priceEach  = $sessionSvc->price_cents;                 // cents
                $line       = $data['people'] * $priceEach;

                $booking->services()->attach($sessionSvc->id, [
                    'quantity'   => $data['people'],
                    'price_each' => $priceEach,
                    'line_total' => $line,
                ]);

                $total += $line;
            } else { // event bundle
                $pkgSvc   = Service::whereCode('EVENT_PACKAGE')->firstOrFail();
                $priceEach = $occ->effective_price;               // cents
                $line      = $data['people'] * $priceEach;

                $booking->services()->attach($pkgSvc->id, [
                    'quantity'   => $data['people'],
                    'price_each' => $priceEach,
                    'line_total' => $line,
                    'meta'       => json_encode(['event_occurrence_id' => $occ->id]),
                ]);

                $total += $line;
            }

            /* 3C. add-ons ------------------------------------------------------ */
            foreach ($data['services'] ?? [] as $code => $qty) {
                if ($qty < 1) continue;

                $svc  = Service::whereCode($code)->firstOrFail();
                $line = $qty * $svc->price;                       // cents

                $booking->services()->attach($svc->id, [
                    'quantity'   => $qty,
                    'price_each' => $svc->price,
                    'line_total' => $line,
                ]);

                $total += $line;
            }

            $booking->update(['amount' => $total]); // cents
            return $booking;
        });

        /* ---------- 4. Initiate Peach Payment checkout ------------------------ */
        $peach   = new PeachPayment();
        $entity  = config('peach-payment.entity_id');
        $cbUrl   = 'order/callback';

        // Convert integer cents → "280.00"
        $amountForGateway = number_format($booking->amount / 100, 2, '.', '');

        $checkout = $peach->createCheckout($amountForGateway, $cbUrl);

        $booking->update(['peach_payment_checkout_id' => $checkout['checkoutId']]);

        return Inertia::render('Payment/RedirectToGateway', [
            'entityId'          => $entity,
            'checkoutId'        => $checkout['checkoutId'],
            'checkoutScriptUrl' => config(
                'peach-payment.' . config('peach-payment.environment') . '.embedded_checkout_url'
            ),
        ]);
    }

    public function storeAdmin(Request $request)
    {
        $data = $request->validate([
            'booking_type'        => ['required', Rule::in(['sauna', 'event'])],
            'timeslot_id'         => ['required', 'exists:timeslots,id'],
            'event_occurrence_id' => [
                'nullable',
                'required_if:booking_type,event',
                'exists:event_occurrences,id',
            ],
            'people'       => ['required', 'integer', 'between:1,8'],
            'services'     => ['array'],   // [code => qty]
            'guest_name'   => ['nullable', 'string', 'max:255'],
            'guest_email'  => ['nullable', 'email', 'max:255'],
            'user_id'      => ['nullable', 'exists:users,id'],
        ]);

        $slot = Timeslot::lockForUpdate()->findOrFail($data['timeslot_id']);

        $occ = null;
        if ($data['booking_type'] === 'event') {
            $occ = EventOccurrence::with('event')
                ->lockForUpdate()
                ->findOrFail($data['event_occurrence_id']);

            if (! $occ->effective_price) {
                abort(500, "Price missing for event occurrence #{$occ->id}");
            }
        }

        // --- Capacity checks ---
        $slotBooked = $slot->bookings()->sum('people');
        if ($slotBooked + $data['people'] > $slot->capacity) {
            abort(409, 'Chosen sauna slot is already full.');
        }
        if ($occ) {
            if (! $occ->is_active) {
                abort(409, 'Event is no longer bookable.');
            }
            $occBooked = $occ->bookings()->sum('people');
            $occCap    = $occ->effective_capacity ?? 8;
            if ($occBooked + $data['people'] > $occCap) {
                abort(409, 'Event capacity reached.');
            }
        }

        // --- Create booking (skip payment gateway) ---
        $booking = DB::transaction(function () use ($data, $slot, $occ) {
            $booking = Booking::create([
                'user_id'             => $data['user_id'] ?? 1,  // fallback user (e.g. "Guest" user)
                'guest_name'          => $data['guest_name'] ?? null,
                'guest_email'         => $data['guest_email'] ?? null,
                'timeslot_id'         => $slot->id,
                'event_occurrence_id' => $occ?->id,
                'people'              => $data['people'],
                'status'              => 'paid',   // mark as paid since admin is bypassing checkout
                'amount'              => 0,
            ]);

            $total = 0;

            // --- Main line item ---
            if ($data['booking_type'] === 'sauna') {
                $sessionSvc = Service::whereCode('SAUNA_SESSION')->firstOrFail();
                $priceEach  = $sessionSvc->price_cents;
                $line       = $data['people'] * $priceEach;

                $booking->services()->attach($sessionSvc->id, [
                    'quantity'   => $data['people'],
                    'price_each' => $priceEach,
                    'line_total' => $line,
                ]);

                $total += $line;
            } else {
                $pkgSvc   = Service::whereCode('EVENT_PACKAGE')->firstOrFail();
                $priceEach = $occ->effective_price;
                $line      = $data['people'] * $priceEach;

                $booking->services()->attach($pkgSvc->id, [
                    'quantity'   => $data['people'],
                    'price_each' => $priceEach,
                    'line_total' => $line,
                    'meta'       => json_encode(['event_occurrence_id' => $occ->id]),
                ]);

                $total += $line;
            }

            // --- Add-ons ---
            foreach ($data['services'] ?? [] as $code => $qty) {
                if ($qty < 1) continue;

                $svc  = Service::whereCode($code)->firstOrFail();
                $line = $qty * $svc->price_cents;

                $booking->services()->attach($svc->id, [
                    'quantity'   => $qty,
                    'price_each' => $svc->price_cents,
                    'line_total' => $line,
                ]);

                $total += $line;
            }

            $booking->update(['amount' => $total]);

            return $booking;
        });

        return back()->with('success', 'Admin booking created successfully.');
    }
}
