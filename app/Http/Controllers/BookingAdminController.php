<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Timeslot;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Location;
use App\Models\Service;

use Illuminate\Validation\ValidationException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Auth;


class BookingAdminController extends Controller
{
    /**
     * Display the booking statistics on the admin dashboard.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {

        if (! Auth::user()->is_admin) {
            return redirect('/');
        }
        // --- Base Query ---
        $query = Booking::where('status', 'paid');

        // --- Filtering Logic ---
        if ($request->filled('period')) {
            $days = (int) $request->period;
            if ($days > 0) {
                $query->where('created_at', '>=', Carbon::now()->subDays($days));
            }
        }

        if ($request->filled('location_id')) {
            $query->whereHas('timeslot.schedule.location', function ($q) use ($request) {
                $q->where('id', $request->location_id);
            });
        }

        // ───────────────────────────────────────────────
        // NEW: Date filter (default = today)
        // ───────────────────────────────────────────────
        $selectedDate = $request->filled('date')
            ? Carbon::parse($request->date)->startOfDay()
            : today();

        // --- Calculate Statistics ---
        $statsBase = clone $query;

        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth   = $now->copy()->endOfMonth();

        $bookingsThisMonth = (clone $statsBase)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        $todaysBookings = (clone $statsBase)
            ->whereDate('created_at', $now->toDateString())
            ->count();

        $totalRevenue = (clone $statsBase)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('amount') / 100;

        $recentBookings = $query->with([
            'user:id,name',
            'timeslot:id,sauna_schedule_id,starts_at,ends_at',
            'timeslot.schedule:id,location_id,date',
            'timeslot.schedule.location:id,name',
            'services:id,name'
        ])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // ───────────────────────────────────────────────
        // Timeslots for the selected date
        // ───────────────────────────────────────────────
        $slotsForDate = Timeslot::query()
            ->with(['schedule.location:id,name', 'bookings'])
            ->whereHas('schedule', function ($q) use ($selectedDate) {
                $q->whereDate('date', $selectedDate);
            })
            ->orderBy('starts_at')
            ->get()
            ->map(function ($t) {
                $fmt = function ($v) {
                    if ($v instanceof \Carbon\CarbonInterface) return $v->format('H:i');
                    if (is_string($v) && preg_match('/\d{2}:\d{2}(:\d{2})?$/', $v, $m)) {
                        return substr($m[0], 0, 5);
                    }
                    try {
                        return Carbon::parse($v)->format('H:i');
                    } catch (\Throwable $e) {
                        return (string) $v;
                    }
                };

                return [
                    'id'          => $t->id,
                    'starts_at'   => $fmt($t->getRawOriginal('starts_at')),
                    'ends_at'     => $fmt($t->getRawOriginal('ends_at')),
                    'capacity'    => (int) $t->capacity,
                    'bookings'    => $t->bookings,
                    'location_id' => $t->schedule->location_id,
                ];
            });

        // ───────────────────────────────────────────────
        // Bookings for the selected date
        // ───────────────────────────────────────────────
        $now = now();

        // Clean up expired holds BEFORE fetching bookings
        Booking::where('status', 'pending')
            ->whereNotNull('hold_expires_at')
            ->where('hold_expires_at', '<=', $now)
            ->update([
                'status'         => 'cancelled',
                'payment_status' => DB::raw("COALESCE(payment_status, 'Hold expired')"),
            ]);

        

        $bookingsQuery = Booking::with(['user', 'timeslot.schedule.location', 'services'])
            ->whereHas('timeslot.schedule', function ($q) use ($selectedDate) {
                $q->whereDate('date', $selectedDate);
            })
            ->where(function ($q) use ($now) {
                // Show paid bookings OR active pending bookings (not expired)
                $q->where('status', 'paid')
                    ->orWhere(function ($q2) use ($now) {
                        $q2->where('status', 'pending')
                            ->whereNotNull('hold_expires_at')
                            ->where('hold_expires_at', '>', $now); // Only non-expired holds
                    });
            })
            ->get();

        // Collect service IDs from bookings BEFORE mapping
        $usedServiceIds = $bookingsQuery->pluck('services')->flatten()->pluck('id')->unique();

        // Now map bookings to array format
        $bookingsForDate = $bookingsQuery->map(function ($booking) {
            $isPending = $booking->status === 'pending';
            
            // Format starts_at to HH:mm for frontend filtering
            $startsAt = $booking->timeslot->starts_at;
            if ($startsAt instanceof \Carbon\CarbonInterface) {
                $startsAt = $startsAt->format('H:i');
            } elseif (is_string($startsAt) && preg_match('/\d{2}:\d{2}(:\d{2})?$/', $startsAt, $m)) {
                $startsAt = substr($m[0], 0, 5);
            } else {
                try {
                    $startsAt = Carbon::parse($startsAt)->format('H:i');
                } catch (\Throwable $e) {
                    $startsAt = (string) $startsAt;
                }
            }
            
            return [
                'id'          => $booking->id,
                'timeslot_id' => $booking->timeslot_id,
                'starts_at'   => $startsAt,
                'people'      => $booking->people,
                'guest_name'  => $booking->guest_name,
                'guest_email' => $booking->guest_email,
                'payment_method'    => $booking->payment_method,
                'updated_via'      => $booking->updated_via,
                'booking_type'    => $booking->booking_type,
                'note'            => $booking->note,
                'no_show' => (bool) $booking->no_show,
                'status'         => $booking->status,
                'is_pending'     => $isPending,
                'status_note'    => $isPending ? 'Pending payment — temporarily reserved' : null,
                'user'        => $booking->user ? [
                    'id' => $booking->user->id,
                    'name' => $booking->user->name,
                    'email' => $booking->user->email,
                ] : null,
                'services'    => $booking->services->map(fn($s) => [
                    'id'       => $s->id,
                    'name'     => $s->name,
                    'quantity' => $s->pivot->quantity,
                ]),
            ];
        });

        // Get all addon services - include both ADDON% codes and any services attached to bookings
        $addonServices = Service::where(function ($q) use ($usedServiceIds) {
            $q->where('code', 'like', 'ADDON%')
                ->orWhereIn('id', $usedServiceIds);
        })->get(['id', 'name', 'code']);

        return Inertia::render('bookings/index', [
            'stats' => [
                'bookingsThisMonth' => $bookingsThisMonth,
                'todaysBookings'    => $todaysBookings,
                'totalRevenue'      => number_format($totalRevenue, 2, '.', ','),
            ],
            'bookings'      => $recentBookings,
            'locations'     => Location::all(),
            'filters'       => $request->only(['period', 'location_id', 'date']),
            'slotsToday'    => $slotsForDate,   // could rename to "slotsForDate"
            'bookingsForDate' => $bookingsForDate, // could rename to "bookingsForDate"
            'addonServices' => $addonServices,
        ]);
    }

    public function destroy(Booking $booking)
    {
        // Optional: authorisation check here

        // Free up capacity: just delete, since booked count is computed live
        $booking->delete();

        return redirect()->back()->with('success', 'Booking deleted successfully.');
    }

    public function update(Request $request, Booking $booking)
    {
        $data = $request->validate([
            'timeslot_id'     => ['required', 'exists:timeslots,id'],
            'people'          => ['required', 'integer', 'min:1'],
            'booking_type'    => ['nullable', 'string', 'max:120'],
            'no_show'         => ['required', 'boolean'],
            'services'        => ['array'],          // payload: code => qty
            'services.*'      => ['integer', 'min:1'],
            'updated_via'     => ['required', 'string', 'max:50'],
            'note'            => ['nullable', 'string'],
        ]);

        // If timeslot is changing, check capacity
        if ($booking->timeslot_id != $data['timeslot_id']) {
            $newSlot = Timeslot::find($data['timeslot_id']);
            // Exclude the current booking's people from the calculation
            $booked = Booking::where('timeslot_id', $newSlot->id)->where('id', '!=', $booking->id)->sum('people');
            $available = $newSlot->capacity - $booked;

            if ($data['people'] > $available) {
                return back()->withErrors(['people' => 'Not enough space in the new timeslot.']);
            }
        }

        $booking->update(Arr::except($data, ['services']));

        // Sync add-ons (expects services: { CODE: qty })
        if ($request->has('services')) {
            $codes = array_keys($data['services']);
            $services = Service::whereIn('code', $codes)->get(['id', 'code', 'price']);
            $sync = [];
            foreach ($services as $svc) {
                $qty = (int) ($data['services'][$svc->code] ?? 0);
                if ($qty > 0) {
                    $sync[$svc->id] = [
                        'quantity' => $qty,
                        'price_each' => $svc->price,
                        'line_total' => $qty * $svc->price,
                    ];
                }
            }
            $booking->services()->sync($sync);
        } else {
            // If no services are provided, detach all
            $booking->services()->detach();
        }

        return back()->with('success', 'Booking updated.');
    }

    public function byOccurrence($eventId, $occurrenceId)
    {
        $bookings = Booking::with(['user', 'services'])
            ->where('event_occurrence_id', $occurrenceId)
            ->get()
            ->map(function ($b) {
                return [
                    'id'       => $b->id,
                    'guest'    => $b->guest_name ?? $b->user?->name ?? 'Guest',
                    'email'    => $b->guest_email ?? $b->user?->email,
                    'people'   => $b->people,
                    'services' => $b->services->map(fn($s) => [
                        'name'     => $s->name,
                        'quantity' => $s->pivot->quantity,
                    ]),
                    'status'   => $b->status,
                ];
            });

        return Inertia::render('Events/ByOccurrence', [
            'bookings'    => $bookings,
            'occurrenceId' => $occurrenceId,
            'eventId'     => $eventId,
        ]);
    }
}
