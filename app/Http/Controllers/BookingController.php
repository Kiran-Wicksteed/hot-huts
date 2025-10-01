<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\EventOccurrence;
use App\Models\Service;
use App\Models\Timeslot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Shaz3e\PeachPayment\Helpers\PeachPayment;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    /* --------------------------------------------------- show */
    public function show(Request $request, Booking $booking)
    {
        // 1) Figure out the "order" identifier (query param takes priority)
        $order = $request->query('order');
        $fallbackOrderNo   = $booking->peach_payment_order_no;
        $fallbackCheckout  = $booking->peach_payment_checkout_id;

        // 2) Build a query to fetch ALL bookings that belong to this order
        $siblingsQuery = Booking::query();

        if ($order) {
            // From redirect: ?order=xxxx (can be order_no or checkout_id)
            $siblingsQuery->where(function ($q) use ($order) {
                $q->where('peach_payment_order_no', $order)
                    ->orWhere('peach_payment_checkout_id', $order);
            });
        } elseif ($fallbackOrderNo || $fallbackCheckout) {
            // Infer from the bound booking
            $siblingsQuery->where(function ($q) use ($fallbackOrderNo, $fallbackCheckout) {
                if ($fallbackOrderNo) {
                    $q->orWhere('peach_payment_order_no', $fallbackOrderNo);
                }
                if ($fallbackCheckout) {
                    $q->orWhere('peach_payment_checkout_id', $fallbackCheckout);
                }
            });
        } else {
            // No shared order markers—just show the single booking
            $siblingsQuery->whereKey($booking->id);
        }

        // 3) Eager-load everything the UI needs for ALL bookings in this order
        $bookings = $siblingsQuery
            ->with([
                'services',                      // includes pivot (quantity, price_each, line_total) if defined on relation
                'timeslot.schedule.location',
                'eventOccurrence.location',
                'user',
            ])
            ->orderBy('id')
            ->get();

        // 4) Derive a display-friendly structure (keeps your page logic simple)
        $display = $bookings->map(function (Booking $b) {
            $lines = $b->services->map(function ($svc) {
                $qty        = (int) ($svc->pivot->quantity ?? 1);
                $unitCents  = (int) ($svc->pivot->price_each ?? 0);
                $lineCents  = (int) ($svc->pivot->line_total ?? ($qty * $unitCents));

                return [
                    'id'         => $svc->id,
                    'code'       => $svc->code ?? null,
                    'name'       => $svc->name ?? 'Item',
                    'qty'        => $qty,
                    'unit_cents' => $unitCents,
                    'line_cents' => $lineCents,
                ];
            });

            // Prefer persisted amount; fall back to summing line items
            $totalCents = (int) ($b->amount ?? $lines->sum('line_cents'));

            // Try to extract nice context (location/date/time)
            $locName = optional(optional($b->timeslot)->schedule)->location->name
                ?? optional($b->eventOccurrence)->location->name
                ?? null;

            $startsAt = $b->timeslot?->starts_at
                ?? $b->eventOccurrence?->start_at
                ?? null;

            $endsAt = $b->timeslot?->ends_at
                ?? $b->eventOccurrence?->end_at
                ?? null;

            // Normalise to strings (avoid TZ surprises in JS)
            $fmtTime = function ($v) {
                if ($v instanceof \Carbon\CarbonInterface) return $v->toDateTimeString();
                return $v ? (string) $v : null;
            };

            return [
                'id'            => $b->id,
                'status'        => $b->status,
                'payment_status' => $b->payment_status,
                'people'        => (int) $b->people,
                'location_name' => $locName,
                'starts_at'     => $fmtTime($startsAt),
                'ends_at'       => $fmtTime($endsAt),
                'lines'         => $lines,
                'total_cents'   => $totalCents,
            ];
        });

        // 5) Compute a simple summary for multi/single orders
        $resolvedOrder = $order
            ?? $fallbackOrderNo
            ?? $fallbackCheckout
            ?? null;

        $grandTotalCents = (int) $bookings->sum(function ($b) {
            return (int) ($b->amount ?? 0);
        });

        // 6) Keep backward compatibility: still pass the bound `$booking`,
        //    but also pass `bookings` (array) + `summary` for multi-cart UI.
        $booking->loadMissing([
            'services',
            'timeslot.schedule.location',
            'eventOccurrence.location',
            'user',
        ]);

        return Inertia::render('Booking/ConfirmedPage', [
            // legacy single
            'booking'  => $booking,

            // new multi-capable payload
            'bookings' => $display, // array of items for this order (1..n)
            'summary'  => [
                'order'             => $resolvedOrder,
                'count'             => $bookings->count(),
                'grand_total_cents' => $grandTotalCents ?: $display->sum('total_cents'),
            ],
        ]);
    }

    /* --------------------------------------------------- store */
    public function store(Request $request)
    {
        $holdMinutes = (int) config('booking.hold_minutes', 10);
        $entity      = config('peach-payment.entity_id');
        $cbUrl = '/order/callback';


        $now         = now();

        // ---------- 0) Normalise payload to a cart of items ---------
        $asCart = $request->has('items');

        if ($asCart) {
            $data = $request->validate([
                'cart_key'                           => ['required', 'string', 'max:191'],
                'items'                              => ['required', 'array', 'min:1'],
                'items.*.kind'                       => ['required', Rule::in(['sauna', 'event'])],
                'items.*.timeslot_id'                => ['nullable', 'required_if:items.*.kind,sauna', 'integer', 'exists:timeslots,id'],
                'items.*.event_occurrence_id'        => ['nullable', 'required_if:items.*.kind,event', 'integer', 'exists:event_occurrences,id'],
                'items.*.people'                     => ['required', 'integer', 'between:1,8'],
                'items.*.addons'                     => ['array'],
                'items.*.addons.*.code'              => ['required_with:items.*.addons', 'string'],
                'items.*.addons.*.qty'               => ['required_with:items.*.addons', 'integer', 'min:0'],
            ]);
            $cartKey = $data['cart_key'];
            $items   = $data['items'];
        } else {
            // Legacy single-booking request → wrap as one item
            $data = $request->validate([
                'cart_key'            => ['nullable', 'string', 'max:191'],
                'booking_type'        => ['required', Rule::in(['sauna', 'event'])],
                'timeslot_id'         => ['nullable', 'required_if:booking_type,sauna', 'exists:timeslots,id'],
                'event_occurrence_id' => ['nullable', 'required_if:booking_type,event', 'exists:event_occurrences,id'],
                'people'              => ['required', 'integer', 'between:1,8'],
                'services'            => ['array'],
                'services.*'          => ['integer', 'min:0'],
            ]);

            $addons = [];
            foreach ($data['services'] ?? [] as $code => $qty) {
                if ((int) $qty > 0) $addons[] = ['code' => (string) $code, 'qty' => (int) $qty];
            }

            $cartKey = $data['cart_key'] ?: (string) Str::uuid();
            $items = [[
                'kind'                => $data['booking_type'] === 'event' ? 'event' : 'sauna',
                'timeslot_id'         => $data['timeslot_id'] ?? null,
                'event_occurrence_id' => $data['event_occurrence_id'] ?? null,
                'people'              => (int) $data['people'],
                'addons'              => $addons,
            ]];
        }

        // ---------- 0.1) Idempotency guard (cache) ----------
        // If this cart_key already produced a checkout, reuse it and DO NOT create new bookings.
        $cacheKey = "cart_checkout:{$cartKey}";
        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            Log::info('Idempotent reuse of existing checkout for cart_key', ['cart_key' => $cartKey, 'cached' => $cached]);

            return Inertia::render('Payment/RedirectToGateway', [
                'entityId'          => $entity,
                'checkoutId'        => $cached['checkoutId'],
                'checkoutScriptUrl' => config('peach-payment.' . config('peach-payment.environment') . '.embedded_checkout_url'),
            ]);
        }

        // ---------- 1) Pre-aggregate requested headcount ----------
        $wantBySlot  = [];
        $wantByEvent = [];
        foreach ($items as $it) {
            if ($it['kind'] === 'sauna' && !empty($it['timeslot_id'])) {
                $wantBySlot[(int) $it['timeslot_id']] = ($wantBySlot[(int) $it['timeslot_id']] ?? 0) + (int) $it['people'];
            } elseif ($it['kind'] === 'event' && !empty($it['event_occurrence_id'])) {
                $wantByEvent[(int) $it['event_occurrence_id']] = ($wantByEvent[(int) $it['event_occurrence_id']] ?? 0) + (int) $it['people'];
            }
        }

        // ---------- 2) Atomic cart creation (with capacity checks) ----------
        [$bookings, $grandTotalCents] = DB::transaction(function () use (
            $items,
            $wantBySlot,
            $wantByEvent,
            $holdMinutes,
            $now,
            $cartKey,
        ) {
            $created = [];
            $grand   = 0;

            // 2A. Slot checks
            foreach (array_keys($wantBySlot) as $slotId) {
                /** @var \App\Models\Timeslot $slot */
                $slot = Timeslot::lockForUpdate()->findOrFail($slotId);

                // expire holds on this slot
                Booking::where('status', 'pending')
                    ->where('timeslot_id', $slot->id)
                    ->whereNotNull('hold_expires_at')
                    ->where('hold_expires_at', '<=', $now)
                    ->update([
                        'status'         => 'cancelled',
                        'payment_status' => DB::raw("COALESCE(payment_status, 'Hold expired')"),
                    ]);

                $active = $slot->bookings()
                    ->where(function ($q) use ($now) {
                        $q->where('status', 'paid')
                            ->orWhere(fn($q2) => $q2->where('status', 'pending')->where('hold_expires_at', '>', $now));
                    })
                    ->sum('people');

                if ($active + $wantBySlot[$slotId] > $slot->capacity) {
                    abort(409, 'Chosen sauna slot is already full.');
                }
            }

            // 2B. Event checks
            foreach (array_keys($wantByEvent) as $occId) {
                /** @var \App\Models\EventOccurrence $occ */
                $occ = EventOccurrence::with('event')->lockForUpdate()->findOrFail($occId);

                if (!$occ->is_active) {
                    abort(409, 'Event is no longer bookable.');
                }

                // expire holds on this occurrence
                Booking::where('status', 'pending')
                    ->where('event_occurrence_id', $occ->id)
                    ->whereNotNull('hold_expires_at')
                    ->where('hold_expires_at', '<=', $now)
                    ->update([
                        'status'         => 'cancelled',
                        'payment_status' => DB::raw("COALESCE(payment_status, 'Hold expired')"),
                    ]);

                $active = $occ->bookings()
                    ->where(function ($q) use ($now) {
                        $q->where('status', 'paid')
                            ->orWhere(fn($q2) => $q2->where('status', 'pending')->where('hold_expires_at', '>', $now));
                    })
                    ->sum('people');

                $cap = $occ->effective_capacity ?? 8;
                if ($active + $wantByEvent[$occId] > $cap) {
                    abort(409, 'Event capacity reached.');
                }
            }

            // 2C. Price lookups
            $sessionSvc = Service::whereCode('SAUNA_SESSION')->first();
            $eventPkg   = Service::whereCode('EVENT_PACKAGE')->first();

            // 2D. Create each booking with a hold
            $voucherApplied = false;

            foreach ($items as $it) {
                $people = (int) $it['people'];
                $addons = (array) ($it['addons'] ?? []);
                $slot = null;
                $occ = null;

                if ($it['kind'] === 'sauna') {
                    $slot = Timeslot::lockForUpdate()->findOrFail($it['timeslot_id']);
                } else {
                    $occ = EventOccurrence::with('event')->lockForUpdate()->findOrFail($it['event_occurrence_id']);
                    if (!$occ->effective_price) abort(500, "Price missing for event occurrence #{$occ->id}");
                    if (!$occ->is_active) abort(409, 'Event is no longer bookable.');
                }

                $booking = Booking::create([
                    'user_id'             => Auth::id(),
                    'timeslot_id'         => $slot?->id,
                    'event_occurrence_id' => $occ?->id,
                    'people'              => $people,
                    'status'              => 'pending',
                    'hold_expires_at'     => $now->copy()->addMinutes($holdMinutes),
                    'amount'              => 0,
                    'booking_type' => "online",
                    'payment_method' => "Peach Payment"
                ]);

                $total = 0;

                if ($it['kind'] === 'sauna') {
                    if (!$sessionSvc) abort(500, 'SAUNA_SESSION service missing.');
                    $priceEach = (int) $sessionSvc->price_cents; // cents
                    $line      = $people * $priceEach;

                    $booking->services()->attach($sessionSvc->id, [
                        'quantity'   => $people,
                        'price_each' => $priceEach,
                        'line_total' => $line,
                    ]);
                    $total += $line;



                    // add-ons (use cents; fallback if legacy price field)
                    foreach ($addons as $a) {
                        $qty = (int) ($a['qty'] ?? 0);
                        if ($qty < 1) continue;

                        $svc        = Service::whereCode($a['code'])->firstOrFail();
                        $priceCents = (int) ($svc->price_cents ?? round($svc->price * 100));
                        $line       = $qty * $priceCents;

                        $booking->services()->attach($svc->id, [
                            'quantity'   => $qty,
                            'price_each' => $priceCents,
                            'line_total' => $line,
                        ]);
                        $total += $line;
                    }

                    if (! $voucherApplied && ! empty($cartKey)) {
                        Log::info('[LOYALTY] Applying voucher', [
                            'cart_key'     => $cartKey,
                            'booking_id'   => $booking->id,
                            'price_each'   => $priceEach,
                            'total_before' => $total,
                        ]);

                        // Look for a reward reserved to this cart
                        $reward = \App\Models\LoyaltyReward::where('status', \App\Models\LoyaltyReward::STATUS_RESERVED)
                            ->where('reserved_token', $cartKey)
                            ->lockForUpdate()
                            ->first();

                        if ($reward) {
                            // bind to this booking and clear the token
                            $reward->update([
                                'reserved_token'     => null,
                                'reserved_booking_id' => $booking->id,
                            ]);

                            // discount exactly one sauna seat
                            $discount = min($priceEach, $total);
                            $total -= $discount;

                            // (optional) persist a discount column if you have one
                            // $booking->discount_amount = ($booking->discount_amount ?? 0) + $discount;

                            $voucherApplied = true;
                        }
                    }
                } else {
                    if (!$eventPkg) abort(500, 'EVENT_PACKAGE service missing.');
                    $priceEach = (int) $occ->effective_price; // cents
                    $line      = $people * $priceEach;

                    $booking->services()->attach($eventPkg->id, [
                        'quantity'   => $people,
                        'price_each' => $priceEach,
                        'line_total' => $line,
                        'meta'       => json_encode(['event_occurrence_id' => $occ->id]),
                    ]);
                    $total += $line;

                    // (optional) event add-ons
                    foreach ($addons as $a) {
                        $qty = (int) ($a['qty'] ?? 0);
                        if ($qty < 1) continue;

                        $svc        = Service::whereCode($a['code'])->firstOrFail();
                        $priceCents = (int) ($svc->price_cents ?? round($svc->price * 100));
                        $line       = $qty * $priceCents;

                        $booking->services()->attach($svc->id, [
                            'quantity'   => $qty,
                            'price_each' => $priceCents,
                            'line_total' => $line,
                        ]);
                        $total += $line;
                    }
                }

                $booking->update(['amount' => $total]);
                $created[] = $booking;
                $grand    += $total;
            }

            return [$created, $grand];
        });



        if ($grandTotalCents <= 0) {
            foreach ($bookings as $b) {
                $b->forceFill([
                    'status'          => 'paid',
                    'payment_status'  => 'Voucher',
                    'hold_expires_at' => null,
                    'payment_method'  => 'Voucher',
                ])->save();

                // loyalty accrual / reward redemption
                $service = app(\App\Services\LoyaltyService::class);
                if ($reward = \App\Models\LoyaltyReward::where('reserved_booking_id', $b->id)
                    ->where('status', \App\Models\LoyaltyReward::STATUS_RESERVED)
                    ->first()
                ) {
                    $service->redeemRewardForBooking($reward, $b->id);
                }
                $service->accrueFromBooking($b);
            }

            $target = $bookings[0];
            $url = route('bookings.show', $target) . '?order=' . urlencode('voucher-' . $target->id);

            return redirect()->to($url);
        }



        // ---------- 3) One Peach checkout for the entire cart ----------
        $peach    = new \Shaz3e\PeachPayment\Helpers\PeachPayment();
        $amount   = number_format($grandTotalCents / 100, 2, '.', '');

        $checkout = $peach->createCheckout($amount, $cbUrl);

        // Tag ALL bookings with the same checkout/order
        foreach ($bookings as $b) {
            $b->forceFill([
                'peach_payment_checkout_id' => $checkout['checkoutId'],
                'peach_payment_order_no'    => $checkout['order_number'],
            ])->save();
        }

        // ---------- 3.1) Cache idempotency record (TTL ≈ holdMinutes) ----------
        Cache::put($cacheKey, [
            'booking_ids' => collect($bookings)->pluck('id')->all(),
            'checkoutId'  => $checkout['checkoutId'],
            'orderNumber' => $checkout['order_number'],
            'grandCents'  => $grandTotalCents,
        ], now()->addMinutes(max($holdMinutes, 10)));

        // ---------- 4) Render payment page ----------
        return Inertia::render('Payment/RedirectToGateway', [
            'entityId'          => $entity,
            'checkoutId'        => $checkout['checkoutId'],
            'checkoutScriptUrl' => config('peach-payment.' . config('peach-payment.environment') . '.embedded_checkout_url'),
        ]);
    }


    public function preflight(Request $request)
    {
        $now = now();

        Log::info('Preflight request', ['payload' => $request->all()]);

        $rules = [
            'cart_key'                    => ['required', 'string', 'max:64'],
            'items'                       => ['required', 'array', 'min:1'],
            'items.*.client_id'           => ['nullable', 'string', 'max:64'],
            'items.*.kind'                => ['required', Rule::in(['sauna', 'event'])],
            // timeslot is mandatory for BOTH sauna and event
            'items.*.timeslot_id'         => ['required', 'integer', 'exists:timeslots,id'],
            'items.*.event_occurrence_id' => ['nullable', 'required_if:items.*.kind,event', 'integer', 'exists:event_occurrences,id'],
            'items.*.people'              => ['required', 'integer', 'between:1,8'],
        ];

        $validator = Validator::make($request->all(), $rules, [
            'items.*.timeslot_id.required'       => 'Each item must include a timeslot_id.',
            'items.*.timeslot_id.exists'         => 'timeslot_id :input does not exist.',
            'items.*.event_occurrence_id.exists' => 'event_occurrence_id :input does not exist.',
        ]);

        try {
            $data = $validator->validate();
        } catch (ValidationException $e) {
            Log::warning('Preflight validation failed', [
                'errors' => $e->errors(),
                'failed' => $validator->failed(),
                'input'  => $request->all(),
            ]);
            throw $e;
        }

        Log::info('Preflight check', ['cart_key' => $data['cart_key'], 'items' => $data['items']]);

        // Collect unique resources
        $slotIds = collect($data['items'])->pluck('timeslot_id')->filter()->unique()->values();
        $occIds  = collect($data['items'])->where('kind', 'event')->pluck('event_occurrence_id')->filter()->unique()->values();

        // ---- Load TIMESLOTS with paid & pending sums to avoid N+1
        $slots = \App\Models\Timeslot::query()
            ->whereIn('id', $slotIds)
            ->withSum(['bookings as paid_people_sum' => function ($q) {
                $q->where('status', 'paid');
            }], 'people')
            ->withSum(['bookings as pending_people_sum' => function ($q) use ($now) {
                $q->where('status', 'pending')->where('hold_expires_at', '>', $now);
            }], 'people')
            ->get()
            ->keyBy('id');

        // Compute current availability per slot
        $availBySlot = [];
        foreach ($slots as $slot) {
            $capacity = (int) $slot->capacity;
            $paid     = (int) ($slot->paid_people_sum ?? 0);
            $pending  = (int) ($slot->pending_people_sum ?? 0);
            $active   = $paid + $pending;
            $availBySlot[$slot->id] = max(0, $capacity - $active);
        }

        // ---- Load OCCURRENCES with parent EVENT + paid & pending sums (bookings)
        $occs = \App\Models\EventOccurrence::query()
            ->whereIn('id', $occIds)
            ->with(['event:id,default_capacity'])
            ->withSum(['bookings as paid_people_sum' => function ($q) {
                $q->where('status', 'paid');
            }], 'people')
            ->withSum(['bookings as pending_people_sum' => function ($q) use ($now) {
                $q->where('status', 'pending')->where('hold_expires_at', '>', $now);
            }], 'people')
            ->get()
            ->keyBy('id');

        // Compute current availability per occurrence (base − paid − pending)
        $availByOcc = [];
        $inactiveOcc = [];
        foreach ($occs as $occ) {
            if (!$occ->is_active) {
                $inactiveOcc[$occ->id] = true;
                continue;
            }
            $base    = (int) ($occ->capacity ?? $occ->event?->default_capacity ?? 0);
            $paid    = (int) ($occ->paid_people_sum ?? 0);
            $pending = (int) ($occ->pending_people_sum ?? 0);
            $availByOcc[$occ->id] = max(0, $base - $paid - $pending);
        }

        // ---- Simulate the cart and attach errors per item
        $errors = [];

        foreach ($data['items'] as $it) {
            $clientId = $it['client_id'] ?? null;
            $people   = (int) $it['people'];
            $slotId   = (int) $it['timeslot_id'];

            // 1) Validate slot capacity first (applies to BOTH kinds)
            $availableSlot = $availBySlot[$slotId] ?? 0;
            if ($people > $availableSlot) {
                $errors[] = [
                    'client_id'   => $clientId,
                    'type'        => 'slot',
                    'id'          => $slotId,
                    'timeslot_id' => $slotId,
                    'requested'   => $people,
                    'available'   => $availableSlot,
                ];
                continue;
            }

            // 2) If event kind, validate occurrence capacity and activity
            if ($it['kind'] === 'event') {
                $occId = (int) $it['event_occurrence_id'];

                if (isset($inactiveOcc[$occId]) && $inactiveOcc[$occId] === true) {
                    $errors[] = [
                        'client_id'           => $clientId,
                        'type'                => 'event',
                        'id'                  => $occId,
                        'event_occurrence_id' => $occId,
                        'reason'              => 'inactive',
                    ];
                    continue;
                }

                $availableOcc = $availByOcc[$occId] ?? 0;
                if ($people > $availableOcc) {
                    $errors[] = [
                        'client_id'           => $clientId,
                        'type'                => 'event',
                        'id'                  => $occId,
                        'event_occurrence_id' => $occId,
                        'requested'           => $people,
                        'available'           => $availableOcc,
                    ];
                    continue;
                }

                // both resources pass → decrement both for this simulated cart
                $availByOcc[$occId] = $availableOcc - $people;
            }

            $availBySlot[$slotId] = $availableSlot - $people;
        }

        $result = [
            'ok'     => count($errors) === 0,
            'errors' => $errors,
        ];

        Log::info('Preflight result', ['cart_key' => $data['cart_key'], 'result' => $result]);

        return $request->header('X-Inertia')
            ? back()->with('preflight', $result)
            : response()->json($result);
    }





    public function storeAdmin(Request $request)
    {
        Log::info('Admin booking attempt', ['admin_id' => Auth::id(), 'payload' => $request->all()]);

        if ($request->filled('context') && ! $request->filled('booking_type')) {
            $request->merge(['booking_type' => $request->input('context')]); // sauna|event
        }

        $validated = $request->validate([
            // Your existing “context” remains named booking_type
            'booking_type'        => ['required', Rule::in(['sauna', 'event'])],
            'timeslot_id'         => ['required', 'exists:timeslots,id'],
            'event_occurrence_id' => ['nullable', 'required_if:booking_type,event', 'exists:event_occurrences,id'],
            'people'              => ['required', 'integer', 'between:1,8'],
            'services'            => ['array'], // [code => qty]

            // New behaviour: admin must select a user
            'user_id'             => ['required', 'exists:users,id'],

            // New column: payment method entered on admin form
            'payment_method'      => ['nullable', 'string', 'max:100'],

            // Keeping these nullable for legacy, but no longer required/used
            'guest_name'          => ['nullable', 'string', 'max:255'],
            'guest_email'         => ['nullable', 'email', 'max:255'],
        ]);

        //log $validated
        Log::info('Admin booking payload', ['data' => $validated, 'admin_id' => Auth::id()]);

        // Treat the request's booking_type as the "context" to avoid confusion
        $context = $validated['booking_type']; // sauna | event

        // One transaction so the locks actually work for capacity checks + create
        $booking = DB::transaction(function () use ($validated, $context) {

            // Lock the slot (and event occurrence if applicable) in THIS transaction
            $slot = \App\Models\Timeslot::whereKey($validated['timeslot_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $occ = null;
            if ($context === 'event') {
                $occ = \App\Models\EventOccurrence::with('event')
                    ->whereKey($validated['event_occurrence_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if (! $occ->effective_price) {
                    abort(500, "Price missing for event occurrence #{$occ->id}");
                }
            }

            // --- Capacity checks (still inside the transaction) ---

            $now = now();


            $slotBooked = $slot->bookings()
                ->where(function ($q) use ($now) {
                    $q->whereIn('status', ['paid', 'confirmed'])
                        ->orWhere(function ($q2) use ($now) {
                            $q2->where('status', 'pending')
                                ->where('hold_expires_at', '>', $now); // only active holds count
                        });
                    // Note: cancelled/void/refunded implicitly excluded by the include list
                })
                ->lockForUpdate()                    // lock rows we are counting
                ->sum('people');

            Log::info('Admin booking capacity check', [
                'slot_id'       => $slot->id,
                'slot_capacity' => $slot->capacity,
                'slot_booked'   => $slotBooked,
                'requested'     => $validated['people'],
            ]);

            if ($slotBooked + $validated['people'] > $slot->capacity) {
                abort(409, 'Chosen sauna slot is already full.');
            }

            if ($occ) {
                if (! $occ->is_active) {
                    abort(409, 'Event is no longer bookable.');
                }
                $occBooked = $occ->bookings()
                    ->where(function ($q) use ($now) {
                        $q->whereIn('status', ['paid', 'confirmed'])
                            ->orWhere(function ($q2) use ($now) {
                                $q2->where('status', 'pending')
                                    ->where('hold_expires_at', '>', $now);
                            });
                    })
                    ->lockForUpdate()
                    ->sum('people');

                $occCap = $occ->effective_capacity ?? 8;

                if ($occBooked + $validated['people'] > $occCap) {
                    abort(409, 'Event capacity reached.');
                }
                if ($occBooked + $validated['people'] > $occCap) {
                    abort(409, 'Event capacity reached.');
                }
            }

            // --- Create booking (skip payment gateway) ---
            $booking = \App\Models\Booking::create([
                'user_id'             => $validated['user_id'],
                'guest_name'          => $validated['guest_name'] ?? null,  // legacy
                'guest_email'         => $validated['guest_email'] ?? null, // legacy
                'timeslot_id'         => $slot->id,
                'event_occurrence_id' => $occ?->id,
                'people'              => $validated['people'],
                'status'              => 'paid',     // admin bypasses checkout
                'amount'              => 0,

                // NEW: persist “channel” into the DB
                'booking_type'        => 'walk in', // per your requirements
                'payment_method'      => $validated['payment_method'] ?? null,
            ]);

            $total = 0;

            // --- Main line item (unchanged) ---
            if ($context === 'sauna') {
                $sessionSvc = \App\Models\Service::whereCode('SAUNA_SESSION')->firstOrFail();
                $priceEach  = $sessionSvc->price_cents;
                $line       = $validated['people'] * $priceEach;

                $booking->services()->attach($sessionSvc->id, [
                    'quantity'   => $validated['people'],
                    'price_each' => $priceEach,
                    'line_total' => $line,
                ]);

                $total += $line;
            } else {
                $pkgSvc    = \App\Models\Service::whereCode('EVENT_PACKAGE')->firstOrFail();
                $priceEach = $occ->effective_price;
                $line      = $validated['people'] * $priceEach;

                $booking->services()->attach($pkgSvc->id, [
                    'quantity'   => $validated['people'],
                    'price_each' => $priceEach,
                    'line_total' => $line,
                    'meta'       => json_encode(['event_occurrence_id' => $occ->id]),
                ]);

                $total += $line;
            }

            // --- Add-ons (unchanged) ---
            foreach ($validated['services'] ?? [] as $code => $qty) {
                if ($qty < 1) continue;

                $svc  = \App\Models\Service::whereCode($code)->firstOrFail();
                $line = $qty * $svc->price_cents;

                $booking->services()->attach($svc->id, [
                    'quantity'   => $qty,
                    'price_each' => $svc->price_cents,
                    'line_total' => $line,
                ]);

                $total += $line;
            }

            $booking->update(['amount' => $total]);

            return $booking;
        });

        return back()->with('success', 'Admin booking created successfully.');
    }
}
