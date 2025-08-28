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

        // ✅ RELIABLE CHECK: A webhook always has a 'result_code'.
        // The browser redirect does not. This is better than isMethod('post').
        $isWebhook = $request->has('result_code');

        // -------------------
        // Case 1: Handle the Webhook (if that's what it is)
        // -------------------
        if ($isWebhook) {
            $orderNumber = $request->input('checkoutId')
                ?? $request->input('id')
                ?? $request->input('merchantTransactionId');

            $resultCode        = $request->input('result_code');
            $resultDescription = $request->input('result_description', 'Unknown');

            // Check if the code represents a final, successful payment
            $isSuccess = $resultCode && \Illuminate\Support\Str::startsWith($resultCode, [
                '000.000',
                '000.100',
                '000.110'
            ]);

            $booking = $orderNumber
                ? Booking::where('peach_payment_checkout_id', $orderNumber)
                ->orWhere('peach_payment_order_no', $orderNumber)
                ->first()
                : null;

            if ($booking) {
                // Only update the status if the payment was successful.
                // Ignore intermediate webhooks like "checkout created".
                if ($isSuccess) {
                    $booking->update([
                        'status'         => 'paid',
                        'payment_status' => $resultDescription,
                    ]);
                    Log::info("Booking {$booking->id} updated to PAID via webhook.");
                } else {
                    Log::info("Intermediate webhook received for Booking {$booking->id}. No status change needed.", ['result_code' => $resultCode]);
                }

                // IMPORTANT: Always return a 200 OK for any webhook you acknowledge.
                return response()->json(['status' => 'webhook acknowledged']);
            }

            Log::warning("Webhook received but booking not found", ['orderNumber' => $orderNumber]);
            return response()->json(['status' => 'not found'], 404);
        }

        // -------------------
        // Case 2: Handle the Browser Redirect (if it's not a webhook)
        // -------------------
        $orderNumber = $request->query('peachpaymentOrder');

        $booking = $orderNumber
            ? Booking::where('peach_payment_order_no', $orderNumber)->first()
            : null;

        if ($booking && $booking->status === 'paid') {
            return redirect()->route('bookings.show', $booking);
        }

        // Fallback if the webhook hasn't processed yet, or if payment failed.
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
