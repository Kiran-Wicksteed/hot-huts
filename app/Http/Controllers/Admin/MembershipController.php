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
            'type' => 'sometimes|string|in:3-month',
        ]);

        if ($user->hasActiveMembership()) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'This user already has an active membership.'], 422);
            }
            return back()->withErrors(['membership' => 'This user already has an active membership.']);
        }

        $membership = $user->membership()->create([
            'expires_at' => now()->addMonths(3),
            'type' => $request->input('type', '3-month'),
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
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
