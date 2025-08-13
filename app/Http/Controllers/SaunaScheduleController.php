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
use App\Models\Timeslot;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

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

        // ---------- Load & sanity check ----------
        $openings = LocationOpening::where('sauna_id', $sauna->id)->get();
        if ($openings->isEmpty()) {
            return back()->with('error', 'No Location Openings configured.');
        }

        // Map for quick lookups and pruning:
        // $openingsMap[location_id][weekday][period] = ['start' => 'HH:MM[:SS]', 'end' => 'HH:MM[:SS]']
        $openingsMap = [];
        foreach ($openings as $o) {
            $period = strtolower(trim($o->period));
            $openingsMap[$o->location_id][$o->weekday][$period] = [
                'start' => $o->start_time,   // DB is TIME so already HH:MM:SS
                'end'   => $o->end_time,
            ];
        }

        // Group by weekday for robust date-first generation
        $byWeekday = $openings->groupBy('weekday')->map->values();

        $start = Carbon::today();
        $end   = (clone $start)->addDays($daysAhead - 1);
        $range = CarbonPeriod::create($start, $end);

        // ---------- A) ADD missing schedules ----------
        $added = 0;
        $perPeriodAdd = ['morning' => 0, 'afternoon' => 0, 'evening' => 0, 'night' => 0];

        foreach ($range as $date) {
            $w = $date->dayOfWeek; // 0..6 (Sun..Sat)

            if (! isset($byWeekday[$w])) {
                continue; // no configured openings for this weekday
            }

            foreach ($byWeekday[$w] as $o) {
                $period = strtolower(trim($o->period));
                if (! in_array($period, ['morning', 'afternoon', 'evening', 'night'], true)) {
                    continue; // skip invalid period labels
                }

                $exists = SaunaSchedule::where('sauna_id', $sauna->id)
                    ->where('location_id', $o->location_id)
                    ->whereDate('date', $date)
                    ->where('period', $period)
                    ->exists();

                if (! $exists) {
                    $sauna->schedules()->create([
                        'location_id' => $o->location_id,
                        'date'        => $date->toDateString(),
                        'period'      => $period,
                    ]);
                    ++$added;
                    ++$perPeriodAdd[$period];
                }
            }
        }

        // ---------- B) PRUNE schedules outside configured windows ----------
        $prunedSchedules = 0;

        $scheduled = SaunaSchedule::where('sauna_id', $sauna->id)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get();

        foreach ($scheduled as $s) {
            $weekday = Carbon::parse($s->date)->dayOfWeek;
            $period  = strtolower(trim($s->period));

            $hasWindow = $openingsMap[$s->location_id][$weekday][$period] ?? null;

            if (! $hasWindow) {
                // No longer a valid opening → remove schedule row
                $s->delete();
                ++$prunedSchedules;
            }
        }

        // ---------- C) PRUNE time slots outside windows (keep ones with bookings) ----------
        $prunedTimeslots = 0;

        // Support either DATE+TIME columns or DATETIME columns
        $usesDateTime = Schema::hasColumn('timeslots', 'start_at')
            && Schema::hasColumn('timeslots', 'end_at');

        // Helper to add seconds if needed
        $ensureSeconds = static function (string $hhmmOrHhmmss): string {
            return strlen($hhmmOrHhmmss) === 5 ? ($hhmmOrHhmmss . ':00') : $hhmmOrHhmmss;
        };

        if ($usesDateTime) {
            $slots = Timeslot::where('sauna_id', $sauna->id)
                ->whereBetween('start_at', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
                ->get();

            foreach ($slots as $t) {
                $day     = Carbon::parse($t->start_at);
                $weekday = $day->dayOfWeek;

                $windows = array_values($openingsMap[$t->location_id][$weekday] ?? []); // 0..n windows

                $slotStart = Carbon::parse($t->start_at);
                $slotEnd   = Carbon::parse($t->end_at);

                $insideAny = false;
                foreach ($windows as $w) {
                    $winStart = Carbon::parse($day->toDateString() . ' ' . $ensureSeconds($w['start']));
                    $winEnd   = Carbon::parse($day->toDateString() . ' ' . $ensureSeconds($w['end']));
                    if ($slotStart >= $winStart && $slotEnd <= $winEnd) {
                        $insideAny = true;
                        break;
                    }
                }

                if (! $insideAny && ! $t->bookings()->exists()) {
                    $t->delete();
                    ++$prunedTimeslots;
                }
            }
        } else {
            // DATE + TIME columns (date, start_time, end_time)
            $slots = Timeslot::where('sauna_id', $sauna->id)
                ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
                ->get();

            foreach ($slots as $t) {
                $weekday = Carbon::parse($t->date)->dayOfWeek;

                $windows = array_values($openingsMap[$t->location_id][$weekday] ?? []);

                $slotStart = Carbon::parse($t->date . ' ' . $ensureSeconds($t->start_time));
                $slotEnd   = Carbon::parse($t->date . ' ' . $ensureSeconds($t->end_time));

                $insideAny = false;
                foreach ($windows as $w) {
                    $winStart = Carbon::parse($t->date . ' ' . $ensureSeconds($w['start']));
                    $winEnd   = Carbon::parse($t->date . ' ' . $ensureSeconds($w['end']));
                    if ($slotStart >= $winStart && $slotEnd <= $winEnd) {
                        $insideAny = true;
                        break;
                    }
                }

                if (! $insideAny && ! $t->bookings()->exists()) {
                    $t->delete();
                    ++$prunedTimeslots;
                }
            }
        }

        // ---------- Logging & response ----------
        Log::info("Sauna {$sauna->id}: schedules added={$added} (by period=" . json_encode($perPeriodAdd) . "), schedules pruned={$prunedSchedules}, timeslots pruned={$prunedTimeslots}");

        return back()->with(
            'success',
            "{$added} schedules created; {$prunedSchedules} schedules pruned; {$prunedTimeslots} timeslots pruned."
        );
    }


    /**
     * Remove Timeslot rows that sit outside the configured opening windows,
     * unless they have bookings. Supports either TIME columns (start_time/end_time)
     * or DATETIME columns (starts_at/ends_at).
     */
    private function pruneTimeslotsOutsideWindows(
        Sauna $sauna,
        \Carbon\Carbon $from,
        \Carbon\Carbon $to,
        array $openingsMap
    ): int {
        // Detect FK column name on timeslots
        $fk = null;
        if (\Illuminate\Support\Facades\Schema::hasColumn('timeslots', 'schedule_id')) {
            $fk = 'schedule_id';
        } elseif (\Illuminate\Support\Facades\Schema::hasColumn('timeslots', 'sauna_schedule_id')) {
            $fk = 'sauna_schedule_id';
        } else {
            Log::warning('Timeslots table has no schedule FK (schedule_id/sauna_schedule_id). Skipping prune.');
            return 0;
        }

        // Detect time columns
        $hasDateTime = \Illuminate\Support\Facades\Schema::hasColumn('timeslots', 'starts_at');
        $hasTimeOnly = \Illuminate\Support\Facades\Schema::hasColumn('timeslots', 'start_time');

        if (! $hasDateTime && ! $hasTimeOnly) {
            Log::warning('Timeslots has neither starts_at nor start_time. Skipping prune.');
            return 0;
        }

        // Bookings table guard
        $hasBookings = \Illuminate\Support\Facades\Schema::hasTable('bookings');

        // Pull candidate timeslots in the date window and without bookings
        $q = DB::table('timeslots as t')
            ->join('sauna_schedules as s', "t.{$fk}", '=', 's.id')
            ->where('s.sauna_id', $sauna->id)
            ->whereBetween('s.date', [$from->toDateString(), $to->toDateString()]);

        if ($hasBookings) {
            $q->leftJoin('bookings as b', 'b.timeslot_id', '=', 't.id')
                ->whereNull('b.id');
        }

        // Select required columns
        $select = ['t.id', 's.location_id', 's.date', 's.period'];
        if ($hasDateTime) {
            $select[] = 't.starts_at';
            $select[] = 't.ends_at';
        }
        if ($hasTimeOnly) {
            $select[] = 't.start_time';
            $select[] = 't.end_time';
        }

        $rows = $q->select($select)->get();

        // Helpers
        $norm = function (?string $t, string $fallback): string {
            if (!$t || trim($t) === '') return $fallback;
            $t = trim($t);
            return strlen($t) === 5 ? $t . ':00' : $t; // "08:00" -> "08:00:00"
        };

        $toDelete = [];

        foreach ($rows as $r) {
            $dayStr  = \Carbon\Carbon::parse($r->date)->toDateString();
            $weekday = \Carbon\Carbon::parse($dayStr)->dayOfWeek;

            $win = $openingsMap[$r->location_id][$weekday][$r->period] ?? null;

            // If there's no window for this schedule anymore, treat slot as outside.
            $winStartStr = $norm($win['start'] ?? null, '00:00:00');
            $winEndStr   = $norm($win['end']   ?? null, '23:59:59');

            if ($hasDateTime) {
                $slotStart = \Carbon\Carbon::parse($r->starts_at);
                $winStart  = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', "{$dayStr} {$winStartStr}");
                $winEnd    = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', "{$dayStr} {$winEndStr}");

                $outside = $slotStart->lt($winStart) || $slotStart->gte($winEnd);
            } else {
                // TIME-only columns
                $slotStartStr = $norm($r->start_time ?? null, '00:00:00');
                $outside = ($slotStartStr < $winStartStr) || ($slotStartStr >= $winEndStr);
            }

            if ($outside) {
                $toDelete[] = $r->id;
            }
        }

        if (!empty($toDelete)) {
            $deleted = \App\Models\Timeslot::whereIn('id', $toDelete)->delete();
            Log::debug('Prune candidates', [
                'considered' => $rows->count(),
                'to_delete'  => count($toDelete),
            ]);
            return $deleted;
        }

        Log::debug('Prune considered, nothing to delete', ['considered' => $rows->count()]);
        return 0;
    }
}
