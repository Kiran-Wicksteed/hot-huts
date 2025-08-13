<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LocationOpening extends Model
{
    protected $fillable = ['location_id', 'sauna_id', 'weekday', 'period', 'start_time', 'end_time'];
    protected $casts = [
        'start_time' => 'string',
        'end_time'   => 'string',
    ];


    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function sauna()
    {
        return $this->belongsTo(Sauna::class);
    }
}
