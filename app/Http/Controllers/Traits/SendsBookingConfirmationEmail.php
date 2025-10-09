<?php

namespace App\Http\Controllers\Traits;

use App\Models\Booking;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderConfirmedMail;

trait SendsBookingConfirmationEmail
{
    protected function sendConfirmationEmail(Collection $bookings, string $orderNumber): void
    {
        $bookings->load(['services', 'timeslot.schedule.location', 'eventOccurrence.location', 'user']);

        $display = $bookings->map(function (Booking $b) {
            $lines = $b->services->map(function ($svc) {
                $qty        = (int) ($svc->pivot->quantity ?? 1);
                $unitCents  = (int) ($svc->pivot->price_each ?? 0);
                $lineCents  = (int) ($svc->pivot->line_total ?? ($qty * $unitCents));

                return [
                    'id'         => $svc->id,
                    'code'       => $svc->code ?? null,
                    'name'       => $svc->name ?? 'Item',
                    'qty'        => $qty,
                    'unit_cents' => $unitCents,
                    'line_cents' => $lineCents,
                ];
            });

            $totalCents = (int) ($b->amount ?? $lines->sum('line_cents'));

            $locName = optional(optional($b->timeslot)->schedule)->location->name
                ?? optional($b->eventOccurrence)->location->name
                ?? null;

            $startsAt = $b->timeslot?->starts_at
                ?? $b->eventOccurrence?->start_at
                ?? null;

            $endsAt = $b->timeslot?->ends_at
                ?? $b->eventOccurrence?->end_at
                ?? null;

            $fmtTime = function ($v) {
                if ($v instanceof \Carbon\CarbonInterface) return $v->toDateTimeString();
                return $v ? (string) $v : null;
            };

            return [
                'id'            => $b->id,
                'status'        => 'paid',
                'payment_status' => $b->payment_status,
                'people'        => (int) $b->people,
                'location_name' => $locName,
                'starts_at'     => $fmtTime($startsAt),
                'ends_at'       => $fmtTime($endsAt),
                'lines'         => $lines,
                'total_cents'   => $totalCents,
            ];
        });

        $grandTotalCents = (int) $bookings->sum('amount');

        $summary = [
            'order'             => $orderNumber,
            'count'             => $bookings->count(),
            'grand_total_cents' => $grandTotalCents,
        ];

        $user = $bookings->first()->user;

        if ($user) {
            Mail::to($user->email)->send(new OrderConfirmedMail($user, $display, $summary));
        }
    }
}
