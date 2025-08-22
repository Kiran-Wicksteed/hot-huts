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
        $statsQuery = clone $query;
        $bookingsThisMonth = (clone $statsQuery)
            ->whereYear('created_at', Carbon::now()->year)
            ->whereMonth('created_at', Carbon::now()->month)
            ->count();

        $todaysBookings = (clone $statsQuery)
            ->whereDate('created_at', $selectedDate)
            ->count();

        $totalRevenue = $statsQuery->sum('amount') / 100;

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
        $bookingsForDate = Booking::with(['user', 'timeslot.schedule.location', 'services'])
            ->whereHas('timeslot.schedule', function ($q) use ($selectedDate) {
                $q->whereDate('date', $selectedDate);
            })
            ->whereNull('event_occurrence_id')
            ->get()
            ->map(function ($booking) {
                return [
                    'id'          => $booking->id,
                    'timeslot_id' => $booking->timeslot_id,
                    'people'      => $booking->people,
                    'guest_name'  => $booking->guest_name,
                    'guest_email' => $booking->guest_email,
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
