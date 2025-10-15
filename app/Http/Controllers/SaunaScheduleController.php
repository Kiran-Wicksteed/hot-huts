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
        $daysAhead = (int) $r->input('days_ahead', 60);
        $daysAhead = max(1, min($daysAhead, 365));

        $openings = LocationOpening::where('sauna_id', $sauna->id)
            ->get(['location_id', 'weekday', 'period', 'start_time', 'end_time']);

        if ($openings->isEmpty()) {
            return back()->with('error', 'No Location Openings configured for this sauna.');
        }

        Log::debug('Fetched LocationOpening rules', ['count' => $openings->count(), 'data' => $openings->toArray()]);

        $start = Carbon::today();
        $end   = (clone $start)->addDays($daysAhead - 1);

        // 🔧 Precompute the next N dates by weekday to avoid reusing a single CarbonPeriod
        $datesByWeekday = array_fill(0, 7, []);
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $datesByWeekday[$d->dayOfWeek][] = $d->copy(); // keep Carbon instance
        }

        // 2) Determine schedules that SHOULD exist
        $idealSchedules = [];
        $windows = [];

        foreach ($openings as $o) {
            // normalise period key (defensive)
            $periodKey = strtolower(trim($o->period));

            // keep window map for slot generation
            $windows[$o->location_id][$o->weekday][$periodKey] = [
                'start' => $o->start_time,
                'end'   => $o->end_time,
            ];

            // 🔧 use precomputed dates for this weekday
            foreach ($datesByWeekday[(int) $o->weekday] as $date) {
                $dateString = $date->toDateString(); // 🔧 date-only to match DATE columns
                $scheduleKey = "{$o->location_id}|{$dateString}|{$periodKey}";

                $idealSchedules[$scheduleKey] = [
                    'sauna_id'    => $sauna->id,
                    'location_id' => $o->location_id,
                    'date'        => $dateString, // 🔧 store as DATE
                    'period'      => $periodKey,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];
            }
        }

        Log::debug('Calculated ideal schedules based on rules', ['count' => count($idealSchedules)]);

        // 3) What exists in DB?
        $existingSchedules = SaunaSchedule::where('sauna_id', $sauna->id)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()]) // 🔧 date range
            ->get()
            ->keyBy(function ($schedule) {
                $dateString = Carbon::parse($schedule->date)->toDateString();
                $periodKey  = strtolower(trim($schedule->period));
                return "{$schedule->location_id}|{$dateString}|{$periodKey}";
            });

        Log::debug('Found existing schedules in DB', ['count' => $existingSchedules->count()]);

        // 4) Diff & sync
        $schedulesToCreate = array_diff_key($idealSchedules, $existingSchedules->all());
        $schedulesToPrune  = array_diff_key($existingSchedules->all(), $idealSchedules);

        Log::debug('Schedules to be created', ['count' => count($schedulesToCreate)]);
        Log::debug('Schedules to be pruned',  ['count' => count($schedulesToPrune)]);

        if (!empty($schedulesToCreate)) {
            DB::table('sauna_schedules')->insert(array_values($schedulesToCreate));
        }

        // 6) Prune old schedules (no change)
        $prunedSchedulesCount = 0;
        if (!empty($schedulesToPrune)) {
            $pruneIds = collect($schedulesToPrune)->pluck('id')->all();
            $schedulesWithBookings = DB::table('timeslots as t')
                ->whereIn('t.sauna_schedule_id', $pruneIds)
                ->whereExists(function ($q) {
                    $q->select(DB::raw(1))
                        ->from('bookings as b')
                        ->whereColumn('b.timeslot_id', 't.id')
                        // optional guards if you use them:
                        ->when(Schema::hasColumn('bookings', 'deleted_at'), fn($qq) => $qq->whereNull('b.deleted_at'))
                        ->when(Schema::hasColumn('bookings', 'status'), fn($qq) => $qq->whereNotIn('b.status', ['cancelled', 'void']));
                })
                ->pluck('t.sauna_schedule_id')
                ->unique();
            $pruneIdsWithoutBookings = collect($pruneIds)->diff($schedulesWithBookings)->all();
            if (!empty($pruneIdsWithoutBookings)) {
                Timeslot::whereIn('sauna_schedule_id', $pruneIdsWithoutBookings)->delete();
                $prunedSchedulesCount = SaunaSchedule::whereIn('id', $pruneIdsWithoutBookings)->delete();
            }
        }

        // 7) Prune any lingering timeslots that now sit outside their window
        $timeslotsPrunedCount = $this->pruneTimeslotsOutsideWindows($sauna, $start, $end, $windows);

        // 8) Generate timeslots for *all* valid schedules in the range
        $timeslotsCreatedCount = 0;

        $validSchedules = SaunaSchedule::where('sauna_id', $sauna->id)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get();

        foreach ($validSchedules as $schedule) {
            $scheduleDate = Carbon::parse($schedule->date);
            $weekday      = $scheduleDate->dayOfWeek;
            $periodKey    = strtolower(trim($schedule->period));

            $win = $windows[$schedule->location_id][$weekday][$periodKey] ?? null;
            if (!$win) {
                Log::warning("No opening window for schedule {$schedule->id} ({$schedule->location_id} {$schedule->date} {$periodKey})");
                continue;
            }

            $slotStartTime = Carbon::parse($scheduleDate->toDateString() . ' ' . $win['start']);
            $slotEndTime   = Carbon::parse($scheduleDate->toDateString() . ' ' . $win['end']);

            $rentalDurationMinutes      = 15;
            $bufferMinutes              = 5;
            $totalSlotIntervalMinutes   = $rentalDurationMinutes + $bufferMinutes;

            // inclusive period; we’ll guard the end
            $timeslotPeriods = CarbonPeriod::create($slotStartTime, $totalSlotIntervalMinutes . ' minutes', $slotEndTime);

            foreach ($timeslotPeriods as $slotStart) {
                $slotEnd = $slotStart->copy()->addMinutes($rentalDurationMinutes);
                if ($slotEnd->gt($slotEndTime)) {
                    continue;
                }

                $ts = Timeslot::firstOrCreate(
                    [
                        'sauna_schedule_id' => $schedule->id,
                        'starts_at'         => $slotStart->format('Y-m-d H:i:s'),
                    ],
                    [
                        'ends_at'  => $slotEnd->format('Y-m-d H:i:s'),
                        'capacity' => $sauna->capacity,
                    ]
                );

                if ($ts->wasRecentlyCreated) {
                    $timeslotsCreatedCount++;
                }
            }
        }

        Log::info("Timeslot generation complete. Created {$timeslotsCreatedCount} new timeslots. Pruned {$timeslotsPrunedCount} existing slots.");

        $createdCounts = collect($schedulesToCreate)->countBy('period');
        $finalCounts   = collect(['morning' => 0, 'afternoon' => 0, 'evening' => 0, 'night' => 0])->merge($createdCounts);

        Log::info(
            'Sauna ' . $sauna->id . ': schedules added=' .
                count($schedulesToCreate) .
                ' (by period=' . json_encode($finalCounts) . ')' .
                ', schedules pruned=' . $prunedSchedulesCount .
                ', timeslots created=' . $timeslotsCreatedCount .
                ', timeslots pruned=' . $timeslotsPrunedCount
        );

        return back()->with(
            'success',
            "Schedules Generated: " . count($schedulesToCreate) .
                " (" . $finalCounts->map(fn($v, $k) => "$k:$v")->implode(', ') . ") · " .
                "Timeslots Created: $timeslotsCreatedCount · " .
                "Timeslots Pruned: $timeslotsPrunedCount · " .
                "Pruned schedules: $prunedSchedulesCount"
        );
    }

    public function updateCapacity(Request $request, SaunaSchedule $schedule)
    {
        // You may want to add authorization here to ensure the logged-in
        // user is allowed to modify this schedule. For example:
        // $this->authorize('update', $schedule);

        $data = $request->validate([
            'capacity' => ['required', 'integer', 'min:1'],
        ]);

        // Find all timeslots linked to this schedule and update their capacity.
        $updatedCount = Timeslot::where('sauna_schedule_id', $schedule->id)
            ->update(['capacity' => $data['capacity']]);

        Log::info("Updated capacity for {$updatedCount} timeslots in schedule {$schedule->id} to {$data['capacity']}.");

        // Inertia will automatically pick up this flash message and pass it as a prop.
        return back()->with('success', 'Capacity updated successfully.');
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
