import React from "react";

/**
 *  TodayBubbles
 *  Props:
 *    – slots      : array of all sauna time‑slots for today (already filtered by location)
 *    – bookings   : array of today’s sauna‑only bookings
 *    – formatTime : helper fn "HH:MM"   (passed from the parent for i18n consistency)
 */
export default function TodayBubbles({ slots, bookings, formatTime }) {
    /* 1 ▸ index bookings by timeslot_id for fast lookup */
    const bySlot = React.useMemo(() => {
        const map = new Map(); // id  →  [bookings…]
        bookings.forEach((b) => {
            if (!map.has(b.timeslot_id)) map.set(b.timeslot_id, []);
            map.get(b.timeslot_id).push(b);
        });
        return map;
    }, [bookings]);

    /* 2 ▸ empty‑state guard */
    if (!slots || slots.length === 0) {
        return (
            <div className="bg-white p-6 rounded shadow border border-gray-200 text-center">
                <p className="text-gray-500">
                    No sauna slots configured for today.
                </p>
            </div>
        );
    }

    /* 3 ▸ bubble grid */
    return (
        <div className="grid grid-cols-2 gap-10">
            {slots.map((slot) => {
                const list = bySlot.get(slot.id) ?? [];
                const booked = list.reduce((t, b) => t + b.people, 0);

                return (
                    <div
                        key={slot.id}
                        className="col-span-1 bg-white border border-hh-gray rounded-md shadow p-4"
                    >
                        {/* header ‑‑ time‑range + capacity */}
                        <div className="flex justify-between items-center mb-3">
                            <h5 className="font-semibold">
                                {formatTime(slot.starts_at)} –{" "}
                                {formatTime(slot.ends_at)}
                            </h5>
                            <p className="text-sm text-gray-500">
                                BOOKED:{" "}
                                <span
                                    className={`text-sm ${
                                        booked === slot.capacity
                                            ? "text-red-600"
                                            : "text-hh-orange"
                                    }`}
                                >
                                    {booked}/{slot.capacity}
                                </span>
                            </p>
                        </div>

                        {/* booking list (or “no bookings yet”) */}
                        {list.length > 0 ? (
                            <ul className="space-y-3 max-h-40 overflow-y-auto pr-1 text-sm">
                                {list.map((b) => (
                                    <li
                                        key={b.id}
                                        className="border-b border-gray-100 pb-2"
                                    >
                                        <p className="font-medium">
                                            Booked under:{" "}
                                            <span className="text-gray-700">
                                                {b.user?.name ?? "Guest"}
                                            </span>
                                        </p>
                                        <p className="text-gray-500">
                                            People booked for: {b.people}
                                        </p>
                                        {b.services &&
                                            b.services.length > 0 && (
                                                <div>
                                                    <p className="text-gray-500">
                                                        Services:
                                                    </p>
                                                    <ul className="list-disc list-inside text-gray-600">
                                                        {b.services.map(
                                                            (s, i) => (
                                                                <li key={i}>
                                                                    {s.name} ×{" "}
                                                                    {s.quantity}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-xs text-gray-400">
                                No bookings yet
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
