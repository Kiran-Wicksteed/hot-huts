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
    public function scopeAddons($query)
    {
        return $query->where('category', 'addon');
    }
}
