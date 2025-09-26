<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Log;
use App\Notifications\UserApprovedNotification;
use Illuminate\Http\UploadedFile;



class ProfileController extends Controller
{
    use AuthorizesRequests;
    //Upload an image
    public function uploadPhoto(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif', 'max:3072'],
        ], [
            'photo.max'   => 'The photo may not be greater than 3 MB.',
            'photo.mimes' => 'The photo must be a file of type: jpg, jpeg, png, webp, gif.',
        ]);

        if ($request->hasFile('photo') && $request->file('photo') instanceof UploadedFile) {
            $old = $user->photo;

            try {
                // Upload to S3 (same folder/disk style as store())
                $key = $request->file('photo')->storePublicly('hothuts/images/users', 's3');
                $url = Storage::disk('s3')->url($key);

                // Save absolute URL (matches your store() convention)
                $user->photo = $url;

                // Best-effort delete of previous image
                if (!empty($old)) {
                    try {
                        if (str_starts_with($old, 'http://') || str_starts_with($old, 'https://')) {
                            // Old was an S3 URL — extract key and delete from S3
                            $oldKey = ltrim(parse_url($old, PHP_URL_PATH) ?: '', '/');
                            Storage::disk('s3')->delete($oldKey);
                        } else {
                            // Old was a local/public path
                            Storage::disk('public')->delete($old);
                        }
                    } catch (\Throwable $del) {
                        Log::warning('Old photo delete failed', ['error' => $del->getMessage(), 'old' => $old]);
                    }
                }

                Log::info('Photo uploaded to S3', ['key' => $key, 'url' => $url]);
            } catch (\Throwable $e) {
                Log::error('S3 image upload failed', ['error' => $e->getMessage()]);
                // If you prefer this to be non-fatal, remove the throw
                throw $e;
            }
        }

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'photo-updated');
    }


    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function changeUserPermissions(Request $request, User $user)
    {
        $validated = $request->validate([
            'is_admin' => 'required|boolean',
            'is_editor' => 'required|boolean',
            'is_family' => 'required|boolean',
        ]);

        Log::info('Validated data:', $validated);
        $user->is_admin = $validated['is_admin'];
        $user->is_editor = $validated['is_editor'];
        $user->is_family = $validated['is_family'];
        $user->save();

        Log::info('Updated user:', $user->toArray());

        return Redirect::route('admin.users')->with('status', 'User permissions updated successfully.');
    }

    public function changeUserOrganization(Request $request, User $user)
    {
        $request->validate([
            'organization_id' => 'required|exists:organizations,id',
        ]);

        $user = $request->user();
        $user->organization_id = $request->organization_id;
        $user->save();

        return redirect()->route('admin.users')->with('status', 'Organization changed successfully.');
    }

    public function adminChangeUserOrganization(Request $request, User $user)
    {
        $request->validate([
            'organization_id' => 'required|exists:organizations,id',
        ]);

        $user->organization_id = $request->organization_id;
        $user->save();

        return redirect()->route('admin.users')->with('status', 'Organization changed successfully.');
    }


    public function changeUserApprovalStatus(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'is_approved' => 'required|boolean',
        ]);

        $user->is_approved = $request->is_approved;
        $user->save();

        if ($user->is_approved) {
            $user->notify(new UserApprovedNotification($user, Auth::user()));
        }


        return redirect()->route('admin.users')->with('status', 'User approval status changed successfully.');
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }


    //delete a specific users account

    public function destroyUser(Request $request, User $user): RedirectResponse
    {
        // Ensure the user is authorized to delete the account
        $this->authorize('delete', $user);

        // Delete the user's photo if it exists
        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }

        // Delete the user
        $user->delete();

        return Redirect::route('admin.users')->with('status', 'User deleted successfully.');
    }
}
