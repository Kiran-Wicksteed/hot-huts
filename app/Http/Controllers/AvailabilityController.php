<?php

namespace App\Http\Controllers;

use App\Models\SaunaSchedule;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Timeslot;
use Carbon\Carbon;

class AvailabilityController extends Controller
{
    public function index(Request $r)
    {
        $data = $r->validate([
            'location_id' => ['required', 'exists:locations,id'],
            'date' => ['required', 'date'],
            'period'      => ['required', Rule::in(['morning', 'afternoon', 'evening', 'night'])],
        ]);

        $schedule = SaunaSchedule::where('location_id', $data['location_id'])
            ->whereDate('date', $data['date'])
            ->where('period', $data['period'])
            ->with(['timeslots' => function ($q) {
                $q->orderBy('starts_at');
            }])
            ->first();

        if (! $schedule) {
            return response()->json([]);
        }

        $slots = $schedule->timeslots->map(function ($ts) {
            $booked = $ts->bookings()->sum('people');
            return [
                'id' => $ts->id,
                'starts_at' => $ts->starts_at->format('H:i'),
                'ends_at' => $ts->ends_at->format('H:i'),
                'spots_left' => $ts->capacity - $booked,
            ];
        });

        return response()->json($slots);
    }
    public function all(Request $r)
    {
        $data = $r->validate([
            'location_id' => ['required', 'exists:locations,id'],
            'date'        => ['required', 'date'],
        ]);

        $schedules = SaunaSchedule::query()
            ->where('location_id', $data['location_id'])
            ->whereDate('date', $data['date'])
            ->with(['timeslots' => function ($q) {
                $q->orderBy('starts_at');
            }])
            ->get(); // ✅ all periods for the day

        $timeslots = $schedules->flatMap->timeslots;

        // Map using RAW DB values to avoid timezone/cast shifts
        $slots = $timeslots->map(function ($ts) {
            // Raw DB strings (works for TIME or DATETIME)
            $rawStart = $ts->getRawOriginal('starts_at');
            $rawEnd   = $ts->getRawOriginal('ends_at');

            // Normalise to HH:mm without applying timezone
            $fmt = function ($v) {
                // handles "HH:MM:SS", "YYYY-MM-DD HH:MM:SS", or Carbon
                if ($v instanceof \Carbon\CarbonInterface) return $v->format('H:i');
                if (preg_match('/\d{2}:\d{2}(:\d{2})?$/', $v, $m)) return substr($m[0], 0, 5);
                return (string) $v; // last-ditch
            };

            $booked = (int) $ts->bookings()->sum('people');

            return [
                'id'         => $ts->id,
                'starts_at'  => $fmt($rawStart),
                'ends_at'    => $fmt($rawEnd),
                'spots_left' => max(0, (int)$ts->capacity - $booked),
                'capacity'   => (int) $ts->capacity,
                'period'     => $ts->period ?? optional($ts->schedule)->period,
                // helpful for one-off debugging in your network tab:
                'debug_raw'  => ['start' => $rawStart, 'end' => $rawEnd],
            ];
        })
            // Sort by minutes since midnight so "00:xx" doesn’t jump the queue
            ->sortBy(function ($s) {
                [$h, $m] = array_map('intval', explode(':', $s['starts_at']));
                return $h * 60 + $m;
            })
            ->values();

        return response()->json([
            'data' => $slots,
            'debug_meta' => [
                'count' => $slots->count(),
                'first' => $slots->first()['debug_raw'] ?? null,
                'last'  => $slots->last()['debug_raw'] ?? null,
            ],
        ]);
    }

    public function byPeriod(Request $r)
    {
        $data = $r->validate([
            'location_id' => ['required', 'exists:locations,id'],
            'date'        => ['required', 'date'],
        ]);

        $schedules = SaunaSchedule::query()
            ->where('location_id', $data['location_id'])
            ->whereDate('date', $data['date'])
            ->with(['timeslots' => function ($q) {
                $q->orderBy('starts_at')
                    ->withSum(['bookings as booked_people' => function ($qq) {
                        $qq->whereNull('cancelled_at');
                    }], 'people');
            }])
            ->get();

        $fmt = function ($v) {
            if ($v instanceof \Carbon\CarbonInterface) return $v->format('H:i');
            if (is_string($v) && preg_match('/\d{2}:\d{2}(:\d{2})?$/', $v, $m)) return substr($m[0], 0, 5);
            return (string) $v;
        };

        $slots = $schedules->flatMap->timeslots->map(function ($ts) use ($fmt) {
            $rawStart = $ts->getRawOriginal('starts_at');
            $rawEnd   = $ts->getRawOriginal('ends_at');
            $booked   = (int) ($ts->booked_people ?? 0);

            return [
                'id'         => $ts->id,
                'starts_at'  => $fmt($rawStart),
                'ends_at'    => $fmt($rawEnd),
                'spots_left' => max(0, (int)$ts->capacity - $booked),
                'capacity'   => (int) $ts->capacity,
                'period'     => $ts->period ?? optional($ts->schedule)->period,
            ];
        });

        $grouped = $slots->groupBy('period')->map(fn($g) => $g->sortBy('starts_at')->values());

        return response()->json([
            'morning'   => $grouped->get('morning', collect())->values(),
            'afternoon' => $grouped->get('afternoon', collect())->values(),
            'evening'   => $grouped->get('evening', collect())->values(),
            'night'     => $grouped->get('night', collect())->values(),
        ]);
    }
}
