<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Sauna;
use App\Models\SaunaSchedule;
use App\Models\Timeslot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TimeslotController extends Controller
{
    public function index(Sauna $sauna, SaunaSchedule $schedule)
    {
        abort_unless($schedule->sauna_id === $sauna->id, 404);

        $schedule->load('timeslots.bookings');    // eager-load bookings

        return Inertia::render('Saunas/Slots', [
            'schedule' => $schedule,
            'sauna' => $sauna,
        ]);
    }
    public function destroy(Timeslot $timeslot)
    {
        // Check if the timeslot has any bookings
        $hasBookings = DB::table('bookings')
            ->where('timeslot_id', $timeslot->id)
            ->when(Schema::hasColumn('bookings', 'deleted_at'), fn($q) => $q->whereNull('deleted_at'))
            ->when(Schema::hasColumn('bookings', 'status'), fn($q) => $q->whereNotIn('status', ['cancelled', 'void', 'pending']))
            ->exists();

        if ($hasBookings) {
            return back()->withErrors(['timeslot' => 'Cannot delete a timeslot with active bookings.']);
        }

        $timeslot->delete();

        return back()->with('success', 'Timeslot deleted successfully.');
    }
}
