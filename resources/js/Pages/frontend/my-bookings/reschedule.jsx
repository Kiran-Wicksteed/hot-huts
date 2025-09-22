import { useEffect, useMemo, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

export default function Reschedule({ booking }) {
    const [date, setDate] = useState(new Date());
    const [days, setDays] = useState([]); // [{date, dayName, slots: {morning:[], ...}}]
    const [loading, setLoading] = useState(false);

    const currentTimeslotId = booking.timeslot_id;
    const people = booking.people ?? booking.services?.[0]?.pivot?.people ?? 1; // fallback

    const selectedIsoDate = useMemo(
        () => dayjs(date).format("YYYY-MM-DD"),
        [date]
    );

    useEffect(() => {
        const url =
            route("my-bookings.reschedule.options", booking.id) +
            `?date=${selectedIsoDate}`;

        setLoading(true);
        fetch(url)
            .then((r) => r.json())
            .then((data) => setDays(data))
            .finally(() => setLoading(false));
    }, [selectedIsoDate]);

    const handleReschedule = (slotId) => {
        router.post(route("my-bookings.reschedule.store", booking.id), {
            timeslot_id: slotId,
        });
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
            <h1 className="text-2xl font-semibold">Reschedule Booking</h1>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mt-6">
                <div className="lg:col-span-4">
                    <div className="border border-hh-gray rounded-md bg-white p-3">
                        <DatePicker
                            selected={date}
                            onChange={(d) => setDate(d)}
                            minDate={new Date()}
                            inline
                        />
                    </div>

                    <div className="mt-4 text-sm text-hh-gray">
                        <p>
                            Location:{" "}
                            <span className="font-medium">
                                {booking.timeslot.schedule.location.name}
                            </span>
                        </p>
                        <p>
                            Current slot:{" "}
                            <span className="font-medium">
                                {dayjs(booking.timeslot.starts_at).format(
                                    "ddd, D MMM YYYY [at] H:mm"
                                )}
                            </span>
                        </p>
                        <p>
                            People:{" "}
                            <span className="font-medium">{people}</span>
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-6">
                    <div className="border border-hh-gray rounded-md bg-white p-4">
                        <h2 className="text-lg font-medium">
                            Available Slots ({selectedIsoDate})
                        </h2>

                        {loading && (
                            <p className="text-sm text-hh-gray mt-2">
                                Loading…
                            </p>
                        )}

                        {!loading && days.length === 0 && (
                            <p className="text-sm text-hh-gray mt-2">
                                No schedules found for this date at this
                                location.
                            </p>
                        )}

                        {!loading &&
                            days.map((day) => (
                                <DayBlock
                                    key={day.date}
                                    day={day}
                                    people={people}
                                    currentTimeslotId={currentTimeslotId}
                                    onPick={handleReschedule}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DayBlock({ day, people, currentTimeslotId, onPick }) {
    const periods = ["morning", "afternoon", "evening", "night"];

    return (
        <div className="mt-4">
            <h3 className="font-semibold text-hh-orange">
                {day.dayName} {day.date}
            </h3>

            {periods.map((p) => (
                <div key={p} className="mt-3">
                    <div className="text-sm font-medium capitalize">{p}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {(day.slots[p] ?? []).map((slot) => {
                            const isSameSlot = slot.id === currentTimeslotId;
                            const hasCapacity = slot.spots_left >= people;

                            return (
                                <div
                                    key={slot.id}
                                    className="inline-flex flex-col"
                                >
                                    <button
                                        disabled={!hasCapacity || isSameSlot}
                                        onClick={() => onPick(slot.id)}
                                        className={[
                                            "px-3 py-2 rounded border text-sm",
                                            hasCapacity && !isSameSlot
                                                ? "bg-hh-orange text-white border-hh-orange"
                                                : "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300",
                                        ].join(" ")}
                                        title={
                                            isSameSlot
                                                ? "This is your current slot"
                                                : hasCapacity
                                                ? "Reschedule to this slot"
                                                : "Not enough capacity"
                                        }
                                    >
                                        {slot.starts_at}–{slot.ends_at} (
                                        {slot.spots_left} left)
                                    </button>

                                    {/* Visual warning for same-slot selection */}
                                    {isSameSlot && (
                                        <span className="mt-1 text-[11px] text-red-600">
                                            This is your current slot — choose a
                                            different one.
                                        </span>
                                    )}

                                    {/* Optional heads-up if capacity is tight */}
                                    {!isSameSlot &&
                                        hasCapacity &&
                                        slot.spots_left <= 2 && (
                                            <span className="mt-1 text-[11px] text-amber-600">
                                                Limited spots — may fill soon.
                                            </span>
                                        )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
