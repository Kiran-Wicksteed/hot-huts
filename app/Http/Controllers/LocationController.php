<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Sauna;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::with('openings')        // eager-load rows
            ->latest()
            ->get()
            ->map(function (Location $loc) {
                /** @var Collection $ops  */
                $ops = $loc->openings;                 // all rows for this loc

                return [
                    'id'         => $loc->id,
                    'name'       => $loc->name,
                    'address'    => $loc->address,
                    'timezone'   => $loc->timezone,
                    'image_path' => $loc->image_path,

                    // ↓↓↓ extra keys used by the modal
                    'sauna_id' => optional($ops->first())->sauna_id ?? '',
                    'weekdays' => $ops->pluck('weekday')->values(),          // [0,3]
                    'periods'  => $ops->flatMap->periods                     // ['morning',…]
                        ->unique()
                        ->values(),
                ];
            });

        return inertia('Locations/index', [
            'locations' => $locations,
            'saunas'    => Sauna::select('id', 'name')->get(),               // [{id,name}]
        ]);
    }

    public function store(Request $r)
    {
        //log the request data
        Log::info('Storing location', $r->all());
        $data = $this->validateLocation($r);
        //log the validated data
        Log::info('Validated location data', $data);

        // 1. save the Location itself
        $loc = Location::create($data['fields']);

        // 2. save its opening rules
        $this->syncOpenings($loc, $data['openings']);

        return back()->with('success', 'Location added.');
    }

    public function update(Request $r, Location $location)
    {
        $data = $this->validateLocation($r);

        $location->update($data['fields']);
        $this->syncOpenings($location, $data['openings']);

        return back()->with('success', 'Location updated.');
    }

    public function destroy(Location $location)
    {
        $location->delete();
        return back()->with('success', 'Location removed.');
    }

    private function validateLocation(Request $r): array
    {
        $fields = $r->validate([
            'name'     => ['required', 'string', 'max:255'],
            'address'  => ['nullable', 'string'],
            'timezone' => ['required', 'string', 'timezone'],
            'image'    => ['nullable', 'image', 'max:2048'],
        ]);

        if ($r->file('image')) {
            $fields['image_path'] = $r->file('image')
                ->store('locations', 'public');
        }

        $flat = $r->validate([
            'sauna_id'  => ['required', 'exists:saunas,id'],
            'weekdays'  => ['required', 'array', 'min:1'],
            'weekdays.*' => ['integer', 'between:0,6'],
            'periods'   => ['required', 'array', 'min:1'],
            'periods.*' => [Rule::in(['morning', 'afternoon', 'evening', 'night'])],
        ]);

        $openings = [];
        foreach ($flat['weekdays'] as $w) {
            $openings[] = [
                'sauna_id' => $flat['sauna_id'],
                'weekday'  => $w,
                'periods'  => $flat['periods'],
            ];
        }


        return ['fields' => $fields, 'openings' => $openings];
    }

    private function syncOpenings(Location $loc, array $openings): void
    {
        // wipe what was there
        $loc->openings()->delete();

        // insert fresh rows
        foreach ($openings as $o) {
            $loc->openings()->create($o);
        }
    }
}
