<?php

namespace App\Http\Controllers;

use App\Models\Sauna;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaunaController extends Controller
{
    public function index()
    {
        return Inertia::render('Saunas/index', [
            'saunas' => Sauna::latest()->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
        ]);


        Sauna::create($validated);

        return back()->with('success', 'Sauna added.');
    }

    public function update(Request $request, Sauna $sauna)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
        ]);



        $sauna->update($validated);

        return back()->with('success', 'Sauna updated.');
    }

    public function destroy(Sauna $sauna)
    {
        $sauna->delete();
        return back()->with('success', 'Sauna removed.');
    }
}
