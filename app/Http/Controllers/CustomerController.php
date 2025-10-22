<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Booking;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $users = User::withCount(['bookings as total_appointments'])
            ->with(['bookings' => function ($q) {
                $q->latest('created_at')->limit(1);
            }])
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->get()
            ->map(function ($user) {
                // Safely handle name and initials
                $name = $user->name ?? 'Unknown User';
                $initials = '??';
                
                try {
                    $nameParts = array_filter(explode(' ', $name));
                    if (count($nameParts) >= 2) {
                        $initials = strtoupper(
                            mb_substr($nameParts[0], 0, 1) . 
                            mb_substr(end($nameParts), 0, 1)
                        );
                    } else if (!empty($name)) {
                        $initials = strtoupper(mb_substr($name, 0, 2));
                    }
                } catch (\Exception $e) {
                    // Fallback in case of any error
                    $initials = '??';
                }

                return [
                    'id' => $user->id,
                    'name' => $name,
                    'initials' => $initials,
                    'email' => $user->email ?? 'No email',
                    'contact_number' => $user->contact_number ?? 'N/A',
                    'role' => $user->is_admin ? 'Admin' : 'Customer',
                    'recent_appointment' => optional($user->bookings->first())->created_at
                        ? $user->bookings->first()->created_at->format('d M Y, g:ia')
                        : 'No Appointments',
                    'total_appointments' => $user->total_appointments,
                ];
            });

        return Inertia::render('customers/index', [
            'customers' => $users,
            'filters' => ['search' => $request->input('search')],
            'customerDetail' => null,
        ]);
    }
}
