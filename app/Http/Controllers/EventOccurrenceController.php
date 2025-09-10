<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventOccurrence;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventOccurrenceController extends Controller
{
    /**
     * List dated occurrences for one template.
     */
    public function index(Event $event)
    {
        $occurrences = $event->occurrences()
            ->with([
                'location:id,name',
                'event:id,default_capacity', // needed for base capacity
            ])
            ->withSum([
                'bookings as paid_people_sum' => fn($q) => $q->where('status', 'paid'),
            ], 'people') // SUM(bookings.people) where status=paid
            ->orderBy('occurs_on')
            ->orderBy('start_time')
            ->paginate(10)
            ->through(fn(EventOccurrence $o) => [
                'id'                 => $o->id,
                'occurs_on'          => $o->occurs_on->toDateString(),
                'start_time'         => $o->start_time->format('H:i'),
                'end_time'           => $o->end_time->format('H:i'),
                'location'           => [
                    'id'   => $o->location->id,
                    'name' => $o->location->name,
                ],
                'effective_price'    => $o->effective_price,
                'effective_capacity' => $o->effective_capacity, // dynamic
                'is_active'          => $o->is_active,
            ]);

        $locations = Location::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Events/Occurrences', [
            'event'       => $event->only('id', 'name'),
            'occurrences' => $occurrences,
            'locations'   => $locations,
        ]);
    }


    /**
     * Store a new dated occurrence.
     */
    public function store(Request $request, Event $event)
    {
        $data = $this->validated($request);

        $event->occurrences()->create($data);

        return back()->with('flash', ['success' => 'Date added.']);
    }

    /**
     * Update an existing occurrence.
     */
    public function update(Request $request, Event $event, EventOccurrence $occurrence)
    {
        // Ensure the URL event matches the record
        abort_unless($occurrence->event_id === $event->id, 404);

        $occurrence->update($this->validated($request));

        return back()->with('flash', ['success' => 'Date updated.']);
    }

    /**
     * Delete an occurrence.
     */
    public function destroy(Event $event, EventOccurrence $occurrence)
    {
        abort_unless($occurrence->event_id === $event->id, 404);

        $occurrence->delete();

        return back()->with('flash', ['success' => 'Date deleted.']);
    }

    /**
     * Extract and validate request data.
     */
    protected function validated(Request $request): array
    {
        return $request->validate([
            'occurs_on'   => ['required', 'date'],
            'start_time'  => ['required', 'date_format:H:i'],
            'end_time'    => ['required', 'date_format:H:i', 'after:start_time'],
            'location_id' => ['required', 'exists:locations,id'],
            'price'       => ['nullable', 'numeric', 'min:0'],
            'capacity'    => ['nullable', 'integer', 'min:1'],
            'is_active'   => ['boolean'],
        ]);
    }
}
