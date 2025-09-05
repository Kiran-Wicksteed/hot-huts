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
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;

class AdminCustomerController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(
            [
                'name'              => ['required', 'string', 'max:255'],
                'email'             => ['required', 'email:filter', 'max:255', 'unique:users,email'],
                'contact_number'    => ['nullable', 'string', 'max:20'],
                'password'          => ['required', 'confirmed', PasswordRule::defaults()],
                'photo'             => ['nullable', 'file', 'mimes:jpg,png,gif', 'max:3072'],

                // Indemnity (Step 2)
                'indemnity_agreed'  => ['accepted'],
                'indemnity_name'    => ['required', 'string', 'max:255'],
                'indemnity_version' => ['required', 'string', 'max:32'],
            ],
            [
                'photo.max'   => 'The photo may not be greater than 3 MB.',
                'photo.mimes' => 'The photo must be a file of type: jpg, png, gif.',
            ]
        );

        // Ensure the typed name matches the entered full name (case/space-insensitive)
        $expectedName = trim($request->name);
        if (mb_strtolower(trim($request->indemnity_name)) !== mb_strtolower($expectedName)) {
            return back()
                ->withErrors(['indemnity_name' => 'Please type the name exactly as entered above.'])
                ->withInput();
        }

        // Photo upload (optional)
        $path = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('photos', 'public');
        }

        // Create the customer (do NOT log in — you remain admin)
        $user = User::create([
            'name'                   => $request->name,
            'email'                  => $request->email,
            'password'               => Hash::make($request->password),
            'title'                  => 'customer',
            'contact_number'         => $request->contact_number, // make sure this column exists
            'photo'                  => $path,                    // make sure this column exists

            // Indemnity audit fields
            'indemnity_consented_at' => now(),
            'indemnity_name'         => $request->indemnity_name,
            'indemnity_version'      => $request->indemnity_version,
        ]);

        Mail::to($user->email)->send(new WelcomeMail($user));

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
        $noShowCount = (clone $q)->where('no_show', true)->count();

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
            'is_admin' => (bool) $user->getAttribute('is_admin'),
            'initials'       => collect(explode(' ', (string) $user->name))
                ->map(fn($p) => mb_substr($p, 0, 1))
                ->take(2)->implode('') ?: 'CU',
            'stats' => [
                'bookings_count'  => (int) $bookingsCount,
                'last_booking_at' => $lastBookingAt,
                'no_show_count'   => (int) $noShowCount,
            ],
            'recent_bookings' => $recent,
        ];

        return Inertia::render('customers/index', [
            'customerDetail' => $detail,
        ]);
    }

    public function update(Request $request, User $user)
    {

        //log the entire request
        \Illuminate\Support\Facades\Log::info('AdminCustomerController@update', ['request' => $request->all(), 'user' => $user->toArray()]);

        // Validate input
        $validated = $request->validate(
            [
                'name'            => ['required', 'string', 'max:255'],
                'email'           => ['required', 'email:filter', 'max:255', 'unique:users,email,' . $user->id],
                'contact_number'  => ['nullable', 'string', 'max:20'],
                'photo'           => ['nullable', 'file', 'mimes:jpg,png,gif', 'max:3072'],
                'is_admin'        => ['sometimes', 'boolean'],
            ],
            [
                'photo.max'   => 'The photo may not be greater than 3 MB.',
                'photo.mimes' => 'The photo must be a file of type: jpg, png, gif.',
            ]
        );

        $updates = [
            'name'  => $validated['name'],
            'email' => $validated['email'],
        ];

        // Optional fields only if columns exist
        if (\Illuminate\Support\Facades\Schema::hasColumn($user->getTable(), 'contact_number')) {
            $updates['contact_number'] = $validated['contact_number'] ?? null;
        }

        // Handle avatar upload (optional)
        if (
            isset($validated['photo']) &&
            $request->hasFile('photo') &&
            \Illuminate\Support\Facades\Schema::hasColumn($user->getTable(), 'photo')
        ) {
            $path = $request->file('photo')->store('photos', 'public');

            // Delete old photo if present
            $old = $user->getAttribute('photo');
            if (!empty($old)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($old);
            }

            $updates['photo'] = $path;
        }

        // Admin toggle (only admins can change; protect last admin; no self-demote)
        if (\Illuminate\Support\Facades\Schema::hasColumn($user->getTable(), 'is_admin') && $request->has('is_admin')) {
            $actor = \Illuminate\Support\Facades\Auth::user();

            if (!$actor || !$actor->is_admin) {
                abort(403, 'Only admins can change admin access.');
            }

            $desired = $request->boolean('is_admin');

            // Prevent removing admin from the last remaining admin
            if ($user->is_admin && $desired === false) {
                $adminCount = User::where('is_admin', true)->count();

                if ($adminCount <= 1) {
                    return back()->with('error', "You can't remove admin from the last admin.");
                }

                // Optional: block self-demotion to avoid lockouts
                if ($user->id === $actor->id) {
                    return back()->with('error', "You can't remove your own admin access.");
                }
            }

            $updates['is_admin'] = $desired;
        }

        $user->fill($updates)->save();

        return back()->with('success', 'Customer updated.');
    }
}
