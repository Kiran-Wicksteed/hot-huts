<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Sauna;
use App\Models\Location;
use App\Models\SaunaSchedule;
use App\Models\LocationOpening;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Log;

class SaunaScheduleController extends Controller
{

    private const PERIODS = ['morning', 'afternoon', 'evening', 'night'];

    public function index(Sauna $sauna)
    {
        $sauna->load(['schedules.location']); // eager-load for table
        return Inertia::render('Saunas/Schedule', [
            'sauna' => $sauna,
            'locations' => Location::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $r, Sauna $sauna)
    {
        $data = $r->validate([
            'location_id' => ['required', 'exists:locations,id'],
            'date'        => ['required', 'date'],
            'periods'     => ['required', 'array', 'min:1'],
            'periods.*'   => ['in:' . implode(',', self::PERIODS)],
        ]);

        foreach ($data['periods'] as $p) {
            $sauna->schedules()->firstOrCreate([
                'location_id' => $data['location_id'],
                'date'        => $data['date'],
                'period'      => $p,
            ]);
        }
        return back()->with('success', 'Schedule(s) added.');
    }

    public function destroy(Sauna $sauna, SaunaSchedule $schedule)
    {
        abort_unless($schedule->sauna_id === $sauna->id, 403);
        $schedule->delete();
        return back()->with('success', 'Schedule removed.');
    }

    public function bulkWeekday(Request $r, Sauna $sauna)
    {
        $data = $r->validate([
            'location_id' => ['required', 'exists:locations,id'],
            'weekdays'    => ['required', 'array', 'min:1'],           // ['mon','fri']
            'weekdays.*'  => ['in:mon,tue,wed,thu,fri,sat,sun'],
            'start_date'  => ['nullable', 'date'],
            'days_ahead'  => ['nullable', 'integer', 'between:1,90'],
            'periods'     => ['required', 'array', 'min:1'],           // ['morning','evening']
            'periods.*' => ['in:' . implode(',', self::PERIODS)],
        ]);

        $start     = Carbon::parse($data['start_date'] ?? today());
        $end       = (clone $start)->addDays(($data['days_ahead'] ?? 30) - 1);
        $period    = CarbonPeriod::create($start, $end);

        $created = 0;

        foreach ($period as $date) {
            $weekday = strtolower($date->format('D'));              // 'mon', 'tue', …
            if (! in_array($weekday, $data['weekdays'], true)) {
                continue;                                           // skip unwanted weekdays
            }

            foreach ($data['periods'] as $periodName) {             // 'morning' / 'evening'
                $exists = SaunaSchedule::where('sauna_id', $sauna->id)
                    ->whereDate('date', $date)
                    ->where('period', $periodName)
                    ->exists();

                if (! $exists) {
                    $sauna->schedules()->create([
                        'location_id' => $data['location_id'],
                        'date'        => $date,
                        'period'      => $periodName,
                    ]);
                    $created++;
                }
            }
        }

        return back()->with('success', "$created new schedules added.");
    }

    public function generate(Request $r, Sauna $sauna)
    {
        $daysAhead = 60;

        // all openings the sauna serves
        $openings = LocationOpening::where('sauna_id', $sauna->id)->get();
        if ($openings->isEmpty()) {
            return back()->with('error', 'No Location Openings configured.');
        }

        $start = Carbon::today();
        $end   = (clone $start)->addDays($daysAhead - 1);
        $range = CarbonPeriod::create($start, $end);

        $created = 0;

        foreach ($openings as $o) {
            foreach ($range as $date) {
                if ($date->dayOfWeek !== $o->weekday) {
                    continue;                                   // wrong weekday
                }

                foreach ($o->periods as $p) {
                    // skip if already exists
                    $dupe = SaunaSchedule::where([
                        'sauna_id'    => $sauna->id,
                        'location_id' => $o->location_id,
                        'date'        => $date->toDateString(),
                        'period'      => $p,
                    ])->exists();

                    if ($dupe) continue;

                    $sauna->schedules()->create([
                        'location_id' => $o->location_id,
                        'date'        => $date,
                        'period'      => $p,
                    ]);
                    ++$created;
                }
            }
        }

        return back()->with('success', "$created slots generated.");
    }
}
