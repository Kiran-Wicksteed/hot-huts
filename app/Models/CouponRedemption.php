<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouponRedemption extends Model
{
    protected $fillable = [
        'coupon_id',
        'booking_id',
        'amount_cents',
    ];

    protected $casts = [
        'amount_cents' => 'integer',
    ];

    /* ----------------------------------------------------------
     | Relationships
     |----------------------------------------------------------*/
    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get amount in currency format
     */
    public function getAmountAttribute(): float
    {
        return $this->amount_cents / 100;
    }
}
