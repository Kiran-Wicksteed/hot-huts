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
use Illuminate\Support\Facades\DB;
use App\Models\Booking;
use Inertia\Inertia;

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


    public function show(User $user)
    {
        // Base query for this user's bookings
        $q = Booking::with(['timeslot.schedule.location']) // keep if these relations exist
            ->where('user_id', $user->id);

        $bookingsCount = (clone $q)->count();
        $lastBookingAt = (clone $q)->max('created_at');

        // Latest 5 bookings with helpful, nullable-safe fields
        $recent = (clone $q)->orderByDesc('created_at')->limit(5)->get()
            ->map(function ($b) {
                $ts       = $b->timeslot ?? null;
                $schedule = $ts?->schedule ?? null;
                $loc      = $schedule?->location ?? null;

                // try to surface a datetime for "when"
                $start = $ts?->getAttribute('start')
                    ?? $ts?->getAttribute('start_time')
                    ?? $ts?->getAttribute('starts_at');

                $end   = $ts?->getAttribute('end')
                    ?? $ts?->getAttribute('end_time')
                    ?? $ts?->getAttribute('ends_at');

                $price = $b->getAttribute('amount')
                    ?? $b->getAttribute('total')   // legacy/backfill if present
                    ?? $ts?->getAttribute('price');

                return [
                    'id'             => $b->id,
                    'booking_type'   => $b->getAttribute('booking_type') ?? $b->getAttribute('context') ?? 'sauna',
                    'status'         => $b->getAttribute('status'),
                    'payment_method' => $b->getAttribute('payment_method'),
                    'people'         => $b->getAttribute('people'),
                    'created_at'     => $b->created_at,
                    'start'          => $start,
                    'end'            => $end,
                    'location'       => $loc?->getAttribute('name') ?? $loc?->getAttribute('title'),
                    // price is optional — show if present on booking or timeslot
                    'price' => is_null($price) ? null : (float) $price / 100,
                ];
            });

        $detail = [
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'contact_number' => $user->getAttribute('contact_number'), // safe if column absent
            'photo'          => $user->getAttribute('photo') ? asset('storage/' . $user->photo) : null,
            'created_at'     => $user->created_at,
            'initials'       => collect(explode(' ', (string) $user->name))
                ->map(fn($p) => mb_substr($p, 0, 1))
                ->take(2)->implode('') ?: 'CU',
            'stats' => [
                'bookings_count'  => (int) $bookingsCount,
                'last_booking_at' => $lastBookingAt,
            ],
            'recent_bookings' => $recent,
        ];

        return Inertia::render('customers/index', [
            'customerDetail' => $detail,
        ]);
    }
}
