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

    /**
     * Categorize payment method into standard types
     */
    private function categorizePaymentMethod($paymentMethod)
    {
        if (empty($paymentMethod)) {
            return 'yoco'; // Default to Yoco for empty payment methods
        }
        
        $pm = strtolower(trim($paymentMethod));
        
        // Online payments
        if (str_contains($pm, 'peach') || str_contains($pm, 'online')) {
            return 'online';
        }
        
        // Yoco card payments - now includes 'paid' and empty strings
        if (str_contains($pm, 'yoco') || 
            str_contains($pm, 'card') || 
            str_contains($pm, 'paid') || 
            $pm === 'paid' ||
            $pm === '') {
            return 'yoco';
        }
        
        // EFT/Voucher
        if (str_contains($pm, 'eft') || str_contains($pm, 'voucher')) {
            return 'eft';
        }
        
        // Cash (now routed to Yoco)
        if (str_contains($pm, 'cash')) {
            return 'yoco';
        }
        
        // Default to 'yoco' for any uncategorized payments
        return 'yoco';
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
                // Filter by actual booking date (timeslot date or event date), not created_at
                $q->where(function ($query) use ($request) {
                    $query->whereHas('timeslot.schedule', function ($sub) use ($request) {
                        $sub->whereBetween('date', [$request->date_start, $request->date_end]);
                    })
                    ->orWhereHas('eventOccurrence', function ($sub) use ($request) {
                        $sub->whereBetween('occurs_on', [$request->date_start, $request->date_end]);
                    });
                });
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

        $response = new StreamedResponse(function () use ($bookings, $retailSales) {
            $handle = fopen('php://output', 'w');

            // Data structure: [location][date][items]
            $data = [];
            $grandTotalBookings = 0;
            $grandTotalRetail = 0;

            $normalizeAmount = static function ($value): int {
                if ($value === null) {
                    return 0;
                }

                $numeric = (float) $value;
                
                // If it's a decimal (has fractional part), it's in rands - convert to cents
                if (fmod($numeric, 1.0) !== 0.0) {
                    return (int) round($numeric * 100);
                }
                
                // If it's a whole number less than 100, it's likely in rands - convert to cents
                if ($numeric < 100) {
                    return (int) round($numeric * 100);
                }
                
                // If it's >= 100, assume it's already in cents
                return (int) round($numeric);
            };

            // STEP 1: Process each booking
            foreach ($bookings as $booking) {
                // Determine location and date
                $isEvent = $booking->eventOccurrence !== null;
                $location = $isEvent ? 'Special Functions' : ($booking->timeslot->schedule->location->name ?? 'Unknown');
                $bookingDate = $isEvent ? $booking->eventOccurrence->occurs_on : $booking->timeslot->schedule->date;
                $date = \Carbon\Carbon::parse($bookingDate)->format('Y-m-d');
                $dateDisplay = \Carbon\Carbon::parse($bookingDate)->format('d M');
                
                // Initialize structure
                if (!isset($data[$location])) {
                    $data[$location] = ['total' => 0, 'dates' => []];
                }
                if (!isset($data[$location]['dates'][$date])) {
                    $data[$location]['dates'][$date] = [
                        'display' => $dateDisplay,
                        'bookings' => [],
                        'capacity' => ['max' => 0, 'booked' => 0]
                    ];
                }
                
                // Store booking with all its data
                $data[$location]['dates'][$date]['bookings'][] = [
                    'id' => $booking->id,
                    'people' => $booking->people,
                    'amount' => $normalizeAmount($booking->amount),
                    'payment_method' => $booking->payment_method,
                    'booking_type' => $booking->booking_type,
                    'services' => $booking->services,
                    'is_event' => $isEvent,
                    'event_name' => $isEvent ? ($booking->eventOccurrence->event->name ?? 'Event') : null
                ];
                
                // Track capacity
                if (!$isEvent && $booking->timeslot) {
                    $cap = $booking->timeslot->capacity ?? 0;
                    if ($cap > $data[$location]['dates'][$date]['capacity']['max']) {
                        $data[$location]['dates'][$date]['capacity']['max'] = $cap;
                    }
                    $data[$location]['dates'][$date]['capacity']['booked'] += $booking->people;
                }
                
                $normalizedBookingAmount = $normalizeAmount($booking->amount);
                $data[$location]['total'] += $normalizedBookingAmount;
                $grandTotalBookings += $normalizedBookingAmount;
            }
            
            // STEP 2: Process retail sales
            foreach ($retailSales as $sale) {
                $location = $sale->location->name ?? 'Unknown';
                $date = $sale->sale_date->format('Y-m-d');
                $dateDisplay = $sale->sale_date->format('d M');

                
                if (!isset($data[$location])) {
                    $data[$location] = ['total' => 0, 'dates' => []];
                }
                if (!isset($data[$location]['dates'][$date])) {
                    $data[$location]['dates'][$date] = [
                        'display' => $dateDisplay,
                        'bookings' => [],
                        'capacity' => ['max' => 0, 'booked' => 0]
                    ];
                }
                
                // Add retail sale as a "booking" with special flag
                $data[$location]['dates'][$date]['bookings'][] = [
                    'is_retail' => true,
                    'name' => $sale->retailItem->name ?? 'Unknown Item',
                    'quantity' => $sale->quantity,
                    'amount' => $normalizeAmount($sale->total_cents)
                ];

                $normalizedRetailAmount = $normalizeAmount($sale->total_cents);
                $data[$location]['total'] += $normalizedRetailAmount;
                $grandTotalRetail += $normalizedRetailAmount;
            }
            
            // STEP 3: Output CSV for each location
            foreach ($data as $location => $locationData) {
                // Location header
                fputcsv($handle, [$location, 'Total Revenue', number_format($locationData['total'] / 100, 2)]);
                fputcsv($handle, []);
                
                // Column headers
                fputcsv($handle, ['Date', 'Item', 'Online', 'Yoco', 'Voucher/EFT', 'Loyalty', '# of clients', 'Revenue', 'Total for day', 'Max Cap', 'Day %', 'Average Capacity', 'Notes']);
                
                // Sort dates
                ksort($locationData['dates']);
                
                foreach ($locationData['dates'] as $date => $dayData) {
                    // Aggregate items for this day
                    $items = [];
                    $dayTotals = ['online' => 0, 'yoco' => 0, 'voucher_eft' => 0, 'loyalty' => 0, 'people' => 0, 'revenue' => 0];
                    
                    foreach ($dayData['bookings'] as $booking) {
                        if (isset($booking['is_retail']) && $booking['is_retail']) {
                            // Retail item
                            $itemName = $booking['name'];
                            if (!isset($items[$itemName])) {
                                $items[$itemName] = ['online' => '', 'yoco' => '', 'voucher_eft' => '', 'loyalty' => '', 'clients' => 0, 'revenue' => 0];
                            }
                            $items[$itemName]['clients'] += $booking['quantity'];
                            $items[$itemName]['revenue'] += $booking['amount'];
                            $dayTotals['revenue'] += $booking['amount'];
                        } else {
                            // Regular booking - process each service
                            $pm = strtolower($booking['payment_method'] ?? '');
                            $bt = strtolower($booking['booking_type'] ?? '');
                            
                            // Separate main services from add-ons
                            $mainServices = [];
                            $addonServices = [];
                            
                            foreach ($booking['services'] as $service) {
                                $code = $service->code ?? '';
                                $category = strtolower($service->category ?? '');
                                
                                // Main services: SAUNA_SESSION, EVENT_PACKAGE, or category 'main'
                                if (in_array($code, ['SAUNA_SESSION', 'EVENT_PACKAGE']) || $category === 'main') {
                                    $mainServices[] = $service;
                                } else {
                                    $addonServices[] = $service;
                                }
                            }
                            
                            // Count payment method ONCE per booking (not per service)
                            $paymentCounted = false;
                            
                            // Process main services
                            foreach ($mainServices as $service) {
                                $serviceLineTotal = $normalizeAmount($service->pivot->line_total ?? 0);
                                $priceEachNormalized = $normalizeAmount($service->pivot->price_each ?? 0);
                                $quantity = max(1, (int) ($service->pivot->quantity ?? 1));

                                if ($serviceLineTotal < ($priceEachNormalized * $quantity) && $priceEachNormalized > 0) {
                                    $serviceLineTotal = $priceEachNormalized * $quantity;
                                }

                                $itemName = $booking['is_event'] ? $booking['event_name'] : ($service->name ?? 'Sauna Session');
                                
                                if (!isset($items[$itemName])) {
                                    $items[$itemName] = ['online' => 0, 'yoco' => 0, 'voucher_eft' => 0, 'loyalty' => 0, 'clients' => 0, 'revenue' => 0];
                                }
                                
                                // Count payment method only once for the entire booking (count people, not bookings)
                                if (!$paymentCounted) {
                                    $peopleCount = $booking['people'];
                                    
                                    $paymentCategory = $this->categorizePaymentMethod($pm);
                            
                            // Map the category to the correct column
                            switch ($paymentCategory) {
                                case 'online':
                                    $items[$itemName]['online'] += $peopleCount;
                                    $dayTotals['online'] += $peopleCount;
                                    break;
                                case 'yoco':
                                    $items[$itemName]['yoco'] += $peopleCount;
                                    $dayTotals['yoco'] += $peopleCount;
                                    break;
                                case 'eft':
                                    $items[$itemName]['voucher_eft'] += $peopleCount;
                                    $dayTotals['voucher_eft'] += $peopleCount;
                                    break;
                                default:
                                    // For 'other' or any uncategorized payments, default to yoco
                                    $items[$itemName]['yoco'] += $peopleCount;
                                    $dayTotals['yoco'] += $peopleCount;
                                    // Log uncategorized payments for review
                                    \Log::info('Uncategorized payment method defaulted to Yoco', [
                                        'payment_method' => $pm,
                                        'booking_id' => $booking['id'],
                                    ]);
                            }
                                    $paymentCounted = true;
                                }
                                
                                $items[$itemName]['clients'] += $booking['people'];
                                $items[$itemName]['revenue'] += $serviceLineTotal;
                            }
                            
                            $dayTotals['people'] += $booking['people'];
                            $dayTotals['revenue'] += $booking['amount'];
                            
                            // Process add-ons as separate items
                            foreach ($addonServices as $service) {
                                $addonName = $service->name;
                                $quantity = $service->pivot->quantity ?? 1;
                                $addonLineTotal = $normalizeAmount($service->pivot->line_total ?? 0);
                                $addonPriceEachNormalized = $normalizeAmount($service->pivot->price_each ?? 0);

                                if ($addonLineTotal < ($addonPriceEachNormalized * $quantity) && $addonPriceEachNormalized > 0) {
                                    $addonLineTotal = $addonPriceEachNormalized * $quantity;
                                }
                                
                                if (!isset($items[$addonName])) {
                                    $items[$addonName] = ['online' => 0, 'yoco' => 0, 'voucher_eft' => 0, 'loyalty' => 0, 'clients' => 0, 'revenue' => 0];
                                }
                                
                                // Track payment method for add-ons based on booking's payment method
                                $paymentCategory = $this->categorizePaymentMethod($booking['payment_method'] ?? '');
                                
                                switch ($paymentCategory) {
                                    case 'online':
                                        $items[$addonName]['online'] += $quantity;
                                        break;
                                    case 'yoco':
                                        $items[$addonName]['yoco'] += $quantity;
                                        break;
                                    case 'eft':
                                        $items[$addonName]['voucher_eft'] += $quantity;
                                        break;
                                    default:
                                        $items[$addonName]['yoco'] += $quantity;
                                }
                                
                                $items[$addonName]['clients'] += $quantity;
                                $items[$addonName]['revenue'] += $addonLineTotal;
                            }
                        }
                    }
                    
                    // Output rows for this day
                    $firstRow = true;
                    foreach ($items as $itemName => $item) {
                        $row = [];
                        $row[] = $firstRow ? $dayData['display'] : '';
                        $row[] = $itemName;
                        $row[] = $item['online'] ?: '';
                        $row[] = $item['yoco'] ?: '';
                        $row[] = $item['voucher_eft'] ?: '';
                        $row[] = $item['loyalty'] ?: '';
                        $row[] = $item['clients'];
                        $row[] = number_format($item['revenue'] / 100, 2);
                        
                        if ($firstRow) {
                            $row[] = number_format($dayTotals['revenue'] / 100, 2);
                            $maxCap = $dayData['capacity']['max'];
                            $booked = $dayData['capacity']['booked'];
                            $row[] = $maxCap ?: '';
                            $row[] = ($maxCap > 0) ? round(($booked / $maxCap) * 100, 1) . '%' : '';
                            $row[] = $booked ?: '';
                            $row[] = '';
                        } else {
                            $row[] = '';
                            $row[] = '';
                            $row[] = '';
                            $row[] = '';
                            $row[] = '';
                        }
                        
                        fputcsv($handle, $row);
                        $firstRow = false;
                    }
                }
                
                fputcsv($handle, []);
                fputcsv($handle, []);
            }
            
            // Totals section
            fputcsv($handle, ['Totals']);
            fputcsv($handle, ['Total Bookings Revenue', number_format($grandTotalBookings / 100, 2)]);
            fputcsv($handle, ['Total Retail Sales', number_format($grandTotalRetail / 100, 2)]);
            fputcsv($handle, ['GRAND TOTAL', number_format(($grandTotalBookings + $grandTotalRetail) / 100, 2)]);

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="payments_export.csv"');

        return $response;
    }
}
