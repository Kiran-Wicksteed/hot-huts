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

const PERIODS = {
    morning: { row: "AM", time: "7 – 12 AM", order: 1 },
    afternoon: { row: "PM", time: "3 – 4 PM", order: 1 },
    evening: { row: "PM", time: "4 – 6 PM", order: 2 },
    night: { row: "PM", time: "6 – 7 PM", order: 3 },
};

// const ROWS = ["AM", "PM"];

export default function Locations({ nextStep, updateFormData, events }) {
    const [selected, setSelected] = useState(null); // { day, period, … }
    const [openings, setOpenings] = useState([]); // raw API rows
    const [schedule, setSchedule] = useState({});

    console.log("events", events);

    dayjs.extend(isSameOrAfter);
    dayjs.extend(weekdayPlugin);

    useEffect(() => {
        fetch(route("openings.all"))
            .then((r) => r.json())
            .then(setOpenings);
    }, []);

    useEffect(() => {
        const tmp = {};

        // always two visual rows
        weekdayNames.forEach((d) => (tmp[d] = { AM: [], PM: [] }));

        // drop every opening into the right bucket
        openings.forEach((o) => {
            const dayName = weekdayNames[o.weekday];

            o.periods.forEach((p) => {
                const meta = PERIODS[p]; // {row, time, order}
                tmp[dayName][meta.row].push({
                    id: o.location_id,
                    name: o.location,
                    period: p,
                    time: meta.time,
                    order: meta.order, // keep for sorting
                });
            });
        });

        // ── sort “AM” and “PM” arrays by order (and optionally by name/time) ──
        Object.values(tmp).forEach(({ AM, PM }) => {
            AM.sort((a, b) => a.order - b.order);
            PM.sort((a, b) => a.order - b.order);
        });

        setSchedule(tmp);
    }, [openings]);
    const handleSelect = (day, slot) => setSelected({ day, ...slot });

    const handleNext = () => {
        if (!selected) return;

        updateFormData({
            location: {
                day: selected.day,
                name: selected.name,
                id: selected.id,
                period: selected.period,
                time: selected.time,
            },
        });
        nextStep();
    };

    const bookEvent = (occ) => {
        updateFormData({
            event_occurrence_id: occ.id,
            date: occ.date,
            time: occ.start_time,
            location: {
                id: occ.location_id,
                name: occ.location,
                image: occ.location.image,
            },
        });
        nextStep(); // straight to the service step
    };

    const UPCOMING_LIMIT = 5;

    const upcomingEvents = useMemo(() => {
        if (!events?.length) return [];

        return (
            events
                // future‑dated only
                .filter((e) => dayjs(e.date).isSameOrAfter(dayjs(), "day"))
                // earliest first
                .sort(
                    (a, b) =>
                        dayjs(a.date).diff(dayjs(b.date)) ||
                        dayjs(`1970-01-01 ${a.start_time}`).diff(
                            dayjs(`1970-01-01 ${b.start_time}`)
                        )
                )
                // trim to limit
                .slice(0, UPCOMING_LIMIT)
        );
    }, [events]);

    if (!Object.keys(schedule).length) {
        return <p>Loading calendar…</p>;
    }

    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <h1 className={`${styles.h3} !text-2xl !text-black font-normal`}>
                Escape to relaxation: Book your sauna experience today
            </h1>
            <p
                className={`${styles.paragraph} !text-xl !text-black font-normal pb-12`}
            >
                Plunge into the ocean, then step straight into the warmth of our
                wood-fired beachfront sauna. Whether you’re looking to
                invigorate your morning, reset after a surf, or simply soak in
                the scenery, our Hot Huts offer a unique way to connect with
                nature while nourishing your body and mind.
            </p>
            <div className="grid grid-cols-7 pl-12 relative gap-x-6 ">
                <div className="absolute bottom-24 left-0">
                    <div className="space-y-36">
                        <p
                            className={`${styles.paragraph} !text-xl !text-black font-normal `}
                        >
                            AM
                        </p>
                        <p
                            className={`${styles.paragraph} !text-xl !text-black font-normal `}
                        >
                            PM
                        </p>
                    </div>
                </div>
                <div className="col-span-full mb-10">
                    <div className="flex gap-x-4 items-center">
                        <img
                            alt="Hot Huts"
                            src="/storage/images/hot-huts-logo.png"
                            className="h-28 -ml-5"
                        />
                        <p className={`text-hh-orange font-medium text-6xl`}>
                            SAUNA SCHEDULE
                        </p>
                    </div>
                </div>

                {Object.entries(schedule).map(([day, rows]) => (
                    <div key={day} className="space-y-10 col-span-1">
                        <div className="bg-hh-orange rounded-2xl shadow py-3 px-6 flex justify-center">
                            <p className="text-white text-2xl uppercase">
                                {day}
                            </p>
                        </div>

                        {/* exactly two fixed rows: AM + PM */}
                        <div className="border border-hh-orange rounded-2xl divide-y divide-hh-orange">
                            {["AM", "PM"].map((row) => (
                                <div
                                    key={row}
                                    className="px-2 py-4 h-48 flex flex-col justify-center gap-y-4"
                                >
                                    {rows[row].map((slot, i) => {
                                        const isSel =
                                            selected?.day === day &&
                                            selected?.id === slot.id;

                                        return (
                                            <div
                                                key={i}
                                                onClick={() =>
                                                    handleSelect(day, slot)
                                                }
                                                className={`border border-hh-orange rounded-2xl p-1.5
                            cursor-pointer transition-all hover:bg-hh-orange/10
                            ${isSel ? "bg-hh-orange/10" : ""}`}
                                            >
                                                <p className="text-hh-orange font-medium uppercase text-center leading-snug text-sm">
                                                    {slot.name}
                                                    <span className="block">
                                                        {slot.time}
                                                    </span>
                                                </p>
                                            </div>
                                        );
                                    })}

                                    {/* empty placeholder to keep row height if no slots */}
                                    {rows[row].length === 0 && (
                                        <div className="h-full flex items-center justify-center text-xs text-hh-gray">
                                            {/* intentionally blank */}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-20 mt-8">
                {selected && (
                    <div className="pl-12">
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
                    <h2 className={`${styles.h3} !text-xl !text-black mb-4`}>
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
                                {/* Logo or fallback placeholder */}
                                <img
                                    src={
                                        ev.event_image ??
                                        "/storage/images/hot-huts-logo.png"
                                    }
                                    alt={ev.event_name}
                                    className="w-14 h-14 object-cover rounded"
                                />

                                {/* Title + meta */}
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
                                                "D MMM YYYY"
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => bookEvent(ev)}
                                    className="text-hh-orange font-semibold text-sm hover:underline"
                                >
                                    Book Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
