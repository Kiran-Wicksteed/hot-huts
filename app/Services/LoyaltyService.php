<?php

namespace App\Services;

use App\Models\{Booking, LoyaltyAccount, LoyaltyLedger, LoyaltyReward, LoyaltyRewardType, User};
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoyaltyService
{
    /**
     * Accrue points when a booking becomes "paid".
     * - Idempotent per booking via ledger unique key (earn/Booking/{id})
     * - Issues vouchers synchronously while balance >= cost
     */
    public function accrueFromBooking(Booking $booking): void
    {
        if ($booking->status !== config('loyalty.eligible_status')) {
            return;
        }

        DB::transaction(function () use ($booking) {
            $account = $this->lockAccount($booking->user);

            // Idempotency: already earned for this booking?
            $exists = $account->ledger()
                ->where('type', LoyaltyLedger::TYPE_EARN)
                ->where('source_type', 'Booking')
                ->where('source_id', $booking->id)
                ->exists();
            if ($exists) return;

            $points = max(1, (int)($booking->people ?? 1));

            // 1) EARN
            $this->insertLedger($account, LoyaltyLedger::TYPE_EARN, +$points, 'Booking', $booking->id, [
                'booking_people' => $booking->people,
                'booking_amount' => $booking->amount ?? null,
            ]);

            // 2) balances (✅ replace incrementEach with two increments)
            $account->increment('points_balance', $points);
            $account->increment('lifetime_points', $points);

            // 3) Auto-issue vouchers
            if (!config('loyalty.auto_issue_rewards')) return;

            $cost = (int) config('loyalty.points_per_reward', 10);
            if ($cost < 1) $cost = 10;

            while ($account->points_balance >= $cost) {
                // Create the voucher first so the convert ledger can reference it
                $reward = $this->issueReward($account, $cost);

                // Convert (debit points) referencing the reward id
                $this->insertLedger($account, LoyaltyLedger::TYPE_CONVERT, -$cost, 'Reward', $reward->id, [
                    'reason' => 'auto-issue voucher',
                    'booking_id' => $booking->id,
                ]);
                $account->decrement('points_balance', $cost);
            }
        });
    }

    /**
     * Reverse previously accrued points for a refunded/cancelled booking.
     * - If balance goes negative, void newest unredeemed vouchers to offset.
     */
    public function reverseFromBooking(Booking $booking): void
    {
        DB::transaction(function () use ($booking) {
            $account = $this->lockAccount($booking->user);

            $earn = $account->ledger()
                ->where('type', LoyaltyLedger::TYPE_EARN)
                ->where('source_type', 'Booking')
                ->where('source_id', $booking->id)
                ->first();

            if (!$earn) return;

            $already = $account->ledger()
                ->where('type', LoyaltyLedger::TYPE_REVERSAL)
                ->where('source_type', 'Booking')
                ->where('source_id', $booking->id)
                ->exists();
            if ($already) return;

            $points = (int) $earn->points;

            // Reversal entry
            $this->insertLedger($account, LoyaltyLedger::TYPE_REVERSAL, -$points, 'Booking', $booking->id, [
                'reason' => 'booking refunded/cancelled',
            ]);

            // Reduce balance (may go negative temporarily)
            $account->decrement('points_balance', $points);

            // Bring balance back to >= 0 by voiding newest issued vouchers (LIFO)
            while ($account->points_balance < 0) {
                $reward = $account->rewards()
                    ->where('status', LoyaltyReward::STATUS_ISSUED)
                    ->latest('issued_at')
                    ->first();

                if (!$reward) break;

                $reward->update(['status' => LoyaltyReward::STATUS_VOID]);

                $cost = $reward->issued_points ?? (int) config('loyalty.points_per_reward', 10);

                // Compensating convert to reflect the void (+cost back)
                $this->insertLedger($account, LoyaltyLedger::TYPE_CONVERT, +$cost, 'Reward', $reward->id, [
                    'reason' => 'void voucher to offset negative balance',
                ]);
                $account->increment('points_balance', $cost);
            }
        });
    }

    /**
     * Reserve a reward for an in-progress checkout/cart.
     * Prevents double-use across tabs.
     */
    public function reserveRewardForBooking(LoyaltyReward $reward, $bookingOrCartId): void
    {
        DB::transaction(function () use ($reward, $bookingOrCartId) {
            $reward->refresh();

            if ($reward->status !== LoyaltyReward::STATUS_ISSUED) {
                throw ValidationException::withMessages(['code' => 'Reward is not available to reserve.']);
            }
            if ($reward->expires_at && $reward->expires_at->isPast()) {
                throw ValidationException::withMessages(['code' => 'Reward has expired.']);
            }

            $reward->update([
                'status' => LoyaltyReward::STATUS_RESERVED,
                'reserved_at' => now(),
                'reserved_booking_id' => $bookingOrCartId,
            ]);
        });
    }

    /**
     * Unreserve a reward (checkout abandoned/removed).
     */
    public function unreserve(LoyaltyReward $reward): void
    {
        DB::transaction(function () use ($reward) {
            if ($reward->status === LoyaltyReward::STATUS_RESERVED) {
                $reward->update([
                    'status' => LoyaltyReward::STATUS_ISSUED,
                    'reserved_at' => null,
                    'reserved_booking_id' => null,
                ]);
            }
        });
    }

    /**
     * Redeem a reserved (or still issued) reward against a successful booking.
     * Writes a zero-point REDEEM ledger marker.
     */
    public function redeemRewardForBooking(LoyaltyReward $reward, $bookingId): void
    {
        DB::transaction(function () use ($reward, $bookingId) {
            $reward->refresh();

            if (!in_array($reward->status, [LoyaltyReward::STATUS_RESERVED, LoyaltyReward::STATUS_ISSUED], true)) {
                throw ValidationException::withMessages(['code' => 'Reward is not redeemable.']);
            }

            // Optional: ensure booking->user owns this account
            $account = $reward->account()->lockForUpdate()->first();

            $reward->update([
                'status' => LoyaltyReward::STATUS_REDEEMED,
                'redeemed_at' => now(),
                'redemption_booking_id' => $bookingId,
            ]);

            // 0-point marker for audit
            $this->insertLedger($account, LoyaltyLedger::TYPE_REDEEM, 0, 'Reward', $reward->id, [
                'booking_id' => $bookingId,
            ]);
        });
    }

    /* ----------------- helpers ----------------- */

    protected function lockAccount(User $user): LoyaltyAccount
    {
        // Create if missing, then row-lock
        $account = LoyaltyAccount::firstOrCreate(['user_id' => $user->id], []);
        return LoyaltyAccount::whereKey($account->id)->lockForUpdate()->first();
    }

    protected function insertLedger(
        LoyaltyAccount $account,
        string $type,
        int $points,
        string $sourceType,
        int $sourceId,
        array $meta = []
    ): void {
        $occurredAt = Carbon::now();

        try {
            $account->ledger()->create([
                'type'        => $type,
                'points'      => $points,
                'source_type' => $sourceType,
                'source_id'   => $sourceId,
                'meta'        => $meta,
                'occurred_at' => $occurredAt,
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            // Swallow duplicate inserts for idempotent operations
            if (str_contains(strtolower($e->getMessage()), 'ledger_unique_event')) {
                return;
            }
            throw $e;
        }
    }

    protected function issueReward(LoyaltyAccount $account, int $cost): LoyaltyReward
    {
        $type = LoyaltyRewardType::where('active', true)->orderBy('id')->first();
        if (!$type) {
            $type = LoyaltyRewardType::create([
                'name'        => 'Free Sauna',
                'points_cost' => config('loyalty.points_per_reward', 10),
                'payload'     => ['covers' => '1-seat'],
                'active'      => true,
            ]);
        }

        return $account->rewards()->create([
            'reward_type_id' => $type->id,
            'code'           => $this->generateCode(),
            'status'         => LoyaltyReward::STATUS_ISSUED,
            'issued_points'  => $cost,
            'issued_at'      => now(),
            'expires_at'     => $this->expiryAt(),
        ]);
    }

    protected function generateCode(): string
    {
        // 10-char uppercase, avoid confusing chars
        do {
            $raw  = strtoupper(Str::random(10));
            $code = strtr($raw, ['O' => 'X', '0' => 'Z', 'I' => 'Y', '1' => 'W', 'L' => 'M']);
        } while (LoyaltyReward::where('code', $code)->exists());

        return $code;
    }

    protected function expiryAt(): ?Carbon
    {
        $days = config('loyalty.reward_expiry_days');
        return $days ? now()->addDays($days) : null;
    }

    public function rebindReservationToBookingByCartKey(\App\Models\User $user, string $cartKey, int $bookingId): ?\App\Models\LoyaltyReward
    {
        return DB::transaction(function () use ($user, $cartKey, $bookingId) {
            $account = \App\Models\LoyaltyAccount::where('user_id', $user->id)->first();
            if (!$account) return null;

            $reward = \App\Models\LoyaltyReward::query()
                ->where('account_id', $account->id)
                ->where('status', \App\Models\LoyaltyReward::STATUS_RESERVED)
                ->where('reserved_booking_id', $cartKey) // was reserved to cart
                ->lockForUpdate()
                ->first();

            if (!$reward) return null;

            $reward->update(['reserved_booking_id' => $bookingId]); // move the link to the booking
            return $reward;
        });
    }

    public function findReservedForBookingOrCart(\App\Models\User $user, $bookingOrCartId): ?\App\Models\LoyaltyReward
    {
        $account = \App\Models\LoyaltyAccount::where('user_id', $user->id)->first();
        if (!$account) return null;

        return \App\Models\LoyaltyReward::query()
            ->where('account_id', $account->id)
            ->where('status', \App\Models\LoyaltyReward::STATUS_RESERVED)
            ->where('reserved_booking_id', $bookingOrCartId)
            ->first();
    }
}
