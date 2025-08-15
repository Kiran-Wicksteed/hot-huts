<?php

namespace App\Http\Controllers;

use App\Models\SaunaSchedule;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Timeslot;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log; // Add this at the top of your controller file
use Illuminate\Support\Facades\DB; // Add this to import the DB facade

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

        // --- LOG 1: Log the incoming data ---
        Log::info('API Request Data:', $data);

        $query = SaunaSchedule::query()
            ->where('location_id', $data['location_id'])
            ->whereDate('date', $data['date'])
            ->with(['timeslots' => function ($q) {
                $q->orderBy('starts_at')
                    ->withSum(['bookings as booked_people' => function ($qq) {
                        $qq->whereNull('cancelled_at');
                    }], 'people');
            }]);

        // --- LOG 2: Log the raw SQL query and its bindings ---
        Log::info('Generated SQL:', [
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings()
        ]);

        $schedules = $query->get();

        // --- LOG 3: Log the results found by the query ---
        Log::info('Schedules found:', [
            'count' => $schedules->count(),
            'dates' => $schedules->pluck('date')
        ]);


        // ... the rest of your method is the same
        $fmt = function ($v) {
            // ...
        };
        // ...
        return response()->json([
            // ...
        ]);
    }

    // In app/Http/Controllers/OpeningController.php

    // Add this new method. You can keep the old 'index' method for now.

    public function byDayOfWeek(Request $r)
    {
        $data = $r->validate([
            'location_id' => ['required', 'exists:locations,id'],
            'weekday'     => ['required', 'integer', 'between:0,6'], // 0=Sun ... 6=Sat
        ]);

        // Build base query
        $query = SaunaSchedule::query()
            ->where('location_id', $data['location_id'])
            ->whereDate('date', '>=', now()->toDateString())
            ->with(['timeslots' => function ($q) {
                $q->orderBy('starts_at')
                    ->withSum(['bookings as booked_people' => function ($qq) {
                        $qq->whereNull('cancelled_at');
                    }], 'people');
            }])
            ->orderBy('date');

        // Optional DB-specific weekday filter (keeps result set small)
        $driver = DB::getDriverName();
        if ($driver === 'sqlite') {
            $query->whereRaw("strftime('%w', date) = ?", [(string)$data['weekday']]); // 0=Sun..6=Sat
        } elseif ($driver === 'mysql') {
            // DAYOFWEEK(): 1=Sun..7=Sat ⇒ add 1 to our 0–6 input
            $query->whereRaw("DAYOFWEEK(`date`) = ?", [(int)$data['weekday'] + 1]);
        }

        $allSchedules = $query->get();



        // Extra safety: filter in PHP too (works regardless of DB)
        $schedulesOnCorrectDay = $allSchedules->filter(function ($schedule) use ($data) {
            $d = $schedule->date instanceof \Carbon\Carbon ? $schedule->date : \Carbon\Carbon::parse($schedule->date);
            return $d->dayOfWeek === (int)$data['weekday']; // 0=Sun..6=Sat
        });



        // Group by date string
        $groupedByDate = $schedulesOnCorrectDay->groupBy(function ($schedule) {
            $d = $schedule->date instanceof \Carbon\Carbon ? $schedule->date : \Carbon\Carbon::parse($schedule->date);
            return $d->toDateString();
        });



        $formattedData = $groupedByDate->map(function ($schedulesForOneDay, $dateString) {
            // Flatten timeslots and ATTACH the schedule period to each slot
            $slots = $schedulesForOneDay->flatMap(function ($schedule) {
                return $schedule->timeslots->map(function ($ts) use ($schedule) {
                    return [
                        'id'         => $ts->id,
                        'starts_at'  => \Carbon\Carbon::parse($ts->starts_at)->format('H:i'),
                        'ends_at'    => \Carbon\Carbon::parse($ts->ends_at)->format('H:i'),
                        'spots_left' => max(0, (int)$ts->capacity - (int)($ts->booked_people ?? 0)),
                        'capacity'   => (int) $ts->capacity,
                        'period'     => $schedule->period, // <- critical fix
                    ];
                });
            });

            $groupedSlots = $slots->groupBy('period');

            return [
                'date'    => $dateString,
                'dayName' => \Carbon\Carbon::parse($dateString)->format('l'),
                'slots'   => [
                    'morning'   => array_values(($groupedSlots->get('morning') ?? collect())->toArray()),
                    'afternoon' => array_values(($groupedSlots->get('afternoon') ?? collect())->toArray()),
                    'evening'   => array_values(($groupedSlots->get('evening') ?? collect())->toArray()),
                    'night'     => array_values(($groupedSlots->get('night') ?? collect())->toArray()),
                ],
            ];
        })->values();



        return response()->json($formattedData);
    }
}
