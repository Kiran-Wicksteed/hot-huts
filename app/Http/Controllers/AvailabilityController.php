<?php

namespace App\Http\Controllers;

use App\Models\SaunaSchedule;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function index(Request $r)
    {
        $data = $r->validate([
            'location_id' => ['required', 'exists:locations,id'],
            'date' => ['required', 'date'],
            'period' => ['required', 'in:morning,evening'],
        ]);

        $schedule = SaunaSchedule::where('location_id', $data['location_id'])
            ->whereDate('date', $data['date'])
            ->where('period', $data['period'])
            ->with(['timeslots' => function ($q) {
                $q->orderBy('starts_at');
            }])
            ->first();

        if (! $schedule) {
            return response()->json([]);
        }

        $slots = $schedule->timeslots->map(function ($ts) {
            $booked = $ts->bookings()->sum('people');
            return [
                'id' => $ts->id,
                'starts_at' => $ts->starts_at->format('H:i'),
                'ends_at' => $ts->ends_at->format('H:i'),
                'spots_left' => $ts->capacity - $booked,
            ];
        });

        return response()->json($slots);
    }
}
