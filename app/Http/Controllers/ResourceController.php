<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Organization;
use Illuminate\Support\Facades\Auth;

class ResourceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Organization $organization, Resource $resource)
    {
        // Fetch chats belonging to the organization
        $resources = Resource::where('organization_id', $organization->id)->with('user')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Resources/Index', [
            'resources' => $resources,
            'organization' => $organization,
        ]);
    }

    public function familyIndex()
    {
        $resources = Resource::where('is_family', true)
            ->whereNull('organization_id')
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('Resources/FamilyIndex', [
            'resources' => $resources,
        ]);
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
    public function store(Request $request, Organization $organization)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'file' => 'required|file|mimes:pdf,doc,docx,txt,ppt,pptx,zip|max:20480', // Validate file type and size
            'is_family' => 'boolean',
        ]);

        // Store the uploaded file and get the path
        $filePath = $request->file('file')->store('resources', 'public');

        // Create the resource
        $resource = new Resource();
        $resource->title = $validated['title'];
        $resource->description = $validated['description'];
        $resource->file = $filePath;
        $resource->user_id = Auth::id();
        $resource->is_family = $request->is_family;
        $resource->organization_id = $organization->id;
        $resource->save();

        return redirect()->route('organizations.resources.index', ['organization' => $resource->organization_id])->with('status', 'Resource created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Resource $resource)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Resource $resource)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Resource $resource)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Resource $resource)
    {
        $resource->delete();

        return redirect()->route('organizations.resources.index', ['organization' => $resource->organization_id, 'resource' => $resource->id])
            ->with('status', 'Resource deleted successfully.');
    }
}
