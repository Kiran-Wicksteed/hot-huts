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
        // Since the user is redirected via POST, we handle everything here.
        // This method serves as BOTH the webhook handler AND the user redirect handler.
        Log::info('Peach Payments Callback Received (POST)', $request->all());

        // --- Part 1: Handle the database update (Webhook Logic) ---
        // This is your "source of truth". You should update your database here.
        $orderId = $request->input('merchantTransactionId'); // Or 'peachpaymentOrder'
        $resultCode = $request->input('result_code') ?? $request->input('result.code');
        $resultDescription = $request->input('result_description') ?? $request->input('result.description');
        $isSuccess = Str::startsWith($resultCode, ['000.000', '000.100', '000.110']);

        $orderNumber = $request->input('checkoutId');
        $booking = Booking::where('peach_payment_checkout_id', $orderNumber)->first();


        if ($booking) {
            // --- Update the status and payment message ---
            $newStatus = $isSuccess ? 'paid' : 'cancelled';
            $paymentDescription = $request->input('result_description', 'Status unknown');

            $booking->update([
                'status' => $newStatus,
                'payment_status' => $paymentDescription,
            ]);

            Log::info("Booking {$booking->id} status updated to '{$newStatus}'.");

            // --- Redirect to the correct page ---
            if ($isSuccess) {
                // On success, redirect to the booking confirmation page.
                return redirect()->route('bookings.show', $booking);
            }
        } else {
            Log::error("Payment callback received for a booking that was not found.", ['peachpaymentOrder' => $orderNumber]);
        }

        $errorMessage = $request->input('result_description', 'An unknown error occurred.');
        return redirect()->route('payment.failed')
            ->with('error', $errorMessage)
            ->with('orderId', $orderNumber);
    }

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
