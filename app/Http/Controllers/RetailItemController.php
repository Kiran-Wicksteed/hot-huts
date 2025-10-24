<?php

namespace App\Http\Controllers;

use App\Models\RetailItem;
use Illuminate\Http\Request;

class RetailItemController extends Controller
{
    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        RetailItem::create([
            'code' => $data['code'],
            'name' => $data['name'],
            'price_cents' => $this->toCents($data['price']),
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'],
        ]);

        return back()->with('success', 'Off-site add-on created.');
    }

    public function update(Request $request, RetailItem $retailItem)
    {
        $data = $this->validatePayload($request);

        $retailItem->update([
            'code' => $data['code'],
            'name' => $data['name'],
            'price_cents' => $this->toCents($data['price']),
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'],
        ]);

        return back()->with('success', 'Off-site add-on updated.');
    }

    public function destroy(RetailItem $retailItem)
    {
        $retailItem->update(['is_active' => false]);

        return back()->with('success', 'Off-site add-on deactivated.');
    }

    public function restore(RetailItem $retailItem)
    {
        $retailItem->update(['is_active' => true]);

        return back()->with('success', 'Off-site add-on activated.');
    }

    public function forceDestroy(RetailItem $retailItem)
    {
        $retailItem->bookings()->detach();
        $retailItem->delete();

        return back()->with('success', 'Off-site add-on deleted.');
    }

    protected function validatePayload(Request $request): array
    {
        if ($request->filled('code')) {
            $request->merge([
                'code' => preg_replace('/\s+/', '_', $request->input('code')),
            ]);
        }

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $validated['is_active'] = array_key_exists('is_active', $validated)
            ? (bool) $validated['is_active']
            : true;

        return $validated;
    }

    protected function toCents($value): int
    {
        return (int) round(((float) $value) * 100);
    }
}
