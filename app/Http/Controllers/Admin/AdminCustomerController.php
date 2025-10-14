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
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use App\Models\LoyaltyAccount;
use App\Models\LoyaltyLedger;


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
                'photo'             => ['required', 'file', 'mimes:jpg,png,gif', 'max:3072'],

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
        if ($request->hasFile('photo') && $request->file('photo') instanceof UploadedFile) {


            try {
                // Put the file on S3 with public visibility
                $path = $request->file('photo')->storePublicly('hothuts/images/users', 's3');
                $request['image_path'] = Storage::disk('s3')->url($path);
                // If you prefer storing the key only, use:
                // $fields['image_path'] = $path;

            } catch (\Throwable $e) {
                Log::error("S3 image upload failed: {$e->getMessage()}");
                throw $e; // or add a validation error/response as you prefer
            }
        }

        // Create the customer (do NOT log in — you remain admin)
        $user = User::create([
            'name'                   => $request->name,
            'email'                  => $request->email,
            'password'               => Hash::make($request->password),
            'title'                  => 'customer',
            'contact_number'         => $request->contact_number, // make sure this column exists
            'photo' => $request['image_path'] ?? null,                // make sure this column exists

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


    public function show(User $user, Request $request)
    {
        // Get or create loyalty account
        $loyaltyAccount = LoyaltyAccount::firstOrCreate(
            ['user_id' => $user->id],
            ['points_balance' => 0, 'lifetime_points' => 0]
        );

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
            'photo' => $this->resolvePhotoUrl($user->getAttribute('photo')),
            'created_at'     => $user->created_at,
            'is_admin' => (bool) $user->getAttribute('is_admin'),
            'is_editor' => (bool) $user->getAttribute('is_editor'),
            'initials'       => collect(explode(' ', (string) $user->name))
                ->map(fn($p) => mb_substr($p, 0, 1))
                ->take(2)->implode('') ?: 'CU',
            'stats' => [
                'bookings_count'  => (int) $bookingsCount,
                'last_booking_at' => $lastBookingAt,
                'no_show_count'   => (int) $noShowCount,
            ],
            'loyalty' => [
                'account_id'      => $loyaltyAccount->id,
                'points_balance'  => (int) $loyaltyAccount->points_balance,
                'lifetime_points' => (int) $loyaltyAccount->lifetime_points,
            ],
            'recent_bookings' => $recent,
        ];

        // If this is an AJAX/modal request (explicitly check for the header we set), return JSON
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' && $request->expectsJson()) {
            return response()->json($detail);
        }

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
                'is_editor'       => ['sometimes', 'boolean'],
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
            $request->hasFile('photo') &&
            $request->file('photo') instanceof \Illuminate\Http\UploadedFile &&
            \Illuminate\Support\Facades\Schema::hasColumn($user->getTable(), 'photo')
        ) {
            try {
                // Upload to the same folder/disk as store()
                $key = $request->file('photo')->storePublicly('hothuts/images/users', 's3');
                $newUrl = \Illuminate\Support\Facades\Storage::disk('s3')->url($key);

                // (Optional) best-effort delete old photo (supports old public path or S3 URL)
                $old = $user->getAttribute('photo');
                if (!empty($old)) {
                    try {
                        if (str_starts_with($old, 'http')) {
                            // old was a URL — extract key and delete from S3
                            $oldKey = ltrim(parse_url($old, PHP_URL_PATH) ?: '', '/');
                            \Illuminate\Support\Facades\Storage::disk('s3')->delete($oldKey);
                        } else {
                            // old was a local/public path
                            \Illuminate\Support\Facades\Storage::disk('public')->delete($old);
                        }
                    } catch (\Throwable $del) {
                        \Illuminate\Support\Facades\Log::warning('Old photo delete failed', ['error' => $del->getMessage()]);
                    }
                }

                // Save the absolute URL exactly like store()
                $updates['photo'] = $newUrl;
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error("S3 image upload failed: {$e->getMessage()}");
                // If you want this to be non-fatal, comment out the next line
                // throw $e;
            }
        }

        // Admin toggle (only admins can change; protect last admin; no self-demote)
        if (\Illuminate\Support\Facades\Schema::hasColumn($user->getTable(), 'is_admin') && $request->has('is_admin')) {
            $actor = \Illuminate\Support\Facades\Auth::user();

            // log the actor
            \Illuminate\Support\Facades\Log::info('AdminCustomerController@update - actor', ['actor' => $actor ? (array) $actor : null]);

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


        // Day staff toggle (non-day-staff only)
        if (\Illuminate\Support\Facades\Schema::hasColumn($user->getTable(), 'is_editor') && $request->has('is_editor')) {
            $actor = \Illuminate\Support\Facades\Auth::user();
            // If the actor is marked as day staff, forbid changing day staff access.
            if ($actor && (bool)$actor->is_editor === true) {
                abort(403, 'Day staff cannot change day staff access.');
            }
            $updates['is_editor'] = $request->boolean('is_editor');
        }

        $user->fill($updates)->save();

        return back()->with('success', 'Customer updated.');
    }

    public function export(Request $request): StreamedResponse
    {
        $fileName = 'customers_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Cache-Control'       => 'no-store, no-cache',
        ];

        $callback = function () {
            $out = fopen('php://output', 'w');

            // BOM so Excel opens UTF-8 properly
            fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header row
            fputcsv($out, [
                'ID',
                'Full Name',
                'Email',
                'Contact Number',
                'Role',
                'Recent Booking',
                'Total Appointments',
            ]);

            // Use aggregates instead of eager loading a full relation per user
            $query = User::query()
                ->withCount(['bookings as total_appointments'])
                ->withMax('bookings', 'created_at') // adds bookings_max_created_at
                ->orderBy('id');

            foreach ($query->cursor() as $u) {
                $recentRaw = $u->bookings_max_created_at; // string nullable
                $recent = $recentRaw
                    ? Carbon::parse($recentRaw)->timezone(config('app.timezone'))->format('d M Y, g:ia')
                    : 'No Appointments';

                fputcsv($out, [
                    $u->id,
                    $u->name,
                    $u->email,
                    $u->contact_number ?? 'N/A',
                    $u->is_admin ? 'Admin' : 'Customer',
                    $recent,
                    $u->total_appointments,
                ]);
            }

            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function adjustLoyaltyPoints(Request $request, User $user)
    {
        $validated = $request->validate([
            'points' => ['required', 'integer', 'min:-10000', 'max:10000'],
        ]);

        // Get or create loyalty account
        $account = LoyaltyAccount::firstOrCreate(
            ['user_id' => $user->id],
            ['points_balance' => 0, 'lifetime_points' => 0]
        );

        $points = (int) $validated['points'];
        $notes = 'Admin adjustment';

        // Create ledger entry
        // Use microtime-based unique ID to avoid duplicate constraint violations
        // when the same admin adjusts points multiple times
        $uniqueSourceId = (int) (microtime(true) * 10000);
        
        LoyaltyLedger::create([
            'account_id' => $account->id,
            'type' => LoyaltyLedger::TYPE_ADJUST,
            'points' => $points,
            'source_type' => 'Admin',
            'source_id' => $uniqueSourceId,
            'notes' => $notes . ' (by admin #' . Auth::id() . ')',
            'occurred_at' => now(),
        ]);

        // Update account balance
        $account->points_balance += $points;
        
        // Update lifetime points (only if adding points)
        if ($points > 0) {
            $account->lifetime_points += $points;
        }
        
        $account->save();

        return response()->json([
            'success' => true,
            'message' => $points > 0 
                ? "Added {$points} loyalty points" 
                : "Removed " . abs($points) . " loyalty points",
            'loyalty' => [
                'account_id' => $account->id,
                'points_balance' => (int) $account->points_balance,
                'lifetime_points' => (int) $account->lifetime_points,
            ],
        ]);
    }

    private function resolvePhotoUrl(?string $value): ?string
    {
        if (!$value) return null;

        // Already an absolute URL? Use as-is.
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        // Looks like an S3 key? (your keys start with hothuts/images/...)
        if (str_starts_with($value, 'hothuts/')) {
            return Storage::disk('s3')->url(ltrim($value, '/'));
        }

        // Fallback: treat as a legacy local/public path
        return Storage::disk('public')->url(ltrim($value, '/'));
    }
}
