<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Coupon extends Model
{
    const STATUS_ACTIVE = 'active';
    const STATUS_FULLY_REDEEMED = 'fully_redeemed';
    const STATUS_EXPIRED = 'expired';
    const STATUS_CANCELLED = 'cancelled';

    const TYPE_REFUND = 'refund';
    const TYPE_PROMOTIONAL = 'promotional';
    const TYPE_LOYALTY = 'loyalty';

    protected $fillable = [
        'code',
        'user_id',
        'source_booking_id',
        'type',
        'original_value_cents',
        'remaining_value_cents',
        'expires_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'original_value_cents' => 'integer',
        'remaining_value_cents' => 'integer',
        'expires_at' => 'datetime',
    ];

    /* ----------------------------------------------------------
     | Relationships
     |----------------------------------------------------------*/
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sourceBooking()
    {
        return $this->belongsTo(Booking::class, 'source_booking_id');
    }

    public function redemptions()
    {
        return $this->hasMany(CouponRedemption::class);
    }

    /* ----------------------------------------------------------
     | Scopes
     |----------------------------------------------------------*/
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /* ----------------------------------------------------------
     | Helpers
     |----------------------------------------------------------*/
    
    /**
     * Check if coupon is valid for use
     */
    public function isValid(): bool
    {
        if ($this->status !== self::STATUS_ACTIVE) {
            return false;
        }

        if ($this->remaining_value_cents <= 0) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Redeem a specific amount from this coupon
     * 
     * @param int $amountCents Amount to redeem in cents
     * @param int $bookingId Booking ID this redemption is for
     * @return int Actual amount redeemed (may be less if insufficient balance)
     */
    public function redeem(int $amountCents, int $bookingId): int
    {
        if (!$this->isValid()) {
            return 0;
        }

        $actualAmount = min($amountCents, $this->remaining_value_cents);
        
        if ($actualAmount <= 0) {
            return 0;
        }

        // Create redemption record
        CouponRedemption::create([
            'coupon_id' => $this->id,
            'booking_id' => $bookingId,
            'amount_cents' => $actualAmount,
        ]);

        // Update remaining value
        $this->remaining_value_cents -= $actualAmount;

        // Update status if fully redeemed
        if ($this->remaining_value_cents <= 0) {
            $this->status = self::STATUS_FULLY_REDEEMED;
        }

        $this->save();

        return $actualAmount;
    }

    /**
     * Get remaining value in currency format (e.g., 80.00)
     */
    public function getRemainingValueAttribute(): float
    {
        return $this->remaining_value_cents / 100;
    }

    /**
     * Get original value in currency format
     */
    public function getOriginalValueAttribute(): float
    {
        return $this->original_value_cents / 100;
    }

    /**
     * Generate a unique coupon code
     */
    public static function generateUniqueCode(string $prefix = 'HH'): string
    {
        do {
            $code = strtoupper($prefix . '-' . Str::random(4) . '-' . Str::random(4));
            $exists = self::where('code', $code)->exists();
        } while ($exists);

        return $code;
    }

    /**
     * Mark coupon as expired (cron job helper)
     */
    public function markAsExpired(): void
    {
        if ($this->status === self::STATUS_ACTIVE) {
            $this->status = self::STATUS_EXPIRED;
            $this->save();
        }
    }
}
