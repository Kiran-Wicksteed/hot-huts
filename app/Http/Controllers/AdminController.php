<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Organization;

class AdminController extends Controller
{
    public function index()
    {
        // You can pass any data you need for the component here
        return Inertia::render('Admin/Dashboard', [
            'users' => User::all(),
            'organizations' => Organization::all(),
        ]);
    }
}
