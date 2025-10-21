<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class CouponController extends Controller
{
    /**
     * Apply a coupon to the cart
     */
    public function apply(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string'],
            'cart_key' => ['required', 'string'],
        ]);

        $code = strtoupper(trim($data['code']));
        $cartKey = $data['cart_key'];

        \Log::info('Code apply attempt', [
            'code' => $code,
            'user_id' => Auth::id(),
            'cart_key' => $cartKey,
        ]);

        // First, check if it's a loyalty reward code
        $loyaltyReward = \App\Models\LoyaltyReward::where('code', $code)
            ->whereHas('account', function($q) {
                $q->where('user_id', Auth::id());
            })
            ->first();

        if ($loyaltyReward) {
            \Log::info('Loyalty reward found, redirecting to loyalty system', [
                'code' => $code,
                'reward_id' => $loyaltyReward->id,
            ]);
            
            // Redirect to loyalty rewards apply route with required service dependency
            $loyaltyService = app(\App\Services\LoyaltyService::class);
            return app(\App\Http\Controllers\Loyalty\LoyaltyRewardController::class)
                ->apply($request, $loyaltyService);
        }

        // If not a loyalty reward, check if it's a coupon
        $coupon = Coupon::where('code', $code)
            ->forUser(Auth::id())
            ->first();

        \Log::info('Coupon search result', [
            'found' => $coupon ? 'yes' : 'no',
            'coupon_id' => $coupon?->id,
        ]);

        if (!$coupon) {
            // Check if code exists for any user (either system)
            $anyCoupon = Coupon::where('code', $code)->first();
            $anyReward = \App\Models\LoyaltyReward::where('code', $code)->first();
            
            if ($anyCoupon || $anyReward) {
                \Log::warning('Code exists but for different user', [
                    'coupon_user_id' => $anyCoupon?->user_id,
                    'reward_account_id' => $anyReward?->account_id,
                    'current_user_id' => Auth::id(),
                ]);
            }
            
            return back()->withErrors(['code' => 'Invalid code.']);
        }

        if (!$coupon->isValid()) {
            $message = 'This coupon is no longer valid.';
            
            if ($coupon->status === Coupon::STATUS_FULLY_REDEEMED) {
                $message = 'This coupon has been fully redeemed.';
            } elseif ($coupon->status === Coupon::STATUS_EXPIRED) {
                $message = 'This coupon has expired.';
            } elseif ($coupon->remaining_value_cents <= 0) {
                $message = 'This coupon has no remaining value.';
            }

            return back()->withErrors(['code' => $message]);
        }

        // Store coupon in cache for this cart
        $cacheKey = "cart_coupon:{$cartKey}";
        Cache::put($cacheKey, [
            'coupon_id' => $coupon->id,
            'code' => $coupon->code,
            'remaining_value_cents' => $coupon->remaining_value_cents,
        ], now()->addMinutes(30));

        return back()->with('success', "Coupon applied! R" . number_format($coupon->remaining_value, 2) . " available.");
    }

    /**
     * Remove coupon from cart
     */
    public function remove(Request $request)
    {
        $data = $request->validate([
            'cart_key' => ['required', 'string'],
        ]);

        $cartKey = $data['cart_key'];
        $cacheKey = "cart_coupon:{$cartKey}";
        
        Cache::forget($cacheKey);

        return back()->with('success', 'Coupon removed.');
    }

    /**
     * Validate a coupon (AJAX endpoint)
     */
    public function validate(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $code = strtoupper(trim($data['code']));

        $coupon = Coupon::where('code', $code)
            ->forUser(Auth::id())
            ->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid coupon code.',
            ], 404);
        }

        if (!$coupon->isValid()) {
            return response()->json([
                'valid' => false,
                'message' => 'This coupon is no longer valid.',
            ], 400);
        }

        return response()->json([
            'valid' => true,
            'coupon' => [
                'code' => $coupon->code,
                'remaining_value' => $coupon->remaining_value,
                'remaining_value_cents' => $coupon->remaining_value_cents,
                'expires_at' => $coupon->expires_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * List user's coupons
     */
    public function index()
    {
        $coupons = Coupon::forUser(Auth::id())
            ->with('sourceBooking')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($coupon) {
                return [
                    'id' => $coupon->id,
                    'code' => $coupon->code,
                    'type' => $coupon->type,
                    'original_value' => $coupon->original_value,
                    'remaining_value' => $coupon->remaining_value,
                    'used_value' => $coupon->original_value - $coupon->remaining_value,
                    'status' => $coupon->status,
                    'status_label' => ucfirst(str_replace('_', ' ', $coupon->status)),
                    'expires_at' => $coupon->expires_at?->format('M d, Y'),
                    'created_at' => $coupon->created_at->format('M d, Y'),
                    'is_valid' => $coupon->isValid(),
                    'source_booking_ref' => $coupon->sourceBooking ? 'HH-' . str_pad($coupon->sourceBooking->id, 6, '0', STR_PAD_LEFT) : null,
                ];
            });

        return Inertia::render('frontend/my-coupons/index', [
            'coupons' => $coupons,
        ]);
    }
}
