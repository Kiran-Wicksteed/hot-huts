<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Shaz3e\PeachPayment\Helpers\PeachPayment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\Booking;

class PaymentController extends Controller
{
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

        $isWebhook = $request->has('result_code') && $request->has('signature');

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
                Booking::whereIn('id', $bookings->pluck('id'))
                    ->update([
                        'status'          => 'paid',
                        'payment_status'  => $resultDescription,
                        'hold_expires_at' => null,
                    ]);
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
        // CASE 2: BROWSER REDIRECT
        // -------------------
        $orderNumber = $orderFromRequest();

        if (!$orderNumber) {
            Log::warning('Browser redirect missing orderNumber/checkoutId.');
            return redirect()->route('payment.failed');
        }

        $bookings = Booking::where('peach_payment_order_no', $orderNumber)
            ->orWhere('peach_payment_checkout_id', $orderNumber)
            ->orderBy('id') // deterministic "first"
            ->get();

        if ($bookings->isNotEmpty()) {
            // wait up to 5s for webhook to complete across ALL related bookings
            for ($i = 0; $i < 5; $i++) {
                $paidCount = Booking::whereIn('id', $bookings->pluck('id'))
                    ->where('status', 'paid')
                    ->count();

                if ($paidCount === $bookings->count()) {
                    Log::info("Browser redirect confirmed all {$paidCount} booking(s) paid for checkout {$orderNumber}.");
                    break;
                }
                sleep(1);
            }

            // Pick one booking to satisfy route-model binding; always pass ?order=...
            $target = $bookings->first();
            $url = route('bookings.show', $target) . '?order=' . urlencode($orderNumber);
            return redirect()->to($url);
        }

        Log::warning("Browser redirect: no bookings found for orderNumber {$orderNumber}.");
        return redirect()->route('payment.failed');
    }



    // public function handlePaymentCallback(Request $request)
    // {
    //     Log::info('Peach Payments Callback Received', $request->all());

    //     Log::info('Callback hit', [
    //         'method' => $request->method(),
    //         'full_url' => $request->fullUrl(),
    //         'input' => $request->all()
    //     ]);


    //     // Check if this is the POST webhook
    //     if ($request->isMethod('post')) {
    //         $orderNumber = $request->input('checkoutId');
    //         $resultCode = $request->input('result_code');
    //         $isSuccess = $resultCode && \Illuminate\Support\Str::startsWith($resultCode, ['000.000', '000.100', '000.110']);

    //         $booking = Booking::where('peach_payment_checkout_id', $orderNumber)->first();
    //         if ($booking) {
    //             $booking->update([
    //                 'status' => $isSuccess ? 'paid' : 'cancelled',
    //                 'payment_status' => $request->input('result_description', 'Unknown'),
    //             ]);
    //             if ($isSuccess) {
    //                 return redirect()->route('bookings.show', $booking);
    //             }
    //         }
    //         return redirect()->route('payment.failed');
    //     }

    //     // Otherwise it's the GET redirect after payment
    //     $orderNumber = $request->query('checkoutId') ?? $request->query('peachpaymentOrder');
    //     $booking = Booking::where('peach_payment_checkout_id', $orderNumber)->first();

    //     if ($booking && $booking->status === 'paid') {
    //         return redirect()->route('bookings.show', $booking);
    //     }

    //     return redirect()->route('payment.failed');
    // }



    /**
     * Displays the successful payment page.
     */
    public function paymentSuccess()
    {
        return response()->json(['status' => 'order success'], 200);
    }

    /**
     * Displays the failed payment page.
     */
    public function paymentFailed()
    {
        return response()->json(['status' => 'order-failure'], 200);
    }
}
