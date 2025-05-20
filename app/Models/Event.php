<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
     protected $fillable = [
        'start_time',
        'finish_time',
        'comments',
        'title',
        'user_id',
        'organization_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
 
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

}
