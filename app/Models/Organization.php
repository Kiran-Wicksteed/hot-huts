<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
   protected $fillable = [
        'photo',
        'orgName',
         'description',
        'category',
        'website',
    ];

       public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class);
    }

    public function resources(): HasMany
    {
        return $this->hasMany(Resource::class);
    }

          public function policies(): HasMany
    {
        return $this->hasMany(Policy::class);
    }

      public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
