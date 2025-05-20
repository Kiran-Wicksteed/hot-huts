<?php

namespace App\Models;

use App\Events\ChatCreated;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chat extends Model
{

    protected $fillable = [
        'message',
        'user_id',
        'organization_id',
        'parent_id',
    ];

    protected $dispatchesEvents = [
        'created' => ChatCreated::class,
    ];

    public function replies()
    {
        return $this->hasMany(Chat::class, 'parent_id')->with('user')->orderBy('created_at', 'asc');
    }

    public function parent()
    {
        return $this->belongsTo(Chat::class, 'parent_id');
    }

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
