<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Sauna;
use App\Models\Location;
use App\Models\SaunaSchedule;
use App\Models\Service;

class BookingFormController extends Controller
{
    public function index()
    {
        $saunas = Sauna::with('schedules.location')->get();
        $services = Service::active()->get();
        $addons = Service::addons()->active()->get();

        return Inertia::render('Index', [
            'saunas' => $saunas,
            'locations' => Location::orderBy('name')->get(['id', 'name', 'image_path']),
            'services' => $services,
            'addons' => $addons,
        ]);
    }
}
