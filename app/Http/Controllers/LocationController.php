<?php

// app/Http/Controllers/LocationController.php
namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Sauna;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::with('openings')->latest()->get()->map(
            function (Location $loc) {
                $ops = $loc->openings;

                return [
                    'id' => $loc->id,
                    'name' => $loc->name,
                    'address' => $loc->address,
                    'timezone' => $loc->timezone,
                    'image_path' => $loc->image_path,

                    // ----- for the modal (new shape) -----
                    'sauna_id' => optional($ops->first())->sauna_id ?? '',
                    'weekdays' => $ops->pluck('weekday')->unique()->values(), // [0,3,5]
                    'day_times' => $ops
                        ->groupBy('weekday')
                        ->map(
                            fn($rows) => $rows
                                ->keyBy('period')
                                ->map(fn($o) => [
                                    'start' => substr($o->start_time, 0, 5), // HH:MM
                                    'end' => substr($o->end_time, 0, 5),
                                ])
                        ),
                ];
            }
        );

        return Inertia::render('Locations/index', [
            'locations' => $locations,
            'saunas' => Sauna::select('id', 'name')->get(),
        ]);
    }

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

    private function validateLocation(Request $r): array
    {
        // ---------- core fields ----------
        $fields = $r->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'timezone' => ['required', 'string', 'timezone'],
            'image' => ['nullable', 'image', 'max:2048'],
            'sauna_id' => ['required', 'exists:saunas,id'],
        ]);

        //upload image to temp location

        if ($r->hasFile('image') && $r->file('image') instanceof UploadedFile) {


            try {
                // Put the file on S3 with public visibility
                $path = $r->file('image')->storePublicly('hothuts/images', 's3');
                $fields['image_path'] = Storage::disk('s3')->url($path);
                // If you prefer storing the key only, use:
                // $fields['image_path'] = $path;

            } catch (\Throwable $e) {
                Log::error("S3 image upload failed: {$e->getMessage()}");
                throw $e; // or add a validation error/response as you prefer
            }
        }


        // if ($r->file('image')) {
        //     $fields['image_path'] = $r->file('image')->store('locations', 'public');
        // }

        // ---------- normalize payload shape ----------
        // Preferred: day_times[weekday][period] = {start,end}
        $dayTimes = $r->input('day_times');

        // Backward-compat: convert old (weekdays + periods + custom_times) to day_times
        if (!$dayTimes && $r->filled('weekdays') && $r->filled('periods') && $r->filled('custom_times')) {
            $dayTimes = [];
            foreach ((array) $r->input('weekdays', []) as $w) {
                foreach ((array) $r->input('periods', []) as $p) {
                    $rng = $r->input("custom_times.$p");
                    if ($rng && isset($rng['start'], $rng['end'])) {
                        $dayTimes[$w][$p] = [
                            'start' => substr($rng['start'], 0, 5),
                            'end' => substr($rng['end'], 0, 5),
                        ];
                    }
                }
            }
        }

        // Validate day_times
        $v = Validator::make(
            ['day_times' => $dayTimes],
            [
                'day_times' => ['required', 'array', 'min:1'],
                'day_times.*' => ['array'], // each weekday
                'day_times.*.*.start' => ['required', 'date_format:H:i'],
                'day_times.*.*.end' => ['required', 'date_format:H:i'],
            ],
            [],
            ['day_times' => 'day times'] // friendly name
        );

        // ensure end > start for each (weekday, period)
        $v->after(function ($validator) use ($dayTimes) {
            foreach ((array) $dayTimes as $w => $periods) {
                foreach ((array) $periods as $p => $rng) {
                    $s = $rng['start'] ?? null;
                    $e = $rng['end'] ?? null;
                    if ($s && $e && strtotime($e) <= strtotime($s)) {
                        $validator->errors()->add("day_times.$w.$p.end", 'End time must be after start time.');
                    }
                }
            }
        });

        $v->validate();

        // ---------- explode into openings ----------
        $openings = [];
        foreach ($dayTimes as $weekday => $periods) {
            foreach ($periods as $period => $rng) {
                $openings[] = [
                    'sauna_id' => $fields['sauna_id'],
                    'weekday' => (int) $weekday,
                    'period' => $period,
                    'start_time' => substr($rng['start'], 0, 5),
                    'end_time' => substr($rng['end'], 0, 5),
                ];
            }
        }

        return ['fields' => $fields, 'openings' => $openings];
    }

    private function syncOpenings(Location $loc, array $openings): void
    {
        $loc->openings()->delete();

        foreach ($openings as $o) {
            $loc->openings()->create($o);
        }
    }
}
