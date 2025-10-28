<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Membership extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'user_id',
        'expires_at',
        'order_id',
        'type',
        'cancelled_at',
        'suspended_from',
        'suspended_until',
        'suspension_reason',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'suspended_from' => 'datetime',
        'suspended_until' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if membership is currently suspended
     */
    public function isSuspended(): bool
    {
        if (!$this->suspended_from || !$this->suspended_until) {
            return false;
        }

        $now = now();
        return $now->greaterThanOrEqualTo($this->suspended_from) 
            && $now->lessThanOrEqualTo($this->suspended_until);
    }

    /**
     * Check if membership is active (not cancelled and not suspended)
     */
    public function isActive(): bool
    {
        if ($this->cancelled_at) {
            return false;
        }

        if ($this->expires_at && now()->greaterThan($this->expires_at)) {
            return false;
        }

        if ($this->isSuspended()) {
            return false;
        }

        return true;
    }
}
