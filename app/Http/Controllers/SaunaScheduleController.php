<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Sauna;
use App\Models\Location;
use App\Models\SaunaSchedule;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class SaunaScheduleController extends Controller
{
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
            'date' => ['required', 'date'],
        ]);

        $sauna->schedules()->firstOrCreate($data); // observer autogenerates slots
        return back()->with('success', 'Schedule added.');
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
            'weekdays'    => ['required', 'array', 'min:1'],      // ['mon','fri']
            'weekdays.*'  => ['in:mon,tue,wed,thu,fri,sat,sun'],
            'start_date'  => ['nullable', 'date'],
            'days_ahead'  => ['nullable', 'integer', 'between:1,90'],
        ]);

        $start       = Carbon::parse($data['start_date'] ?? today());
        $daysAhead   = $data['days_ahead'] ?? 30;
        $end         = (clone $start)->addDays($daysAhead - 1);
        $period      = CarbonPeriod::create($start, $end);

        $created = 0;

        foreach ($period as $date) {
            $weekday = strtolower($date->format('D'));   // mon, tue, …
            if (!in_array($weekday, $data['weekdays'], true)) {
                continue;
            }

            $exists = SaunaSchedule::where('sauna_id', $sauna->id)
                ->whereDate('date', $date)
                ->exists();

            if (!$exists) {
                $sauna->schedules()->create([
                    'location_id' => $data['location_id'],
                    'date'        => $date,
                ]);
                $created++;
            }
        }

        return back()->with('success', "$created new days added.");
    }
}
