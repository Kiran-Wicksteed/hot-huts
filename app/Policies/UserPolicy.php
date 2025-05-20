<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;


class UserPolicy
{
 use HandlesAuthorization;

 public function delete(User $currentUser, User $user)
    {
        // Only allow admins to delete users
        return $currentUser->is_admin;
    }
}
