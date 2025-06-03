<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    protected $fillable = [
        'name',
        'price',
        'active',
    ];

    protected $casts = [
        'price'  => 'decimal:2',
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

    /* ----------------------------------------------------------
     | Scopes
     |----------------------------------------------------------*/
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
