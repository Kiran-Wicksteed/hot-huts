<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\WelcomeMail;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'contact_number' => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'indemnity_agreed'   => ['accepted'],
            'indemnity_name'     => ['required', 'string', 'max:255'],
            'indemnity_version'  => ['required', 'string', 'max:32'],
            'photo' => 'nullable|file|mimes:jpg,png,gif|max:3072'
        ], [
            'photo.max' => 'The photo may not be greater than 3 MB.',
            'photo.mimes' => 'The photo must be a file of type: jpg, png, gif.',
        ]);




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


        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'title' => "customer",
            'contact_number' => $request->contact_number,
            'photo' => $request['image_path'] ?? null,
            'indemnity_consented_at' => now(),
            'indemnity_name'         => $request->indemnity_name,
            'indemnity_version'      => $request->indemnity_version,
        ]);

        try {
            Mail::to($user->email)->send(new WelcomeMail($user));
        } catch (\Throwable $e) {
            Log::error('WelcomeMail failed', [
                'user_id' => $user->id,
                'email'   => $user->email,
                'error'   => $e->getMessage(),
            ]);
        }

        Auth::login($user);

        return redirect(route('index', absolute: false));
    }
}
