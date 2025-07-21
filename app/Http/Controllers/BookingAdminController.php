<?php

namespace App\Http\Controllers;

use App\Models\Booking;
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
        ]);
    }
}
