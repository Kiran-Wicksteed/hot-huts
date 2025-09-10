import { useState, useEffect, useMemo } from "react";
import styles from "../../../styles";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import weekdayPlugin from "dayjs/plugin/weekday";
import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export default function Locations({ nextStep, updateFormData, events }) {
    const [selected, setSelected] = useState(null); // { day, id, name }
    const [openings, setOpenings] = useState([]); // raw API rows
    const [schedule, setSchedule] = useState({}); // { Monday: [{id,name,windowsLabel,earliestStart}], ... }

    dayjs.extend(isSameOrAfter);
    dayjs.extend(weekdayPlugin);

    useEffect(() => {
        fetch(route("openings.all"))
            .then((r) => r.json())
            .then(setOpenings);
    }, []);

    // Build: one row per location per day, merge all time windows
    useEffect(() => {
        if (!openings.length) return;

        // tmp[day][locId] = { id, name, windows:Set, earliestStart }
        const tmp = {};
        weekdayNames.forEach((d) => (tmp[d] = {}));

        openings.forEach((o) => {
            const dayName = weekdayNames[o.weekday];
            if (!dayName) return;

            const locId = o.location_id;
            const locName = o.location;
            const start = (o.start_time || "").slice(0, 5);
            const end = (o.end_time || "").slice(0, 5);
            const label = start && end ? `${start} – ${end}` : "—";

            if (!tmp[dayName][locId]) {
                tmp[dayName][locId] = {
                    id: locId,
                    name: locName,
                    windows: new Set(),
                    earliestStart: start || "99:99",
                };
            }

            if (label !== "—") tmp[dayName][locId].windows.add(label);
            if (start && start < tmp[dayName][locId].earliestStart) {
                tmp[dayName][locId].earliestStart = start;
            }
        });

        // Finalize to arrays, dedupe windows, sort by earliest start then name
        const out = {};
        Object.entries(tmp).forEach(([day, byLoc]) => {
            out[day] = Object.values(byLoc)
                .map((e) => ({
                    id: e.id,
                    name: e.name,
                    windowsLabel: Array.from(e.windows).join(", "),
                    earliestStart: e.earliestStart,
                }))
                .sort(
                    (a, b) =>
                        (a.earliestStart || "").localeCompare(
                            b.earliestStart || ""
                        ) || a.name.localeCompare(b.name)
                );
        });

        setSchedule(out);
    }, [openings]);

    const handleSelect = (day, item) =>
        setSelected({ day, id: item.id, name: item.name });

    const handleNext = () => {
        if (!selected) return;
        updateFormData({
            booking_type: "sauna",
            location: {
                day: selected.day, // e.g., "Monday" (TimeDate slices to 'mon' fine)
                name: selected.name,
                id: selected.id,
            },
        });
        nextStep();
    };

    const UPCOMING_LIMIT = 5;

    const upcomingEvents = useMemo(() => {
        if (!events?.length) return [];
        return events
            .filter((e) => dayjs(e.date).isSameOrAfter(dayjs(), "day"))
            .sort(
                (a, b) =>
                    dayjs(a.date).diff(dayjs(b.date)) ||
                    dayjs(`1970-01-01 ${a.start_time}`).diff(
                        dayjs(`1970-01-01 ${b.start_time}`)
                    )
            )
            .slice(0, UPCOMING_LIMIT);
    }, [events]);

    if (!Object.keys(schedule).length) {
        return <p>Loading calendar…</p>;
    }

    const storageUrl = (path) => {
        if (!path) return null;
        if (/^https?:\/\//i.test(path)) return path;
        // ensure it points at the /storage symlink
        return "/storage/" + String(path).replace(/^\/?(storage\/)?/i, "");
    };

    const hero = storageUrl("images/locations-bg.jpg");

    return (
        <div
            className={`${styles.boxWidth} bg-cover bg-center bg-no-repeat pb-10 pt-40 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
            style={hero ? { backgroundImage: `url(${hero})` } : undefined}
        >
            <div className="bg-white/95 p-10 border border-hh-orange rounded-md shadow">
                <h1 className={`${styles.h4} !text-xl !text-black font-normal`}>
                    Escape to relaxation: Book your sauna experience today
                </h1>
                <p
                    className={`${styles.paragraph}  !text-black font-normal pb-12`}
                >
                    Plunge into the ocean, then step straight into the warmth of
                    our wood-fired beachfront sauna…
                </p>

                {/* Header */}
                <div className="flex gap-x-4 items-center mb-10">
                    <p className="text-hh-orange font-medium text-3xl">
                        SAUNA SCHEDULE
                    </p>
                </div>

                {/* 7 equal columns, no AM/PM rows */}
                <div className="grid grid-cols-7 gap-x-6">
                    {Object.entries(schedule).map(([day, items]) => (
                        <div key={day} className="space-y-6 col-span-1">
                            <div className="bg-hh-orange rounded-2xl shadow py-3 px-6 flex justify-center">
                                <p className="text-white text-2xl uppercase">
                                    {day}
                                </p>
                            </div>

                            <div className="border border-hh-orange bg-white rounded-2xl px-2 py-4 flex flex-col gap-y-3">
                                {items.map((item) => {
                                    const isSel =
                                        selected?.day === day &&
                                        selected?.id === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() =>
                                                handleSelect(day, item)
                                            }
                                            className={`border border-hh-orange rounded-2xl p-1.5 cursor-pointer transition-all hover:bg-hh-orange/10 ${
                                                isSel ? "bg-hh-orange/10" : ""
                                            }`}
                                        >
                                            <p className="text-hh-orange font-medium uppercase text-center leading-snug text-sm">
                                                {item.name}
                                                {/* {item.windowsLabel && (
                                                <span className="block normal-case text-xs text-black/70">
                                                    {item.windowsLabel} aa
                                                </span>
                                            )} */}
                                            </p>
                                        </div>
                                    );
                                })}

                                {items.length === 0 && (
                                    <div className="text-xs text-hh-gray text-center py-6">
                                        {/* empty state */}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className=" mt-8">
                    {selected && (
                        <div>
                            <button
                                onClick={handleNext}
                                className={`bg-hh-orange text-white py-2 px-6 rounded hover:bg-hh-orange/80 transition ${styles.paragraph}`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

                {upcomingEvents.length > 0 && (
                    <div className="mt-16">
                        <h2
                            className={`${styles.h3} !text-xl !text-black mb-4`}
                        >
                            Upcoming Events
                        </h2>
                        <div className="space-y-3">
                            {upcomingEvents.map((ev, i) => (
                                <div
                                    key={ev.id}
                                    className={[
                                        "flex items-center gap-x-4 rounded-lg px-4 py-3 transition",
                                        i === 0
                                            ? "border border-hh-orange bg-white"
                                            : "bg-[#f7f7f7] hover:bg-white",
                                    ].join(" ")}
                                >
                                    <img
                                        src={
                                            ev.event_image ??
                                            "/storage/images/hot-huts-logo.png"
                                        }
                                        alt={ev.event_name}
                                        className="w-14 h-14 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-black mb-0.5">
                                            {ev.event_name}
                                        </p>
                                        <div className="flex items-center gap-x-4 text-xs text-[#666]">
                                            <span className="flex items-center gap-x-1">
                                                <MapPinIcon className="w-4 h-4 text-hh-orange" />
                                                {ev.location}
                                            </span>
                                            <span className="flex items-center gap-x-1">
                                                <ClockIcon className="w-4 h-4 text-hh-orange" />
                                                {dayjs(ev.date).format(
                                                    "D MMM YYYY"
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const start =
                                                ev.start ?? ev.start_time;
                                            const end = ev.end ?? ev.end_time;

                                            updateFormData({
                                                booking_type: "event",

                                                // event meta
                                                event_occurrence_id: ev.id,
                                                event_name: ev.event_name,
                                                event_description:
                                                    ev.description,
                                                event_date: ev.date,
                                                event_time_range: `${start} - ${end}`,

                                                // ✅ per-person price (let EventTimeDate treat this as unit)
                                                event_price_per_person:
                                                    ev.price,

                                                // ✅ total remaining capacity for this occurrence (server gives this to index)
                                                event_capacity: ev.capacity,

                                                // initial qty
                                                event_people: 1,

                                                // generic fields some components use
                                                date: ev.date,
                                                time: start,

                                                // location
                                                location: {
                                                    id: ev.location_id,
                                                    name: ev.location,
                                                    image: ev.location_image, // note: controller returns location_image
                                                },
                                            });

                                            nextStep(); // step helper will skip ServiceSection for events
                                        }}
                                        className="text-hh-orange font-semibold text-sm hover:underline"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
