<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Service;
use App\Models\Timeslot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BookingController extends Controller
{

    public function show(Booking $booking)
    {
        $booking->load(['services', 'timeslot.schedule.location', 'user']);
        return Inertia::render('Booking/ConfirmedPage', [
            'booking' => $booking,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Booking Controller Initiated');

        /* 1. Validate ----------------------------------------------------- */
        $data = $request->validate([
            'timeslot_id' => ['required', 'exists:timeslots,id'],
            'people' => ['required', 'integer', 'between:1,8'],
            'services' => ['array'], // addonCode => qty
            'services.*' => ['integer', 'min:0'],
        ]);

        Log::info('Booking Data Validated', $data);

        /* 2. Transaction keeps capacity + total consistent --------------- */
        $booking = DB::transaction(function () use ($data) {

            /* 2.1 Capacity guard (row-lock the slot) -------------------- */
            $slot = Timeslot::lockForUpdate()->find($data['timeslot_id']);

            $alreadyBooked = $slot->bookings()->sum('people');
            if ($alreadyBooked + $data['people'] > $slot->capacity) {
                abort(409, 'This slot is already full.');
            }

            Log::info('Timeslot Capacity Checked', [
                'timeslot_id' => $slot->id,
                'current_bookings' => $alreadyBooked,
                'requested_people' => $data['people'],
                'remaining_capacity' => $slot->capacity - $alreadyBooked,
            ]);

            /* 3. Create booking header --------------------------------- */
            $booking = Booking::create([
                'user_id'     => Auth::id(),
                'timeslot_id' => $slot->id,
                'people' => $data['people'],
                'status' => 'pending',
                'amount' => 0, // placeholder, update later
            ]);

            Log::info('Booking Created', [
                'booking_id' => $booking->id,
                'user_id' => $booking->user_id,
                'timeslot_id' => $booking->timeslot_id,
                'people' => $booking->people,
            ]);

            $total = 0;

            /* 4. Attach the base session (priced per person) ------------ */
            $sessionSvc = Service::where('code', 'SAUNA_SESSION')->firstOrFail();

            $booking->services()->attach($sessionSvc->id, [
                'quantity' => $data['people'],
                'price_each' => $sessionSvc->price,
                'line_total' => $data['people'] * $sessionSvc->price,
            ]);

            $total += $data['people'] * $sessionSvc->price;

            /* 5. Attach each selected add-on --------------------------- */
            foreach ($data['services'] ?? [] as $code => $qty) {
                if ($qty < 1) continue; // skip un-selected items

                $svc = Service::where('code', $code)->firstOrFail();
                $line = $qty * $svc->price;

                $booking->services()->attach($svc->id, [
                    'quantity' => $qty,
                    'price_each' => $svc->price,
                    'line_total' => $line,
                ]);

                $total += $line;
            }

            /* 6. Save grand total on header ---------------------------- */
            $booking->update(['amount' => $total]);

            return $booking; // returned out of the transaction
        });

        /* 7. Respond ----------------------------------------------------- */
        // For an SPA / Inertia app:
        return redirect()->route('bookings.show', $booking);
        // Or for classic redirect flow:
        // return to_route('bookings.show', $booking);
    }
}
