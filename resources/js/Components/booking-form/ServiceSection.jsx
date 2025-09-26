import {
    MapPinIcon,
    MinusIcon,
    PlusIcon,
    ClockIcon,
    CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import styles from "../../../styles";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);

export default function ServiceSection({
    nextStep,
    prevStep,
    updateFormData,
    servicesData, // {..., SAUNA_HONEY: 2, ADDON_REVIVE : 0, people: 1 }
    formData,
    addons, // [{id, code, name, price, ...}, ...]  category==='addon'
    sessionService, // pass the one row where category==='session'
    locations,
    events,
}) {
    const { location } = formData;
    const people = servicesData.people;
    const [eventQty, setEventQty] = useState(1);

    //create a new addons array with only those with a price greater than 0
    const filteredAddons = useMemo(
        () => addons.filter((svc) => svc.price > 0),
        [addons]
    );

    const currentLocation = useMemo(() => {
        if (!location.id) return null; // wizard hasn’t chosen yet
        return locations.find((l) => l.id === location.id);
    }, [locations, location.id]);

    const nextEventHere = useMemo(() => {
        if (!events?.length || !location.id) return null;

        return (
            events
                .filter(
                    (e) =>
                        e.location_id === location.id &&
                        dayjs(e.date).isSameOrAfter(dayjs(), "day")
                )
                .sort((a, b) =>
                    dayjs(`${a.date} ${a.start_time}`).diff(
                        dayjs(`${b.date} ${b.start_time}`)
                    )
                )[0] || null
        );
    }, [events, location.id]);

    const thumbSrc = currentLocation
        ? `${currentLocation.image_path}` // path from DB
        : "/storage/images/colourful-huts.png";

    /** ----------------------------------------------------------------
     * Helpers
     *----------------------------------------------------------------*/

    /** Update any quantity (people or addon) */
    const updateQuantity = (code, value) =>
        updateFormData({
            services: { ...servicesData, [code]: Math.max(0, value) },
        });

    /** Total price = session*people + Σ(addonQty*addonPrice) */
    const total = useMemo(() => {
        let sum = +sessionService.price * people;

        addons.forEach((svc) => {
            const qty = servicesData[svc.code] ?? 0;
            sum += qty * svc.price;
        });

        return sum.toFixed(2);
    }, [servicesData, addons, people, sessionService.price]);

    const eventPriceCents = nextEventHere
        ? nextEventHere.effective_price ?? nextEventHere.price ?? 0
        : 0;

    const eventPrice = eventPriceCents / 100;
    const eventTotal = (eventPrice * eventQty).toFixed(2);

    const maxQty = nextEventHere?.effective_capacity ?? 8;

    return (
        <div
            className={`${styles.boxWidth} bg-cover bg-center bg-no-repeat pb-10 sm:pb-28 pt-28 sm:pt-40 px-2 sm:px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
            style={
                thumbSrc ? { backgroundImage: `url(${thumbSrc})` } : undefined
            }
        >
            <div className=" border border-hh-orange bg-white/95 rounded-md shadow mb-6 sm:mb-0  flex items-center py-2 justify-center">
                <h1
                    className={`${styles.h3} !text-lg sm:!text-xl lg:!text-2xl !text-black font-normal max-w-3xl !mb-0 text-center`}
                >
                    Cold dip, warm glow: dive into the Sea,&nbsp;then unwind in
                    a beachfront sauna at&nbsp;
                    <span className="text-hh-orange">{location.name}.</span>
                </h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="col-span-1 border border-hh-orange bg-white/95 rounded-md shadow grid grid-cols-3 overflow-hidden items-center mt-6 sm:mt-10">
                    {/* right panel */}
                    <div className="col-span-full py-4 sm:py-6 lg:py-8 px-4 sm:px-8 lg:px-20 space-y-4 sm:space-y-6">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            {location.day && (
                                <div className="bg-hh-orange py-1 px-3 sm:px-4 shadow flex items-center gap-1 text-white rounded">
                                    <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <p
                                        className={`${styles.paragraph} uppercase !text-xs sm:!text-sm`}
                                    >
                                        {location.day}
                                    </p>
                                </div>
                            )}
                            {location.time && (
                                <div className="bg-hh-orange py-1 px-3 sm:px-4 shadow flex items-center gap-1 text-white rounded">
                                    <p
                                        className={`${styles.paragraph} uppercase !text-xs sm:!text-sm`}
                                    >
                                        {location.time}
                                    </p>
                                </div>
                            )}
                        </div>

                        <h3
                            className={`${styles.h2} !text-lg sm:!text-xl text-black font-medium`}
                        >
                            Single Sauna Session
                        </h3>

                        {/* ----------------- ADD-ONS LIST ----------------- */}
                        <div className="space-y-2">
                            {filteredAddons.map((svc) => {
                                const qty = servicesData[svc.code] ?? 0;

                                return (
                                    <div
                                        key={svc.id}
                                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center border border-hh-orange px-3 py-2 rounded gap-3 sm:gap-2"
                                    >
                                        {/* label */}
                                        <div className="flex items-center gap-x-2 flex-1">
                                            <input
                                                type="checkbox"
                                                checked={qty > 0}
                                                onChange={(e) =>
                                                    updateQuantity(
                                                        svc.code,
                                                        e.target.checked ? 1 : 0
                                                    )
                                                }
                                                className="h-4 w-4 text-hh-orange border-hh-orange rounded"
                                            />
                                            <label
                                                className={`${styles.paragraph} !text-sm font-medium text-black`}
                                            >
                                                {svc.name} / R{svc.price}
                                            </label>
                                        </div>

                                        {/* qty picker */}
                                        <div className="flex gap-x-2 items-center justify-center sm:justify-end">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        svc.code,
                                                        qty - 1
                                                    )
                                                }
                                                aria-label="Decrease quantity"
                                                className="touch-manipulation"
                                            >
                                                <MinusIcon className="h-8 w-8 sm:h-6 sm:w-6 text-black bg-[#E2E2E2] rounded-lg p-1 sm:p-0.5" />
                                            </button>
                                            <span
                                                className={`${styles.paragraph} font-medium text-black w-8 sm:w-6 text-center`}
                                            >
                                                {qty}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        svc.code,
                                                        Math.min(8, qty + 1)
                                                    )
                                                }
                                                aria-label="Increase quantity"
                                                className="touch-manipulation"
                                            >
                                                <PlusIcon className="h-8 w-8 sm:h-6 sm:w-6 text-black bg-[#E2E2E2] rounded-lg p-1 sm:p-0.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* ----------------- PEOPLE COUNT ----------------- */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0 pt-6">
                                <p
                                    className={`${styles.h2} !text-lg sm:!text-xl text-hh-orange font-medium`}
                                >
                                    R{total}
                                    <span
                                        className={`ml-1 text-hh-gray ${styles.paragraph} !text-sm`}
                                    >
                                        / total
                                    </span>
                                </p>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-x-4">
                                    <p
                                        className={`text-hh-gray ${styles.paragraph} !text-sm text-center sm:text-left`}
                                    >
                                        No of people (max 8)
                                    </p>
                                    <div className="flex gap-x-2 justify-center sm:justify-end">
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    "people",
                                                    people - 1
                                                )
                                            }
                                            aria-label="Decrease people"
                                            className="touch-manipulation"
                                        >
                                            <MinusIcon className="h-8 w-8 sm:h-6 sm:w-6 text-black bg-[#E2E2E2] rounded-lg p-1 sm:p-0.5" />
                                        </button>
                                        <span
                                            className={`${styles.paragraph} font-medium text-black w-8 sm:w-6 text-center`}
                                        >
                                            {people}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    "people",
                                                    Math.min(8, people + 1)
                                                )
                                            }
                                            aria-label="Increase people"
                                            className="touch-manipulation"
                                        >
                                            <PlusIcon className="h-8 w-8 sm:h-6 sm:w-6 text-black bg-[#E2E2E2] rounded-lg p-1 sm:p-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* nav buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-x-2 justify-end mt-6 sm:mt-8">
                            <button
                                onClick={prevStep}
                                className="w-full sm:w-auto bg-white py-3 sm:py-2 px-6 sm:px-4 shadow text-hh-orange rounded border border-hh-orange font-medium"
                            >
                                <p
                                    className={`${styles.paragraph} uppercase !text-sm`}
                                >
                                    Go back
                                </p>
                            </button>
                            <button
                                onClick={() => {
                                    updateFormData({
                                        booking_type: "sauna",
                                    });
                                    nextStep();
                                }}
                                className="w-full sm:w-auto bg-hh-orange py-3 sm:py-2 px-6 sm:px-4 shadow text-white rounded font-medium"
                            >
                                <p
                                    className={`${styles.paragraph} uppercase !text-sm`}
                                >
                                    Continue
                                </p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ---------- Next upcoming event banner ---------- */}
                {nextEventHere && (
                    <div className="flex-1 border border-hh-orange bg-white/95 rounded-md shadow grid grid-cols-3 overflow-hidden items-center mt-6 sm:mt-10">
                        {/* right panel */}
                        <div className="col-span-full py-4 sm:py-6 lg:py-8 px-4 sm:px-8 lg:px-20 space-y-4 sm:space-y-6">
                            {/* Badges */}
                            {nextEventHere && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Date badge */}
                                    <div className="bg-hh-orange py-1 px-3 sm:px-4 shadow flex items-center gap-1 text-white rounded">
                                        <CalendarDaysIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                        <p
                                            className={`${styles.paragraph} uppercase !text-xs sm:!text-sm`}
                                        >
                                            {dayjs(nextEventHere.date).format(
                                                "ddd, D MMM YYYY"
                                            )}
                                        </p>
                                    </div>

                                    {/* Time badge */}
                                    <div className="bg-hh-orange py-1 px-3 sm:px-4 shadow flex items-center gap-1 text-white rounded">
                                        <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                        <p
                                            className={`${styles.paragraph} uppercase !text-xs sm:!text-sm`}
                                        >
                                            {nextEventHere.start} –{" "}
                                            {nextEventHere.end}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <h3
                                className={`${styles.h2} !text-lg sm:!text-xl text-black font-medium`}
                            >
                                {nextEventHere.event_name}
                            </h3>

                            <p className="text-sm sm:text-base">
                                {nextEventHere.description}
                            </p>

                            {/* ----------------- ADD-ONS LIST ----------------- */}
                            <div className="space-y-2">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border border-hh-orange px-3 py-2 rounded gap-3 sm:gap-2">
                                    {/* label */}
                                    <div className="flex items-center gap-x-2 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={true}
                                            className="h-4 w-4 text-hh-orange border-hh-orange rounded"
                                        />
                                        <label
                                            className={`${styles.paragraph} !text-sm font-medium text-black`}
                                        >
                                            Single Sauna Session (15 minutes) *
                                        </label>
                                    </div>
                                </div>

                                {/* ----------------- PEOPLE COUNT ----------------- */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0 pt-6">
                                    <p
                                        className={`${styles.h2} !text-lg sm:!text-xl text-hh-orange font-medium`}
                                    >
                                        R{eventTotal}
                                        <span
                                            className={`ml-1 text-hh-gray ${styles.paragraph} !text-sm`}
                                        >
                                            / total
                                        </span>
                                    </p>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-x-4">
                                        <p
                                            className={`text-hh-gray ${styles.paragraph} !text-sm text-center sm:text-left`}
                                        >
                                            No of people
                                        </p>
                                        <div className="flex gap-x-2 justify-center sm:justify-end">
                                            <button
                                                onClick={() =>
                                                    setEventQty(
                                                        Math.max(
                                                            1,
                                                            eventQty - 1
                                                        )
                                                    )
                                                }
                                                aria-label="Decrease people"
                                                className="touch-manipulation"
                                            >
                                                <MinusIcon className="h-8 w-8 sm:h-6 sm:w-6 text-black bg-[#E2E2E2] rounded-lg p-1 sm:p-0.5" />
                                            </button>
                                            <span
                                                className={`${styles.paragraph} font-medium text-black w-8 sm:w-6 text-center`}
                                            >
                                                {eventQty}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setEventQty(
                                                        Math.min(
                                                            maxQty || 99,
                                                            eventQty + 1
                                                        )
                                                    )
                                                }
                                                aria-label="Increase people"
                                                className="touch-manipulation"
                                            >
                                                <PlusIcon className="h-8 w-8 sm:h-6 sm:w-6 text-black bg-[#E2E2E2] rounded-lg p-1 sm:p-0.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* nav buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-x-2 justify-end mt-6 sm:mt-8">
                                <button
                                    onClick={prevStep}
                                    className="w-full sm:w-auto bg-white py-3 sm:py-2 px-6 sm:px-4 shadow text-hh-orange rounded border border-hh-orange font-medium"
                                >
                                    <p
                                        className={`${styles.paragraph} uppercase !text-sm`}
                                    >
                                        Go back
                                    </p>
                                </button>
                                <button
                                    onClick={() => {
                                        updateFormData({
                                            booking_type: "event",
                                            event_occurrence_id:
                                                nextEventHere.id,
                                            event_date: nextEventHere.date,
                                            event_start: nextEventHere.start,
                                            event_end: nextEventHere.end,
                                            event_name:
                                                nextEventHere.event_name,
                                            event_description:
                                                nextEventHere.description,
                                            event_price: eventPriceCents,
                                            event_time_range: `${nextEventHere.start} - ${nextEventHere.end}`,
                                            event_people: eventQty,
                                        });
                                        nextStep();
                                    }}
                                    className="w-full sm:w-auto bg-hh-orange py-3 sm:py-2 px-6 sm:px-4 shadow text-white rounded font-medium"
                                >
                                    <p
                                        className={`${styles.paragraph} uppercase !text-sm`}
                                    >
                                        Continue
                                    </p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
