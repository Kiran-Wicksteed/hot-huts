<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, User $user)
    {
        $request->validate([
            'type' => 'required|string|in:3-month,6-month,1-year',
        ]);

        // Cancel any existing active memberships
        if ($existingMembership = $user->activeMembership) {
            $existingMembership->update(['cancelled_at' => now()]);
        }

        $type = $request->input('type');
        
        // Calculate expiration based on type
        $expiresAt = match($type) {
            '3-month' => now()->addMonths(3),
            '6-month' => now()->addMonths(6),
            '1-year' => now()->addYear(),
            default => now()->addMonths(3),
        };

        $membership = $user->memberships()->create([
            'expires_at' => $expiresAt,
            'type' => $type,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Membership created successfully',
                'membership' => $membership
            ]);
        }

        return back()->with('success', 'Membership created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage (revoke membership).
     */
    public function destroy(User $user)
    {
        // Use the 'membership' relationship to find the latest, non-cancelled membership,
        // regardless of its suspension status.
        if (!$membership = $user->membership) {
            return $this->errorResponse('No membership found to revoke.', 404);
        }

        $membership->update(['cancelled_at' => now()]);

        return $this->successResponse('Membership revoked successfully');
    }

    public function suspend(Request $request, User $user)
    {
        $request->validate([
            'suspended_from' => 'required|date',
            'suspended_until' => 'required|date|after:suspended_from',
            'suspension_reason' => 'nullable|string|max:500',
        ]);

        if (!$membership = $user->activeMembership) {
            return $this->errorResponse('No active membership found to suspend.', 422);
        }

        if ($membership->isSuspended()) {
            return $this->errorResponse('This membership is already suspended.', 422);
        }

        $membership->update([
            'suspended_from' => $request->suspended_from,
            'suspended_until' => $request->suspended_until,
            'suspension_reason' => $request->suspension_reason,
        ]);

        return $this->successResponse('Membership suspended successfully', [
            'membership' => $membership->fresh()
        ]);
    }

    public function unsuspend(User $user)
    {
        if (!$membership = $user->membership) {
            return $this->errorResponse('No membership found.', 404);
        }

        if (!$membership->isSuspended()) {
            return $this->successResponse('Membership is not currently suspended');
        }

        $membership->update([
            'suspended_from' => null,
            'suspended_until' => null,
            'suspension_reason' => null,
        ]);

        return $this->successResponse('Membership suspension removed successfully', [
            'membership' => $membership->fresh()
        ]);
    }

    // Helper methods
    private function errorResponse($message, $code = 400)
    {
        if (request()->wantsJson()) {
            return response()->json(['error' => $message], $code);
        }
        return back()->withErrors(['membership' => $message]);
    }

    private function successResponse($message, $data = [])
    {
        if (request()->wantsJson()) {
            return response()->json(array_merge(['message' => $message], $data));
        }
        return back()->with('success', $message);
    }
}
