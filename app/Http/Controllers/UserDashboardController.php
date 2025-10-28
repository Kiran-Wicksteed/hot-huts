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
use Illuminate\Support\Str;

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
            ->filter(function ($booking) {
                // Filter out bookings without timeslot data
                return $booking->timeslot && 
                       $booking->timeslot->schedule && 
                       $booking->timeslot->schedule->location;
            })
            ->map(function ($booking) {
                $now   = now();
                $start = Carbon::parse($booking->timeslot->starts_at);
                // 6-hour rule flag for UX
                $booking->can_reschedule = $start->greaterThan($now->copy()->addHours(6));
                return $booking;
            });

        $now = now();

        $loyalty = $this->buildLoyaltyPayload($user);

        $membership = $user->membership;

        return Inertia::render('frontend/my-bookings/index', [
            'upcoming' => $bookings->where('timeslot.starts_at', '>', $now)->values(),
            'past'     => $bookings->where('timeslot.starts_at', '<=', $now)->values(),
            'loyalty'  => $loyalty,
            'events'   => [],
            'membership' => $membership,
        ]);
    }

    public function loyaltyRedeem(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'reward_type_id' => ['required', 'integer', 'exists:loyalty_reward_types,id'],
        ]);

        $rewardType = DB::table('loyalty_reward_types')
            ->where('id', $data['reward_type_id'])
            ->where('active', true)
            ->first();

        if (!$rewardType) {
            return back()->withErrors(['reward' => 'This reward is not available.']);
        }

        $expiresDays = (int) (config('loyalty.reward_expires_days', env('LOYALTY_REWARD_EXPIRES_DAYS', 180)) ?: 180);
        $now = now();

        $result = DB::transaction(function () use ($user, $rewardType, $expiresDays, $now) {
            // 1) Lock the account row
            $acc = DB::table('loyalty_accounts')->where('user_id', $user->id)->lockForUpdate()->first();

            if (!$acc) {
                // create if missing
                $accId = DB::table('loyalty_accounts')->insertGetId([
                    'user_id'         => $user->id,
                    'points_balance'  => 0,
                    'lifetime_points' => 0,
                ]);
                $acc = DB::table('loyalty_accounts')->where('id', $accId)->lockForUpdate()->first();
            }

            $balance = (int) $acc->points_balance;
            $cost    = (int) $rewardType->points_cost;

            if ($balance < $cost) {
                return ['error' => 'Not enough points to redeem this reward.'];
            }

            // 2) Deduct points
            DB::table('loyalty_accounts')->where('id', $acc->id)->update([
                'points_balance' => $balance - $cost,
            ]);

            // 3) Ledger entry (negative points)
            DB::table('loyalty_ledger')->insert([
                'account_id'  => $acc->id,
                'type'        => 'redeem',             // your convention: e.g. earn|adjust|redeem
                'points'      => -$cost,
                'source_type' => 'reward_type',
                'source_id'   => $rewardType->id,
                'notes'       => 'Redeemed reward: ' . ($rewardType->name ?? 'Reward'),
                'meta'        => json_encode(['name' => $rewardType->name]),
                'occurred_at' => $now,
            ]);

            // 4) Generate a unique code
            $code = $this->generateUniqueRewardCode();

            // 5) Create loyalty_reward
            $rewardId = DB::table('loyalty_rewards')->insertGetId([
                'account_id'           => $acc->id,
                'reward_type_id'       => $rewardType->id,
                'code'                 => $code,
                'status'               => 'issued',        // issued | reserved | redeemed | expired
                'issued_points'        => $cost,
                'issued_at'            => $now,
                'expires_at'           => $expiresDays > 0 ? $now->clone()->addDays($expiresDays) : null,
                'reserved_at'          => null,
                'redeemed_at'          => null,
                'reserved_booking_id'  => null,
                'reserved_token'       => null,
                'redemption_booking_id' => null,
            ]);

            return ['id' => $rewardId, 'code' => $code];
        });

        if (!empty($result['error'])) {
            return back()->withErrors(['reward' => $result['error']]);
        }

        // Success — flash the new code or return JSON for SPA toast
        return redirect()->route('loyalty.index')->with('success', 'Reward redeemed! Code: ' . $result['code']);
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

    public function loyaltyIndex(Request $request)
    {
        $user = $request->user();
        $loyalty  = $this->buildLoyaltyPayload($user);
        $rewards  = $this->fetchUserRewards($user);

        // how many of the *primary* reward can be redeemed right now?
        $unit = (int) ($loyalty['unit'] ?? 10);
        $availableCount = intdiv(max($loyalty['points'] ?? 0, 0), max($unit, 1));

        return Inertia::render('loyalty/index', [
            'loyalty'              => $loyalty,
            'vouchers'             => $rewards,
            'available_to_redeem'  => $availableCount,
        ]);
    }


    /**
     * Count how many loyalty vouchers this user has *redeemed* already.
     * We detect “loyalty” coupons by their parent batch id.
     */
    private function countRedeemedLoyaltyVouchers($user): int
    {
        if (!Schema::hasTable('coupon_usage') || !Schema::hasTable('coupons')) {
            return 0;
        }

        $loginId = $this->getLoginIdForUser($user); // legacy login table mapping
        if (!$loginId) return 0;

        $parentId = (int) (config('loyalty.parent_coupon_id', env('LOYALTY_PARENT_COUPON_ID', 0)) ?: 0);

        // If you don't use parent_coupon_id, you can switch to a name LIKE filter instead.
        $q = DB::table('coupon_usage as cu')
            ->join('coupons as c', 'c.id', '=', 'cu.coupon_id')
            ->where('cu.login_id', $loginId);

        if ($parentId > 0) {
            $q->where('c.parent_coupon_id', $parentId);
        } else {
            // heuristic fallback: treat coupons with "loyalty" in name as loyalty coupons
            $q->where('c.name', 'like', '%loyalty%');
        }

        return (int) $q->count();
    }

    private function getLoginIdForUser($user): ?int
    {
        if (!Schema::hasTable('login')) return null;
        if (!$user || !$user->email) return null;

        $row = DB::table('login')->where('email', $user->email)->first();
        return $row?->id ? (int) $row->id : null;
    }

    private function buildLoyaltyPayload($user): array
    {
        // account
        $acc = DB::table('loyalty_accounts')->where('user_id', $user->id)->first();
        $points = (int) ($acc->points_balance ?? 0);
        $lifetime = $acc?->lifetime_points !== null ? (int) $acc->lifetime_points : null;

        // reward types (we’ll show the first active as the “primary”)
        $types = DB::table('loyalty_reward_types')->where('active', true)->orderBy('points_cost')->get();

        $primary = $types->first();
        $unit = (int) ($primary->points_cost ?? 10); // default 10 (your free sauna)
        $unlockedTotal = intdiv(max($points, 0), max($unit, 1));
        $toNext = $unit - (($points % $unit) ?: $unit);

        return [
            'points'         => $points,
            'lifetime'       => $lifetime,
            'unit'           => $unit,
            'points_to_next' => $toNext,
            'types'          => $types->map(fn($t) => [
                'id'          => $t->id,
                'name'        => $t->name,
                'points_cost' => (int) $t->points_cost,
                'payload'     => json_decode($t->payload ?? 'null', true),
                'active'      => (bool) $t->active,
            ])->values(),
        ];
    }
    private function fetchUserRewards($user): array
    {
        $acc = DB::table('loyalty_accounts')->where('user_id', $user->id)->first();
        if (!$acc) return [];

        $rows = DB::table('loyalty_rewards')
            ->where('account_id', $acc->id)
            ->orderByDesc('issued_at')
            ->limit(100)
            ->get();

        return $rows->map(function ($r) {
            // Normalize a friendly status for the UI
            $status = $r->status ?: (
                $r->redeemed_at ? 'redeemed' : ($r->reserved_at ? 'reserved' : 'issued')
            );

            return [
                'id'          => $r->id,
                'code'        => $r->code,
                'status'      => $status, // issued | reserved | redeemed | expired (if you set it)
                'issued_points' => (int) $r->issued_points,
                'issued_at'   => $r->issued_at,
                'reserved_at' => $r->reserved_at,
                'redeemed_at' => $r->redeemed_at,
                'expires_at'  => $r->expires_at,
                'reward_type_id' => $r->reward_type_id,
            ];
        })->values()->all();
    }
    private function generateUniqueRewardCode(): string
    {
        do {
            $code = 'HH-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(4)); // e.g., HH-ABCD-EFGH
            $exists = DB::table('loyalty_rewards')->where('code', $code)->exists();
        } while ($exists);

        return $code;
    }
}
