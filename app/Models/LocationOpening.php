<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LocationOpening extends Model
{
    protected $fillable = ['location_id', 'sauna_id', 'weekday', 'periods'];
    protected $casts    = ['periods' => 'array'];


    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function sauna()
    {
        return $this->belongsTo(Sauna::class);
    }
}
