<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Booking;
use Illuminate\Support\Facades\Auth;

class UserDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $bookings = Booking::query()
            ->select('bookings.*')                              // keep only booking columns
            ->leftJoin('timeslots', 'timeslots.id', '=', 'bookings.timeslot_id')
            ->where('bookings.user_id', $user->id)
            ->orderBy('timeslots.starts_at')                    // ✅ now the column exists
            ->with(['timeslot.schedule.location', 'services']) // eager-load as before
            ->get();

        $now = now();

        return Inertia::render('frontend/my-bookings/index', [
            'upcoming' => $bookings->where('timeslot.starts_at', '>', $now)->values(),
            'past'     => $bookings->where('timeslot.starts_at', '<=', $now)->values(),
            'points'   => $user->loyalty_points ?? 0,
            'events'   => [],
        ]);
    }
}
