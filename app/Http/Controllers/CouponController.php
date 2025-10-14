<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        // Find the coupon
        $coupon = Coupon::where('code', $code)
            ->forUser(Auth::id())
            ->first();

        if (!$coupon) {
            return back()->withErrors(['code' => 'Invalid coupon code.']);
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

        return back()->with('success', "Coupon applied! R{$coupon->remaining_value} available.");
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
                    'status' => $coupon->status,
                    'expires_at' => $coupon->expires_at?->toIso8601String(),
                    'is_valid' => $coupon->isValid(),
                    'source_booking_ref' => $coupon->sourceBooking ? 'HH-' . str_pad($coupon->sourceBooking->id, 6, '0', STR_PAD_LEFT) : null,
                ];
            });

        return response()->json($coupons);
    }
}
