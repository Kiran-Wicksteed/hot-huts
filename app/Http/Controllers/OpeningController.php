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
    public function index(Request $r)
    {
        $r->validate(['location_id' => ['required', 'exists:locations,id']]);

        $rows = LocationOpening::where('location_id', $r->location_id)
            ->select('weekday', 'period', 'start_time', 'end_time')
            ->get();

        return response()->json($rows);
    }
}
