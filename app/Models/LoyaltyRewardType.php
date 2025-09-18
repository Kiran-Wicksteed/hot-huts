<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoyaltyRewardType extends Model
{
    protected $fillable = ['name', 'points_cost', 'payload', 'active'];
    protected $casts = ['payload' => 'array', 'active' => 'boolean'];

    public function rewards(): HasMany
    {
        return $this->hasMany(LoyaltyReward::class, 'reward_type_id');
    }
}
