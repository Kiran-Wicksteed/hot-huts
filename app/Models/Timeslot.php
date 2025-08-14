<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Timeslot extends Model
{
    protected $fillable = [
        'sauna_schedule_id',
        'starts_at',
        'ends_at',
        'capacity',
    ];

    protected $casts = [
        'capacity'  => 'integer',
    ];

    /* ----------------------------------------------------------
     | Relationships
     |----------------------------------------------------------*/
    public function schedule()
    {
        return $this->belongsTo(SaunaSchedule::class, 'sauna_schedule_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /* ----------------------------------------------------------
     | Convenience accessors
     |----------------------------------------------------------*/
    /** Remaining seats in this slot */
    protected function spotsLeft(): Attribute
    {
        return Attribute::get(
            fn() => $this->capacity - $this->bookings()->sum('people')
        );
    }
}
