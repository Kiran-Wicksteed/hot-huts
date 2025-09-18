<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

class LoyaltyAccount extends Model
{
    protected $fillable = ['user_id', 'points_balance', 'lifetime_points'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function ledger(): HasMany
    {
        return $this->hasMany(LoyaltyLedger::class, 'account_id');
    }
    public function rewards(): HasMany
    {
        return $this->hasMany(LoyaltyReward::class, 'account_id');
    }
}
