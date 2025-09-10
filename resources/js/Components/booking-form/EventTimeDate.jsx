import styles from "../../../styles";
import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import {
    MapPinIcon,
    ClockIcon,
    MinusIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";

const HIDDEN_ADDON_IDS = new Set([8]); // ✅ hide "event ticket + sauna session"

export default function EventTimeDate({
    nextStep,
    prevStep,
    updateFormData,
    formData,
    addons = [],
}) {
    const {
        location,
        event_occurrence_id,
        event_people,
        event_price_per_person = 0, // ✅ treat as unit price
        event_price = 0, // fallback as unit
        event_capacity, // ✅ provided by Index
        event_date: eventDate,
        event_time_range: eventTimeRange,
        event_name,
        services: servicesFromForm = { people: 1 },
    } = formData;

    const services = servicesFromForm || { people: 1 };
    const { addItem } = useCart();

    // ---------- PRICING ----------
    const priceToRand = (raw) => {
        const n = Number(raw || 0);
        // accept cents or rands; >=1000 treated as cents
        return n >= 1000 ? n / 100 : n;
    };

    // ✅ FIX: lock the unit price; do NOT divide by qty
    const eventUnitRand = useMemo(
        () => priceToRand(event_price_per_person || event_price),
        [event_price_per_person, event_price]
    );

    // ---------- SLOTS AFTER EVENT ----------
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTimeId, setSelectedTimeId] = useState(null);
    const [agreed, setAgreed] = useState(false);

    // hide addon id=8 in UI and totals
    const visibleAddons = useMemo(
        () => addons.filter((svc) => svc.price > 0),
        [addons]
    );

    // if hidden addon had qty, zero it
    useEffect(() => {
        let changed = false;
        const next = { ...services };
        addons.forEach((a) => {
            if (HIDDEN_ADDON_IDS.has(Number(a?.id))) {
                const code = a.code ?? a.slug ?? a.id;
                if ((next[code] || 0) !== 0) {
                    next[code] = 0;
                    changed = true;
                }
            }
        });
        if (changed) updateFormData?.({ services: next });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addons]);

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

    useEffect(() => {
        if (!location?.id || !eventDate || !eventStartTime || !eventEndTime)
            return;

        (async () => {
            setLoading(true);
            const res = await fetch(
                route("availability.all", {
                    location_id: location.id,
                    date: eventDate,
                    after: eventEndTime,
                })
            );
            const json = await res.json();

            const eventEnd = parseOnDate(eventDate, eventEndTime);
            const filtered = (json.data || [])
                .filter((s) => {
                    const slotStart = parseOnDate(eventDate, s.starts_at);
                    if (!slotStart || !eventEnd) return false;
                    return !slotStart.isBefore(eventEnd);
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

    const prettyEventDate = useMemo(
        () =>
            eventDate && dayjs(eventDate).isValid()
                ? dayjs(eventDate).format("D MMMM YYYY")
                : eventDate ?? "",
        [eventDate]
    );

    const handleSelectSlot = (slot) => {
        if (slot.spots_left === 0) return;
        setSelectedTimeId(slot.id);
        updateFormData?.({
            timeslot_id: slot.id,
            sauna_time: `${slot.starts_at} - ${slot.ends_at}`,
        });
    };

    // ---------- GUEST QTY WITH DUAL CAP (slot + event) ----------
    const rawQty = Number(event_people ?? services.people ?? 1) || 1;

    const selectedSlot = useMemo(
        () => slots.find((s) => s.id === selectedTimeId),
        [slots, selectedTimeId]
    );

    const slotRemaining =
        selectedSlot && Number.isFinite(Number(selectedSlot.spots_left))
            ? Number(selectedSlot.spots_left)
            : Infinity;

    // ✅ cap by event_capacity (from Index) AND slotRemaining (and 1..8 UI cap)
    const hardMaxGuests = useMemo(() => {
        const evCap = Number.isFinite(Number(event_capacity))
            ? Number(event_capacity)
            : Infinity;
        return Math.min(8, slotRemaining, evCap);
    }, [slotRemaining, event_capacity]);

    const guestQty = useMemo(
        () =>
            Math.max(
                1,
                Math.min(
                    rawQty,
                    Number.isFinite(hardMaxGuests) ? hardMaxGuests : 8
                )
            ),
        [rawQty, hardMaxGuests]
    );

    // auto-clamp if caps drop
    useEffect(() => {
        const next = Math.max(
            1,
            Math.min(rawQty, Number.isFinite(hardMaxGuests) ? hardMaxGuests : 8)
        );
        if (next !== rawQty) {
            updateFormData?.({
                event_people: next,
                services: { ...services, people: next },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hardMaxGuests]);

    const setGuests = (n) => {
        const max = Number.isFinite(hardMaxGuests) ? hardMaxGuests : 8;
        const next = Math.max(1, Math.min(Number(n || 1), max));
        updateFormData?.({
            event_people: next,
            services: { ...services, people: next },
        });
    };
    const incGuests = () => setGuests(guestQty + 1);
    const decGuests = () => setGuests(guestQty - 1);

    // ---------- ADD-ONS (visible only) ----------
    const getAddonUnitRand = (a) =>
        priceToRand(a.price_cents ?? a.price ?? a.amount ?? a.unit ?? 0);

    const setAddonQty = (code, qty) => {
        const next = Math.max(0, Number(qty || 0));
        updateFormData?.({ services: { ...services, [code]: next } });
    };
    const incAddon = (code) => setAddonQty(code, (services[code] || 0) + 1);
    const decAddon = (code) => setAddonQty(code, (services[code] || 0) - 1);

    // ---------- TOTALS ----------
    const eventTotalRand = useMemo(
        () => Number(eventUnitRand * guestQty),
        [eventUnitRand, guestQty]
    );

    const addonsSubtotalRand = useMemo(() => {
        return visibleAddons.reduce((sum, a) => {
            const code = a.code ?? a.slug ?? a.id;
            const qty = Number(services[code] || 0);
            if (qty <= 0) return sum;
            return sum + qty * getAddonUnitRand(a);
        }, 0);
    }, [visibleAddons, services]);

    const grandTotalRand = useMemo(
        () => eventTotalRand + addonsSubtotalRand,
        [eventTotalRand, addonsSubtotalRand]
    );

    const formatR = (n) => Number(n || 0).toFixed(2);

    const handleContinue = () => {
        const capacityOk = Number.isFinite(hardMaxGuests)
            ? guestQty <= hardMaxGuests
            : true;
        if (!selectedTimeId || !agreed || !capacityOk) return;

        const chosen = slots.find((s) => s.id === selectedTimeId);
        const timeRange = chosen
            ? `${chosen.starts_at} - ${chosen.ends_at}`
            : null;

        // invoice lines: event (includes sauna) + visible add-ons
        const lines = [
            {
                label: event_name,
                qty: guestQty,
                unit: Number(eventUnitRand),
                total: formatR(eventUnitRand * guestQty),
            },
        ];

        visibleAddons.forEach((a) => {
            const code = a.code ?? a.slug ?? a.id;
            const qty = Number(services[code] || 0);
            if (qty > 0) {
                const unit = getAddonUnitRand(a);
                lines.push({
                    label: a.name ?? code,
                    qty,
                    unit: Number(unit),
                    total: formatR(unit * qty),
                });
            }
        });

        const lineTotal = formatR(
            lines.reduce((sum, l) => sum + Number(l.total), 0)
        );

        addItem({
            kind: "event",
            event_occurrence_id,
            timeslot_id: selectedTimeId,
            location_id: location.id,
            event_name,
            location_name: location.name,
            date: eventDate,
            timeRange,
            people: guestQty,
            addons: visibleAddons.reduce((acc, a) => {
                const code = a.code ?? a.slug ?? a.id;
                const qty = Number(services[code] || 0);
                if (qty > 0) acc[code] = qty;
                return acc;
            }, {}),
            lines,
            lineTotal,
        });

        nextStep?.();
    };

    // ----- UI -----
    const capacityNote = (() => {
        const parts = [];
        if (Number.isFinite(Number(event_capacity)))
            parts.push(`event: ${event_capacity}`);
        if (Number.isFinite(Number(selectedSlot?.spots_left)))
            parts.push(`slot: ${selectedSlot.spots_left}`);
        const capMin = Number.isFinite(hardMaxGuests)
            ? `max you can book: ${hardMaxGuests}`
            : "";
        return { parts, capMin };
    })();

    const storageUrl = (path) => {
        if (!path) return null;
        if (/^https?:\/\//i.test(path)) return path;
        // ensure it points at the /storage symlink
        return "/storage/" + String(path).replace(/^\/?(storage\/)?/i, "");
    };

    const hero = storageUrl("images/fire-bg.jpg");

    return (
        <div
            className={`${styles.boxWidth} bg-cover bg-center bg-no-repeat pb-28 pt-40 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
            style={hero ? { backgroundImage: `url(${hero})` } : undefined}
        >
            <h1
                className={`${styles.h3} !text-2xl !text-black font-normal max-w-3xl`}
            >
                Add a sauna session after your{" "}
                <span className="text-hh-orange">{event_name}</span> at&nbsp;
                {location.name}
            </h1>

            <div className="grid grid-cols-3 gap-x-10 mt-10">
                {/* LEFT: slot picker */}
                <div className="col-span-2 bg-white  p-10 rounded-md shadow border-hh-orange border">
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
                    <div className="p-8 space-y-5">
                        <h4 className={`${styles.h3} font-medium text-black`}>
                            Summary
                        </h4>

                        {/* badges */}
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

                        {/* guests */}
                        <div className="border border-hh-gray p-3 rounded space-y-3">
                            <div className="flex items-center justify-between">
                                <p
                                    className={`${styles.paragraph} text-black font-medium`}
                                >
                                    Guests
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={decGuests}
                                        disabled={guestQty <= 1}
                                        className="h-8 w-8 grid place-items-center border border-hh-orange rounded text-hh-orange disabled:opacity-40"
                                        aria-label="Decrease guests"
                                    >
                                        <MinusIcon className="h-4 w-4" />
                                    </button>
                                    <span className="min-w-[2ch] text-center">
                                        {guestQty}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={incGuests}
                                        disabled={
                                            guestQty >=
                                            (Number.isFinite(hardMaxGuests)
                                                ? hardMaxGuests
                                                : 8)
                                        }
                                        className="h-8 w-8 grid place-items-center bg-hh-orange rounded text-white disabled:opacity-40"
                                        aria-label="Increase guests"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#666]">
                                    {event_name} @ R{formatR(eventUnitRand)} ea
                                </span>
                                <span className="text-hh-orange font-medium">
                                    R{formatR(eventTotalRand)}
                                </span>
                            </div>

                            {/* capacity hints */}
                            <div className="text-xs text-[#666] pt-1">
                                {Number.isFinite(hardMaxGuests) ? (
                                    <>
                                        <span className="block">
                                            Max you can book: {hardMaxGuests}
                                        </span>
                                        <span className="block">
                                            Capacity —{" "}
                                            {capacityNote.parts.join(" · ")}
                                        </span>
                                    </>
                                ) : (
                                    <span className="block">
                                        Capacity based on slot & event
                                        availability.
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* add-ons (id 8 hidden) */}
                        {visibleAddons.length > 0 && (
                            <div className="border border-hh-gray p-3 rounded space-y-3">
                                <p
                                    className={`${styles.paragraph} text-black font-medium`}
                                >
                                    Add-ons
                                </p>
                                <div className="space-y-2">
                                    {visibleAddons.map((a) => {
                                        const code = a.code ?? a.slug ?? a.id;
                                        const qty = Number(services[code] || 0);
                                        const unit = getAddonUnitRand(a);
                                        return (
                                            <div
                                                key={code}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex flex-col">
                                                    <span
                                                        className={`${styles.paragraph} text-black`}
                                                    >
                                                        {a.name ?? code}
                                                    </span>
                                                    <span className="text-xs text-[#666]">
                                                        R{formatR(unit)} ea
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            decAddon(code)
                                                        }
                                                        disabled={qty <= 0}
                                                        className="h-7 w-7 grid place-items-center border border-hh-orange rounded text-hh-orange disabled:opacity-40"
                                                        aria-label={`Decrease ${
                                                            a.name ?? code
                                                        }`}
                                                    >
                                                        <MinusIcon className="h-4 w-4" />
                                                    </button>
                                                    <span className="min-w-[2ch] text-center">
                                                        {qty}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            incAddon(code)
                                                        }
                                                        className="h-7 w-7 grid place-items-center bg-hh-orange rounded text-white"
                                                        aria-label={`Increase ${
                                                            a.name ?? code
                                                        }`}
                                                    >
                                                        <PlusIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-sm text-[#666]">
                                        Add-ons subtotal
                                    </span>
                                    <span className="text-hh-orange font-medium">
                                        R{formatR(addonsSubtotalRand)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* grand total */}
                        <div className="flex items-center justify-between border-t pt-3">
                            <p
                                className={`${styles.paragraph} text-black font-medium`}
                            >
                                Total
                            </p>
                            <p
                                className={`${styles.paragraph} text-hh-orange font-semibold`}
                            >
                                R{formatR(grandTotalRand)}
                            </p>
                        </div>

                        {/* consent + buttons */}
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

                        <div className="flex items-center gap-x-2 pt-2">
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
                                disabled={
                                    !selectedTimeId ||
                                    !agreed ||
                                    (Number.isFinite(hardMaxGuests) &&
                                        guestQty > hardMaxGuests) ||
                                    hardMaxGuests === 0
                                }
                                className={`bg-hh-orange py-1 w-full px-4 shadow text-white rounded ${
                                    (!selectedTimeId ||
                                        !agreed ||
                                        (Number.isFinite(hardMaxGuests) &&
                                            guestQty > hardMaxGuests) ||
                                        hardMaxGuests === 0) &&
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
