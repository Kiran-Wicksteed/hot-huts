<?php

namespace App\Http\Controllers;

use App\Models\Policy;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Organization;
use Illuminate\Support\Facades\Auth;

class PolicyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Organization $organization, Policy $policy)
    {

        $policies = Policy::where('organization_id', $organization->id)->with('user')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Policies/Index', [
            'policies' => $policies,
            'organization' => $organization,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function store(Request $request,  Organization $organization)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'required|string',
        ]);

        $policy = new Policy();
        $policy->title = $validated['title'];
        $policy->description = $validated['description'];
        $policy->content = $validated['content'];
        $policy->user_id = Auth::id();
        $policy->organization_id = $organization->id;
        $policy->save();

        return redirect()->route('organizations.policies.index', ['organization' => $policy->organization_id])->with('status', 'Policy created successfully.');
    }


    public function show(Organization $organization, Policy $policy)
    {
        return Inertia::render('Policies/Show', [
            'organization' => $organization,
            'policy' => $policy,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Policy $policy, Organization $organization)
    {
        return Inertia::render('Policies/Edit', [
            'organization' => $organization,
            'policy' => $policy,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Organization $organization, Policy $policy)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'required|string',
        ]);

        $policy->update($validated);

        return redirect()->route('organizations.policies.index', [$organization, $policy])->with('status', 'Policy updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Policy $policy)
    {
        $policy->delete();

        return redirect()->route('organizations.policies.index', ['organization' => $policy->organization_id, 'policy' => $policy->id])
            ->with('status', 'Policy deleted successfully.');
    }
}
