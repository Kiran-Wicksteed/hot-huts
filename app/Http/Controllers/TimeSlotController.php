<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Sauna;
use App\Models\SaunaSchedule;

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
}
