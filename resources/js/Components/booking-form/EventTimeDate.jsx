import styles from "../../../styles";
import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function EventTimeDate({
    nextStep,
    prevStep,
    updateFormData,
    formData,
    servicesData,
    addons,
    sessionService,
    events,
}) {
    const {
        location,
        event_occurrence_id,
        event_people,
        event_price_per_person = 0,
        event_price = 0,
        event_date: eventDate,
        event_time_range: eventTimeRange,
        event_name,
    } = formData;

    const eventPriceRand = (event_price / 100).toFixed(2);
    const pricePerPerson = (event_price_per_person / 100).toFixed(2);

    const eventEndTime = useMemo(() => {
        if (!eventTimeRange) return null;
        return eventTimeRange.split("-")[1].trim(); // "HH:MM"
    }, [eventTimeRange]);

    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);

    const [agreed, setAgreed] = useState(false);
    const [slotCap, setSlotCap] = useState(8);

    // fetch only slots AFTER the event end time on the same date/location
    useEffect(() => {
        console.log(location.id, eventDate, eventEndTime);
        if (!location.id || !eventDate || !eventEndTime) return;

        (async () => {
            setLoading(true);
            const res = await fetch(
                route("availability.all", {
                    location_id: location.id,
                    date: eventDate,
                })
            );
            const json = await res.json(); // [{id, starts_at, ends_at, spots_left}, …]
            const filtered = json.filter((s) => s.starts_at >= eventEndTime);
            setSlots(filtered);
            setLoading(false);
        })();
    }, [location.id, eventDate, eventEndTime]);

    // When selecting a sauna slot
    const handleSlot = (slot) => {
        if (slot.spots_left === 0) return;
        setSelectedTime(slot.id);
        setSlotCap(slot.spots_left);
        updateFormData({
            timeslot_id: slot.id,
            sauna_time: `${slot.starts_at} - ${slot.ends_at}`,
        });
    };

    // Sauna add‑ons & people: reuse existing structure if you still want addons
    // (or strip them out in event mode if not needed)
    const updateSaunaPeople = (val) =>
        setSaunaQty(Math.max(1, Math.min(slotCap, val)));

    const addonsSubtotal = useMemo(() => {
        let sum = 0;
        addons.forEach((svc) => {
            const qty = servicesData[svc.code] ?? 0;
            sum += qty * svc.price;
        });
        return sum.toFixed(2);
    }, [addons, servicesData]);

    const grandTotal = useMemo(
        () =>
            (parseFloat(eventPriceRand) + parseFloat(addonsSubtotal)).toFixed(
                2
            ),
        [eventPriceRand, addonsSubtotal]
    );

    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <h1
                className={`${styles.h3} !text-2xl !text-black font-normal max-w-3xl`}
            >
                Add a sauna session after your{" "}
                <span className="text-hh-orange">{event_name}</span> at&nbsp;
                {location.name}
            </h1>

            <div className="grid grid-cols-3 gap-x-20 mt-10">
                {/* LEFT: slot picker */}
                <div className="col-span-2 bg-white">
                    <h3 className={`${styles.h2} text-black font-medium mb-2`}>
                        Choose a sauna slot on {eventDate}
                    </h3>
                    <p className={`${styles.paragraph} text-black mb-6`}>
                        After your event ({eventTimeRange}), pick a time that
                        suits you:
                    </p>

                    <div className="h-[485px] overflow-y-scroll space-y-2">
                        {loading && <p>Loading…</p>}
                        {!loading && slots.length === 0 && (
                            <p className={`${styles.paragraph} text-hh-gray`}>
                                No sauna slots available after the event.
                            </p>
                        )}
                        {!loading &&
                            slots.map((slot) => (
                                <div
                                    key={slot.id}
                                    className={`border rounded shadow p-6 flex justify-between
                    ${
                        slot.spots_left === 0
                            ? "opacity-40 cursor-not-allowed"
                            : "cursor-pointer"
                    }
                    ${
                        selectedTime === slot.id
                            ? "border-hh-orange"
                            : "border-hh-gray"
                    }`}
                                    onClick={() => handleSlot(slot)}
                                >
                                    <p
                                        className={`${styles.paragraph} text-black font-medium`}
                                    >
                                        {slot.starts_at} – {slot.ends_at}
                                    </p>
                                    <p
                                        className={`${styles.paragraph} uppercase text-[#999]`}
                                    >
                                        {slot.spots_left} slots left
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>

                {/* RIGHT: summary */}
                <div className="col-span-1 border border-hh-gray bg-white rounded-md shadow h-fit sticky top-12">
                    <div className="p-8 space-y-4">
                        <h4 className={`${styles.h3} font-medium text-black`}>
                            Summary
                        </h4>

                        {/* Event badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="bg-hh-orange py-1 px-4 shadow flex items-center gap-1 text-white rounded">
                                <MapPinIcon className="h-5 w-5" />
                                <p
                                    className={`${styles.paragraph} uppercase !text-sm`}
                                >
                                    {location.name}
                                </p>
                            </div>
                            <div className="bg-hh-orange py-1 px-4 shadow flex items-center gap-1 text-white rounded">
                                <ClockIcon className="h-5 w-5" />
                                <p
                                    className={`${styles.paragraph} uppercase !text-sm`}
                                >
                                    event - {eventTimeRange}
                                </p>
                            </div>
                        </div>

                        {/* Event cost */}
                        <div className="border border-hh-gray p-2 rounded">
                            <p
                                className={`${styles.paragraph} text-black font-medium`}
                            >
                                {event_name}{" "}
                                <span
                                    className={`${styles.paragraph} text-[#666]`}
                                >
                                    × {event_people}
                                </span>
                            </p>

                            <p className={`${styles.paragraph} text-hh-orange`}>
                                R{parseFloat(eventPriceRand).toFixed(2)}
                            </p>
                        </div>

                        <h4
                            className={`${styles.h3} font-medium text-hh-orange pt-4`}
                        >
                            Total: R{grandTotal}
                        </h4>

                        {/* Consent + buttons */}
                        <div className="flex items-center gap-x-2">
                            <input
                                type="checkbox"
                                id="consent"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="h-4 w-4 text-hh-orange border-hh-orange rounded bg-white"
                            />
                            <label
                                htmlFor="consent"
                                className={`${styles.paragraph} text-hh-gray !text-sm`}
                            >
                                I agree that I have read and accepted the Terms
                                of Use and Privacy Policy
                            </label>
                        </div>

                        <div className="flex items-center gap-x-2 pt-4">
                            <button
                                onClick={prevStep}
                                className="bg-white border border-hh-orange py-1 px-4 shadow text-hh-orange rounded"
                            >
                                <p
                                    className={`${styles.paragraph} uppercase whitespace-nowrap`}
                                >
                                    go back
                                </p>
                            </button>
                            <button
                                onClick={() => {
                                    updateFormData({
                                        booking_type: "event",
                                        sauna_people: event_people,
                                        sauna_total: grandTotal,
                                        grand_total: grandTotal,
                                    });
                                    nextStep(); // no callback needed
                                }}
                                disabled={!selectedTime || !agreed}
                                className={`bg-hh-orange py-1 w-full px-4 shadow text-white rounded ${
                                    (!selectedTime || !agreed) &&
                                    "opacity-50 cursor-not-allowed"
                                }`}
                            >
                                <p className={`${styles.paragraph} uppercase`}>
                                    Continue
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// simple qty picker (separate from servicesData.people)
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
