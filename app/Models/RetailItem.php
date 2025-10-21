<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailItem extends Model
{
    protected $fillable = [
        'name',
        'code',
        'price_cents',
        'description',
        'is_active',
    ];

    protected $casts = [
        'price_cents' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get price in rands for display
     */
    public function getPriceRandsAttribute(): float
    {
        return $this->price_cents / 100;
    }

    /**
     * Bookings that purchased this retail item
     */
    public function bookings()
    {
        return $this->belongsToMany(Booking::class, 'booking_retail_item')
            ->withPivot('quantity', 'price_each', 'line_total')
            ->withTimestamps();
    }
}
