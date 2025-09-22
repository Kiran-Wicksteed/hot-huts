<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo};

class LoyaltyReward extends Model
{
    protected $fillable = [
        'account_id',
        'reward_type_id',
        'code',
        'status',
        'issued_points',
        'issued_at',
        'reserved_at',
        'redeemed_at',
        'expires_at',
        'reserved_booking_id',
        'reserved_token',
        'redemption_booking_id'
    ];
    protected $casts = [
        'issued_at' => 'datetime',
        'reserved_at' => 'datetime',
        'redeemed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public const STATUS_ISSUED  = 'issued';
    public const STATUS_RESERVED = 'reserved';
    public const STATUS_REDEEMED = 'redeemed';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_VOID    = 'void';

    public function account(): BelongsTo
    {
        return $this->belongsTo(LoyaltyAccount::class, 'account_id');
    }
    public function type(): BelongsTo
    {
        return $this->belongsTo(LoyaltyRewardType::class, 'reward_type_id');
    }
}
