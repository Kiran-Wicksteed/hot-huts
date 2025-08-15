<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Booking;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $users = User::withCount(['bookings as total_appointments'])
            ->with(['bookings' => function ($q) {
                $q->latest('created_at')->limit(1);
            }])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'initials' => strtoupper(substr($user->name, 0, 1) . substr(strrchr($user->name, ' '), 1, 1)),
                    'email' => $user->email,
                    'contact_number' => $user->contact_number ?? 'N/A',
                    'role' => $user->is_admin ? 'Admin' : 'Customer',
                    'recent_appointment' => optional($user->bookings->first())->created_at
                        ? $user->bookings->first()->created_at->format('d M Y, g:ia')
                        : 'No Appointments',
                    'total_appointments' => $user->total_appointments,
                ];
            });

        return Inertia::render('customers/index', [
            'customers' => $users
        ]);
    }
}
