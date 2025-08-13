<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Sauna;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LocationController extends Controller
{
    /* ------------------------------------------------ index */
    public function index()
    {
        $locations = Location::with('openings')->latest()->get()->map(
            function (Location $loc) {
                $ops = $loc->openings;      // rows already 1-per-period

                return [
                    'id'         => $loc->id,
                    'name'       => $loc->name,
                    'address'    => $loc->address,
                    'timezone'   => $loc->timezone,
                    'image_path' => $loc->image_path,

                    // ----- for the modal -----
                    'sauna_id' => optional($ops->first())->sauna_id ?? '',
                    'weekdays' => $ops->pluck('weekday')->unique()->values(),   // [0,3]
                    'periods'  => $ops->pluck('period')->unique()->values(),    // ['morning',…]
                    'times'    => $ops->keyBy('period')->map(fn($o) => [
                        'start' => $o->start_time,
                        'end'   => $o->end_time,
                    ]),
                ];
            }
        );

        return Inertia::render('Locations/index', [
            'locations' => $locations,
            'saunas'    => Sauna::select('id', 'name')->get(),
        ]);
    }

    /* ------------------------------------------------ store & update */
    public function store(Request $r)
    {
        $pack = $this->validateLocation($r);

        $loc = Location::create($pack['fields']);
        $this->syncOpenings($loc, $pack['openings']);

        return back()->with('success', 'Location added.');
    }

    public function update(Request $r, Location $location)
    {
        $pack = $this->validateLocation($r);

        $location->update($pack['fields']);
        $this->syncOpenings($location, $pack['openings']);

        return back()->with('success', 'Location updated.');
    }

    public function destroy(Location $location)
    {
        $location->delete();
        return back()->with('success', 'Location removed.');
    }

    /* ------------------------------------------------ helpers */

    private function validateLocation(Request $r): array
    {
        /* ---------- basic location fields ---------- */
        $fields = $r->validate([
            'name'     => ['required', 'string', 'max:255'],
            'address'  => ['nullable', 'string'],
            'timezone' => ['required', 'string', 'timezone'],
            'image'    => ['nullable', 'image', 'max:2048'],
        ]);

        if ($r->file('image')) {
            $fields['image_path'] = $r->file('image')->store('locations', 'public');
        }

        /* ---------- opening-rule flat fields ---------- */
        $flat = $r->validate([
            'sauna_id'   => ['required', 'exists:saunas,id'],
            'weekdays'   => ['required', 'array', 'min:1'],
            'weekdays.*' => ['integer', 'between:0,6'],
            'periods'    => ['required', 'array', 'min:1'],
            'periods.*'  => [Rule::in(['morning', 'afternoon', 'evening', 'night'])],
            'custom_times'                 => ['required', 'array'],
            'custom_times.*.start'         => ['required', 'date_format:H:i'],
            'custom_times.*.end'           => ['required', 'date_format:H:i', 'after:custom_times.*.start'],
        ]);

        /* ---------- explode into row-per-period ---------- */
        $openings = [];
        foreach ($flat['weekdays'] as $w) {
            foreach ($flat['periods'] as $p) {
                $openings[] = [
                    'sauna_id'   => $flat['sauna_id'],
                    'weekday'    => $w,
                    'period'     => $p,
                    'start_time' => $flat['custom_times'][$p]['start'],
                    'end_time'   => $flat['custom_times'][$p]['end'],
                ];
            }
        }

        return ['fields' => $fields, 'openings' => $openings];
    }

    private function syncOpenings(Location $loc, array $openings): void
    {
        $loc->openings()->delete();        // wipe old rules

        foreach ($openings as $o) {
            $loc->openings()->create($o);  // row already has period/start/end
        }
    }
}
