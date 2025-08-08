<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Sauna;
use App\Models\Location;
use App\Models\SaunaSchedule;
use App\Models\EventOccurrence;
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
            'events'    => EventOccurrence::with('event', 'location')
                ->where('is_active', true)
                ->orderBy('occurs_on')
                ->get()
                ->map(fn($o) => [
                    'id'          => $o->id,
                    'event_name'  => $o->event->name,
                    'description' => $o->event->description,
                    'date'        => $o->occurs_on->toDateString(),
                    'start'       => $o->start_time->format('H:i'),
                    'end'         => $o->end_time->format('H:i'),
                    'location_id' => $o->location_id,
                    'location'    => $o->location->name,
                    'location_image' => $o->location->image_path,
                    'price'       => $o->effective_price,
                    'capacity'    => $o->effective_capacity,
                ]),
        ]);
    }
}
