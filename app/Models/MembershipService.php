<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MembershipService extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'price',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function setPriceAttribute($value): void
    {
        $this->attributes['price'] = (int) round(((float) $value) * 100);
    }

    public function getPriceAttribute($value): float
    {
        return $value / 100;
    }

    public function getPriceCentsAttribute(): int
    {
        return $this->attributes['price'] ?? 0;
    }
}
