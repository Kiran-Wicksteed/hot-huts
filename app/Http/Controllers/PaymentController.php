<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\Booking;
use Shaz3e\PeachPayment\Helpers\PeachPayment;

class PaymentController extends Controller
{
    public function pay()
    {
        return view('pay');
    }

    public function post(Request $request)
    {
        $entityId = config('peach-payment.entity_id');
        $amount   = (float) $request->amount;

        // Ensure no accidental trailing slashes
        $return_url = rtrim(config('app.url'), '/') . '/order/callback';

        $peachPayment = new PeachPayment();
        $checkoutData = $peachPayment->createCheckout($amount, $return_url);

        $order_number = $checkoutData['order_number'];
        $checkoutId   = $checkoutData['checkoutId'];

        return view('peach-payment', compact('entityId', 'checkoutId'));
    }

    /**
     * Handles both webhook (POST) and browser redirect (GET).
     */
    public function handlePaymentCallback(Request $request)
    {
        Log::info('Peach callback hit', [
            'method'   => $request->method(),
            'url'      => $request->fullUrl(),
            'payload'  => $request->all(),
            'query'    => $request->query(),
        ]);

        // -------------------------------
        // Case 1: POST = webhook from Peach
        // -------------------------------
        if ($request->isMethod('post')) {
            $orderNumber = $request->input('checkoutId')
                ?? $request->input('id')
                ?? $request->input('ndc')
                ?? $request->query('peachpaymentOrder');

            $resultCode        = $request->input('result_code');
            $resultDescription = $request->input('result_description', 'Unknown');

            $isSuccess = $resultCode && Str::startsWith($resultCode, [
                '000.000',
                '000.100',
                '000.110'
            ]);

            if ($orderNumber && $booking = Booking::where('peach_payment_checkout_id', $orderNumber)->first()) {
                $booking->update([
                    'status'         => $isSuccess ? 'paid' : 'cancelled',
                    'payment_status' => $resultDescription,
                ]);
                Log::info("Booking {$booking->id} updated via webhook", ['success' => $isSuccess]);

                // ✅ Important: return 200 OK to Peach, no redirect
                return response()->json(['status' => $isSuccess ? 'paid' : 'failed'], 200);
            }

            return response()->json(['status' => 'not found'], 404);
        }

        // -------------------------------
        // Case 2: GET = browser redirect after payment
        // -------------------------------
        $orderNumber = $request->query('checkoutId') ?? $request->query('peachpaymentOrder');
        $booking     = $orderNumber
            ? Booking::where('peach_payment_checkout_id', $orderNumber)->first()
            : null;

        if ($booking && $booking->status === 'paid') {
            return redirect()->route('bookings.show', $booking);
        }

        return redirect()->route('payment.failed');
    }

    public function paymentSuccess()
    {
        return response()->json(['status' => 'order success'], 200);
    }

    public function paymentFailed()
    {
        return response()->json(['status' => 'order-failure'], 200);
    }
}
