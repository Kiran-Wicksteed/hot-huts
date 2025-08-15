import { MapPinIcon } from "@heroicons/react/24/outline";
import styles from "../../../styles";
import { useState, useEffect, useMemo, useRef } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";

export default function TimeDate({
    nextStep,
    prevStep,
    updateFormData,
    formData,
    servicesData,
    addons,
    sessionService,
}) {
    // THIS LINE IS NOW CORRECTED
    const { location = {}, time } = formData ?? {};
    const people = servicesData.people ?? 1;

    // NEW: State to hold all schedule data from the single API call
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [agreed, setAgreed] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
    const [slotCap, setSlotCap] = useState(8);
    const [selectedDate, setSelectedDate] = useState(null); // Initialized to null

    const updateQuantity = (code, value) =>
        updateFormData({
            services: { ...servicesData, [code]: Math.max(0, value) },
        });

    // EFFECT 1: Simplified to a single API call
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

            setScheduleData(data);

            // If we got results, select the first available date by default
            if (data.length > 0) {
                const firstDate = dayjs(data[0].date);
                setSelectedDate(firstDate);
                // Update parent form with the initial date
                updateFormData({ date: firstDate.format("YYYY-MM-DD") });
            }
            setLoading(false);
        })();
    }, [location?.id, location.day]);

    // DERIVED STATE: These are now calculated from state, not fetched separately
    const displayDays = useMemo(
        () =>
            scheduleData
                .slice(0, 6)
                .filter(Boolean) // <-- ADD THIS LINE
                .map((d) => dayjs(d.date)),
        [scheduleData]
    );
    const slots = useMemo(() => {
        if (!selectedDate || scheduleData.length === 0) {
            return { morning: [], afternoon: [], evening: [], night: [] };
        }
        const dateString = selectedDate.format("YYYY-MM-DD");
        const foundData = scheduleData.find((d) => d.date === dateString);
        return foundData
            ? foundData.slots
            : { morning: [], afternoon: [], evening: [], night: [] };
    }, [selectedDate, scheduleData]);

    // Keep formData in sync with user selections
    const handleDaySelect = (day) => {
        setSelectedDate(day);
        setSelectedTime(null); // Reset time selection when day changes
        updateFormData({
            date: day.format("YYYY-MM-DD"),
            time: "", // Reset time in form data
            timeslot_id: null,
        });
    };

    const handleTimeSelect = (item) => {
        if (item.spots_left === 0) return;
        setSelectedTime(item.id);
        setSlotCap(item.spots_left);
        updateFormData({
            time: `${item.starts_at} - ${item.ends_at}`,
            timeslot_id: item.id,
        });
    };

    const total = useMemo(() => {
        let sum = +sessionService.price * people;
        addons.forEach(
            (svc) => (sum += (servicesData[svc.code] ?? 0) * svc.price)
        );
        return sum.toFixed(2);
    }, [servicesData, addons, people, sessionService.price]);

    // --- JSX (Largely the same, just simplified) ---
    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <h1
                className={`${styles.h3} !text-2xl !text-black font-normal max-w-3xl`}
            >
                Feel the Chill, Embrace the Heat — sauna sessions by the sea.
                <span className="text-hh-orange block">{location.name}</span>
            </h1>

            <div className="grid grid-cols-3 gap-x-20 relative mt-10">
                {/* left: calendar + slots */}
                <div className="col-span-2 bg-white">
                    <h3 className={`${styles.h2} text-black font-medium`}>
                        Pick a slot on a{" "}
                        <span className="text-hh-orange font-semibold">
                            {selectedDate ? selectedDate.format("dddd") : "..."}
                        </span>
                    </h3>
                    <p
                        className={`!font-medium !text-xl text-black mt-2 mb-4 ${styles.paragraph}`}
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
                            <div className="flex gap-x-6 mb-16">
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
                                                className={`text-xl w-16 py-4 rounded-md ${
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
                                                } font-medium ${
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

                            {/* slots */}
                            <div className="space-y-10">
                                {slots.morning.length > 0 ||
                                slots.evening.length > 0 ? (
                                    <>
                                        {slots.morning.length > 0 && (
                                            <div className="space-y-2">
                                                <p
                                                    className={`${styles.paragraph} mb-6 underline !text-lg text-black font-medium`}
                                                >
                                                    Morning Slots
                                                </p>
                                                {slots.morning.map((slot) => (
                                                    <TimeSlot
                                                        key={slot.id}
                                                        slot={slot}
                                                        selectedTime={
                                                            selectedTime
                                                        }
                                                        handleTimeSelect={
                                                            handleTimeSelect
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {slots.evening.length > 0 && (
                                            <div className="space-y-2">
                                                <p
                                                    className={`${styles.paragraph} mb-6 underline !text-lg text-black font-medium`}
                                                >
                                                    Evening Slots
                                                </p>
                                                {slots.evening.map((slot) => (
                                                    <TimeSlot
                                                        key={slot.id}
                                                        slot={slot}
                                                        selectedTime={
                                                            selectedTime
                                                        }
                                                        handleTimeSelect={
                                                            handleTimeSelect
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
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
                <div className="col-span-1 border border-hh-gray bg-white rounded-md shadow overflow-hidden h-fit sticky top-12">
                    <div className="p-8">
                        <h4
                            className={`${styles.h3} !mb-4 font-medium text-black`}
                        >
                            Summary
                        </h4>
                        <div className="flex items-center gap-x-2">
                            <div className="bg-hh-orange py-1 px-4 shadow flex items-center gap-1 text-white rounded">
                                <MapPinIcon className="h-5 w-5" />
                                <p
                                    className={`${styles.paragraph} uppercase !text-sm`}
                                >
                                    {selectedDate
                                        ? selectedDate.format("dddd")
                                        : location.day}
                                </p>
                            </div>
                            <div className="bg-hh-orange py-1 px-4 shadow flex items-center gap-1 text-white rounded">
                                <p
                                    className={`${styles.paragraph} uppercase !text-sm`}
                                >
                                    15 minutes
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-x-2 mt-6 mb-6 text-hh-orange">
                                <MapPinIcon className="h-6 w-6 shrink-0" />
                                <h3
                                    className={`${styles.h3} !mb-0 font-medium`}
                                >
                                    {location.name}
                                </h3>
                            </div>
                            <div className="flex justify-between items-end border border-hh-gray p-2 rounded">
                                <p
                                    className={`${styles.paragraph} text-black font-medium!mb-0`}
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
                                        className="flex justify-between items-end border border-hh-gray p-2 rounded"
                                    >
                                        <p
                                            className={`${styles.paragraph} text-black font-medium!mb-0`}
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
                            <div className="pt-6 flex justify-between gap-x-2 items-center">
                                <div className="bg-white w-full py-3 shadow flex items-center justify-center gap-1 text-hh-orange rounded border border-hh-orange">
                                    <p
                                        className={`${styles.paragraph} uppercase !text-sm`}
                                    >
                                        {selectedDate
                                            ? selectedDate.format("YYYY-MM-DD")
                                            : "Date"}
                                    </p>
                                </div>
                                <div className="bg-white w-full py-3 shadow flex items-center justify-center gap-1 text-hh-orange rounded border border-hh-orange">
                                    <p
                                        className={`${styles.paragraph} uppercase !text-sm`}
                                    >
                                        {time || "Time"}
                                    </p>
                                </div>
                            </div>
                            <h4
                                className={`${styles.h3} !mb-4 font-medium text-hh-orange pt-8`}
                            >
                                Total: R{total}
                            </h4>
                            <div className="flex items-center gap-x-2">
                                <input
                                    type="checkbox"
                                    id="consent"
                                    name="consent"
                                    checked={agreed}
                                    onChange={(e) =>
                                        setAgreed(e.target.checked)
                                    }
                                    className="h-4 w-4 text-hh-orange ring-white border-hh-orange ring focus:ring-hh-orange rounded bg-white"
                                />
                                <label
                                    htmlFor="consent"
                                    className={`${styles.paragraph} text-hh-gray !text-sm`}
                                >
                                    I agree that I have read and accepted the
                                    Terms of Use and Privacy Policy
                                </label>
                            </div>
                            <div className="flex items-center gap-x-2 pt-6">
                                <div className="bg-white border border-hh-orange py-1 px-4 shadow flex items-center gap-1 text-hh-orange rounded">
                                    <button
                                        onClick={prevStep}
                                        className={`${styles.paragraph} uppercase whitespace-nowrap`}
                                    >
                                        go back
                                    </button>
                                </div>
                                <div className="bg-hh-orange py-1 w-full px-4 shadow flex items-center justify-center gap-1 text-white rounded">
                                    <button
                                        onClick={nextStep}
                                        disabled={!selectedTime || !agreed}
                                        className={`${
                                            styles.paragraph
                                        } uppercase ${
                                            (!selectedTime || !agreed) &&
                                            "opacity-50 cursor-not-allowed"
                                        }`}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
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
            className={`border rounded shadow p-6 flex justify-between ${
                slot.spots_left === 0
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer"
            } ${
                selectedTime === slot.id ? "border-hh-orange" : "border-hh-gray"
            }`}
            onClick={() => handleTimeSelect(slot)}
        >
            <p className={`${styles.paragraph} text-black font-medium`}>
                {slot.starts_at} – {slot.ends_at}
            </p>
            <p className={`${styles.paragraph} uppercase text-[#999]`}>
                {slot.spots_left} slots left
            </p>
        </div>
    );
}

function QtyPicker({ code, qty, min, max, update }) {
    return (
        <div className="flex gap-x-1 items-center">
            <button onClick={() => update(code, Math.max(min, qty - 1))}>
                <MinusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
            </button>
            <span
                className={`${styles.paragraph} font-medium text-black w-6 text-center`}
            >
                {qty}
            </span>
            <button onClick={() => update(code, Math.min(max, qty + 1))}>
                <PlusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
            </button>
        </div>
    );
}
