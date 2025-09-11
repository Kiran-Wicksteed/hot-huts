<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaymentAdminController extends Controller
{
    public function index(Request $request)
    {
        $bookings = Booking::with(['user', 'timeslot.schedule.location'])
            ->when($request->location_id, function ($q) use ($request) {
                $q->whereHas('timeslot.schedule.location', function ($sub) use ($request) {
                    $sub->where('id', $request->location_id);
                });
            })
            ->when($request->date_start && $request->date_end, function ($q) use ($request) {
                $q->whereBetween('created_at', [
                    $request->date_start,
                    $request->date_end
                ]);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Stats
        $totalOrders = $bookings->count();
        $totalPaid   = $bookings->where('status', 'paid')->count();
        $totalUnpaid = $bookings->where('status', 'pending')->count();
        $totalRefunds = 100;

        // Map payments
        $payments = $bookings->map(function ($booking) {
            return [
                'id' => $booking->id,
                'customerInitials' => strtoupper(substr($booking->user->name, 0, 1) . substr(strrchr($booking->user->name, ' '), 1, 1)),
                'customerName' => $booking->user->name,
                'date' => $booking->created_at->format('d M Y, g:ia'),
                'service' => $booking->timeslot?->schedule?->name ?? 'Unknown Service',
                'method' => $booking->payment_status ?? 'Unknown',
                'amount' => (float) $booking->amount,
                'status' => ucfirst($booking->status),
                'transactionId' => $booking->payment_intent_id ?? $booking->peach_payment_checkout_id,
            ];
        });

        // All locations for dropdown
        $locations = \App\Models\Location::select('id', 'name')->get();

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'stats' => [
                'totalInvoices' => $totalOrders,
                'totalRefunds' => $totalRefunds,
                'totalPaid' => $totalPaid,
                'totalUnpaid' => $totalUnpaid,
            ],
            'filters' => [
                'location_id' => $request->location_id,
                'date_start' => $request->date_start,
                'date_end' => $request->date_end
            ],
            'locations' => $locations
        ]);
    }

    public function export(Request $request)
    {
        // Apply same filters as index
        $bookings = Booking::with(['user', 'timeslot.schedule.location'])
            ->when($request->location_id, function ($q) use ($request) {
                $q->whereHas('timeslot.schedule.location', function ($sub) use ($request) {
                    $sub->where('id', $request->location_id);
                });
            })
            ->when($request->date_start && $request->date_end, function ($q) use ($request) {
                $q->whereBetween('created_at', [$request->date_start, $request->date_end]);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $totalAmount = $bookings->sum('amount');

        $response = new StreamedResponse(function () use ($bookings, $totalAmount) {
            $handle = fopen('php://output', 'w');

            // CSV Header
            fputcsv($handle, ['Booking ID', 'Customer Name', 'Date', 'Service', 'Method', 'Amount', 'Status']);

            // CSV Rows
            foreach ($bookings as $booking) {
                fputcsv($handle, [
                    $booking->id,
                    $booking->user->name,
                    $booking->created_at->format('d M Y, g:ia'),
                    optional($booking->timeslot->schedule)->name ?? 'Unknown Service',
                    $booking->payment_status ?? 'Unknown',
                    number_format($booking->amount, 2),
                    ucfirst($booking->status),
                ]);
            }

            // Total row
            fputcsv($handle, []);
            fputcsv($handle, ['TOTAL', '', '', '', '', number_format($totalAmount, 2)]);

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="payments_export.csv"');

        return $response;
    }
}
