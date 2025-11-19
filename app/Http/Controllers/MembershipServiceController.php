<?php

namespace App\Http\Controllers;

use App\Models\MembershipService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MembershipServiceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $this->validatePayload($request);

        MembershipService::create($validated);

        return back()->with('success', 'Membership service created.');
    }

    public function update(Request $request, MembershipService $membershipService)
    {
        $validated = $this->validatePayload($request, $membershipService->id);

        $membershipService->update($validated);

        return back()->with('success', 'Membership service updated.');
    }

    public function destroy(MembershipService $membershipService)
    {
        $membershipService->delete();

        return back()->with('success', 'Membership service removed.');
    }

    protected function validatePayload(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('membership_services', 'code')->ignore($ignoreId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}
