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
        'cart_key',
        'booking_type',
        'payment_method',    // UUID to group bookings in a cart
    ];

    protected $casts = [
        'people' => 'integer',
        'amount' => 'decimal:2',
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
}
