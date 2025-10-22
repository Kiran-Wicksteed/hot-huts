<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Coupon;
use App\Models\LoyaltyReward;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CancellationService
{
    protected $loyaltyService;

    public function __construct()
    {
        // Loyalty service is optional - only inject if it exists
        if (class_exists(LoyaltyService::class)) {
            $this->loyaltyService = app(LoyaltyService::class);
        }
    }

    /**
     * Calculate refund policy based on time until session
     * 
     * Policy:
     * - Less than 6 hours: No refund
     * - 6-24 hours: 50% refund
     * - More than 24 hours: Full refund
     * 
     * @param Booking $booking
     * @return array ['refund_percentage' => int, 'refund_amount_cents' => int, 'policy' => string]
     */
    public function calculateRefund(Booking $booking): array
    {
        if (!$booking->timeslot) {
            return [
                'refund_percentage' => 0,
                'refund_amount_cents' => 0,
                'policy' => 'no_timeslot',
                'can_cancel' => false,
                'message' => 'This booking does not have a valid timeslot.',
            ];
        }

        $now = now();
        $sessionStart = Carbon::parse($booking->timeslot->starts_at);
        $hoursUntilSession = $now->diffInHours($sessionStart, false);

        // If session already started or passed
        if ($hoursUntilSession <= 0) {
            return [
                'refund_percentage' => 0,
                'refund_amount_cents' => 0,
                'policy' => 'session_started',
                'can_cancel' => false,
                'message' => 'Cannot cancel a session that has already started or passed.',
            ];
        }

        // Use accessor to handle both old (rands) and new (cents) formats
        $bookingAmountCents = $booking->amount_cents;

        // Less than 6 hours
        if ($hoursUntilSession < 6) {
            return [
                'refund_percentage' => 0,
                'refund_amount_cents' => 0,
                'policy' => 'less_than_6_hours',
                'can_cancel' => true,
                'can_reschedule' => false,
                'message' => 'Cancellation allowed but no refund will be issued (less than 6 hours before session).',
            ];
        }

        // Between 6 and 24 hours
        if ($hoursUntilSession < 24) {
            $refundAmount = (int) round($bookingAmountCents * 0.5);
            return [
                'refund_percentage' => 50,
                'refund_amount_cents' => $refundAmount,
                'policy' => '6_to_24_hours',
                'can_cancel' => true,
                'can_reschedule' => true,
                'message' => 'You will receive a 50% refund as a coupon (6-24 hours before session).',
            ];
        }

        // More than 24 hours
        return [
            'refund_percentage' => 100,
            'refund_amount_cents' => $bookingAmountCents,
            'policy' => 'more_than_24_hours',
            'can_cancel' => true,
            'can_reschedule' => true,
            'message' => 'You will receive a full refund as a coupon (more than 24 hours before session).',
        ];
    }

    /**
     * Cancel a booking and issue refund coupon if applicable
     * 
     * @param Booking $booking
     * @param int $userId User initiating the cancellation
     * @param string|null $reason Optional cancellation reason
     * @return array ['success' => bool, 'coupon' => Coupon|null, 'message' => string]
     */
    public function cancelBooking(Booking $booking, int $userId, ?string $reason = null): array
    {
        // Validate booking can be cancelled
        if ($booking->status === 'cancelled') {
            return [
                'success' => false,
                'coupon' => null,
                'message' => 'This booking is already cancelled.',
            ];
        }

        if ($booking->status !== 'paid') {
            return [
                'success' => false,
                'coupon' => null,
                'message' => 'Only paid bookings can be cancelled.',
            ];
        }

        // Calculate refund
        $refundInfo = $this->calculateRefund($booking);

        if (!$refundInfo['can_cancel']) {
            return [
                'success' => false,
                'coupon' => null,
                'message' => $refundInfo['message'],
            ];
        }

        return DB::transaction(function () use ($booking, $userId, $reason, $refundInfo) {
            // Mark booking as cancelled
            $booking->status = 'cancelled';
            $booking->cancelled_at = now();
            $booking->cancelled_by = $userId;
            $booking->cancellation_reason = $reason ?? $refundInfo['policy'];
            $booking->refund_amount_cents = $refundInfo['refund_amount_cents'];
            $booking->refund_type = $refundInfo['refund_amount_cents'] > 0 ? 'coupon' : 'none';
            $booking->save();

            $coupon = null;

            // Issue coupon if refund amount > 0
            if ($refundInfo['refund_amount_cents'] > 0) {
                $expiresAt = now()->addMonths(6); // Coupons expire in 6 months

                $coupon = Coupon::create([
                    'code' => Coupon::generateUniqueCode('REFUND'),
                    'user_id' => $booking->user_id,
                    'source_booking_id' => $booking->id,
                    'type' => Coupon::TYPE_REFUND,
                    'original_value_cents' => $refundInfo['refund_amount_cents'],
                    'remaining_value_cents' => $refundInfo['refund_amount_cents'],
                    'expires_at' => $expiresAt,
                    'status' => Coupon::STATUS_ACTIVE,
                    'notes' => "Refund for cancelled booking #{$booking->id} ({$refundInfo['refund_percentage']}% refund)",
                ]);

                Log::info('Refund coupon issued', [
                    'booking_id' => $booking->id,
                    'coupon_id' => $coupon->id,
                    'coupon_code' => $coupon->code,
                    'amount_cents' => $refundInfo['refund_amount_cents'],
                ]);
            }

            // Reverse loyalty points if applicable
            if ($this->loyaltyService && method_exists($this->loyaltyService, 'reverseFromBooking')) {
                try {
                    $this->loyaltyService->reverseFromBooking($booking);
                    
                    // Also handle any loyalty rewards that were redeemed for this booking
                    if (class_exists(LoyaltyReward::class)) {
                        LoyaltyReward::where('redemption_booking_id', $booking->id)
                            ->where('status', LoyaltyReward::STATUS_REDEEMED)
                            ->update([
                                'status' => LoyaltyReward::STATUS_ISSUED,
                                'redemption_booking_id' => null,
                                'redeemed_at' => null,
                            ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to reverse loyalty for cancelled booking', [
                        'booking_id' => $booking->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $message = $coupon
                ? "Booking cancelled successfully. Refund coupon code: {$coupon->code} (R" . number_format($coupon->remaining_value, 2) . ")"
                : 'Booking cancelled successfully. No refund issued per cancellation policy.';

            return [
                'success' => true,
                'coupon' => $coupon,
                'refund_info' => $refundInfo,
                'message' => $message,
            ];
        });
    }

    /**
     * Get cancellation preview (without actually cancelling)
     * 
     * @param Booking $booking
     * @return array
     */
    public function getCancellationPreview(Booking $booking): array
    {
        if ($booking->status === 'cancelled') {
            return [
                'can_cancel' => false,
                'message' => 'This booking is already cancelled.',
            ];
        }

        if ($booking->status !== 'paid') {
            return [
                'can_cancel' => false,
                'message' => 'Only paid bookings can be cancelled.',
            ];
        }

        if (!$booking->timeslot) {
            return [
                'can_cancel' => false,
                'message' => 'This booking does not have a valid timeslot.',
            ];
        }

        $refundInfo = $this->calculateRefund($booking);
        
        // Use accessors to handle both old (rands) and new (cents) formats
        $amountInCents = $booking->amount_cents;
        $amountInRands = $booking->amount_rands;
        
        return array_merge($refundInfo, [
            'booking_id' => $booking->id,
            'booking_amount' => $amountInRands,
            'booking_amount_cents' => $amountInCents,
            'session_time' => $booking->timeslot->starts_at,
            'hours_until_session' => now()->diffInHours(Carbon::parse($booking->timeslot->starts_at), false),
        ]);
    }
}
