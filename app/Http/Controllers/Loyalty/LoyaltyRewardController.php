<?php

namespace App\Http\Controllers\Loyalty;

use App\Http\Controllers\Controller;
use App\Models\{Booking, LoyaltyReward};
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LoyaltyRewardController extends Controller
{
    public function apply(Request $request, \App\Services\LoyaltyService $service)
    {
        $validated = $request->validate([
            'code'       => ['required', 'string'],
            'booking_id' => ['nullable', 'integer'],
            'cart_key'   => ['nullable', 'string', 'max:64'],
        ]);

        Log::info('[LOYALTY] Applying reward code', ['user_id' => $request->user()->id, 'code' => $validated['code'], 'booking_id' => $validated['booking_id'] ?? null, 'cart_key' => $validated['cart_key'] ?? null]);

        $user = $request->user();
        $code = strtoupper(trim($validated['code']));

        $reward = \App\Models\LoyaltyReward::query()
            ->where('code', $code)
            ->whereHas('account', fn($q) => $q->where('user_id', $user->id))
            ->first();

        if (! $reward) {
            return back()->withErrors(['code' => 'Invalid code.']);
        }
        if ($reward->status !== \App\Models\LoyaltyReward::STATUS_ISSUED) {
            return back()->withErrors(['code' => 'Code is not available.']);
        }

        // A) If booking_id present, reserve directly to the booking (unchanged)
        if (!empty($validated['booking_id'])) {
            $booking = \App\Models\Booking::where('id', $validated['booking_id'])
                ->where('user_id', $user->id)
                ->where('status', '!=', 'paid')
                ->firstOrFail();

            $service->reserveRewardForBooking($reward, $booking->id);
            return back()->with('success', 'Free sauna applied to this booking.');
        }

        // B) Else reserve to cart_key (pre-booking)
        if (!empty($validated['cart_key'])) {
            // no nested transaction here; keep it simple
            DB::transaction(function () use ($reward, $validated) {
                $reward->refresh();
                if ($reward->status !== \App\Models\LoyaltyReward::STATUS_ISSUED) {
                    throw \Illuminate\Validation\ValidationException::withMessages(['code' => 'Code is not available.']);
                }
                if ($reward->expires_at && $reward->expires_at->isPast()) {
                    throw \Illuminate\Validation\ValidationException::withMessages(['code' => 'Reward has expired.']);
                }
                $reward->update([
                    'status'          => \App\Models\LoyaltyReward::STATUS_RESERVED,
                    'reserved_at'     => now(),
                    'reserved_token'  => $validated['cart_key'], // <— cart-level reservation
                    'reserved_booking_id' => null,
                ]);
            });

            return back()->with('success', 'Free sauna applied to this cart.');
        }

        return back()->withErrors(['code' => 'Missing booking_id or cart_key.']);
    }

    public function remove(Request $request, LoyaltyService $service)
    {
        $validated = $request->validate([
            'booking_id' => ['required', 'integer'],
        ]);

        if ($reward = LoyaltyReward::query()
            ->where('status', LoyaltyReward::STATUS_RESERVED)
            ->where('reserved_booking_id', $validated['booking_id'])
            ->first()
        ) {
            $service->unreserve($reward);
        }

        return back()->with('success', 'Reward removed from this booking.');
    }
}
