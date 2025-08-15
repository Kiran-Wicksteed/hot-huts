<?php

namespace App\Http\Controllers;

use App\Models\LocationOpening;
use Illuminate\Http\Request;

class OpeningController extends Controller
{

    public function all()   // route: openings.all   (no params needed)
    {
        $rows = LocationOpening::with('location:id,name')   // eager-load name
            ->select('location_id', 'weekday', 'period', 'start_time', 'end_time')
            ->get()
            ->map(function ($o) {
                return [
                    'weekday'     => $o->weekday,
                    'period'      => strtolower($o->period), // "Morning" → "morning"
                    'start_time'  => $o->start_time,
                    'end_time'    => $o->end_time,

                    'location_id' => $o->location_id,
                    'location'    => $o->location->name,
                ];
            });

        return response()->json($rows);
    }

    /**
     * Keep the single-location endpoint if you still need it elsewhere.
     */
    // In app/Http/Controllers/OpeningController.php

    public function index(Request $r)
    {
        $r->validate(['location_id' => ['required', 'exists:locations,id']]);

        // The bug was here. You need to get data from the database first.
        $rows = LocationOpening::where('location_id', $r->location_id)
            ->select('weekday', 'period')
            ->get(); // <-- YOU WERE MISSING ->get() HERE

        // This code is now running on an actual collection of data
        $groupedByWeekday = $rows->groupBy('weekday')->map(function ($group) {
            return $group->pluck('period')->map('strtolower')->unique()->values();
        });

        return response()->json($groupedByWeekday);
    }
}
