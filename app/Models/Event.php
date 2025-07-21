<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'location_id',
        'name',
        'description',
        'start_time',
        'end_time',
        'price',
        'capacity',
        'is_active',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function location()
    {
        return $this->belongsTo(Location::class);
    }
}
