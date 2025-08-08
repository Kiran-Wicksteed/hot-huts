<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventOccurrence extends Model
{
    use HasFactory;

    /** -----------------------------------------------------------------
     *  Mass‑assignable columns
     *  ----------------------------------------------------------------*/
    protected $fillable = [
        'event_id',
        'location_id',
        'occurs_on',
        'start_time',
        'end_time',
        'price',        // optional override
        'capacity',     // optional override
        'is_active',
    ];

    /** -----------------------------------------------------------------
     *  Attribute casting
     *  ----------------------------------------------------------------
     *  - occurs_on:  DATE only (no time component)
     *  - start/end:  store as TIME; cast as Carbon instance using HH:MM
     *  - price & capacity: integers (or price → decimal:2 if you use DECIMAL)
     *  - is_active: true/false
     */
    protected $casts = [
        'occurs_on'  => 'date',

        // Laravel doesn’t have a native “time” cast; we use datetime with a format
        // so Carbon gives you just the time portion.
        'start_time' => 'datetime:H:i',
        'end_time'   => 'datetime:H:i',

        'price'      => 'integer',   // or 'decimal:2'
        'capacity'   => 'integer',
        'is_active'  => 'boolean',
    ];

    // Always eager‑load the bits we need (optional but handy)
    protected $with = ['event:id,name,description', 'location:id,name'];

    // Expose virtual attributes on toArray()/toJson()
    protected $appends = ['description', 'effective_price', 'effective_capacity'];

    /** -----------------------------------------------------------------
     *  Relationships
     *  ----------------------------------------------------------------*/
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /** -----------------------------------------------------------------
     *  Convenience accessors
     *  ----------------------------------------------------------------*/
    public function getEffectivePriceAttribute(): ?int
    {
        return $this->price ?? $this->event->default_price;
    }

    public function getEffectiveCapacityAttribute(): ?int
    {
        return $this->capacity ?? $this->event->default_capacity;
    }

    public function getDescriptionAttribute(): ?string
    {
        return $this->event?->description;
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
