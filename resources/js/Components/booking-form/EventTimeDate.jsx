import styles from "../../../styles";
import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";

export default function EventTimeDate({
    nextStep,
    prevStep,
    updateFormData,
    formData,
}) {
    const {
        location,
        event_occurrence_id,
        event_people = 1,
        event_price_per_person = 0, // cents
        event_price = 0, // cents (fallback)
        event_date: eventDate,
        event_time_range: eventTimeRange,
        event_name,
    } = formData;

    const { addItem } = useCart();

    // derive per-person + total in Rands (display + cart)
    const unitRand = useMemo(() => {
        const viaEach = Number(event_price_per_person || 0) / 100;
        if (viaEach > 0) return viaEach;
        // fallback if only total was given
        const viaTotal = Number(event_price || 0) / 100;
        return event_people ? viaTotal / Number(event_people) : viaTotal;
    }, [event_price_per_person, event_price, event_people]);

    const totalRand = useMemo(
        () => (unitRand * Number(event_people || 1)).toFixed(2),
        [unitRand, event_people]
    );

    // parse "HH:mm[-]HH:mm" safely
    const [eventStartTime, eventEndTime] = useMemo(() => {
        if (!eventTimeRange) return [null, null];
        const [startStr, endStr] = eventTimeRange
            .split("-")
            .map((s) => s.trim());
        return [startStr, endStr];
    }, [eventTimeRange]);

    const parseOnDate = (dateStr, timeStr) => {
        if (!timeStr) return null;
        const hhmm = /^\d{2}:\d{2}(:\d{2})?$/;
        return hhmm.test(timeStr)
            ? dayjs(`${dateStr} ${timeStr}`)
            : dayjs(timeStr);
    };

    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTimeId, setSelectedTimeId] = useState(null);
    const [agreed, setAgreed] = useState(false);

    // fetch only slots AFTER the event end time on the same date/location
    useEffect(() => {
        if (!location?.id || !eventDate || !eventStartTime || !eventEndTime)
            return;

        (async () => {
            setLoading(true);

            const res = await fetch(
                route("availability.all", {
                    location_id: location.id,
                    date: eventDate,
                    after: eventEndTime, // server will do "starts_at >= after"
                })
            );
            const json = await res.json(); // [{id, starts_at, ends_at, spots_left}, …]

            const eventEnd = parseOnDate(eventDate, eventEndTime);

            // Double-filter in UI for safety: only show slots that start AFTER the event
            const filtered = (json.data || [])
                .filter((s) => {
                    const slotStart = parseOnDate(eventDate, s.starts_at);
                    if (!slotStart || !eventEnd) return false;
                    return !slotStart.isBefore(eventEnd); // slotStart >= eventEnd
                })
                .sort((a, b) => {
                    const aStart = parseOnDate(eventDate, a.starts_at);
                    const bStart = parseOnDate(eventDate, b.starts_at);
                    return aStart.valueOf() - bStart.valueOf();
                });

            setSlots(filtered);
            setLoading(false);
        })();
    }, [location?.id, eventDate, eventStartTime, eventEndTime]);

    const prettyEventDate = useMemo(() => {
        return eventDate && dayjs(eventDate).isValid()
            ? dayjs(eventDate).format("D MMMM YYYY")
            : eventDate ?? "";
    }, [eventDate]);

    const handleSelectSlot = (slot) => {
        if (slot.spots_left === 0) return;
        setSelectedTimeId(slot.id);
        // keep wizard form in sync (optional)
        updateFormData?.({
            timeslot_id: slot.id,
            sauna_time: `${slot.starts_at} - ${slot.ends_at}`,
        });
    };

    const handleContinue = () => {
        if (!selectedTimeId || !agreed) return;

        const chosen = slots.find((s) => s.id === selectedTimeId);
        const timeRange = chosen
            ? `${chosen.starts_at} - ${chosen.ends_at}`
            : null;

        // Build cart item (shape expected by InvoiceDetails & checkout)
        addItem({
            kind: "event",
            // identifiers
            event_occurrence_id,
            timeslot_id: selectedTimeId, // post-event sauna slot
            location_id: location.id,
            // display/meta
            event_name,
            location_name: location.name,
            date: eventDate,
            timeRange,
            people: Number(event_people || 1),
            // line items for the invoice
            lines: [
                {
                    label: event_name,
                    qty: Number(event_people || 1),
                    unit: Number(unitRand), // number in Rands
                    total: Number(unitRand * (event_people || 1)).toFixed(2),
                },
            ],
            lineTotal: Number(unitRand * (event_people || 1)).toFixed(2),
            // (add `addons` here later if you support event add-ons)
        });

        // Nudge the wizard forward to the invoice step
        nextStep?.();
    };

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
                        Choose a sauna slot on {prettyEventDate}
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
                            slots.map((slot) => {
                                const selected = selectedTimeId === slot.id;
                                const disabled = slot.spots_left === 0;
                                return (
                                    <button
                                        type="button"
                                        key={slot.id}
                                        onClick={() => handleSelectSlot(slot)}
                                        disabled={disabled}
                                        className={`w-full text-left border rounded shadow p-6 flex justify-between
                      ${
                          disabled
                              ? "opacity-40 cursor-not-allowed"
                              : "cursor-pointer"
                      }
                      ${selected ? "border-hh-orange" : "border-hh-gray"}`}
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
                                    </button>
                                );
                            })}
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
                                    × {event_people}
                                </span>
                            </p>
                            <p className={`${styles.paragraph} text-hh-orange`}>
                                R{totalRand}
                            </p>
                        </div>

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
                                onClick={handleContinue}
                                disabled={!selectedTimeId || !agreed}
                                className={`bg-hh-orange py-1 w-full px-4 shadow text-white rounded ${
                                    (!selectedTimeId || !agreed) &&
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
