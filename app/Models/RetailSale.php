<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailSale extends Model
{
    protected $fillable = [
        'retail_item_id',
        'location_id',
        'quantity',
        'price_each',
        'total_cents',
        'sale_date',
        'note',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price_each' => 'integer',
        'total_cents' => 'integer',
        'sale_date' => 'date',
    ];

    public function retailItem()
    {
        return $this->belongsTo(RetailItem::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get total in rands for display
     */
    public function getTotalRandsAttribute(): float
    {
        return $this->total_cents / 100;
    }
}
