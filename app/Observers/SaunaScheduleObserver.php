<?php

namespace App\Observers;

use App\Models\SaunaSchedule;
use Carbon\Carbon;

class SaunaScheduleObserver
{
    public function created(SaunaSchedule $schedule): void
    {
        $start  = Carbon::parse($schedule->date)->setTime(7, 0);  // 07:00
        $finish = Carbon::parse($schedule->date)->setTime(11, 0); // stop at 11:00

        while ($start < $finish) {
            $schedule->timeslots()->create([
                'starts_at' => $start,
                'ends_at'   => $start->copy()->addMinutes(15),
                'capacity'  => $schedule->sauna->capacity ?? 8,
            ]);

            $start->addMinutes(20);  // 15-minute session + 5-minute buffer
        }
    }
}
