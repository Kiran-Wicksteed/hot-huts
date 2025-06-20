<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::active()->get();
        return Inertia::render('services/index', [
            'services' => $services,
        ]);
    }
    public function destroy(Service $service)
    {
        $service->delete();
        return back()->with('success', 'Service removed.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'active' => ['required', 'boolean'],
        ]);


        Service::create($validated);

        return back()->with('success', 'Service added.');
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'active' => ['required', 'boolean'],
        ]);



        $service->update($validated);

        return back()->with('success', 'Service updated.');
    }
}
