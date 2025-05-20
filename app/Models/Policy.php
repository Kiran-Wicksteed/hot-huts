<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Policy extends Model
{
       protected $fillable = [
        'title',
        'description',
        'content',
    ];

  public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the organization that owns the chat.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

}
