<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sauna extends Model
{
    /* -----------------------------------------------------------------
     |  Mass assignment & casts
     |-----------------------------------------------------------------*/
    protected $fillable = [
        'name',        // e.g. “Sauna 1”
        'capacity',    // default 8
        'description', // optional blurb for staff
    ];

    protected $casts = [
        'capacity' => 'integer',
    ];

    /* -----------------------------------------------------------------
     |  Relationships
     |-----------------------------------------------------------------*/
    public function schedules()   // one trailer can have many day-schedules
    {
        return $this->hasMany(SaunaSchedule::class);
    }

    public function timeslots()   // through the day-schedules
    {
        return $this->hasManyThrough(
            Timeslot::class,
            SaunaSchedule::class
        );
    }

    public function openings()
    {
        return $this->hasMany(LocationOpening::class);
    }
}
