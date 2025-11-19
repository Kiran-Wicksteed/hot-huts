<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Service;
use App\Models\RetailItem;
use App\Models\MembershipService;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::active()->orderBy('name')->get();

        $retailItems = RetailItem::orderByDesc('is_active')
            ->orderBy('name')
            ->get()
            ->map(function (RetailItem $item) {
                return [
                    'id' => $item->id,
                    'code' => $item->code,
                    'name' => $item->name,
                    'price' => round($item->price_rands, 2),
                    'price_cents' => $item->price_cents,
                    'description' => $item->description,
                    'is_active' => $item->is_active,
                ];
            });

        $membershipServices = MembershipService::orderByDesc('is_active')
            ->orderBy('name')
            ->get()
            ->map(function (MembershipService $service) {
                return [
                    'id' => $service->id,
                    'code' => $service->code,
                    'name' => $service->name,
                    'description' => $service->description,
                    'price' => round($service->price, 2),
                    'price_cents' => $service->price_cents,
                    'is_active' => $service->is_active,
                ];
            });

        return Inertia::render('services/index', [
            'services' => $services,
            'retailItems' => $retailItems,
            'membershipServices' => $membershipServices,
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
