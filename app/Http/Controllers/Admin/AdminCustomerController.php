<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class AdminCustomerController extends Controller
{
    public function store(Request $request)
    {
        // NOTE: Your users table (per schema) only has name, email, password etc.
        // No contact_number or photo columns. Keep validation aligned to that.
        $request->validate(
            [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email:filter', 'max:255', 'unique:users,email'],
                'contact_number' => ['nullable', 'string', 'max:20'],
                'password' => ['required', 'confirmed', PasswordRule::defaults()],
                'photo' => 'nullable|file|mimes:jpg,png,gif|max:3072'
            ],
            [
                'photo.max' => 'The photo may not be greater than 3 MB.',
                'photo.mimes' => 'The photo must be a file of type: jpg, png, gif.',
            ]
        );

        $path = null;

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('photos', 'public');
        }



        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'title' => "customer",
            'contact_number' => $request->contact_number,
            'photo' => $path,
        ]);

        event(new Registered($user));

        // Don’t Auth::login($user) — you stay as admin.
        return back()->with('success', 'Customer added.');
    }

    public function destroy(\App\Models\User $user)
    {
        // (optional) protect against self-delete or deleting admins
        if (Auth::id() === $user->id) {
            return back()->with('error', "You can't delete yourself.");
        }

        // Block deletion if any bookings exist
        if ($user->bookings()->exists()) {
            return back()->with('error', "Sorry, we can't delete a user with bookings.");
        }

        // (optional) remove stored photo if you save one
        if (!empty($user->getAttribute('photo'))) {
            Storage::disk('public')->delete($user->photo);
        }

        $user->delete();

        return back()->with('success', 'Customer deleted.');
    }
}
