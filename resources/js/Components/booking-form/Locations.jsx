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

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mql = window.matchMedia("(max-width: 639px)");
        const onChange = (e) => setIsMobile(e.matches);
        setIsMobile(mql.matches);
        // support older Safari
        if (mql.addEventListener) mql.addEventListener("change", onChange);
        else mql.addListener(onChange);
        return () => {
            if (mql.removeEventListener)
                mql.removeEventListener("change", onChange);
            else mql.removeListener(onChange);
        };
    }, []);
    return isMobile;
}

export default function Locations({ nextStep, updateFormData, events }) {
    const [selected, setSelected] = useState(null); // { day, id, name }
    const [openings, setOpenings] = useState([]); // raw API rows
    const [schedule, setSchedule] = useState({}); // { Monday: [{id,name,windowsLabel,earliestStart}], ... }

    const isMobile = useIsMobile();

    const commitSelection = (sel) => {
        updateFormData({
            booking_type: "sauna",
            location: { day: sel.day, name: sel.name, id: sel.id },
        });
        nextStep();
    };

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

    const handleSelect = (day, item) => {
        const sel = { day, id: item.id, name: item.name };
        setSelected(sel);
        // ⏩ on mobile, go straight to next step
        if (isMobile) commitSelection(sel);
    };

    const handleNext = () => {
        if (!selected) return;
        commitSelection(selected);
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
            className={`${styles.boxWidth} bg-cover bg-center bg-no-repeat pb-6 sm:pb-10 pt-20 sm:pt-40 px-2 sm:px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
            style={hero ? { backgroundImage: `url(${hero})` } : undefined}
        >
            <div className="bg-white/95 p-4 sm:p-6 lg:p-10 border border-hh-orange rounded-md shadow">
                <h1
                    className={`${styles.h4} !text-lg sm:!text-xl !text-black font-normal`}
                >
                    Escape to relaxation: Book your sauna experience today
                </h1>
                <p
                    className={`${styles.paragraph} !text-sm sm:!text-base !text-black font-normal pb-6 `}
                >
                    Plunge into the ocean, then step straight into the warmth of
                    our wood-fired beachfront sauna…
                </p>

                {/* Header */}
                {/* <div className="flex gap-x-4 items-center mb-6 sm:mb-10">
                    <p className="text-hh-orange font-medium text-xl sm:text-2xl lg:text-3xl">
                        SAUNA SCHEDULE
                    </p>
                </div> */}

                {/* Responsive grid: mobile stack, tablet 3 cols, desktop 7 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 sm:gap-x-6">
                    {Object.entries(schedule).map(([day, items]) => (
                        <div
                            key={day}
                            className="space-y-3 sm:space-y-4 md:space-y-6 col-span-1"
                        >
                            <div className="bg-hh-orange rounded-xl sm:rounded-2xl shadow py-2 sm:py-3 md:py-2.5 px-4 sm:px-6 md:px-4 flex justify-center">
                                <p className="text-white text-lg sm:text-xl md:text-lg lg:text-lg uppercase font-medium">
                                    {day}
                                </p>
                            </div>

                            <div className="border border-hh-orange bg-white rounded-xl sm:rounded-2xl px-2 py-3 sm:py-4 md:py-3 flex flex-col gap-y-2 sm:gap-y-3 md:gap-y-2 min-h-[120px] sm:min-h-[140px] md:min-h-[130px]">
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
                                            className={`border border-hh-orange rounded-xl sm:rounded-2xl p-2 sm:p-1.5 md:p-2 cursor-pointer transition-all hover:bg-hh-orange/10 active:bg-hh-orange/20 ${
                                                isSel
                                                    ? "bg-hh-orange/10 shadow-sm"
                                                    : ""
                                            }`}
                                        >
                                            <p className="text-hh-orange font-medium uppercase text-center leading-snug text-sm md:text-xs lg:text-sm">
                                                {item.name}
                                            </p>
                                            {item.windowsLabel && (
                                                <div className="text-xs md:text-[11px] lg:text-xs text-black/60 text-center mt-1 normal-case leading-tight space-y-0.5">
                                                    {item.windowsLabel
                                                        .split(", ")
                                                        .map((range) => (
                                                            <div key={range}>
                                                                {range}
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {items.length === 0 && (
                                    <div className="text-xs text-gray-400 text-center py-4 sm:py-6 md:py-4">
                                        No sessions
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 sm:mt-8">
                    {selected && (
                        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 sm:gap-0 md:gap-3 lg:gap-0">
                            <div className="bg-gray-50 p-3 rounded-lg mb-3 sm:mb-0 md:mb-3 lg:mb-0 sm:mr-4 md:mr-0 lg:mr-4 flex-1">
                                <p className="text-sm text-gray-600">
                                    Selected:
                                </p>
                                <p className="font-medium text-hh-orange">
                                    {selected.name} - {selected.day}
                                </p>
                            </div>
                            <button
                                onClick={handleNext}
                                className={`bg-hh-orange text-white py-3 px-6 rounded-lg hover:bg-hh-orange/80 transition font-medium w-full sm:w-auto md:w-full lg:w-auto ${styles.paragraph}`}
                            >
                                Next Step
                            </button>
                        </div>
                    )}
                </div>

                {upcomingEvents.length > 0 && (
                    <div className="mt-8 sm:mt-16">
                        <h2
                            className={`${styles.h3} !text-lg sm:!text-xl !text-black mb-4`}
                        >
                            Upcoming Events
                        </h2>
                        <div className="space-y-3">
                            {upcomingEvents.map((ev, i) => (
                                <div
                                    key={ev.id}
                                    className={[
                                        "flex flex-col sm:flex-row md:flex-col lg:flex-row sm:items-center md:items-start lg:items-center gap-3 sm:gap-x-4 md:gap-3 lg:gap-x-4 rounded-lg p-3 sm:px-4 sm:py-3 md:p-3 lg:px-4 lg:py-3 transition",
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
                                        className="w-16 h-16 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-14 lg:h-14 object-cover rounded mx-auto sm:mx-0 md:mx-auto lg:mx-0"
                                    />
                                    <div className="flex-1 text-center sm:text-left md:text-center lg:text-left">
                                        <p className="font-medium text-sm sm:text-sm md:text-sm lg:text-sm text-black mb-1 sm:mb-0.5">
                                            {ev.event_name}
                                        </p>
                                        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row sm:items-center md:items-center lg:items-center gap-2 sm:gap-x-4 md:gap-2 lg:gap-x-4 text-xs text-[#666]">
                                            <span className="flex items-center justify-center sm:justify-start md:justify-center lg:justify-start gap-x-1">
                                                <MapPinIcon className="w-4 h-4 text-hh-orange" />
                                                {ev.location}
                                            </span>
                                            <span className="flex items-center justify-center sm:justify-start md:justify-center lg:justify-start gap-x-1">
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
                                        className="bg-hh-orange text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-hh-orange/80 transition w-full sm:w-auto md:w-full lg:w-auto"
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
