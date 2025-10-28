<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'title',
        'contact_number',
        'password',
        'photo',
        'organization_id',
        'indemnity_consented_at',
        'indemnity_name',
        'indemnity_version',
        'is_admin',
        'is_editor',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'email_verified_at' => 'datetime',
        'indemnity_consented_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin()
    {
        return $this->is_admin;
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function memberships()
    {
        return $this->hasMany(Membership::class);
    }

    public function membership()
    {
        return $this->hasOne(Membership::class)
            ->whereNull('cancelled_at')
            ->latest();
    }

    public function activeMembership()
    {
        $now = now();
        return $this->hasOne(Membership::class)
            ->where('expires_at', '>', $now)
            ->whereNull('cancelled_at')
            ->where(function ($q) use ($now) {
                // Not suspended: either never suspended OR suspension period is not active
                $q->where(function ($q2) {
                    // Never been suspended
                    $q2->whereNull('suspended_from')
                       ->whereNull('suspended_until');
                })
                ->orWhere(function ($q2) use ($now) {
                    // Suspension period hasn't started yet
                    $q2->whereNotNull('suspended_from')
                       ->where('suspended_from', '>', $now);
                })
                ->orWhere(function ($q2) use ($now) {
                    // Suspension period has ended
                    $q2->whereNotNull('suspended_until')
                       ->where('suspended_until', '<', $now);
                });
            })
            ->latest();
    }

    public function hasActiveMembership()
    {
        return $this->activeMembership()->exists();
    }

    public function hasUsedFreeBookingToday()
    {
        if (!$this->hasActiveMembership()) {
            return false;
        }

        return $this->bookings()
            ->where('payment_status', 'Member')
            ->whereDate('created_at', today())
            ->exists();
    }

    public function hasUsedFreeBookingOnDate($date)
    {
        if (!$this->hasActiveMembership()) {
            return false;
        }

        $target = $date instanceof Carbon
            ? $date->toDateString()
            : Carbon::parse($date)->toDateString();

        return $this->bookings()
            ->where('payment_status', 'Member')
            ->whereHas('timeslot', function ($q) use ($target) {
                $q->whereDate('starts_at', $target);
            })
            ->exists();
    }
}
