<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Booking;
use App\Models\Timeslot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UserDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $bookings = Booking::query()
            ->select('bookings.*')
            ->leftJoin('timeslots', 'timeslots.id', '=', 'bookings.timeslot_id')
            ->where('bookings.status', 'paid')
            ->where('bookings.user_id', $user->id)
            ->orderBy('timeslots.starts_at')
            ->with(['timeslot.schedule.location', 'services'])
            ->get()
            ->map(function ($booking) {
                $now   = now();
                $start = Carbon::parse($booking->timeslot->starts_at);
                // 6-hour rule flag for UX
                $booking->can_reschedule = $start->greaterThan($now->copy()->addHours(6));
                return $booking;
            });

        $now = now();

        return Inertia::render('frontend/my-bookings/index', [
            'upcoming' => $bookings->where('timeslot.starts_at', '>', $now)->values(),
            'past'     => $bookings->where('timeslot.starts_at', '<=', $now)->values(),
            'points'   => $user->loyalty_points ?? 0,
            'events'   => [],
        ]);
    }

    /** Show the reschedule page */
    public function reschedule(Booking $booking)
    {
        abort_unless($booking->user_id === Auth::id(), 403);

        $now   = now();
        $start = Carbon::parse($booking->timeslot->starts_at);

        if ($start->lessThanOrEqualTo($now->copy()->addHours(6))) {
            abort(403, 'Cannot reschedule within 6 hours of start time.');
        }

        return Inertia::render('frontend/my-bookings/reschedule', [
            'booking' => $booking->load('timeslot.schedule.location', 'services'),
        ]);
    }

    /** Return available slots for the booking’s location on a chosen date (grouped by period) */
    public function rescheduleOptions(Booking $booking, Request $request)
    {
        abort_unless($booking->user_id === Auth::id(), 403);

        $date = Carbon::parse($request->query('date', now()->toDateString()))->startOfDay();
        $weekday = $date->dayOfWeek; // 0=Sun..6=Sat
        $locationId = $booking->timeslot->schedule->location_id;
        $now = now();

        // Build the same query your AvailabilityController@byDayOfWeek uses, inline here
        $bookingSumFilter = function ($qq) use ($now) {
            // Exclude cancelled (defensive)
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
                if (Schema::hasColumn('bookings', 'status')) {
                    $qq->where('status', 'paid');
                }
            }
        };

        $query = \App\Models\SaunaSchedule::query()
            ->where('location_id', $locationId)
            ->whereDate('date', '>=', $now->toDateString())
            ->with(['timeslots' => function ($q) use ($bookingSumFilter, $now) {
                $q->orderBy('starts_at')
                    ->withSum(['bookings as booked_people' => $bookingSumFilter], 'people');

                if (Schema::hasColumn('bookings', 'hold_expires_at') && Schema::hasColumn('bookings', 'status')) {
                    $q->withMin(['bookings as next_release_at' => function ($qq) use ($now) {
                        $qq->where('status', 'pending')->where('hold_expires_at', '>', $now);
                    }], 'hold_expires_at');
                }
            }])
            ->orderBy('date');

        // Weekday filter for that chosen date
        $driver = DB::getDriverName();
        if ($driver === 'sqlite') {
            $query->whereRaw("strftime('%w', date) = ?", [(string) $weekday]);
        } elseif ($driver === 'mysql') {
            $query->whereRaw("DAYOFWEEK(`date`) = ?", [(int) $weekday + 1]); // MySQL 1..7
        }

        $all = $query->get();

        // Extra safety filter by PHP weekday
        $filtered = $all->filter(function ($schedule) use ($weekday) {
            $d = $schedule->date instanceof Carbon ? $schedule->date : Carbon::parse($schedule->date);
            return $d->dayOfWeek === (int) $weekday;
        });

        $groupedByDate = $filtered->groupBy(function ($schedule) {
            $d = $schedule->date instanceof Carbon ? $schedule->date : Carbon::parse($schedule->date);
            return $d->toDateString();
        });

        $formatted = $groupedByDate->map(function ($schedulesForOneDay, $dateString) {
            $slots = $schedulesForOneDay->flatMap(function ($schedule) {
                return $schedule->timeslots->map(function ($ts) use ($schedule) {
                    $booked   = (int) ($ts->booked_people ?? 0);
                    $capacity = (int) $ts->capacity;
                    return [
                        'id'         => $ts->id,
                        'starts_at'  => Carbon::parse($ts->starts_at)->format('H:i'),
                        'ends_at'    => Carbon::parse($ts->ends_at)->format('H:i'),
                        'starts_iso' => Carbon::parse($ts->starts_at)->toIso8601String(),
                        'spots_left' => max(0, $capacity - $booked),
                        'capacity'   => $capacity,
                        'period'     => $schedule->period,
                    ];
                });
            });

            $groupedSlots = $slots->groupBy('period');

            return [
                'date'    => $dateString,
                'dayName' => Carbon::parse($dateString)->format('l'),
                'slots'   => [
                    'morning'   => array_values(($groupedSlots->get('morning') ?? collect())->toArray()),
                    'afternoon' => array_values(($groupedSlots->get('afternoon') ?? collect())->toArray()),
                    'evening'   => array_values(($groupedSlots->get('evening') ?? collect())->toArray()),
                    'night'     => array_values(($groupedSlots->get('night') ?? collect())->toArray()),
                ],
            ];
        })->values();

        return response()->json($formatted);
    }

    /** Persist the new timeslot */
    public function rescheduleStore(Booking $booking, Request $request)
    {
        abort_unless($booking->user_id === Auth::id(), 403);

        $now   = now();
        $start = Carbon::parse($booking->timeslot->starts_at);

        // Only allow reschedule if current booking is still ≥ 6 hours away
        if ($start->lessThanOrEqualTo($now->copy()->addHours(6))) {
            return back()->withErrors(['timeslot_id' => 'Cannot reschedule within 6 hours of start time.']);
        }

        $data = $request->validate([
            'timeslot_id' => ['required', 'integer', 'exists:timeslots,id'],
        ]);

        // Load target slot
        $newTs = Timeslot::with('schedule')->findOrFail($data['timeslot_id']);

        // Must be same location as original booking
        $currentLocationId = $booking->timeslot->schedule->location_id;
        if ($newTs->schedule->location_id !== $currentLocationId) {
            return back()->withErrors(['timeslot_id' => 'Please choose a slot at the same location.']);
        }

        // Must be in the future (and avoid choosing the exact same slot)
        $newStart = Carbon::parse($newTs->starts_at);
        if ($newTs->id === $booking->timeslot_id) {
            return back()->withErrors(['timeslot_id' => 'This is your current slot. Please select a different one.']);
        }
        if ($newStart->lessThanOrEqualTo($now)) {
            return back()->withErrors(['timeslot_id' => 'Chosen slot is in the past.']);
        }

        // Capacity check: paid + active pending holds + this booking’s people
        $bookedPeople = $newTs->bookings()
            ->where(function ($q) use ($now) {
                $q->where('status', 'paid')
                    ->orWhere(function ($q2) use ($now) {
                        $q2->where('status', 'pending')
                            ->where('hold_expires_at', '>', $now);
                    });
            })->sum('people');

        if ($bookedPeople + $booking->people > $newTs->capacity) {
            return back()->withErrors(['timeslot_id' => 'Not enough spots left in this slot.']);
        }

        // All good — swap the timeslot
        $booking->timeslot_id = $newTs->id;
        $booking->save();

        return redirect()->route('user.dashboard')->with('success', 'Booking rescheduled.');
    }
}
