<?php

namespace App\Http\Controllers;

use App\Models\SaunaSchedule;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Timeslot;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log; // Add this at the top of your controller file
use Illuminate\Support\Facades\DB; // Add this to import the DB facade
use Illuminate\Support\Facades\Schema; // Add this to import the Schema facade

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
            // Accept "HH:mm" or "HH:mm:ss" – this is your "pivot" time
            'after'       => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
        ]);

        $now = now();
        $afterTs = $r->filled('after')
            ? \Carbon\Carbon::parse("{$data['date']} {$data['after']}")
            : null;

        // Sum only: PAID + PENDING where hold_expires_at > now()
        $bookingSumFilter = function ($qq) use ($now) {
            if (\Illuminate\Support\Facades\Schema::hasColumn('bookings', 'cancelled_at')) {
                $qq->whereNull('cancelled_at');
            } elseif (\Illuminate\Support\Facades\Schema::hasColumn('bookings', 'is_cancelled')) {
                $qq->where(function ($q) {
                    $q->whereNull('is_cancelled')->orWhere('is_cancelled', false);
                });
            } elseif (\Illuminate\Support\Facades\Schema::hasColumn('bookings', 'status')) {
                $qq->whereNotIn('status', ['cancelled', 'refunded', 'failed']);
            }

            if (
                \Illuminate\Support\Facades\Schema::hasColumn('bookings', 'status') &&
                \Illuminate\Support\Facades\Schema::hasColumn('bookings', 'hold_expires_at')
            ) {
                $qq->where(function ($q) use ($now) {
                    $q->where('status', 'paid')
                        ->orWhere(function ($q2) use ($now) {
                            $q2->where('status', 'pending')
                                ->where('hold_expires_at', '>', $now);
                        });
                });
            } else {
                if (\Illuminate\Support\Facades\Schema::hasColumn('bookings', 'status')) {
                    $qq->where('status', 'paid');
                }
            }
        };

        $schedules = \App\Models\SaunaSchedule::query()
            ->where('location_id', $data['location_id'])
            ->whereDate('date', $data['date'])
            ->with(['timeslots' => function ($q) use ($bookingSumFilter, $now) {
                $q->orderBy('starts_at')
                    ->withSum(['bookings as booked_people' => $bookingSumFilter], 'people');

                if (
                    \Illuminate\Support\Facades\Schema::hasColumn('bookings', 'hold_expires_at') &&
                    \Illuminate\Support\Facades\Schema::hasColumn('bookings', 'status')
                ) {
                    $q->withMin(['bookings as next_release_at' => function ($qq) use ($now) {
                        $qq->where('status', 'pending')->where('hold_expires_at', '>', $now);
                    }], 'hold_expires_at');
                }
            }])
            ->get();

        $timeslots = $schedules->flatMap->timeslots;

        // Lazy clean-up: cancel expired holds for JUST these timeslots (no cron needed)
        if ($timeslots->isNotEmpty() && \Illuminate\Support\Facades\Schema::hasColumn('bookings', 'hold_expires_at')) {
            \App\Models\Booking::whereIn('timeslot_id', $timeslots->pluck('id'))
                ->where('status', 'pending')
                ->whereNotNull('hold_expires_at')
                ->where('hold_expires_at', '<=', $now)
                ->update([
                    'status'         => 'cancelled',
                    'payment_status' => \Illuminate\Support\Facades\DB::raw("COALESCE(payment_status, 'Hold expired')"),
                ]);
        }

        // Map using RAW DB values to avoid timezone/cast shifts
        $slots = $timeslots->map(function ($ts) {
            $rawStart = $ts->getRawOriginal('starts_at');
            $rawEnd   = $ts->getRawOriginal('ends_at');

            $fmt = function ($v) {
                if ($v instanceof \Carbon\CarbonInterface) return $v->format('H:i');
                if (preg_match('/\d{2}:\d{2}(:\d{2})?$/', $v, $m)) return substr($m[0], 0, 5);
                return (string) $v;
            };

            $booked   = (int) ($ts->booked_people ?? 0);
            $capacity = (int) $ts->capacity;

            return [
                'id'         => $ts->id,
                'starts_at'  => $fmt($rawStart),
                'ends_at'    => $fmt($rawEnd),
                'spots_left' => max(0, $capacity - $booked),
                'capacity'   => $capacity,
                'period'     => $ts->period ?? optional($ts->schedule)->period,
                'debug_raw'  => ['start' => $rawStart, 'end' => $rawEnd],
            ];
        })
            ->sortBy(function ($s) { // chronological
                [$h, $m] = array_map('intval', explode(':', $s['starts_at']));
                return $h * 60 + $m;
            })
            ->values();

        // Partition the day's slots into "before" and "after" relative to the provided time (same date)
        $before = collect();
        $after  = $slots;

        if ($afterTs) {
            $before = $slots->filter(function ($s) use ($afterTs, $data) {
                $slotStart = \Carbon\Carbon::parse("{$data['date']} {$s['starts_at']}:00");
                return $slotStart->lt($afterTs);
            })->values();

            $after = $slots->filter(function ($s) use ($afterTs, $data) {
                $slotStart = \Carbon\Carbon::parse("{$data['date']} {$s['starts_at']}:00");
                return $slotStart->greaterThanOrEqualTo($afterTs);
            })->values();
        }

        return response()->json([
            'data' => [
                'all'    => $slots,   // full day, unchanged
                'before' => $before,  // strictly before the pivot time (same day)
                'after'  => $after,   // at/after the pivot time (same day)
            ],
            'debug_meta' => [
                'all_count'    => $slots->count(),
                'before_count' => $before->count(),
                'after_count'  => $after->count(),
                'first'        => $slots->first()['debug_raw'] ?? null,
                'last'         => $slots->last()['debug_raw'] ?? null,
                'pivot'        => $afterTs?->toDateTimeString(),
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
            'weekday'     => ['required', 'integer', 'between:0,6'], // 0=Sun..6=Sat
        ]);

        $now = now();

        // Sum only: PAID + PENDING where hold_expires_at > now()
        $bookingSumFilter = function ($qq) use ($now) {
            // Exclude cancelled where possible (defensive)
            if (Schema::hasColumn('bookings', 'cancelled_at')) {
                $qq->whereNull('cancelled_at');
            } elseif (Schema::hasColumn('bookings', 'is_cancelled')) {
                $qq->where(function ($q) {
                    $q->whereNull('is_cancelled')->orWhere('is_cancelled', false);
                });
            } elseif (Schema::hasColumn('bookings', 'status')) {
                $qq->whereNotIn('status', ['cancelled', 'refunded', 'failed']);
            }

            // Active capacity: paid OR (pending & unexpired hold)
            if (Schema::hasColumn('bookings', 'status') && Schema::hasColumn('bookings', 'hold_expires_at')) {
                $qq->where(function ($q) use ($now) {
                    $q->where('status', 'paid')
                        ->orWhere(function ($q2) use ($now) {
                            $q2->where('status', 'pending')
                                ->where('hold_expires_at', '>', $now);
                        });
                });
            } else {
                // Fallback: only count paid if hold_expires_at/status not available
                if (Schema::hasColumn('bookings', 'status')) {
                    $qq->where('status', 'paid');
                }
            }
        };

        $query = \App\Models\SaunaSchedule::query()
            ->where('location_id', $data['location_id'])
            ->whereDate('date', '>=', $now->toDateString())
            ->with(['timeslots' => function ($q) use ($bookingSumFilter, $now) {
                $q->orderBy('starts_at')
                    // people being consumed (paid + active holds)
                    ->withSum(['bookings as booked_people' => $bookingSumFilter], 'people');

                // Optional: earliest active hold expiry for countdowns in UI
                if (Schema::hasColumn('bookings', 'hold_expires_at') && Schema::hasColumn('bookings', 'status')) {
                    $q->withMin(['bookings as next_release_at' => function ($qq) use ($now) {
                        $qq->where('status', 'pending')->where('hold_expires_at', '>', $now);
                    }], 'hold_expires_at');
                }
            }])
            ->orderBy('date');

        // DB-specific weekday filter
        $driver = DB::getDriverName();
        if ($driver === 'sqlite') {
            $query->whereRaw("strftime('%w', date) = ?", [(string) $data['weekday']]);
        } elseif ($driver === 'mysql') {
            // MySQL: 1=Sun..7=Sat => add 1
            $query->whereRaw("DAYOFWEEK(`date`) = ?", [(int) $data['weekday'] + 1]);
        }

        $allSchedules = $query->get();

        // Safety: php filter too
        $schedulesOnCorrectDay = $allSchedules->filter(function ($schedule) use ($data) {
            $d = $schedule->date instanceof \Carbon\Carbon ? $schedule->date : \Carbon\Carbon::parse($schedule->date);
            return $d->dayOfWeek === (int) $data['weekday'];
        });

        // Group by date
        $groupedByDate = $schedulesOnCorrectDay->groupBy(function ($schedule) {
            $d = $schedule->date instanceof \Carbon\Carbon ? $schedule->date : \Carbon\Carbon::parse($schedule->date);
            return $d->toDateString();
        });

        $formattedData = $groupedByDate->map(function ($schedulesForOneDay, $dateString) {
            $slots = $schedulesForOneDay->flatMap(function ($schedule) {
                return $schedule->timeslots->map(function ($ts) use ($schedule) {
                    $booked = (int) ($ts->booked_people ?? 0);
                    $capacity = (int) $ts->capacity;

                    return [
                        'id'              => $ts->id,
                        'starts_at'       => \Carbon\Carbon::parse($ts->starts_at)->format('H:i'),
                        'ends_at'         => \Carbon\Carbon::parse($ts->ends_at)->format('H:i'),
                        'spots_left'      => max(0, $capacity - $booked),
                        'capacity'        => $capacity,
                        'period'          => $schedule->period,
                        // Optional for nicer UX (show countdown when soft-full):
                        // 'next_release_at' => isset($ts->next_release_at) ? \Carbon\Carbon::parse($ts->next_release_at)->toIso8601String() : null,
                        // 'softFull'        => ($capacity - $booked) === 0 && isset($ts->next_release_at),
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
