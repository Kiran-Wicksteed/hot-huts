<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Timeslot;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Location;
use App\Models\Service;

class BookingAdminController extends Controller
{
    /**
     * Display the booking statistics on the admin dashboard.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // --- Base Query ---
        $query = Booking::where('status', 'paid');

        // --- Filtering Logic ---
        if ($request->filled('period')) {
            $days = (int) $request->period;
            if ($days > 0) {
                $query->where('created_at', '>=', Carbon::now()->subDays($days));
            }
        }

        if ($request->filled('location_id')) {
            $query->whereHas('timeslot.schedule.location', function ($q) use ($request) {
                $q->where('id', $request->location_id);
            });
        }

        // ───────────────────────────────────────────────
        // NEW: Date filter (default = today)
        // ───────────────────────────────────────────────
        $selectedDate = $request->filled('date')
            ? Carbon::parse($request->date)->startOfDay()
            : today();

        // --- Calculate Statistics ---
        $statsBase = clone $query;

        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth   = $now->copy()->endOfMonth();

        $bookingsThisMonth = (clone $statsBase)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        $todaysBookings = (clone $statsBase)
            ->whereDate('created_at', $now->toDateString())
            ->count();

        $totalRevenue = (clone $statsBase)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('amount') / 100;

        $recentBookings = $query->with(['user', 'timeslot.schedule.location', 'services'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // ───────────────────────────────────────────────
        // Timeslots for the selected date
        // ───────────────────────────────────────────────
        $slotsForDate = Timeslot::query()
            ->with(['schedule.location'])
            ->whereHas('schedule', function ($q) use ($selectedDate) {
                $q->whereDate('date', $selectedDate);
            })
            ->orderBy('starts_at')
            ->get()
            ->map(function ($t) {
                $fmt = function ($v) {
                    if ($v instanceof \Carbon\CarbonInterface) return $v->format('H:i');
                    if (is_string($v) && preg_match('/\d{2}:\d{2}(:\d{2})?$/', $v, $m)) {
                        return substr($m[0], 0, 5);
                    }
                    try {
                        return Carbon::parse($v)->format('H:i');
                    } catch (\Throwable $e) {
                        return (string) $v;
                    }
                };

                return [
                    'id'          => $t->id,
                    'starts_at'   => $fmt($t->getRawOriginal('starts_at')),
                    'ends_at'     => $fmt($t->getRawOriginal('ends_at')),
                    'capacity'    => (int) $t->capacity,
                    'bookings'    => $t->bookings,
                    'location_id' => $t->schedule->location_id,
                ];
            });

        // ───────────────────────────────────────────────
        // Bookings for the selected date
        // ───────────────────────────────────────────────
        $now = now();

        $bookingsForDate = Booking::with(['user', 'timeslot.schedule.location', 'services'])
            ->whereHas('timeslot.schedule', function ($q) use ($selectedDate) {
                $q->whereDate('date', $selectedDate);
            })
            ->whereNull('event_occurrence_id')
            ->where(function ($q) use ($now) {
                $q->where('status', 'paid')
                    ->orWhere(function ($q2) use ($now) {
                        $q2->where('status', 'pending')
                            ->whereNotNull('hold_expires_at')
                            ->where('hold_expires_at', '<=', $now); // 👈 expired holds only
                    });
            })
            ->get()
            ->map(function ($booking) {
                $isPending = $booking->status === 'pending';
                return [
                    'id'          => $booking->id,
                    'timeslot_id' => $booking->timeslot_id,
                    'people'      => $booking->people,
                    'guest_name'  => $booking->guest_name,
                    'guest_email' => $booking->guest_email,
                    'payment_method'    => $booking->payment_method,
                    'updated_via'      => $booking->updated_via,
                    'booking_type'    => $booking->booking_type,
                    'no_show' => (bool) $booking->no_show,
                    'status'         => $booking->status,
                    'is_pending'     => $isPending,
                    'status_note'    => $isPending ? 'Pending payment — temporarily reserved' : null,
                    'user'        => ['name' => $booking->user?->name],
                    'services'    => $booking->services->map(fn($s) => [
                        'id'       => $s->id,
                        'name'     => $s->name,
                        'quantity' => $s->pivot->quantity,
                    ]),
                ];
            });

        return Inertia::render('bookings/index', [
            'stats' => [
                'bookingsThisMonth' => $bookingsThisMonth,
                'todaysBookings'    => $todaysBookings,
                'totalRevenue'      => number_format($totalRevenue, 2, '.', ','),
            ],
            'bookings'      => $recentBookings,
            'locations'     => Location::all(),
            'filters'       => $request->only(['period', 'location_id', 'date']), // ✅ now includes date
            'slotsToday'    => $slotsForDate,   // could rename to "slotsForDate"
            'bookingsToday' => $bookingsForDate, // could rename to "bookingsForDate"
            'addonServices' => Service::where('code', 'like', 'ADDON%')
                ->get(['id', 'name', 'code']),
        ]);
    }

    public function destroy(Booking $booking)
    {
        // Optional: authorisation check here

        // Free up capacity: just delete, since booked count is computed live
        $booking->delete();

        return redirect()->back()->with('success', 'Booking deleted successfully.');
    }

    public function update(Request $request, Booking $booking)
    {
        $data = $request->validate([
            'people'          => ['required', 'integer', 'min:1'],
            'payment_method'  => ['nullable', 'string', 'max:120'],
            'booking_type'    => ['nullable', 'string', 'max:120'],
            'no_show'         => ['required', 'boolean'],
            'services'        => ['array'],          // payload: code => qty
            'services.*'      => ['integer', 'min:1'],
            'updated_via'     => ['required', 'string', 'max:50'],
        ]);

        // Update main fields
        $booking->fill([
            'people'         => $data['people'],
            'payment_method' => $data['payment_method'] ?? null,
            'booking_type'   => $data['booking_type']   ?? $booking->booking_type,
            'no_show'        => $data['no_show'],
            'updated_via'   => $data['updated_via'],
        ])->save();

        // Sync add-ons (expects services: { CODE: qty })
        if ($request->has('services')) {
            $codes = array_keys($data['services']);
            $services = Service::whereIn('code', $codes)->get(['id', 'code']);
            $sync = [];
            foreach ($services as $svc) {
                $qty = (int) ($data['services'][$svc->code] ?? 0);
                if ($qty > 0) {
                    $sync[$svc->id] = ['quantity' => $qty];
                }
            }
            $booking->services()->sync($sync);
        }

        return back()->with('success', 'Booking updated.');
    }


    public function byOccurrence($eventId, $occurrenceId)
    {
        $bookings = Booking::with(['user', 'services'])
            ->where('event_occurrence_id', $occurrenceId)
            ->get()
            ->map(function ($b) {
                return [
                    'id'       => $b->id,
                    'guest'    => $b->guest_name ?? $b->user?->name ?? 'Guest',
                    'email'    => $b->guest_email ?? $b->user?->email,
                    'people'   => $b->people,
                    'services' => $b->services->map(fn($s) => [
                        'name'     => $s->name,
                        'quantity' => $s->pivot->quantity,
                    ]),
                    'status'   => $b->status,
                ];
            });

        return Inertia::render('Events/ByOccurrence', [
            'bookings'    => $bookings,
            'occurrenceId' => $occurrenceId,
            'eventId'     => $eventId,
        ]);
    }
}
