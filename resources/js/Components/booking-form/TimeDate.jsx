import React, { useState, useEffect, useMemo } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import styles from "../../../styles";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import { useCart } from "@/context/CartContext";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mql = window.matchMedia("(max-width: 639px)");
        const onChange = (e) => setIsMobile(e.matches);
        setIsMobile(mql.matches);
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

const nice = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function TimeDate({
    nextStep,
    prevStep,
    updateFormData,
    formData,
    servicesData,
    addons,
    sessionService,
}) {
    const { addItem } = useCart();

    const { location = {}, time } = formData ?? {};
    const people = servicesData.people ?? 1;

    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null); // ← store the full slot
    const [slotCap, setSlotCap] = useState(8);

    // Slots for the selected date
    const slots = useMemo(() => {
        if (!selectedDate || scheduleData.length === 0) {
            return { morning: [], afternoon: [], evening: [], night: [] };
        }
        const dateString = selectedDate.format("YYYY-MM-DD");
        const found = scheduleData.find((d) => d.date === dateString);
        return found
            ? found.slots
            : { morning: [], afternoon: [], evening: [], night: [] };
    }, [selectedDate, scheduleData]);

    const isMobile = useIsMobile();

    const [mobileOpen, setMobileOpen] = useState(null);

    const updateQuantity = (code, value) =>
        updateFormData({
            services: { ...servicesData, [code]: Math.max(0, value) },
        });

    // Load schedules for the chosen weekday at the chosen location
    useEffect(() => {
        if (!location?.id || !location.day) {
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);

            const dayMap = {
                sun: 0,
                mon: 1,
                tue: 2,
                wed: 3,
                thu: 4,
                fri: 5,
                sat: 6,
            };
            const wantedDow =
                dayMap[String(location.day).slice(0, 3).toLowerCase()];
            if (wantedDow === undefined) {
                setLoading(false);
                return;
            }

            const res = await fetch(
                route("schedules.byDay", {
                    location_id: location.id,
                    weekday: wantedDow,
                })
            );
            const data = await res.json();

            setScheduleData(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length > 0) {
                const firstDate = dayjs(data[0].date);
                setSelectedDate(firstDate);
                updateFormData({ date: firstDate.format("YYYY-MM-DD") });
            } else {
                setSelectedDate(null);
            }
            // reset selection on reload
            setSelectedSlot(null);
            setSlotCap(8);
            setLoading(false);
        })();
    }, [location?.id, location.day]);

    // Dates row
    const displayDays = useMemo(
        () =>
            scheduleData
                .slice(0, 6)
                .filter(Boolean)
                .map((d) => dayjs(d.date)),
        [scheduleData]
    );

    // Reset time selection when day changes
    const handleDaySelect = (day) => {
        setSelectedDate(day);
        setSelectedSlot(null);
        updateFormData({
            date: day.format("YYYY-MM-DD"),
            time: "",
            timeslot_id: null,
        });
    };

    // Select a slot (store full object) and immediately proceed
    const handleTimeSelect = (item) => {
        if (!item || item.spots_left === 0) return;
        setSelectedSlot(item);
        setSlotCap(item.spots_left);
        updateFormData({
            time: `${item.starts_at} - ${item.ends_at}`,
            timeslot_id: item.id,
            booking_type: "sauna",
        });
        
        // Immediately add to cart and proceed to order summary
        const pickedAddons = addons
            .filter((a) => (servicesData[a.code] ?? 0) > 0)
            .map((a) => ({
                code: a.code,
                name: a.name,
                qty: servicesData[a.code],
                unit: Number(a.price),
                total: Number(a.price) * (servicesData[a.code] ?? 0),
            }));

        const sessionUnit = Number(sessionService.price);
        const sessionLine = sessionUnit * people;
        const lineTotal =
            sessionLine + pickedAddons.reduce((t, x) => t + x.total, 0);

        addItem({
            kind: "sauna",
            location_id: location.id,
            location_name: location.name,
            date: selectedDate ? selectedDate.format("YYYY-MM-DD") : null,
            timeRange: `${item.starts_at} - ${item.ends_at}`,
            timeslot_id: item.id,
            people,

            lines: [
                {
                    label: "Single Sauna Session",
                    qty: people,
                    unit: sessionUnit,
                    total: sessionLine,
                },
                ...pickedAddons.map((a) => ({
                    label: a.name,
                    qty: a.qty,
                    unit: a.unit,
                    total: a.total,
                })),
            ],
            addons: pickedAddons,
            lineTotal,
        });

        // advance to invoice (step 4)
        nextStep();
    };

    // Pricing
    const total = useMemo(() => {
        const sessionUnit = Number(sessionService.price);
        let sum = sessionUnit * people;
        addons.forEach((svc) => {
            sum += (servicesData[svc.code] ?? 0) * Number(svc.price);
        });
        return sum.toFixed(2);
    }, [servicesData, addons, people, sessionService.price]);


    const storageUrl = (path) => {
        if (!path) return null;
        if (/^https?:\/\//i.test(path)) return path;
        // ensure it points at the /storage symlink
        return "/storage/" + String(path).replace(/^\/?(storage\/)?/i, "");
    };

    const hero = storageUrl("images/fire-bg.jpg");

    return (
        <div
            className={`${styles.boxWidth} bg-cover bg-center bg-no-repeat pb-10 sm:pb-28 pt-28 sm:pt-40 px-2 sm:px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
            style={hero ? { backgroundImage: `url(${hero})` } : undefined}
        >
            {/* <div className=" border border-hh-orange bg-white/95 rounded-md shadow mb-6 sm:mb-0  flex items-center py-2 justify-center">
                <h1
                    className={`${styles.h3} !text-lg sm:!text-xl lg:!text-2xl !text-black text-center font-normal max-w-3xl mb-6 sm:mb-0`}
                >
                    Feel the Chill, Embrace the Heat — sauna sessions by the
                    sea.
                    <span className="text-hh-orange block">
                        {location.name}
                    </span>
                </h1>
            </div> */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-x-10 relative mt-6 sm:mt-4">
                {/* left: calendar + slots */}
                <div className="col-span-1 lg:col-span-2 bg-white/95 p-4 sm:p-6 lg:p-10 rounded-md shadow border-hh-orange border">
                    <h3
                        className={`${styles.h2} !text-lg sm:!text-xl lg:!text-2xl text-black font-medium`}
                    >
                        Pick a slot on a{" "}
                        <span className="text-hh-orange font-semibold">
                            {selectedDate ? selectedDate.format("dddd") : "..."}
                        </span>
                    </h3>
                    <p
                        className={`!font-medium !text-lg sm:!text-xl text-black mt-2 mb-4 ${styles.paragraph}`}
                    >
                        {selectedDate
                            ? selectedDate.format("MMMM YYYY")
                            : "..."}
                    </p>

                    {loading && (
                        <p className={`${styles.paragraph} text-hh-gray`}>
                            Finding available slots...
                        </p>
                    )}

                    {!loading && displayDays.length === 0 && (
                        <p className={`${styles.paragraph} text-hh-gray`}>
                            Sorry, no available slots were found for{" "}
                            {location.day}s.
                        </p>
                    )}

                    {!loading && displayDays.length > 0 && (
                        <>
                            {/* date chips */}
                            <div className="flex flex-wrap gap-3 sm:gap-x-6 mb-8 sm:mb-16 justify-center sm:justify-start">
                                {displayDays.map((day) => {
                                    const isSelected = day.isSame(
                                        selectedDate,
                                        "day"
                                    );
                                    return (
                                        <div
                                            key={day.toString()}
                                            onClick={() => handleDaySelect(day)}
                                            className="text-center cursor-pointer"
                                        >
                                            <div
                                                className={`text-lg sm:text-xl w-14 sm:w-16 py-3 sm:py-4 rounded-md ${
                                                    isSelected
                                                        ? "bg-hh-orange text-white font-bold border border-hh-orange"
                                                        : "bg-white text-hh-gray border border-hh-gray font-medium"
                                                }`}
                                            >
                                                {day.date()}
                                            </div>
                                            <div
                                                className={`${
                                                    styles.paragraph
                                                } !text-sm font-medium ${
                                                    isSelected
                                                        ? "text-hh-orange"
                                                        : "text-hh-gray"
                                                }`}
                                            >
                                                {day.format("ddd")}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* slots - show all periods that have availability */}
                            <div className="space-y-6 sm:space-y-8">
                                {["morning", "afternoon", "evening", "night"].some(
                                    (period) => (slots[period]?.length ?? 0) > 0
                                ) ? (
                                    ["morning", "afternoon", "evening", "night"].map(
                                        (period) =>
                                            slots[period]?.length > 0 && (
                                                <PeriodSection
                                                    key={period}
                                                    period={period}
                                                    items={slots[period]}
                                                    isMobile={isMobile}
                                                    mobileOpen={mobileOpen}
                                                    setMobileOpen={setMobileOpen}
                                                    selectedSlotId={selectedSlot?.id}
                                                    onPick={handleTimeSelect}
                                                />
                                            )
                                    )
                                ) : (
                                    <p
                                        className={`${styles.paragraph} text-hh-gray`}
                                    >
                                        No slots available for this date.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* right: summary */}
                <div className="col-span-1 border border-hh-gray bg-white/95 rounded-md shadow overflow-hidden h-fit lg:sticky lg:top-12">
                    <div className="p-4 sm:p-6 lg:p-8">
                        <h4
                            className={`${styles.h3} !text-lg sm:!text-xl lg:!text-2xl !mb-4 font-medium text-black`}
                        >
                            Summary
                        </h4>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="bg-hh-orange py-1 px-3 sm:px-4 shadow flex items-center gap-1 text-white rounded">
                                <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                <p
                                    className={`${styles.paragraph} uppercase !text-xs sm:!text-sm`}
                                >
                                    {selectedDate
                                        ? selectedDate.format("dddd")
                                        : location.day}
                                </p>
                            </div>
                            <div className="bg-hh-orange py-1 px-3 sm:px-4 shadow flex items-center gap-1 text-white rounded">
                                <p
                                    className={`${styles.paragraph} uppercase !text-xs sm:!text-sm`}
                                >
                                    15 minutes
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-x-2 mt-4 sm:mt-6 mb-4 sm:mb-6 text-hh-orange">
                                <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                                <h3
                                    className={`${styles.h3} !text-base sm:!text-lg lg:!text-xl !mb-0 font-medium`}
                                >
                                    {location.name}
                                </h3>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-2 border border-hh-gray p-3 sm:p-2 rounded">
                                <p
                                    className={`${styles.paragraph} !text-sm text-black font-medium !mb-0`}
                                >
                                    Single Sauna Session
                                </p>
                                <QtyPicker
                                    code="people"
                                    qty={people}
                                    min={1}
                                    max={Math.min(slotCap, 8)}
                                    update={updateQuantity}
                                />
                            </div>

                            {addons
                                .filter(
                                    (svc) => (servicesData[svc.code] ?? 0) > 0
                                )
                                .map((svc) => (
                                    <div
                                        key={svc.code}
                                        className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-2 border border-hh-gray p-3 sm:p-2 rounded"
                                    >
                                        <p
                                            className={`${styles.paragraph} !text-sm text-black font-medium !mb-0`}
                                        >
                                            {svc.name}
                                        </p>
                                        <QtyPicker
                                            code={svc.code}
                                            qty={servicesData[svc.code]}
                                            min={0}
                                            max={8}
                                            update={updateQuantity}
                                        />
                                    </div>
                                ))}

                            <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between gap-3 sm:gap-x-2 items-center">
                                <div className="bg-white w-full py-2 sm:py-3 shadow flex items-center justify-center gap-1 text-hh-orange rounded border border-hh-orange">
                                    <p
                                        className={`${styles.paragraph} uppercase !text-xs sm:!text-sm`}
                                    >
                                        {selectedDate
                                            ? selectedDate.format("YYYY-MM-DD")
                                            : "Date"}
                                    </p>
                                </div>
                                <div className="bg-white w-full py-2 sm:py-3 shadow flex items-center justify-center gap-1 text-hh-orange rounded border border-hh-orange">
                                    <p
                                        className={`${styles.paragraph} uppercase !text-xs sm:!text-sm`}
                                    >
                                        {time || "Time"}
                                    </p>
                                </div>
                            </div>

                            <h4
                                className={`${styles.h3} !text-lg sm:!text-xl lg:!text-2xl !mb-4 font-medium text-hh-orange pt-6 sm:pt-8`}
                            >
                                Total: R{total}
                            </h4>

                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-x-2 pt-4 sm:pt-6">
                                <button
                                    onClick={prevStep}
                                    className="w-full sm:w-auto bg-white border border-hh-orange py-3 sm:py-2 px-6 sm:px-4 shadow text-hh-orange rounded font-medium"
                                >
                                    <span
                                        className={`${styles.paragraph} uppercase !text-sm`}
                                    >
                                        go back
                                    </span>
                                </button>
                            </div>
                            
                            <p className={`${styles.paragraph} text-center text-gray-600 !text-sm mt-4`}>
                                Select a time slot above to continue
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TimeSlot({ slot, selectedTime, handleTimeSelect }) {
    return (
        <div
            className={`border rounded shadow p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 ${
                slot.spots_left === 0
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer touch-manipulation"
            } ${
                selectedTime === slot.id
                    ? "border-hh-orange bg-orange-50"
                    : "border-hh-gray"
            }`}
            onClick={() => handleTimeSelect(slot)}
        >
            <p
                className={`${styles.paragraph} !text-sm sm:!text-base text-black font-medium`}
            >
                {slot.starts_at} – {slot.ends_at}
            </p>
            <p
                className={`${styles.paragraph} !text-xs sm:!text-sm uppercase text-[#999]`}
            >
                {slot.spots_left} slots left
            </p>
        </div>
    );
}

function QtyPicker({ code, qty, min, max, update }) {
    return (
        <div className="flex gap-x-2 items-center justify-center sm:justify-end">
            <button
                onClick={() => update(code, Math.max(min, qty - 1))}
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
                onClick={() => update(code, Math.min(max, qty + 1))}
                className="touch-manipulation"
            >
                <PlusIcon className="h-8 w-8 sm:h-6 sm:w-6 text-black bg-[#E2E2E2] rounded-lg p-1 sm:p-0.5" />
            </button>
        </div>
    );
}

function PeriodSection({
    period,
    items,
    isMobile,
    mobileOpen,
    setMobileOpen,
    selectedSlotId,
    onPick,
}) {
    const title = `${nice(period)} Slots`;
    const [isOpen, setIsOpen] = React.useState(false);
    const count = items.length;

    return (
        <div className="border border-hh-orange rounded-lg overflow-hidden">
            {/* Dropdown header */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-hh-orange text-white hover:bg-hh-orange/90 transition-colors"
                aria-expanded={isOpen}
            >
                <span className="text-sm sm:text-base font-medium">
                    {title} <span className="opacity-80">({count})</span>
                </span>
                <ChevronDownIcon
                    className={`h-5 w-5 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {/* Collapsible body with time slot cards */}
            <div
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
            >
                <div className="overflow-hidden">
                    <div className="p-3 space-y-2 bg-white">
                        {items.map((slot) => (
                            <TimeSlot
                                key={slot.id}
                                slot={slot}
                                selectedTime={selectedSlotId}
                                handleTimeSelect={onPick}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
