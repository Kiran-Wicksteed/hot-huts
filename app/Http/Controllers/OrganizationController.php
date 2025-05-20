<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;


class OrganizationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // You can pass any data you need for the component here
        return Inertia::render('Orgs/Index', [
            'organizations' => Organization::all(),
        ]);
    }

    public function displayOrgs()
    {
        return Inertia::render('Orgs/List', [
            'organizations' => Organization::with('users')->get(),
            'users' => User::all(),
        ]);
    }

    public function getOrganizations()
    {
        return response()->json(Organization::all());
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
    public function store(Request $request)
    {

        $validated = $request->validate([
            'orgName' => 'required|string|max:255|unique:organizations,orgName',
            'description' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'website' => 'nullable|string|max:255',
            'photo' => 'nullable|file|mimes:jpg,png,gif|max:3072',
        ], [
            'photo.max' => 'The photo may not be greater than 3 MB.',
            'photo.mimes' => 'The photo must be a file of type: jpg, png, gif.',
        ]);

        $organization = new Organization($validated);
        $organization->orgName = $validated['orgName'];

        if ($request->hasFile('photo')) {

            // Store the new photo
            $path = $request->file('photo')->store('photos', 'public');
            $organization->photo = $path;

            Log::info('Photo uploaded:', ['path' => $path]);
        }

        $organization->save();

        return Redirect::route('admin.organizations.index')->with('status', 'organization-created');
    }

    public function users(Organization $organization)
    {
        $users = $organization->users()->get();

        return Inertia::render('Users/Index', [
            'organization' => $organization,
            'users' => $users,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Organization $organization)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Organization $organization)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Organization $organization)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Organization $organization)
    {
        // Delete the organization's photo if it exists
        if ($organization->photo) {
            Storage::disk('public')->delete($organization->photo);
        }

        // Delete the organization
        $organization->delete();

        return Redirect::route('admin.organizations.index')->with('status', 'Organization deleted successfully.');
    }
}
