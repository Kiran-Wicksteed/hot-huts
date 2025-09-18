<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'timeslot_id',
        'guest_name',   // ✅ new
        'guest_email',
        'people',
        'status',          // pending | paid | cancelled
        'amount',          // decimal 8,2
        'payment_intent_id',
        'peach_payment_checkout_id',
        'peach_payment_order_no',
        'payment_status',
        'hold_expires_at',
        'event_occurrence_id', // nullable FK
        'cart_key',
        'booking_type',
        'no_show',
        'updated_via',
        'payment_method',    // UUID to group bookings in a cart
    ];

    protected $casts = [
        'people' => 'integer',
        'amount' => 'decimal:2',
        'no_show' => 'boolean',
    ];

    /* ----------------------------------------------------------
     | Relationships
     |----------------------------------------------------------*/
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function timeslot()
    {
        return $this->belongsTo(Timeslot::class);
    }

    public function eventOccurrence()
    {
        return $this->belongsTo(EventOccurrence::class);
    }

    public function services()
    {
        // if your pivot table is booking_service the default name is fine
        return $this->belongsToMany(Service::class)
            ->withPivot(['quantity', 'price_each', 'line_total'])
            ->withTimestamps();
    }

    /* ----------------------------------------------------------
     | Helpers
     |----------------------------------------------------------*/
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /** Human-readable booking reference */
    public function getRefAttribute(): string
    {
        return 'HH-' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    public function scopeActiveHold(Builder $q): Builder
    {
        return $q->where('status', 'pending')->where('hold_expires_at', '>', now());
    }
    public function scopeCountsForTimeslot(Builder $q, int $timeslotId): Builder
    {
        return $q->selectRaw('
        SUM(CASE WHEN status = "paid" THEN people ELSE 0 END)          AS paid_people,
        SUM(CASE WHEN status = "pending" AND hold_expires_at > ? THEN people ELSE 0 END) AS held_people,
        MIN(CASE WHEN status = "pending" AND hold_expires_at > ? THEN hold_expires_at END) AS next_release_at
    ', [now(), now()])
            ->where('timeslot_id', $timeslotId);
    }

    public function recalcTotals(): void
    {
        $people = max(1, (int) ($this->people ?? 1));

        // 1) Figure out the unit price (prefer a stored column)
        $unit = $this->unit_price
            ?? ($this->amount_per_person ?? null)          // if you already have this
            ?? $this->deriveUnitPrice();                   // optional helper below

        // Fallback if we still don't have a unit: derive from current total
        if ($unit === null) {
            $unit = ($this->amount && $people > 0)
                ? (float) $this->amount / $people
                : 0.0;
        }

        $subtotal = $unit * $people;

        // 2) Loyalty: discount exactly one seat if reserved for this booking
        $hasReserved = LoyaltyReward::where('reserved_booking_id', $this->id)
            ->where('status', LoyaltyReward::STATUS_RESERVED)
            ->exists();

        $discount = $hasReserved ? min($unit, $subtotal) : 0.0;

        // 3) Persist
        // If you have a discount column, set it; otherwise just bake it into amount.
        if ($this->isFillable('discount_amount')) {
            $this->discount_amount = round($discount, 2);
        }
        $this->amount = max(0, round($subtotal - $discount, 2));
        $this->save();
    }

    protected function deriveUnitPrice(): ?float
    {
        // Example stubs – replace with your actual relations/columns
        if (isset($this->service) && isset($this->service->price)) {
            return (float) $this->service->price;
        }
        if (isset($this->eventOccurrence) && isset($this->eventOccurrence->price)) {
            return (float) $this->eventOccurrence->price;
        }
        return null;
    }
}
