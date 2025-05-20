<?php

namespace App\Http\Controllers;

use App\Models\FamilyGallery;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class FamilyGalleryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $galleryImages = FamilyGallery::with('user')->orderBy('created_at', 'desc')->get();

        return Inertia::render('FamilyGallery/Index', [
            'galleryImages' => $galleryImages,
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
    public function store(Request $request)
    {
        $validated = $request->validate(
            [
                'caption' => 'required|string|max:255',
                'file' => 'file|mimes:jpg,png,gif|max:3072',
            ],
            [
                'file.max' => 'The photo may not be greater than 3 MB.',
                'file.mimes' => 'The photo must be a file of type: jpg, png, gif.',
            ]
        );

        $gallery = new FamilyGallery();
        $gallery->caption = $validated['caption'];
        $gallery->user_id = Auth::id();
        $path = $request->file('file')->store('family_gallery', 'public');
        $gallery->file = $path;
        $gallery->save();

        return redirect()->route('family.gallery.index')->with('status', 'Gallery image uploaded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(FamilyGallery $familyGallery)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FamilyGallery $familyGallery)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FamilyGallery $familyGallery)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FamilyGallery $familyGallery)
    {
        //
    }
}
