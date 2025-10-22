<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Location;
use App\Models\RetailSale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaymentAdminController extends Controller
{
    public function index(Request $request)
    {
        $bookings = Booking::with([
            'user',
            'timeslot.schedule.location',
            'timeslot.schedule.sauna',
            'eventOccurrence.event',
            'eventOccurrence.location',
            'services'
        ])
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('user', function ($sub) use ($request) {
                    $sub->where('name', 'like', '%' . $request->search . '%');
                });
            })
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
            $details = [];
            if ($booking->eventOccurrence) {
                $details = [
                    'type' => 'Event',
                    'name' => $booking->eventOccurrence->event->name,
                    'location' => $booking->eventOccurrence->location->name,
                    'date' => \Carbon\Carbon::parse($booking->eventOccurrence->occurs_on)->format('d M Y'),
                    'time' => $booking->eventOccurrence->start_time . ' - ' . $booking->eventOccurrence->end_time,
                    'people' => $booking->people,
                ];
            } elseif ($booking->timeslot) {
                $details = [
                    'type' => $booking->booking_type === 'walk in' ? 'Walk-in' : 'Sauna',
                    'name' => $booking->timeslot->schedule->sauna->name ?? 'Sauna Session',
                    'location' => $booking->timeslot->schedule->location->name,
                    'date' => \Carbon\Carbon::parse($booking->timeslot->schedule->date)->format('d M Y'),
                    'time' => \Carbon\Carbon::parse($booking->timeslot->starts_at)->format('H:i') . ' - ' . \Carbon\Carbon::parse($booking->timeslot->ends_at)->format('H:i'),
                    'people' => $booking->people,
                ];
            }

            return [
                'id' => $booking->id,
                'customerInitials' => strtoupper(substr($booking->user->name, 0, 1) . substr(strrchr($booking->user->name, ' '), 1, 1)),
                'customerName' => $booking->user->name,
                'date' => $booking->created_at->format('d M Y, g:ia'),
                'service' => $details['name'] ?? 'Unknown Service',
                'method' => $booking->payment_status ?? 'Unknown',
                'amount' => $booking->amount_rands, // Use accessor for backward compatibility
                'status' => ucfirst($booking->status),
                'transactionId' => $booking->payment_intent_id ?? $booking->peach_payment_checkout_id,
                'details' => $details,
                'addOns' => $booking->services->map(fn ($s) => [
                    'name' => $s->name,
                    'quantity' => $s->pivot->quantity,
                    'price' => $s->pivot->price_each / 100, // Convert cents to rands
                ]),
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
                'search' => $request->search,
                'location_id' => $request->location_id,
                'date_start' => $request->date_start,
                'date_end' => $request->date_end
            ],
            'locations' => $locations
        ]);
    }

    public function export(Request $request)
    {
    
        // Apply same filters as index - ONLY PAID BOOKINGS
        $bookings = Booking::with([
            'user',
            'timeslot.schedule.location',
            'timeslot.schedule.sauna',
            'eventOccurrence.event',
            'eventOccurrence.location',
            'services'
        ])
            ->where('status', 'paid')
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('user', function ($sub) use ($request) {
                    $sub->where('name', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->location_id, function ($q) use ($request) {
                $q->whereHas('timeslot.schedule.location', function ($sub) use ($request) {
                    $sub->where('id', $request->location_id);
                });
            })
            ->when($request->date_start && $request->date_end, function ($q) use ($request) {
                $q->whereBetween('created_at', [$request->date_start, $request->date_end]);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Get retail sales for the same period
        $retailSales = RetailSale::with(['retailItem', 'location'])
            ->when($request->location_id, function ($q) use ($request) {
                $q->where('location_id', $request->location_id);
            })
            ->when($request->date_start && $request->date_end, function ($q) use ($request) {
                $q->whereBetween('sale_date', [$request->date_start, $request->date_end]);
            })
            ->orderBy('sale_date', 'asc')
            ->get();

        // Calculate totals
        $totalAmount = $bookings->sum('amount');
        $totalOnline = $bookings->where('booking_type', 'online')->sum('amount');
        $totalWalkIn = $bookings->where('booking_type', 'walk in')->sum('amount');
        
        // Calculate add-ons total
        $totalAddons = 0;
        foreach ($bookings as $booking) {
            foreach ($booking->services as $service) {
                // Exclude main service codes (SAUNA_SESSION, EVENT_PACKAGE)
                if (!in_array($service->code, ['SAUNA_SESSION', 'EVENT_PACKAGE'])) {
                    $totalAddons += ($service->pivot->line_total ?? 0);
                }
            }
        }

        // Calculate retail sales total
        $totalRetailSales = $retailSales->sum('total_cents');

        $response = new StreamedResponse(function () use ($bookings, $retailSales, $totalAmount, $totalOnline, $totalWalkIn, $totalAddons, $totalRetailSales) {
            $handle = fopen('php://output', 'w');

            // Group bookings by location
            $bookingsByLocation = [];
            $dailyTotals = [];
            $weeklyTotals = [];
            $monthlyTotals = [];
            $locationTotals = [];
            $locationDailyTotals = [];
            $locationWeeklyTotals = [];
            $locationMonthlyTotals = [];
            $locationOnlineVsWalkIn = [];

            // Process and group bookings
            foreach ($bookings as $booking) {
                // Determine service name and location
                $serviceName = 'Unknown Service';
                $location = 'Unknown Location';
                
                if ($booking->eventOccurrence && $booking->eventOccurrence->event) {
                    $serviceName = $booking->eventOccurrence->event->name ?? 'Event';
                    if ($booking->eventOccurrence->location) {
                        $location = $booking->eventOccurrence->location->name ?? 'Unknown Location';
                    }
                } elseif ($booking->timeslot && $booking->timeslot->schedule) {
                    if ($booking->timeslot->schedule->sauna) {
                        $serviceName = $booking->timeslot->schedule->sauna->name ?? 'Sauna Session';
                    }
                    if ($booking->timeslot->schedule->location) {
                        $location = $booking->timeslot->schedule->location->name ?? 'Unknown Location';
                    }
                }

                // Calculate add-ons for this booking
                $addonsAmount = 0;
                foreach ($booking->services as $service) {
                    if (!in_array($service->code, ['SAUNA_SESSION', 'EVENT_PACKAGE'])) {
                        $addonsAmount += ($service->pivot->line_total ?? 0);
                    }
                }

                $baseAmount = $booking->amount - $addonsAmount;
                $bookingType = ucfirst($booking->booking_type ?? 'Unknown');
                $date = $booking->created_at->format('Y-m-d');
                $dateFormatted = $booking->created_at->format('d M Y');
                $week = $booking->created_at->format('Y-W');
                $month = $booking->created_at->format('Y-m');

                // Group by location
                if (!isset($bookingsByLocation[$location])) {
                    $bookingsByLocation[$location] = [];
                }
                $bookingsByLocation[$location][] = [
                    'date' => $dateFormatted,
                    'id' => $booking->id,
                    'customer' => $booking->user->name ?? 'Guest',
                    'service' => $serviceName,
                    'type' => $bookingType,
                    'people' => $booking->people,
                    'base' => $baseAmount,
                    'addons' => $addonsAmount,
                    'total' => $booking->amount,
                    'method' => $booking->payment_method ?? 'Unknown',
                    'status' => ucfirst($booking->status),
                ];

                // Track daily totals
                if (!isset($dailyTotals[$date])) {
                    $dailyTotals[$date] = ['base' => 0, 'addons' => 0, 'total' => 0, 'count' => 0];
                }
                $dailyTotals[$date]['base'] += $baseAmount;
                $dailyTotals[$date]['addons'] += $addonsAmount;
                $dailyTotals[$date]['total'] += $booking->amount;
                $dailyTotals[$date]['count']++;

                // Track weekly totals
                if (!isset($weeklyTotals[$week])) {
                    $weeklyTotals[$week] = ['base' => 0, 'addons' => 0, 'total' => 0, 'count' => 0];
                }
                $weeklyTotals[$week]['base'] += $baseAmount;
                $weeklyTotals[$week]['addons'] += $addonsAmount;
                $weeklyTotals[$week]['total'] += $booking->amount;
                $weeklyTotals[$week]['count']++;

                // Track monthly totals
                if (!isset($monthlyTotals[$month])) {
                    $monthlyTotals[$month] = ['base' => 0, 'addons' => 0, 'total' => 0, 'count' => 0];
                }
                $monthlyTotals[$month]['base'] += $baseAmount;
                $monthlyTotals[$month]['addons'] += $addonsAmount;
                $monthlyTotals[$month]['total'] += $booking->amount;
                $monthlyTotals[$month]['count']++;

                // Track location totals
                if (!isset($locationTotals[$location])) {
                    $locationTotals[$location] = ['base' => 0, 'addons' => 0, 'total' => 0, 'count' => 0];
                }
                $locationTotals[$location]['base'] += $baseAmount;
                $locationTotals[$location]['addons'] += $addonsAmount;
                $locationTotals[$location]['total'] += $booking->amount;
                $locationTotals[$location]['count']++;

                // Track location daily totals
                if (!isset($locationDailyTotals[$location])) {
                    $locationDailyTotals[$location] = [];
                }
                if (!isset($locationDailyTotals[$location][$date])) {
                    $locationDailyTotals[$location][$date] = ['base' => 0, 'addons' => 0, 'total' => 0, 'count' => 0];
                }
                $locationDailyTotals[$location][$date]['base'] += $baseAmount;
                $locationDailyTotals[$location][$date]['addons'] += $addonsAmount;
                $locationDailyTotals[$location][$date]['total'] += $booking->amount;
                $locationDailyTotals[$location][$date]['count']++;

                // Track location weekly totals
                if (!isset($locationWeeklyTotals[$location])) {
                    $locationWeeklyTotals[$location] = [];
                }
                if (!isset($locationWeeklyTotals[$location][$week])) {
                    $locationWeeklyTotals[$location][$week] = ['base' => 0, 'addons' => 0, 'total' => 0, 'count' => 0];
                }
                $locationWeeklyTotals[$location][$week]['base'] += $baseAmount;
                $locationWeeklyTotals[$location][$week]['addons'] += $addonsAmount;
                $locationWeeklyTotals[$location][$week]['total'] += $booking->amount;
                $locationWeeklyTotals[$location][$week]['count']++;

                // Track location monthly totals
                if (!isset($locationMonthlyTotals[$location])) {
                    $locationMonthlyTotals[$location] = [];
                }
                if (!isset($locationMonthlyTotals[$location][$month])) {
                    $locationMonthlyTotals[$location][$month] = ['base' => 0, 'addons' => 0, 'total' => 0, 'count' => 0];
                }
                $locationMonthlyTotals[$location][$month]['base'] += $baseAmount;
                $locationMonthlyTotals[$location][$month]['addons'] += $addonsAmount;
                $locationMonthlyTotals[$location][$month]['total'] += $booking->amount;
                $locationMonthlyTotals[$location][$month]['count']++;

                // Track location online vs walk-in
                if (!isset($locationOnlineVsWalkIn[$location])) {
                    $locationOnlineVsWalkIn[$location] = ['online' => 0, 'walk_in' => 0];
                }
                if (strtolower($booking->booking_type ?? '') === 'online') {
                    $locationOnlineVsWalkIn[$location]['online'] += $booking->amount;
                } elseif (strtolower($booking->booking_type ?? '') === 'walk in') {
                    $locationOnlineVsWalkIn[$location]['walk_in'] += $booking->amount;
                }
            }

            // Output bookings grouped by location
            foreach ($bookingsByLocation as $location => $locationBookings) {
                fputcsv($handle, []);
                fputcsv($handle, ['--- ' . strtoupper($location) . ' ---']);
                fputcsv($handle, []);
                fputcsv($handle, ['Date', 'Booking ID', 'Customer Name', 'Service', 'Booking Type', 'People', 'Base Amount', 'Add-ons Amount', 'Total Amount', 'Payment Method', 'Status']);
                
                foreach ($locationBookings as $b) {
                    fputcsv($handle, [
                        $b['date'],
                        $b['id'],
                        $b['customer'],
                        $b['service'],
                        $b['type'],
                        $b['people'],
                        number_format($b['base'] / 100, 2),
                        number_format($b['addons'] / 100, 2),
                        number_format($b['total'] / 100, 2),
                        $b['method'],
                        $b['status'],
                    ]);
                }

                // Location-specific totals
                fputcsv($handle, []);
                fputcsv($handle, [strtoupper($location) . ' - DAILY TOTALS']);
                fputcsv($handle, ['Date', 'Bookings', 'Base Revenue', 'Add-ons Revenue', 'Total Revenue']);
                if (isset($locationDailyTotals[$location])) {
                    foreach ($locationDailyTotals[$location] as $date => $totals) {
                        fputcsv($handle, [
                            \Carbon\Carbon::parse($date)->format('d M Y'),
                            $totals['count'],
                            'R' . number_format($totals['base'] / 100, 2),
                            'R' . number_format($totals['addons'] / 100, 2),
                            'R' . number_format($totals['total'] / 100, 2),
                        ]);
                    }
                }

                fputcsv($handle, []);
                fputcsv($handle, [strtoupper($location) . ' - WEEKLY TOTALS']);
                fputcsv($handle, ['Week', 'Bookings', 'Base Revenue', 'Add-ons Revenue', 'Total Revenue']);
                if (isset($locationWeeklyTotals[$location])) {
                    foreach ($locationWeeklyTotals[$location] as $week => $totals) {
                        $weekLabel = 'Week ' . substr($week, -2) . ' of ' . substr($week, 0, 4);
                        fputcsv($handle, [
                            $weekLabel,
                            $totals['count'],
                            'R' . number_format($totals['base'] / 100, 2),
                            'R' . number_format($totals['addons'] / 100, 2),
                            'R' . number_format($totals['total'] / 100, 2),
                        ]);
                    }
                }

                fputcsv($handle, []);
                fputcsv($handle, [strtoupper($location) . ' - MONTHLY TOTALS']);
                fputcsv($handle, ['Month', 'Bookings', 'Base Revenue', 'Add-ons Revenue', 'Total Revenue']);
                if (isset($locationMonthlyTotals[$location])) {
                    foreach ($locationMonthlyTotals[$location] as $month => $totals) {
                        fputcsv($handle, [
                            \Carbon\Carbon::parse($month . '-01')->format('F Y'),
                            $totals['count'],
                            'R' . number_format($totals['base'] / 100, 2),
                            'R' . number_format($totals['addons'] / 100, 2),
                            'R' . number_format($totals['total'] / 100, 2),
                        ]);
                    }
                }

                // Location online vs walk-in
                fputcsv($handle, []);
                fputcsv($handle, [strtoupper($location) . ' - ONLINE VS WALK-IN']);
                fputcsv($handle, ['Type', 'Revenue']);
                if (isset($locationOnlineVsWalkIn[$location])) {
                    fputcsv($handle, ['Online Bookings', 'R' . number_format($locationOnlineVsWalkIn[$location]['online'] / 100, 2)]);
                    fputcsv($handle, ['Walk-in Bookings', 'R' . number_format($locationOnlineVsWalkIn[$location]['walk_in'] / 100, 2)]);
                }
            }

            // Summary Section
            fputcsv($handle, []);
            fputcsv($handle, ['--- SUMMARY ---']);
            fputcsv($handle, []);

            // Daily Totals
            fputcsv($handle, ['DAILY TOTALS']);
            fputcsv($handle, ['Date', 'Bookings', 'Base Revenue', 'Add-ons Revenue', 'Total Revenue']);
            foreach ($dailyTotals as $date => $totals) {
                fputcsv($handle, [
                    \Carbon\Carbon::parse($date)->format('d M Y'),
                    $totals['count'],
                    'R' . number_format($totals['base'] / 100, 2),
                    'R' . number_format($totals['addons'] / 100, 2),
                    'R' . number_format($totals['total'] / 100, 2),
                ]);
            }

            fputcsv($handle, []);

            // Weekly Totals
            fputcsv($handle, ['WEEKLY TOTALS']);
            fputcsv($handle, ['Week', 'Bookings', 'Base Revenue', 'Add-ons Revenue', 'Total Revenue']);
            foreach ($weeklyTotals as $week => $totals) {
                $weekLabel = 'Week ' . substr($week, -2) . ' of ' . substr($week, 0, 4);
                fputcsv($handle, [
                    $weekLabel,
                    $totals['count'],
                    'R' . number_format($totals['base'] / 100, 2),
                    'R' . number_format($totals['addons'] / 100, 2),
                    'R' . number_format($totals['total'] / 100, 2),
                ]);
            }

            fputcsv($handle, []);

            // Monthly Totals
            fputcsv($handle, ['MONTHLY TOTALS']);
            fputcsv($handle, ['Month', 'Bookings', 'Base Revenue', 'Add-ons Revenue', 'Total Revenue']);
            foreach ($monthlyTotals as $month => $totals) {
                fputcsv($handle, [
                    \Carbon\Carbon::parse($month . '-01')->format('F Y'),
                    $totals['count'],
                    'R' . number_format($totals['base'] / 100, 2),
                    'R' . number_format($totals['addons'] / 100, 2),
                    'R' . number_format($totals['total'] / 100, 2),
                ]);
            }

            fputcsv($handle, []);

            // Location Totals
            fputcsv($handle, ['BOOKINGS PER LOCATION']);
            fputcsv($handle, ['Location', 'Bookings', 'Base Revenue', 'Add-ons Revenue', 'Total Revenue']);
            foreach ($locationTotals as $location => $totals) {
                fputcsv($handle, [
                    $location,
                    $totals['count'],
                    'R' . number_format($totals['base'] / 100, 2),
                    'R' . number_format($totals['addons'] / 100, 2),
                    'R' . number_format($totals['total'] / 100, 2),
                ]);
            }

            fputcsv($handle, []);

            // Online vs Walk-in
            fputcsv($handle, ['ONLINE VS WALK-IN']);
            fputcsv($handle, ['Type', 'Revenue']);
            fputcsv($handle, ['Online Bookings', 'R' . number_format($totalOnline / 100, 2)]);
            fputcsv($handle, ['Walk-in Bookings', 'R' . number_format($totalWalkIn / 100, 2)]);

            fputcsv($handle, []);

            // Retail Sales Section
            fputcsv($handle, ['--- RETAIL SALES ---']);
            fputcsv($handle, []);
            fputcsv($handle, ['Date', 'Item', 'Location', 'Quantity', 'Price Each', 'Total']);
            
            foreach ($retailSales as $sale) {
                fputcsv($handle, [
                    \Carbon\Carbon::parse($sale->sale_date)->format('d M Y'),
                    $sale->retailItem->name ?? 'Unknown Item',
                    $sale->location->name ?? 'N/A',
                    $sale->quantity,
                    'R' . number_format($sale->price_each / 100, 2),
                    'R' . number_format($sale->total_cents / 100, 2),
                ]);
            }

            fputcsv($handle, []);
            fputcsv($handle, ['Total Retail Sales', '', '', '', '', 'R' . number_format($totalRetailSales / 100, 2)]);

            fputcsv($handle, []);

            // Grand Total
            fputcsv($handle, ['GRAND TOTAL']);
            fputcsv($handle, ['Total Bookings', $bookings->count()]);
            fputcsv($handle, ['Total Add-ons Revenue', 'R' . number_format($totalAddons / 100, 2)]);
            fputcsv($handle, ['Total Bookings Revenue', 'R' . number_format($totalAmount / 100, 2)]);
            fputcsv($handle, ['Total Retail Sales', 'R' . number_format($totalRetailSales / 100, 2)]);
            fputcsv($handle, ['TOTAL REVENUE (Bookings + Retail)', 'R' . number_format(($totalAmount + $totalRetailSales) / 100, 2)]);

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="payments_export.csv"');

        return $response;
    }
}
