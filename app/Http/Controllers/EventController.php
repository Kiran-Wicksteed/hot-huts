<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    /**
     * Display a paginated list of event templates.
     */
    public function index()
    {
        $events = Event::query()
            ->orderByDesc('created_at')
            ->paginate(10)
            ->through(fn(Event $event) => [
                'id'               => $event->id,
                'name'             => $event->name,
                'description'      => $event->description,
                'default_price'    => $event->default_price,
                'default_capacity' => $event->default_capacity,
                'is_active'        => $event->is_active,
            ]);

        return Inertia::render('Events/index', compact('events'));
    }

    /**
     * Store a newly‐created event template.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'default_price'    => ['nullable', 'numeric', 'min:0'],
            'default_capacity' => ['nullable', 'integer', 'min:1'],
            'is_active'        => ['boolean'],
        ]);

        Event::create($data);

        return back()->with('flash', ['success' => 'Event created successfully.']);
    }

    /**
     * Update the specified template.
     */
    public function update(Request $request, Event $event)
    {
        $data = $request->validate([
            'name'             => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'default_price'    => ['nullable', 'numeric', 'min:0'],
            'default_capacity' => ['nullable', 'integer', 'min:1'],
            'is_active'        => ['boolean'],
        ]);

        $event->update($data);

        return back()->with('flash', ['success' => 'Event updated.']);
    }

    /**
     * Remove the template (and cascade‑delete its dated occurrences).
     */
    public function destroy(Event $event)
    {
        $event->delete();

        return back()->with('flash', ['success' => 'Event deleted.']);
    }
}
