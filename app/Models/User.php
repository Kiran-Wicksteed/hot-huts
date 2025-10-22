<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function membership()
    {
        return $this->hasOne(Membership::class);
    }

    public function activeMembership()
    {
        return $this->hasOne(Membership::class)->where('expires_at', '>', now())->whereNull('cancelled_at');
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
}
