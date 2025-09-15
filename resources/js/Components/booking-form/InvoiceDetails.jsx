import { router } from "@inertiajs/react";
import dayjs from "dayjs";
import styles from "../../../styles";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";

export default function InvoiceDetails() {
    const { items, removeItem, clearCart, cartKey } = useCart();
    const [itemErrors, setItemErrors] = useState({}); // { [itemId]: "message" }
    const [globalError, setGlobalError] = useState(null);

    // ---------- helpers ----------
    const toAmount = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const money = (n) => toAmount(n).toFixed(2);

    /**
     * Normalize a single invoice line for display & totals.
     * - For EVENTS: l.total represents the per-ticket price (e.g. 280).
     *   We display unit = per-ticket price, and compute total = unit * qty.
     * - For SAUNAS: keep existing meaning (unit & total already correct).
     */
    const normalizeLine = (kind, l) => {
        const qty = toAmount(l.qty) || 0;

        if (kind === "event") {
            // Use unit if present; otherwise derive from total/qty.
            const unitFromUnit = toAmount(l.unit);
            const unit =
                unitFromUnit > 0
                    ? unitFromUnit
                    : qty > 0
                    ? toAmount(l.total) / qty
                    : toAmount(l.total);
            const total = unit * qty;
            return {
                label: l.label,
                qty,
                unit,
                total,
            };
        }

        // Sauna / default behaviour
        const unit = toAmount(l.unit);
        const total = toAmount(l.total) || unit * qty;
        return {
            label: l.label,
            qty,
            unit,
            total,
        };
    };

    // Prefer summing normalized line totals (always fresh). If an item has no lines, fall back.
    const calcItemTotal = (it) => {
        const lines = it?.lines ?? [];
        if (lines.length) {
            return lines
                .map((l) => normalizeLine(it.kind, l).total)
                .reduce((s, n) => s + toAmount(n), 0);
        }
        return toAmount(it?.lineTotal);
    };

    // keep itemErrors in sync if user removes an item
    useEffect(() => {
        setItemErrors((prev) => {
            const alive = new Set(items.map((i) => i.id));
            return Object.fromEntries(
                Object.entries(prev).filter(([id]) => alive.has(id))
            );
        });
    }, [items]);

    // ---- compute values BEFORE any early return (no hooks below) ----
    const invoiceDate = dayjs().format("D MMMM YYYY");
    const grandTotal = items.reduce((t, it) => t + calcItemTotal(it), 0);

    if (!items.length) {
        const startFreshBooking = () => {
            try {
                localStorage.removeItem("hh_step");
                localStorage.removeItem("hh_form");
            } catch {}
            router.visit(route("index"), { replace: true });
        };

        return (
            <div className={`${styles.boxWidth} py-10 sm:py-20 px-2 sm:px-4 text-center`}>
                <p className={`${styles.paragraph} !text-base sm:!text-lg mb-4`}>Your cart is empty.</p>
                <button
                    onClick={startFreshBooking}
                    className="bg-hh-orange text-white px-6 py-3 rounded font-medium touch-manipulation"
                >
                    <span className={`${styles.paragraph} !text-sm sm:!text-base`}>
                        Start a booking
                    </span>
                </button>
            </div>
        );
    }

    const proceedToPayment = () => {
        setGlobalError(null);
        setItemErrors({});

        // Build payload (include client_id so server can echo it back)
        const payloadItems = items.map((it) => {
            // Convert addons object { code: qty } -> [{ code, qty }]
            const addonsObj = it.addons ?? {};
            const addonsArr = Object.entries(addonsObj)
                .map(([code, qty]) => ({ code, qty: Number(qty) }))
                .filter((a) => a.qty > 0);

            return {
                client_id: it.id,
                kind: it.kind, // 'sauna' | 'event'
                timeslot_id: it.timeslot_id,
                event_occurrence_id:
                    it.kind === "event" ? it.event_occurrence_id : null,
                people: it.people,
                addons: addonsArr,
            };
        });

        // Lookup maps for fallback mapping if server didn't echo client_id
        const slotIdToItemId = {};
        const eventIdToItemId = {};
        items.forEach((it) => {
            if (it.kind === "sauna" && it.timeslot_id) {
                slotIdToItemId[it.timeslot_id] = it.id;
            } else if (it.kind === "event" && it.event_occurrence_id) {
                eventIdToItemId[it.event_occurrence_id] = it.id;
            }
        });

        // 1) Preflight via Inertia (no navigation)
        router.post(
            route("bookings.preflight"),
            { cart_key: cartKey, items: payloadItems },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true, // don't add a history entry
                onSuccess: (page) => {
                    const preflight =
                        page?.props?.preflight ?? page?.props?.flash?.preflight;

                    if (!preflight) {
                        setGlobalError(
                            "Could not verify availability right now. Please try again."
                        );
                        return;
                    }

                    if (preflight.ok) {
                        // 2) Holds + checkout
                        router.post(
                            route("bookings.store"),
                            { cart_key: cartKey, items: payloadItems },
                            {
                                onSuccess: () => {
                                    clearCart({ rekey: true });
                                    try {
                                        localStorage.removeItem("hh_step");
                                        localStorage.removeItem("hh_form");
                                    } catch {}
                                },
                            }
                        );
                        return;
                    }

                    // Map per-item errors to UI
                    const mapped = {};
                    (preflight.errors || []).forEach((e) => {
                        // { client_id?: string, type: 'slot'|'event', id, requested, available, reason? }
                        const itemId =
                            e.client_id ??
                            (e.type === "slot"
                                ? slotIdToItemId[e.id]
                                : eventIdToItemId[e.id]);

                        const msg =
                            e.type === "slot"
                                ? `This slot is full (need ${e.requested}, only ${e.available} left).`
                                : e.reason === "inactive"
                                ? `This event is no longer bookable.`
                                : e.reason === "not_found"
                                ? `This event no longer exists.`
                                : `This event is full (need ${e.requested}, only ${e.available} left).`;

                        if (itemId) {
                            mapped[itemId] = mapped[itemId]
                                ? `${mapped[itemId]} ${msg}`
                                : msg;
                        }
                    });

                    if (!Object.keys(mapped).length) {
                        setGlobalError(
                            "Some items are no longer available. Please review your cart."
                        );
                    }
                    setItemErrors(mapped);
                },
                onError: () => {
                    setGlobalError(
                        "Could not verify availability right now. Please try again."
                    );
                },
            }
        );
    };

    const bookAnother = () => {
        try {
            localStorage.removeItem("hh_step");
            localStorage.removeItem("hh_form");
        } catch {}
        router.visit(route("index"), { replace: true });
    };

    const storageUrl = (path) => {
        if (!path) return null;
        if (/^https?:\/\//i.test(path)) return path;
        // ensure it points at the /storage symlink
        return "/storage/" + String(path).replace(/^\/?(storage\/)?/i, "");
    };

    const hero = storageUrl("images/tub-bg.jpg");

    return (
        <div
            className={`${styles.boxWidth} bg-cover bg-center bg-no-repeat pb-10 sm:pb-28 pt-20 sm:pt-40 px-2 sm:px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
            style={hero ? { backgroundImage: `url(${hero})` } : undefined}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-x-8">
                {/* LEFT: summary */}
                <div className="col-span-1 lg:col-span-2 border border-hh-orange rounded-md shadow bg-white/95 p-4 sm:p-6">
                    <h1 className={`${styles.h2} !text-xl sm:!text-2xl lg:!text-3xl text-hh-orange font-medium`}>
                        Order summary
                    </h1>
                    <p className={`${styles.paragraph} !text-sm sm:!text-base text-black/60 mb-4`}>
                        {invoiceDate}
                    </p>

                    {globalError && (
                        <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded">
                            {globalError}
                        </div>
                    )}

                    {items.map((it) => {
                        const err = itemErrors[it.id];
                        const lines = (it.lines ?? []).map((l) =>
                            normalizeLine(it.kind, l)
                        );

                        return (
                            <div
                                key={it.id}
                                className={`mb-6 sm:mb-8 rounded p-3 sm:p-4 border shadow ${
                                    err ? "border-red-500" : "border-hh-gray"
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2 sm:gap-0">
                                    <div className="flex-1">
                                        <p
                                            className={`${styles.h3} !text-base sm:!text-lg lg:!text-xl text-black font-medium`}
                                        >
                                            {it.kind === "event"
                                                ? it.event_name
                                                : "Single sauna session"}
                                        </p>
                                        <p
                                            className={`${styles.paragraph} !text-xs sm:!text-sm text-black/60`}
                                        >
                                            {it.location_name} • {it.date}{" "}
                                            {it.timeRange
                                                ? `• ${it.timeRange}`
                                                : ""}
                                        </p>
                                    </div>
                                    <button
                                        className="text-xs sm:text-sm text-red-600 underline self-start sm:self-center touch-manipulation"
                                        onClick={() => removeItem(it.id)}
                                    >
                                        Remove
                                    </button>
                                </div>

                                {err && (
                                    <div className="mb-3 p-2 border border-red-300 bg-red-50 text-red-700 rounded">
                                        {err}
                                    </div>
                                )}

                                <div className="hidden sm:grid grid-cols-8 gap-y-1">
                                    <Header />
                                    {lines.map((l, idx) => (
                                        <Line
                                            key={idx}
                                            item={l.label}
                                            qty={l.qty}
                                            unit={l.unit}
                                            total={l.total}
                                        />
                                    ))}
                                </div>
                                
                                {/* Mobile layout */}
                                <div className="sm:hidden space-y-2">
                                    {lines.map((l, idx) => (
                                        <MobileLine
                                            key={idx}
                                            item={l.label}
                                            qty={l.qty}
                                            unit={l.unit}
                                            total={l.total}
                                        />
                                    ))}
                                </div>

                                <div className="hidden sm:grid grid-cols-8 bg-[#F5F5F5] rounded py-2 mt-4">
                                    <div className="col-span-5" />
                                    <p
                                        className={`${styles.paragraph} col-span-2 text-right text-black/50`}
                                    >
                                        Item total:
                                    </p>
                                    <p
                                        className={`${styles.paragraph} col-span-1 text-black`}
                                    >
                                        R{money(calcItemTotal(it))}
                                    </p>
                                </div>
                                
                                {/* Mobile item total */}
                                <div className="sm:hidden flex justify-between items-center bg-[#F5F5F5] rounded py-3 px-3 mt-3">
                                    <p className={`${styles.paragraph} !text-sm text-black/50`}>
                                        Item total:
                                    </p>
                                    <p className={`${styles.paragraph} !text-sm font-medium text-black`}>
                                        R{money(calcItemTotal(it))}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {/* Grand total - Desktop */}
                    <div className="hidden sm:grid grid-cols-8 bg-[#F5F5F5] rounded py-4">
                        <div className="col-span-5" />
                        <p
                            className={`${styles.paragraph} col-span-2 text-right text-black/50`}
                        >
                            Total Amount:
                        </p>
                        <p
                            className={`${styles.paragraph} col-span-1 text-black`}
                        >
                            R{money(grandTotal)}
                        </p>
                    </div>
                    
                    {/* Grand total - Mobile */}
                    <div className="sm:hidden flex justify-between items-center bg-[#F5F5F5] rounded py-4 px-4">
                        <p className={`${styles.paragraph} !text-base font-medium text-black/50`}>
                            Total Amount:
                        </p>
                        <p className={`${styles.paragraph} !text-lg font-semibold text-black`}>
                            R{money(grandTotal)}
                        </p>
                    </div>
                </div>

                {/* RIGHT: actions */}
                <div className="col-span-1">
                    <div className="space-y-3 sm:space-y-2 mt-4 sm:mt-6">
                        <button
                            onClick={proceedToPayment}
                            className="shadow border border-hh-orange w-full py-3 sm:py-2 text-white bg-hh-orange rounded font-medium touch-manipulation"
                        >
                            <span className={`${styles.paragraph} !text-sm sm:!text-base font-medium`}>
                                Proceed to payment
                            </span>
                        </button>

                        <button
                            onClick={bookAnother}
                            className="bg-black shadow w-full py-3 sm:py-2 text-white rounded font-medium touch-manipulation"
                        >
                            <span className={`${styles.paragraph} !text-sm sm:!text-base font-medium`}>
                                Book another service
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Header = () => (
    <>
        <p className={`${styles.paragraph} col-span-3 text-sm text-black/50`}>
            Item
        </p>
        <p className={`${styles.paragraph} col-span-2 text-sm text-black/50`}>
            Quantity
        </p>
        <p className={`${styles.paragraph} col-span-2 text-sm text-black/50`}>
            Amount
        </p>
        <p className={`${styles.paragraph} col-span-1 text-sm text-black/50`}>
            Total
        </p>
    </>
);

const MobileLine = ({ item, qty, unit, total }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <div className="flex-1">
            <p className={`${styles.paragraph} !text-sm text-black font-medium`}>
                {item}
            </p>
            <p className={`${styles.paragraph} !text-xs text-black/50`}>
                {Number(qty)} × R{Number(unit).toFixed(2)}
            </p>
        </div>
        <p className={`${styles.paragraph} !text-sm text-black font-medium`}>
            R{Number(total).toFixed(2)}
        </p>
    </div>
);

const Line = ({ item, qty, unit, total }) => (
    <>
        <p className={`${styles.paragraph} col-span-3 text-sm text-black`}>
            {item}
        </p>
        <p className={`${styles.paragraph} col-span-2 text-sm text-black/50`}>
            {Number(qty)}
        </p>
        <p className={`${styles.paragraph} col-span-2 text-sm text-black/50`}>
            R{Number(unit).toFixed(2)}
        </p>
        <p className={`${styles.paragraph} col-span-1 text-sm text-black`}>
            R{Number(total).toFixed(2)}
        </p>
    </>
);
