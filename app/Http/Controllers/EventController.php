<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Organization;
use App\Models\Event;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

class EventController extends Controller
{
     public function index(Organization $organization, Event $event)
    {

         $events = [];
 
        $appointments = Event::where('organization_id', $organization->id)->with('user')->get();
 
        foreach ($appointments as $appointment) {
            $events[] = [
                'title' => $appointment->title,
                'start' => $appointment->start_time,
                'end' => $appointment->finish_time,
                 'backgroundColor' => '#72829F',
        'borderColor' => 'white',
        'display' => 'block',
        'extendedProps' => [
        'id' => $appointment->id,    
        ],
        ];
        }

         return Inertia::render('Events/Index', [
                     'events' => $events,
        'organization' => $organization,
        ]);
    }
      public function store(Request $request, Organization $organization)
    {
        // Validate the input data
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'start_time' => 'required|date_format:Y-m-d\TH:i',
            'finish_time' => 'required|date_format:Y-m-d\TH:i|after:start_time',
        ]);

        // Create and save the new event
        $event = new Event();
        $event->title = $validated['title'];
        $event->start_time = $validated['start_time'];
        $event->finish_time = $validated['finish_time'];
        $event->user_id = Auth::id(); 
        $event->organization_id = $organization->id;
        $event->save();

        // Redirect with a success message
      return redirect()->route('organizations.events.index', ['organization' => $organization->id])
                         ->with('status', 'Event created successfully.');
    }
 public function destroy(Event $event): RedirectResponse
    {
          
 
        $event->delete();
 
    return redirect()->route('organizations.events.index', ['organization' => $event->organization_id, 'event' => $event->id])
                         ->with('status', 'Event deleted successfully.');
    }

}
