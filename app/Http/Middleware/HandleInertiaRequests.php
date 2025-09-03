<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Inertia\Inertia;
use App\Models\User;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
                'organization' => $user ? $user->organization : null,
            ],
            'preflight' => fn() => $request->session()->pull('preflight'),
            'userResults' => Inertia::lazy(function () use ($request) {
                $q = trim($request->get('q', ''));
                if (strlen($q) < 2) return [];

                return User::query()
                    ->where(function ($w) use ($q) {
                        $w->where('name', 'like', "%{$q}%")
                            ->orWhere('email', 'like', "%{$q}%");
                    })
                    ->orderBy('name')
                    ->limit(10)
                    ->get(['id', 'name', 'email']);
            }),
        ]);
    }
}
