<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Services\CancellationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingCancelledMail;

class BookingCancellationController extends Controller
{
    protected CancellationService $cancellationService;

    public function __construct(CancellationService $cancellationService)
    {
        $this->cancellationService = $cancellationService;
    }

    /**
     * Get cancellation preview for a booking
     */
    public function preview(Booking $booking)
    {
        // Authorization: user must own the booking
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        // Load the timeslot relationship
        $booking->load('timeslot');

        $preview = $this->cancellationService->getCancellationPreview($booking);

        return response()->json($preview);
    }

    /**
     * Cancel a booking
     */
    public function cancel(Request $request, Booking $booking)
    {
        // Authorization: user must own the booking
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        // Load the timeslot relationship
        $booking->load('timeslot', 'user');

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $result = $this->cancellationService->cancelBooking(
            $booking,
            Auth::id(),
            $data['reason'] ?? null
        );

        if (!$result['success']) {
            return back()->withErrors(['cancellation' => $result['message']]);
        }

        // Send cancellation email
        try {
            if ($booking->user && $booking->user->email) {
                Mail::to($booking->user->email)->send(
                    new BookingCancelledMail($booking, $result['coupon'])
                );
            }
        } catch (\Exception $e) {
            // Log but don't fail the cancellation
            \Log::error('Failed to send cancellation email', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
        }

        return redirect()
            ->route('user.dashboard')
            ->with('success', $result['message']);
    }

    /**
     * Admin cancel a booking
     */
    public function adminCancel(Request $request, Booking $booking)
    {
        // Authorization: must be admin
        if (!Auth::user()->is_admin) {
            abort(403, 'Unauthorized');
        }

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
            'issue_refund' => ['boolean'],
            'refund_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        // For admin cancellations, we can override the refund amount
        if (isset($data['issue_refund']) && $data['issue_refund'] === false) {
            // Force no refund
            $result = $this->forceCancel($booking, Auth::id(), $data['reason'] ?? 'Admin cancellation', 0);
        } elseif (isset($data['refund_percentage'])) {
            // Custom refund percentage
            $bookingAmountCents = (int) ($booking->amount * 100);
            $refundAmountCents = (int) round($bookingAmountCents * ($data['refund_percentage'] / 100));
            $result = $this->forceCancel($booking, Auth::id(), $data['reason'] ?? 'Admin cancellation', $refundAmountCents);
        } else {
            // Use standard policy
            $result = $this->cancellationService->cancelBooking(
                $booking,
                Auth::id(),
                $data['reason'] ?? 'Admin cancellation'
            );
        }

        if (!$result['success']) {
            return back()->withErrors(['cancellation' => $result['message']]);
        }

        // Send cancellation email
        try {
            if ($booking->user && $booking->user->email) {
                Mail::to($booking->user->email)->send(
                    new BookingCancelledMail($booking, $result['coupon'])
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send admin cancellation email', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
        }

        return back()->with('success', $result['message']);
    }

    /**
     * Force cancel with custom refund amount (admin only)
     */
    private function forceCancel(Booking $booking, int $userId, string $reason, int $refundAmountCents): array
    {
        if ($booking->status === 'cancelled') {
            return [
                'success' => false,
                'coupon' => null,
                'message' => 'This booking is already cancelled.',
            ];
        }

        return \DB::transaction(function () use ($booking, $userId, $reason, $refundAmountCents) {
            $booking->status = 'cancelled';
            $booking->cancelled_at = now();
            $booking->cancelled_by = $userId;
            $booking->cancellation_reason = $reason;
            $booking->refund_amount_cents = $refundAmountCents;
            $booking->refund_type = $refundAmountCents > 0 ? 'coupon' : 'none';
            $booking->save();

            $coupon = null;

            if ($refundAmountCents > 0) {
                $expiresAt = now()->addMonths(6);

                $coupon = \App\Models\Coupon::create([
                    'code' => \App\Models\Coupon::generateUniqueCode('REFUND'),
                    'user_id' => $booking->user_id,
                    'source_booking_id' => $booking->id,
                    'type' => \App\Models\Coupon::TYPE_REFUND,
                    'original_value_cents' => $refundAmountCents,
                    'remaining_value_cents' => $refundAmountCents,
                    'expires_at' => $expiresAt,
                    'status' => \App\Models\Coupon::STATUS_ACTIVE,
                    'notes' => "Admin refund for cancelled booking #{$booking->id}",
                ]);
            }

            $message = $coupon
                ? "Booking cancelled. Refund coupon: {$coupon->code} (R" . number_format($coupon->remaining_value, 2) . ")"
                : 'Booking cancelled. No refund issued.';

            return [
                'success' => true,
                'coupon' => $coupon,
                'message' => $message,
            ];
        });
    }
}
