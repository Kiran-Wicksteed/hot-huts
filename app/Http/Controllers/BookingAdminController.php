<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Timeslot;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Location;

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
        // Start with a base query for successful bookings
        $query = Booking::where('status', 'paid');

        // --- Filtering Logic ---
        // Filter by date range
        if ($request->filled('period')) {
            $days = (int) $request->period;
            if ($days > 0) {
                $query->where('created_at', '>=', Carbon::now()->subDays($days));
            }
        }

        // Filter by location
        if ($request->filled('location_id')) {
            $query->whereHas('timeslot.schedule.location', function ($q) use ($request) {
                $q->where('id', $request->location_id);
            });
        }

        // --- Calculate Statistics based on the filtered query ---
        $statsQuery = clone $query; // Clone the query to not affect pagination
        $bookingsThisMonth = (clone $statsQuery)->whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->count();
        $todaysBookings = (clone $statsQuery)->whereDate('created_at', Carbon::today())->count();
        $totalRevenue = $statsQuery->sum('amount');

        $recentBookings = $query->with(['user', 'timeslot.schedule.location', 'services'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $today = today();

        $slotsToday = Timeslot::query()
            ->with(['schedule.location'])   // MUST eager‑load location
            ->whereDate('starts_at', today())
            ->orderBy('starts_at')
            ->get()
            ->map(fn($t) => [
                'id'          => $t->id,
                'starts_at'   => $t->starts_at->format('H:i'),
                'ends_at'     => $t->ends_at->format('H:i'),
                'capacity'    => $t->capacity,
                'bookings'    => $t->bookings     /* already loaded */,
                // 🔽  add exactly ONE of the two lines below
                'location_id' => $t->schedule->location_id,          // simplest
                // or, if you already send the nested object:
                // 'schedule'   => [..., 'location_id' => $t->schedule->location_id],
            ]);

        // 2️⃣ all sauna bookings for today (exclude event bookings)
        $bookingsToday = Booking::with(['user', 'timeslot.schedule.location'])
            ->whereDate('created_at', $today)
            ->whereNull('event_occurrence_id')
            ->get();

        // Pass the calculated data to the Inertia component as props.
        return Inertia::render('bookings/index', [
            'stats' => [
                'bookingsThisMonth' => $bookingsThisMonth,
                'todaysBookings' => $todaysBookings,
                // Format the revenue to two decimal places for display.
                'totalRevenue' => number_format($totalRevenue, 2, '.', ','),
            ],
            'bookings' => $recentBookings,
            'locations' => Location::all(), // Pass all locations for the dropdown
            'filters' => $request->only(['period', 'location_id']),
            'slotsToday'    => $slotsToday,
            'bookingsToday' => $bookingsToday,
        ]);
    }
}
