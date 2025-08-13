<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'code',
        'name',
        'category',
        'price',
        'active',
    ];

    protected $casts = [
        'code'    => 'string',
        'name'    => 'string',
        'category' => 'string',
        'price'  => 'integer',
        'active' => 'boolean',
    ];

    /* ----------------------------------------------------------
     | Relationships
     |----------------------------------------------------------*/
    public function bookings()
    {
        return $this->belongsToMany(Booking::class)
            ->withPivot(['quantity', 'price_each', 'line_total'])
            ->withTimestamps();
    }

    public function setPriceAttribute($value): void
    {
        // accept "80" or "80.00" and turn into 8000
        $this->attributes['price'] = (int) round(((float) $value) * 100);
    }

    public function getPriceAttribute($value): float
    {
        // 8000  →  80.00
        return $value / 100;
    }

    public function getPriceCentsAttribute(): int
    {
        return $this->attributes['price'];   // raw integer
    }

    /* ----------------------------------------------------------
     | Scopes
     |----------------------------------------------------------*/
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
    public function scopeAddons($query)
    {
        return $query->where('category', 'addon');
    }
}
