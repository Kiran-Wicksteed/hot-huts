<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class SaunaSchedule extends Model
{
    protected $fillable = [
        'sauna_id',
        'location_id',
        'date',
    ];

    protected $casts = [
        'date' => 'date',  // Carbon instance
    ];

    /* -----------------------------------------------------------------
     |  Relationships
     |-----------------------------------------------------------------*/
    public function sauna()
    {
        return $this->belongsTo(Sauna::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function timeslots()
    {
        return $this->hasMany(Timeslot::class);
    }

    public function bookings()      // convenience shortcut
    {
        return $this->hasManyThrough(
            Booking::class,
            Timeslot::class
        );
    }

    /* -----------------------------------------------------------------
     |  Accessors
     |-----------------------------------------------------------------*/
    public function getDateLabelAttribute(): string
    {
        // e.g. “Sat, 14 Jun 2025”
        return $this->date->translatedFormat('D, j M Y');
    }
}
