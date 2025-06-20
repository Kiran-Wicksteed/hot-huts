<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LocationOpening;

class OpeningController extends Controller
{
    public function index(Request $r)
    {
        $r->validate(['location_id' => ['required', 'exists:locations,id']]);

        $openings = LocationOpening::where('location_id', $r->location_id)
            ->get() // e.g. [{weekday:3, periods:["morning","evening"]}]
            ->mapWithKeys(fn($row) => [$row->weekday => $row->periods]);

        return response()->json($openings);
    }
}
