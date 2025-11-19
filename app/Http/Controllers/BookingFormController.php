<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Sauna;
use App\Models\Location;
use App\Models\SaunaSchedule;
use App\Models\EventOccurrence;
use App\Models\Service;
use App\Models\MembershipService;

class BookingFormController extends Controller
{
    public function index()
    {
        $saunas   = Sauna::with('schedules.location')->get();
        $services = Service::active()->get();
        $addons   = Service::addons()->active()->get();

        $eventOccurrences = EventOccurrence::with([
            'event:id,default_capacity,name,description,default_price',
            'location:id,name,address,image_path', // ← Added 'address' here
        ])
            ->where('is_active', true)
            ->withSum([
                'bookings as paid_people_sum' => fn($q) => $q->where('status', 'paid'),
            ], 'people')
            ->orderBy('occurs_on')
            ->orderBy('start_time')
            ->get();

        // Map occurrences for frontend
        $events = $eventOccurrences->map(fn(EventOccurrence $o) => [
            'id'             => $o->id,
            'event_id'       => $o->event_id,
            'event_name'     => $o->event->name,
            'description'    => $o->event->description,
            'date'           => $o->occurs_on->toDateString(),
            'start'          => $o->start_time->format('H:i'),
            'end'            => $o->end_time->format('H:i'),
            'location_id'    => $o->location_id,
            'location'       => $o->location->name,
            'address'        => $o->location->address,
            'location_image' => $o->location->image_path,
            'event_image'    => $o->event->image_path ?? null,
            'price'          => $o->effective_price,
            'capacity'       => $o->effective_capacity,
        ]);

        // Check if this is a reschedule flow
        $rescheduleContext = null;
        if (session()->has('reschedule_booking_id')) {
            $rescheduleContext = [
                'booking_id' => session('reschedule_booking_id'),
                'original_timeslot' => session('reschedule_original_timeslot'),
                'people' => session('reschedule_people'),
            ];
        }

        $membershipPlusService = MembershipService::where('code', 'MEMBER_PLUS_ONE_PRICE')->first();

        return Inertia::render('Index', [
            'saunas'    => $saunas,
            'locations' => Location::orderBy('name')->get(['id', 'name', 'image_path']),
            'services'  => $services,
            'addons'    => $addons,
            'events'    => $events,
            'rescheduleContext' => $rescheduleContext,
            'membershipPlusOnePriceCents' => $membershipPlusService?->price_cents,
            'membershipPlusOnePrice' => $membershipPlusService?->price,
        ]);
    }
}
