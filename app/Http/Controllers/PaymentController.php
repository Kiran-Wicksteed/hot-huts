<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Shaz3e\PeachPayment\Helpers\PeachPayment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\Booking;
use App\Services\LoyaltyService;
use App\Models\LoyaltyReward;
use Inertia\Inertia;
use App\Mail\OrderConfirmedMail;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Traits\SendsBookingConfirmationEmail;

class PaymentController extends Controller
{
    use SendsBookingConfirmationEmail;
    public function pay()
    {
        return view('pay');
    }
    public function post(Request $request)
    {
        $entityId = config('peach-payment.entity_id');

        $amount = (float) $request->amount;

        $return_url = config('app.url') . '/order/callback';


        $peachPayment = new  PeachPayment();

        $checkoutData = $peachPayment->createCheckout($amount, $return_url);


        $order_number = $checkoutData['order_number'];

        $checkoutId = $checkoutData['checkoutId'];

        return view('peach-payment', compact('entityId', 'checkoutId'));
    }
    public function handlePaymentCallback(Request $request)
    {
        Log::info('Peach Payments Callback Received', $request->all());

        $isBrowser = str_contains(strtolower($request->userAgent() ?? ''), 'mozilla');
        $isWebhook = !$isBrowser && $request->has('result_code') && $request->has('signature');
        
        Log::info('Callback routing decision', [
            'isBrowser' => $isBrowser,
            'isWebhook' => $isWebhook,
            'has_result_code' => $request->has('result_code'),
            'has_signature' => $request->has('signature'),
            'user_agent' => $request->userAgent(),
        ]);

        $orderFromRequest = function () use ($request) {
            return $request->input('checkoutId')                 // primary
                ?? $request->input('id')                         // sometimes present
                ?? $request->input('merchantTransactionId')      // Peach “order number”
                ?? $request->query('peachpaymentOrder')          // browser redirect param
                ?? $request->query('checkoutId');                // fallback on GET
        };

        // -------------------
        // CASE 1: WEBHOOK (server-to-server)
        // -------------------
        if ($isWebhook) {
            $orderNumber       = $orderFromRequest();
            $resultCode        = $request->input('result_code');
            $resultDescription = $request->input('result_description', 'Unknown');

            $isSuccess = $resultCode && Str::startsWith($resultCode, ['000.000', '000.100', '000.110']);

            if (!$orderNumber) {
                Log::warning('Webhook missing orderNumber/checkoutId');
                return response()->json(['status' => 'bad request'], 400);
            }

            // ALL bookings tied to this checkout/order
            $bookings = Booking::where('peach_payment_checkout_id', $orderNumber)
                ->orWhere('peach_payment_order_no', $orderNumber)
                ->get();

            if ($bookings->isEmpty()) {
                Log::warning("Webhook received but bookings not found", ['orderNumber' => $orderNumber]);
                return response()->json(['status' => 'not found'], 404);
            }

            if ($isSuccess) {
                // Instead of mass-update, iterate to ensure models are fresh when used
                $service = app(LoyaltyService::class);

                foreach ($bookings as $booking) {
                    $booking->update([
                        'status'          => 'paid',
                        'payment_status'  => $resultDescription,
                        'hold_expires_at' => null,
                    ]);

                    // Refresh the model to get the 'paid' status before accruing points
                    $booking->refresh();

                    // 1) Redeem if this booking has a reserved reward
                    if ($reward = LoyaltyReward::where('reserved_booking_id', $booking->id)
                        ->where('status', LoyaltyReward::STATUS_RESERVED)
                        ->first()
                    ) {
                        $service->redeemRewardForBooking($reward, $booking->id);
                    }

                    // 2) Accrue points (people => points) & auto-issue vouchers
                    Log::info('[WEBHOOK] About to call accrueFromBooking', [
                        'booking_id' => $booking->id,
                        'user_id' => $booking->user_id,
                        'status' => $booking->status,
                    ]);
                    
                    try {
                        $service->accrueFromBooking($booking);
                        Log::info('[WEBHOOK] accrueFromBooking completed', ['booking_id' => $booking->id]);
                    } catch (\Exception $e) {
                        Log::error('[WEBHOOK] accrueFromBooking failed', [
                            'booking_id' => $booking->id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                        ]);
                    }
                }

                // Send one confirmation for all
                $this->sendConfirmationEmail($bookings, $orderNumber);

                Log::info("Checkout {$orderNumber}: marked PAID for {$bookings->count()} booking(s).");
            } else {
                Log::info("Checkout {$orderNumber}: intermediate/unsuccessful webhook.", [
                    'result_code' => $resultCode,
                    'desc'        => $resultDescription,
                ]);
            }

            return response()->json(['status' => 'webhook acknowledged'], 200);
        }

        // -------------------
        // CASE 2: BROWSER REDIRECT (or webhook with browser user-agent)
        // -------------------
        $orderNumber = $orderFromRequest();

        if (!$orderNumber) {
            Log::warning('Browser redirect missing orderNumber/checkoutId.');
            return redirect()->route('payment.failed');
        }

        // Check if this is actually a webhook disguised as browser (has result_code)
        if ($request->has('result_code') && $request->has('signature')) {
            Log::info('Browser callback with payment result - treating as webhook', [
                'order' => $orderNumber,
                'result_code' => $request->input('result_code'),
            ]);
            
            $resultCode = $request->input('result_code');
            $resultDescription = $request->input('result_description', 'Unknown');
            $isSuccess = $resultCode && Str::startsWith($resultCode, ['000.000', '000.100', '000.110']);
            
            if ($isSuccess) {
                $bookings = Booking::where('peach_payment_checkout_id', $orderNumber)
                    ->orWhere('peach_payment_order_no', $orderNumber)
                    ->get();
                
                if ($bookings->isNotEmpty()) {
                    $service = app(LoyaltyService::class);
                    
                    foreach ($bookings as $b) {
                        $b->update([
                            'status'          => 'paid',
                            'payment_status'  => $resultDescription,
                            'hold_expires_at' => null,
                        ]);
                        
                        $b->refresh();
                        
                        // Redeem loyalty reward if reserved
                        if ($reward = LoyaltyReward::where('reserved_booking_id', $b->id)
                            ->where('status', LoyaltyReward::STATUS_RESERVED)
                            ->first()
                        ) {
                            $service->redeemRewardForBooking($reward, $b->id);
                        }
                        
                        // Accrue loyalty points
                        Log::info('[BROWSER-WEBHOOK] About to accrue points', [
                            'booking_id' => $b->id,
                            'user_id' => $b->user_id,
                        ]);
                        
                        try {
                            $service->accrueFromBooking($b);
                            Log::info('[BROWSER-WEBHOOK] Points accrued successfully', ['booking_id' => $b->id]);
                        } catch (\Exception $e) {
                            Log::error('[BROWSER-WEBHOOK] Failed to accrue points', [
                                'booking_id' => $b->id,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                    
                    // Send confirmation email
                    $this->sendConfirmationEmail($bookings, $orderNumber);
                    
                    Log::info("Browser-webhook: marked PAID for {$bookings->count()} booking(s).");
                    
                    // Redirect to confirmation page
                    $url = route('bookings.show', $bookings->first()) . '?order=' . urlencode($orderNumber);
                    return redirect()->to($url);
                }
            }
        }

        // Find the first booking to use for the redirect
        $booking = Booking::where('peach_payment_order_no', $orderNumber)
            ->orWhere('peach_payment_checkout_id', $orderNumber)
            ->orderBy('id')
            ->first();

        if (!$booking) {
            Log::warning("Browser redirect: no bookings found for orderNumber {$orderNumber}.");
            return redirect()->route('payment.failed');
        }

        // Poll for up to 5 seconds for the webhook to mark the booking as paid
        for ($i = 0; $i < 5; $i++) {
            if ($booking->refresh()->status === 'paid') {
                $url = route('bookings.show', $booking) . '?order=' . urlencode($orderNumber);
                return redirect()->to($url);
            }
            sleep(1);
        }

        // Webhook didn't arrive in time - verify payment status directly with Peach Payment
        Log::info("Browser redirect: webhook timeout, checking payment status directly for order {$orderNumber}.");
        
        try {
            $paymentStatus = $this->checkPeachPaymentStatus($orderNumber);
            
            Log::info("Payment status check result", [
                'order' => $orderNumber,
                'status' => $paymentStatus,
            ]);
            
            $resultCode = $paymentStatus['result']['code'] ?? null;
            $isSuccess = $resultCode && Str::startsWith($resultCode, ['000.000', '000.100', '000.110']);
            
            Log::info("Payment verification", [
                'order' => $orderNumber,
                'resultCode' => $resultCode,
                'isSuccess' => $isSuccess,
            ]);
            
            if ($isSuccess) {
                // Payment was successful - mark all bookings as paid and accrue loyalty points
                $bookings = Booking::where('peach_payment_checkout_id', $orderNumber)
                    ->orWhere('peach_payment_order_no', $orderNumber)
                    ->get();
                
                $service = app(LoyaltyService::class);
                
                foreach ($bookings as $b) {
                    $b->update([
                        'status'          => 'paid',
                        'payment_status'  => $paymentStatus['result']['description'] ?? 'Successful',
                        'hold_expires_at' => null,
                    ]);
                    
                    $b->refresh();
                    
                    // Redeem loyalty reward if reserved
                    if ($reward = LoyaltyReward::where('reserved_booking_id', $b->id)
                        ->where('status', LoyaltyReward::STATUS_RESERVED)
                        ->first()
                    ) {
                        $service->redeemRewardForBooking($reward, $b->id);
                    }
                    
                    // Accrue loyalty points
                    $service->accrueFromBooking($b);
                }
                
                // Send confirmation email
                $this->sendConfirmationEmail($bookings, $orderNumber);
                
                Log::info("Browser redirect: manually marked PAID for {$bookings->count()} booking(s) after API check.");
                
                $url = route('bookings.show', $booking) . '?order=' . urlencode($orderNumber);
                return redirect()->to($url);
            }
        } catch (\Exception $e) {
            Log::error("Browser redirect: failed to check payment status", [
                'order' => $orderNumber,
                'error' => $e->getMessage(),
            ]);
        }

        // If it's still not paid, redirect to a pending page
        Log::warning("Browser redirect: booking status not 'paid' after verification for order {$orderNumber}.");
        return redirect()->route('payment.pending')->with('order', $orderNumber);
    }




    public function paymentSuccess()
    {
        return response()->json(['status' => 'order success'], 200);
    }

    /**
     * Displays the failed payment page.
     */
    public function paymentFailed()
    {
        // Optional: pull any flash message / reason you've stored earlier
        $message = session('payment_error') ?? 'Your payment was unsuccessful.';

        return Inertia::render('Checkout/PaymentFailed', [
            'message' => $message,
        ]);
    }

    /**
     * Displays the pending payment page.
     */
    public function paymentPending()
    {
        $orderNumber = session('order');
        
        return Inertia::render('Checkout/PaymentPending', [
            'orderNumber' => $orderNumber,
            'message' => 'Your payment is being processed. Please check your bookings shortly.',
        ]);
    }

    /**
     * Check payment status with Peach Payment API
     */
    private function checkPeachPaymentStatus($checkoutId)
    {
        $statusUrl = config('peach-payment.' . config('peach-payment.environment') . '.checkout_url') . '/v2/checkout/' . $checkoutId;
        
        $domain = config('peach-payment.domain');
        $entityId = config('peach-payment.entity_id');
        
        // Get authentication token
        $token = $this->getPeachToken();
        
        $headers = [
            'Accept: application/json',
            'Referer: ' . $domain,
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $statusUrl . '?authentication.entityId=' . $entityId);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        $result = curl_exec($ch);
        
        if (curl_errno($ch)) {
            throw new \Exception('Curl error: ' . curl_error($ch));
        }
        
        curl_close($ch);
        
        return json_decode($result, true);
    }

    /**
     * Get Peach Payment authentication token
     */
    private function getPeachToken()
    {
        $apiUrl = config('peach-payment.' . config('peach-payment.environment') . '.authentication_url');
        $tokenEndpoint = $apiUrl . '/api/oauth/token';

        $clientId = config('peach-payment.client_id');
        $clientSecret = config('peach-payment.client_secret');
        $merchantId = config('peach-payment.merchant_id');

        $response = \Illuminate\Support\Facades\Http::withoutVerifying()->post($tokenEndpoint, [
            'clientId' => $clientId,
            'clientSecret' => $clientSecret,
            'merchantId' => $merchantId,
        ]);

        if ($response->successful()) {
            return $response->json('access_token');
        } else {
            throw new \Exception('Error getting access token');
        }
    }
}
