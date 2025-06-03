<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        return Inertia::render('Locations/index', [
            'locations' => Location::latest()->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'timezone' => ['required', 'string', 'timezone'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->file('image')) {
            $validated['image_path'] = $request->file('image')
                ->store('locations', 'public');
        }

        Location::create($validated);

        return back()->with('success', 'Location added.');
    }

    public function update(Request $request, Location $location)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'timezone' => ['required', 'string', 'timezone'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->file('image')) {
            $validated['image_path'] = $request->file('image')
                ->store('locations', 'public');
        }

        $location->update($validated);

        return back()->with('success', 'Location updated.');
    }

    public function destroy(Location $location)
    {
        $location->delete();
        return back()->with('success', 'Location removed.');
    }
}
