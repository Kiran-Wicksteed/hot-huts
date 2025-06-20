<?php

namespace App\Observers;

use App\Models\SaunaSchedule;
use Carbon\Carbon;

class SaunaScheduleObserver
{
    public function created(SaunaSchedule $schedule): void
    {

        [$startHour, $endHour] = $schedule->period === 'evening'
            ? [17, 20]   // 17:00-20:00
            : [6, 11];   // 06:00-11:00


        $start  = $schedule->date->copy()->setTime($startHour, 0);
        $finish = $schedule->date->copy()->setTime($endHour,   0);

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
