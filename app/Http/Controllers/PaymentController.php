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

    // public function handlePaymentCallback(Request $request)
    // {
    //     Log::info('Peach Payments Callback Received', $request->all());

    //     Log::info('Callback hit', [
    //         'method'    => $request->method(),
    //         'full_url'  => $request->fullUrl(),
    //         'input'     => $request->all(),
    //         'query'     => $request->query(),
    //     ]);

    //     // -------------------
    //     // Case 1: POST (webhook from Peach)
    //     // -------------------
    //     if ($request->isMethod('post')) {
    //         $orderNumber = $request->input('checkoutId')
    //             ?? $request->input('id')
    //             ?? $request->input('ndc')
    //             ?? $request->input('merchantTransactionId')
    //             ?? $request->query('peachpaymentOrder');

    //         $resultCode        = $request->input('result_code');
    //         $resultDescription = $request->input('result_description', 'Unknown');

    //         $isSuccess = $resultCode && \Illuminate\Support\Str::startsWith($resultCode, [
    //             '000.000',
    //             '000.100',
    //             '000.110'
    //         ]);

    //         $booking = $orderNumber
    //             ? Booking::where('peach_payment_checkout_id', $orderNumber)
    //             ->orWhere('peach_payment_order_no', $orderNumber)
    //             ->first()
    //             : null;

    //         if ($booking) {
    //             $booking->update([
    //                 'status'         => $isSuccess ? 'paid' : 'cancelled',
    //                 'payment_status' => $resultDescription,
    //             ]);

    //             Log::info("Booking {$booking->id} updated via POST webhook", [
    //                 'success' => $isSuccess,
    //                 'orderNumber' => $orderNumber
    //             ]);

    //             // ✅ Important: 200 OK (no redirect) for Peach server
    //             return response()->json(['status' => $isSuccess ? 'paid' : 'failed'], 200);
    //         }

    //         Log::warning("POST webhook received but booking not found", ['orderNumber' => $orderNumber]);
    //         return response()->json(['status' => 'not found'], 404);
    //     }

    //     // -------------------
    //     // Case 2: GET (browser redirect after payment)
    //     // -------------------
    //     $orderNumber = $request->query('checkoutId')
    //         ?? $request->query('peachpaymentOrder')
    //         ?? $request->query('merchantTransactionId');

    //     $booking = $orderNumber
    //         ? Booking::where('peach_payment_checkout_id', $orderNumber)
    //         ->orWhere('peach_payment_order_no', $orderNumber)
    //         ->first()
    //         : null;

    //     if ($booking && $booking->status === 'paid') {
    //         return redirect()->route('bookings.show', $booking);
    //     }

    //     return redirect()->route('payment.failed');
    // }


    public function handlePaymentCallback(Request $request)
    {
        Log::info('Peach Payments Callback Received', $request->all());

        Log::info('Callback hit', [
            'method' => $request->method(),
            'full_url' => $request->fullUrl(),
            'input' => $request->all()
        ]);


        // Check if this is the POST webhook
        if ($request->isMethod('post')) {
            $orderNumber = $request->input('checkoutId');
            $resultCode = $request->input('result_code');
            $isSuccess = $resultCode && \Illuminate\Support\Str::startsWith($resultCode, ['000.000', '000.100', '000.110']);

            $booking = Booking::where('peach_payment_checkout_id', $orderNumber)->first();
            if ($booking) {
                $booking->update([
                    'status' => $isSuccess ? 'paid' : 'cancelled',
                    'payment_status' => $request->input('result_description', 'Unknown'),
                ]);
                if ($isSuccess) {
                    return redirect()->route('bookings.show', $booking);
                }
            }
            return redirect()->route('payment.failed');
        }

        // Otherwise it's the GET redirect after payment
        $orderNumber = $request->query('checkoutId') ?? $request->query('peachpaymentOrder');
        $booking = Booking::where('peach_payment_checkout_id', $orderNumber)->first();

        if ($booking && $booking->status === 'paid') {
            return redirect()->route('bookings.show', $booking);
        }

        return redirect()->route('payment.failed');
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
