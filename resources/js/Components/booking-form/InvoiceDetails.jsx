import { router, usePage } from "@inertiajs/react";
import dayjs from "dayjs";
import styles from "../../../styles";
import { useCart } from "@/context/CartContext";
import { useState, useEffect, useMemo } from "react";

export default function InvoiceDetails({ isReschedule = false }) {
    const { items, removeItem, clearCart, cartKey } = useCart();
    const { props } = usePage();
    const user = props.auth?.user;

    const [itemErrors, setItemErrors] = useState({}); // { [itemId]: "message" }
    const [globalError, setGlobalError] = useState(null);
    const [agreed, setAgreed] = useState(false);
    const [memberEligibility, setMemberEligibility] = useState(null); // { has_membership: bool, eligible_dates: {date: bool} }
    const [checkingEligibility, setCheckingEligibility] = useState(false);

    // ---------- COUPON STATE ----------
    const [coupon, setCoupon] = useState("");
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponMsg, setCouponMsg] = useState(null);
    const [couponErr, setCouponErr] = useState(null);
    const couponBusy = false; // kept simple; set true/false if you want loading states
    const [grandTotalAfterVoucher, setGrandTotalAfterVoucher] = useState(null);

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
            const unitFromUnit = toAmount(l.unit);
            const unit =
                unitFromUnit > 0
                    ? unitFromUnit
                    : qty > 0
                    ? toAmount(l.total) / qty
                    : toAmount(l.total);
            const total = unit * qty;
            return { label: l.label, qty, unit, total };
        }

        const unit = toAmount(l.unit);
        const total = toAmount(l.total) || unit * qty;
        return { label: l.label, qty, unit, total };
    };

    const calcItemTotal = (it) => {
        const lines = it?.lines ?? [];
        if (lines.length) {
            return lines
                .map((l) => normalizeLine(it.kind, l).total)
                .reduce((s, n) => s + toAmount(n), 0);
        }
        return toAmount(it?.lineTotal);
    };

    // ---------- COUPON: Note - actual discount is applied server-side ----------
    // We don't show an estimated discount here because the backend handles
    // the full coupon value calculation. The discount will be applied at checkout.

    // keep itemErrors in sync if user removes an item
    useEffect(() => {
        setItemErrors((prev) => {
            const alive = new Set(items.map((i) => i.id));
            return Object.fromEntries(
                Object.entries(prev).filter(([id]) => alive.has(id))
            );
        });
    }, [items]);

    // Check member eligibility when cart items change
    useEffect(() => {
        console.log('[Member Eligibility Check] Starting', {
            has_active_membership: user?.has_active_membership,
            items_count: items.length,
            items: items.map(i => ({ id: i.id, date: i.date, kind: i.kind }))
        });

        if (!user?.has_active_membership || items.length === 0) {
            console.log('[Member Eligibility Check] Skipping - no membership or no items');
            setMemberEligibility(null);
            return;
        }

        // Extract unique dates from cart items
        const dates = [...new Set(items.map(item => item.date).filter(Boolean))];
        
        console.log('[Member Eligibility Check] Extracted dates:', dates);
        
        if (dates.length === 0) {
            console.log('[Member Eligibility Check] No valid dates found');
            setMemberEligibility(null);
            setCheckingEligibility(false);
            return;
        }

        // Check eligibility for these dates using fetch instead of Inertia router
        setCheckingEligibility(true);
        console.log('[Member Eligibility Check] Calling API...', route('bookings.checkMemberEligibility'));

        const params = new URLSearchParams();
        dates.forEach(date => params.append('dates[]', date));
        
        fetch(`${route('bookings.checkMemberEligibility')}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin', // Include cookies/session
        })
            .then(response => {
                console.log('[Member Eligibility Check] Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('[Member Eligibility Check] Response data:', data);
                setMemberEligibility(data);
                setCheckingEligibility(false);
            })
            .catch(error => {
                console.error('[Member Eligibility Check] Error:', error);
                setMemberEligibility(null);
                setCheckingEligibility(false);
            });
    }, [items, user?.has_active_membership]);

    // ---- compute values BEFORE any early return (no hooks below) ----
    const invoiceDate = dayjs().format("D MMMM YYYY");
    const grandTotal = items.reduce((t, it) => t + calcItemTotal(it), 0);
    
    // Calculate member discount based on actual eligibility from backend
    // Members get ONE free booking (per-person price) for the first booking of each day
    // This is an ESTIMATE for display - backend enforces the actual rules
    const memberDiscount = (() => {
        console.log('[Member Discount] Calculating', {
            has_membership: user?.has_active_membership,
            couponApplied,
            items_count: items.length,
            memberEligibility,
            checkingEligibility,
        });

        if (!user?.has_active_membership || couponApplied || items.length === 0) {
            console.log('[Member Discount] Not eligible - returning 0');
            return 0;
        }

        const eligibleDates = memberEligibility?.eligible_dates;
        if (!memberEligibility?.has_membership || !eligibleDates) {
            console.log('[Member Discount] Waiting for API response - no discount shown yet');
            return 0;
        }

        const usedDates = new Set();
        let runningDiscount = 0;

        items.forEach((item) => {
            const itemDate = item.date;
            const isEligible = itemDate && eligibleDates[itemDate] === true;
            const alreadyUsed = itemDate ? usedDates.has(itemDate) : false;

            console.log('[Member Discount] Checking item', {
                item_id: item.id,
                item_date: itemDate,
                is_eligible: isEligible,
                already_used_for_date: alreadyUsed,
            });

            if (!isEligible || alreadyUsed) {
                return;
            }

            const lines = item?.lines ?? [];
            let perPersonPrice = 0;

            if (lines.length > 0) {
                const firstLine = normalizeLine(item.kind, lines[0]);
                perPersonPrice = firstLine.unit;
            } else {
                perPersonPrice = calcItemTotal(item);
            }

            const remainingTotal = Math.max(0, grandTotal - runningDiscount);
            const discount = Math.min(perPersonPrice, remainingTotal);

            if (discount > 0) {
                runningDiscount += discount;
                usedDates.add(itemDate);
                console.log('[Member Discount] Applied to item', {
                    item_id: item.id,
                    item_date: itemDate,
                    perPersonPrice,
                    discount,
                    runningDiscount,
                });
            }
        });

        console.log('[Member Discount] Total discount', { total: runningDiscount });
        return runningDiscount;
    })();
    
    // Calculate effective total after all discounts
    let effectiveTotal = grandTotal - memberDiscount;
    if (grandTotalAfterVoucher !== null) {
        effectiveTotal = grandTotalAfterVoucher;
    }
    
    const isMemberFreeBooking = memberDiscount > 0 && effectiveTotal === 0;
    
    console.log('[Cart Display] Final totals:', {
        grandTotal,
        memberDiscount,
        effectiveTotal,
        isMemberFreeBooking,
        buttonText: isMemberFreeBooking ? 'Confirm Booking' : 'Proceed to payment'
    });
    
    // Note: Actual coupon discount is applied server-side at checkout

    if (!items.length) {
        const startFreshBooking = () => {
            try {
                localStorage.removeItem("hh_step");
                localStorage.removeItem("hh_form");
            } catch {}
            router.visit(route("index"), { replace: true });
        };

        const storageUrl = (path) => {
            if (!path) return null;
            if (/^https?:\/\//i.test(path)) return path;
            return "/storage/" + String(path).replace(/^\/?(storage\/)?/i, "");
        };

        const hero = storageUrl("images/tub-bg.jpg");

        return (
            <div
                className={`${styles.boxWidth} bg-cover bg-center bg-no-repeat pb-10 sm:pb-28 pt-20 sm:pt-40 px-2 sm:px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20 min-h-screen flex items-center justify-center`}
                style={hero ? { backgroundImage: `url(${hero})` } : undefined}
            >
                <div className="border border-hh-orange rounded-md shadow bg-white/95 p-8 sm:p-12 max-w-md w-full text-center">
                    <div className="mb-6">
                        <svg className="h-16 w-16 text-hh-orange mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h1
                        className={`${styles.h2} !text-2xl sm:!text-3xl text-hh-orange font-medium mb-4`}
                    >
                        Your cart is empty
                    </h1>
                    <p
                        className={`${styles.paragraph} !text-base sm:!text-lg text-black/70 mb-8`}
                    >
                        Looks like you haven't added any bookings yet. Start your journey with us!
                    </p>
                    <button
                        onClick={startFreshBooking}
                        className="bg-hh-orange text-white px-8 py-3 rounded-lg font-medium touch-manipulation hover:bg-orange-600 transition-colors shadow-lg"
                    >
                        <span
                            className={`${styles.paragraph} !text-base sm:!text-lg`}
                        >
                            Start a booking
                        </span>
                    </button>
                </div>
            </div>
        );
    }

    // ---------- COUPON: actions ----------
    const applyCoupon = () => {
        setCouponErr(null);
        setCouponMsg(null);

        const code = String(coupon || "")
            .trim()
            .toUpperCase();
        if (!code) {
            setCouponErr("Please enter a code.");
            return;
        }
        if (!cartKey) {
            setCouponErr("Cart not found. Please refresh and try again.");
            return;
        }

        console.log("Applying coupon", { code, cartKey });

        router.post(
            route("coupons.apply"),
            { code, cart_key: cartKey, items: items.map(it => ({ id: it.id, kind: it.kind, lines: it.lines, lineTotal: it.lineTotal })) },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onSuccess: (page) => {
                    // Standard Inertia flash/error handling
                    const flash = page.props.flash || {};
                    const errors = page.props.errors || {};
                
                    if (errors.code) {
                        setCouponErr(errors.code);
                        setCouponApplied(false);
                        setGrandTotalAfterVoucher(null);
                        return;
                    }
                
                    // Use coupon_applied for detailed data - check both flash and props
                    const couponData = page.props.flash?.coupon_applied || page.props.coupon_applied;
                    const finalTotalCentsFallback = page.props.flash?.coupon_final_total_cents ?? page.props.coupon_final_total_cents ?? null;
                
                    console.log('[Coupon Apply] Response data:', {
                        couponData,
                        flash,
                        flashCouponApplied: page.props.flash?.coupon_applied,
                        propsCouponApplied: page.props.coupon_applied,
                        grandTotal,
                        page: page.props
                    });
                
                    if (couponData && couponData.success) {
                        setCouponApplied(true);
                        setCouponMsg(couponData.message || "Coupon applied!");
                
                        // Ensure final_total_cents is a number before setting state
                        const finalTotal = Number(couponData.final_total_cents);
                        console.log('[Coupon Apply] Final total calculation:', {
                            final_total_cents: couponData.final_total_cents,
                            finalTotal,
                            divided: finalTotal / 100
                        });
                        
                        if (!isNaN(finalTotal)) {
                            setGrandTotalAfterVoucher(finalTotal / 100);
                        } else {
                            // Fallback or error if final_total_cents is not valid
                            setGrandTotalAfterVoucher(null);
                        }
                    } else if (finalTotalCentsFallback !== null && !isNaN(Number(finalTotalCentsFallback))) {
                        // Fallback: server provided only a numeric final total in cents
                        setCouponApplied(true);
                        setGrandTotalAfterVoucher(Number(finalTotalCentsFallback) / 100);
                    } else if (flash.success) {
                        // Fallback for generic success flash
                        setCouponApplied(true);
                        setCouponMsg(flash.success);
                        // No server-provided total; hide estimate rather than guessing
                        setGrandTotalAfterVoucher(null);
                    } else {
                        // Handle cases where there's no error but no success data either
                        setCouponApplied(true);
                        setCouponMsg("Coupon applied.");
                        setGrandTotalAfterVoucher(null);
                    }
                },
                onError: (errors) => {
                    setCouponErr(
                        errors?.code || "Could not apply this code right now."
                    );
                    setCouponApplied(false);
                    setGrandTotalAfterVoucher(null);
                },
            }
        );
    };

    const removeCoupon = () => {
        setCouponErr(null);
        setCouponMsg(null);

        if (!cartKey) {
            setCouponErr("Cart not found. Please refresh and try again.");
            return;
        }

        router.post(
            route("coupons.remove"),
            { cart_key: cartKey },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            onSuccess: (page) => {
                const flash = page?.props?.flash || {};
                if (flash?.success) setCouponMsg(flash.success);
                setCouponApplied(false);
                setGrandTotalAfterVoucher(null);
            },
            onError: () => {
                setCouponErr("Could not remove the code right now.");
            },
        });
    };

    const proceedToPayment = () => {
        if (!agreed) {
            setGlobalError("Please agree to the Terms of Use and Privacy Policy before proceeding.");
            return;
        }
        
        setGlobalError(null);
        setItemErrors({});

        const toInt = (v, d = 0) => {
            const n = Number.parseInt(String(v), 10);
            return Number.isFinite(n) ? n : d;
        };

        function extractAddons(it) {
            // Case A: already an array of addon objects
            if (Array.isArray(it.addons)) {
                return it.addons
                    .map((a) => ({
                        code: a.code ?? a.id ?? a.sku ?? null,
                        qty: toInt(a.qty ?? a.quantity ?? 1),
                    }))
                    .filter((a) => a.code && a.qty > 0);
            }

            // Case B: legacy object map { CODE: qty }
            if (it.addons && typeof it.addons === "object") {
                return Object.entries(it.addons)
                    .map(([code, qty]) => ({ code, qty: toInt(qty, 0) }))
                    .filter((a) => a.code && a.qty > 0);
            }

            // Case C: derive from line items if addons only live there
            const lineAddons = (it.lines ?? []).filter((l) => {
                const code = l.code || "";
                return l.isAddon === true || /^ADDON_/.test(code);
            });

            return lineAddons
                .map((l) => ({ code: l.code, qty: toInt(l.qty ?? 1) }))
                .filter((a) => a.code && a.qty > 0);
        }

        const payloadItems = items.map((it) => {
            const addonsArr = extractAddons(it);
            console.log("payload addons →", addonsArr); // sanity check
            return {
                client_id: it.id,
                kind: it.kind, // 'sauna' | 'event'
                timeslot_id: it.timeslot_id,
                event_occurrence_id:
                    it.kind === "event" ? it.event_occurrence_id : null,
                people: it.people,
                addons: addonsArr, // <-- now correctly populated
            };
        });

        const slotIdToItemId = {};
        const eventIdToItemId = {};
        items.forEach((it) => {
            if (it.kind === "sauna" && it.timeslot_id) {
                slotIdToItemId[it.timeslot_id] = it.id;
            } else if (it.kind === "event" && it.event_occurrence_id) {
                eventIdToItemId[it.event_occurrence_id] = it.id;
            }
        });

        console.log("payloadItems", payloadItems);

        // 1) Preflight via Inertia (no navigation)
        router.post(
            route("bookings.preflight"),
            { cart_key: cartKey, items: payloadItems },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
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
                        console.log('[CHECKOUT] Proceeding to bookings.store', {
                            cart_key: cartKey,
                            items: payloadItems,
                            memberDiscount,
                            effectiveTotal,
                            isMemberFreeBooking
                        });
                        router.post(route("bookings.store"), { cart_key: cartKey, items: payloadItems });
                        return;
                    }

                    //             // Map per-item errors to UI
                    const mapped = {};
                    (preflight.errors || []).forEach((e) => {
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
                    <h1
                        className={`${styles.h2} !text-xl sm:!text-2xl lg:!text-3xl text-hh-orange font-medium`}
                    >
                        Order summary
                    </h1>
                    <p
                        className={`${styles.paragraph} !text-sm sm:!text-base text-black/60 mb-4`}
                    >
                        {invoiceDate}
                    </p>

                    {/* Reschedule Notification Banner */}
                    {isReschedule && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-r">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-amber-800 font-medium">
                                    You are rescheduling your booking. Please review the new details below.
                                </p>
                            </div>
                        </div>
                    )}

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
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        Item total:&nbsp;
                                    </p>
                                    <p
                                        className={`${styles.paragraph} !text-sm font-medium text-black`}
                                    >
                                        R{money(calcItemTotal(it))}
                                    </p>
                                </div>
                            </div>
                        );
                    })} 

                    {/* Grand total - Desktop */}
                    <div className="hidden sm:grid grid-cols-12 mt-6">
                        <div className="col-span-7" />
                        <p className={`${styles.paragraph} !text-sm col-span-3 text-right text-black/50`}>
                            Total Amount
                        </p>
                        <p className={`${styles.paragraph} !text-sm col-span-2 text-black font-medium text-right`}>
                            R{money(grandTotal)}
                        </p>
                    </div>

                    {memberDiscount > 0 && !couponApplied && (
                        <div className="hidden sm:grid grid-cols-12 mt-2">
                            <div className="col-span-7" />
                            <p className={`${styles.paragraph} !text-sm col-span-3 text-right text-black/50`}>
                                Member Discount
                            </p>
                            <p className={`${styles.paragraph} !text-sm col-span-2 text-black text-right`}>
                                - R{money(memberDiscount)}
                            </p>
                        </div>
                    )}

                    {couponApplied && (
                        <div className="hidden sm:grid grid-cols-12 mt-2">
                            <div className="col-span-7" />
                            <p className={`${styles.paragraph} !text-sm col-span-3 text-right text-black/50`}>
                                Voucher Applied
                            </p>
                            <p className={`${styles.paragraph} !text-sm col-span-2 text-black text-right`}>
                                {grandTotalAfterVoucher !== null
                                    ? `- R${money(Math.max(0, grandTotal - grandTotalAfterVoucher))}`
                                    : 'Applied'}
                            </p>
                        </div>
                    )}

                    {(memberDiscount > 0 || (couponApplied && grandTotalAfterVoucher !== null)) && (
                        <div className="hidden sm:grid grid-cols-12 mt-2">
                            <div className="col-span-7" />
                            <p className={`${styles.paragraph} !text-sm col-span-3 text-right text-green-700 font-medium`}>
                                Total Payable
                            </p>
                            <p className={`${styles.paragraph} !text-sm col-span-2 text-green-700 font-bold text-right`}>
                                R{money(effectiveTotal)}
                            </p>
                        </div>
                    )}

                    {/* Grand total - Mobile */}
                    <div className="sm:hidden flex justify-between items-center mt-6">
                        <p className={`${styles.paragraph} !text-sm text-black/50`}>
                            Total Amount
                        </p>
                        <p className={`${styles.paragraph} !text-base text-black font-medium`}>
                            R{money(grandTotal)}
                        </p>
                    </div>

                    {memberDiscount > 0 && !couponApplied && (
                        <div className="sm:hidden flex justify-between items-center mt-2">
                            <p className={`${styles.paragraph} !text-sm text-black/50`}>
                                Member Discount
                            </p>
                            <p className={`${styles.paragraph} !text-sm text-black`}>
                                - R{money(memberDiscount)}
                            </p>
                        </div>
                    )}

                    {couponApplied && (
                        <div className="sm:hidden flex justify-between items-center mt-2">
                            <p className={`${styles.paragraph} !text-sm text-black/50`}>
                                Voucher Applied
                            </p>
                            <p className={`${styles.paragraph} !text-sm text-black`}>
                                {grandTotalAfterVoucher !== null
                                    ? `- R${money(Math.max(0, grandTotal - grandTotalAfterVoucher))}`
                                    : 'Applied'}
                            </p>
                        </div>
                    )}

                    {(memberDiscount > 0 || (couponApplied && grandTotalAfterVoucher !== null)) && (
                        <div className="sm:hidden flex justify-between items-center mt-2">
                            <p className={`${styles.paragraph} !text-sm text-green-700 font-medium`}>
                                Total Payable
                            </p>
                            <p className={`${styles.paragraph} !text-base text-green-700 font-bold`}>
                                R{money(effectiveTotal)}
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT: actions */}
                <div className="col-span-1">
                    <div className="space-y-3 sm:space-y-2 mt-4 sm:mt-6">
                        {/* Member Free Booking Banner */}
                        {memberDiscount > 0 && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r">
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-green-800 font-medium">
                                            Member Benefit Applied
                                        </p>
                                        <p className="text-xs text-green-700 mt-1">
                                            Your first booking today is free as part of your membership.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* COUPON BOX */}
                        <div className="mt-2 mb-4 p-4 bg-white border rounded shadow">
                            <p
                                className={`${styles.paragraph} text-black font-medium mb-2`}
                            >
                                Have a coupon?
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={coupon}
                                    onChange={(e) => setCoupon(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") applyCoupon();
                                    }}
                                    placeholder="Enter code"
                                    className="flex-1 border rounded px-3 py-2"
                                    disabled={couponApplied || memberDiscount > 0}
                                />
                                {!couponApplied ? (
                                    <button
                                        onClick={applyCoupon}
                                        disabled={couponBusy}
                                        className="px-3 py-2 rounded bg-hh-orange text-white border border-hh-orange"
                                    >
                                        Apply
                                    </button>
                                ) : (
                                    <button
                                        onClick={removeCoupon}
                                        className="px-3 py-2 rounded border text-black bg-white"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            {couponErr && (
                                <p className="text-sm text-red-600 mt-2">
                                    {String(couponErr)}
                                </p>
                            )}
                            {couponMsg && !couponErr && (
                                <p className="text-sm text-green-700 mt-2">
                                    {String(couponMsg)}
                                </p>
                            )}
                            {couponApplied && !couponErr && (
                                <p className="text-xs text-black/60 mt-1">
                                    Your voucher discount will be applied at checkout.
                                    The final amount will be calculated based on your voucher balance.
                                </p>
                            )}
                            {memberDiscount > 0 && !couponApplied && (
                                <p className="text-xs text-black/60 mt-1">
                                    Coupon codes cannot be combined with member discounts.
                                </p>
                            )}
                        </div>

                        {/* Agreement Checkbox */}
                            <div className="bg-white border rounded shadow p-4 mt-4">
                                <div className="flex items-start gap-x-3">
                                    <input
                                        type="checkbox"
                                        id="consent"
                                        name="consent"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="h-4 w-4 mt-0.5 text-hh-orange ring-white border-hh-orange ring focus:ring-hh-orange rounded bg-white shrink-0 cursor-pointer"
                                    />
                                    <label
                                        htmlFor="consent"
                                        className={`${styles.paragraph} !text-xs sm:!text-sm text-black/60`}
                                    >
                                        I agree that I have read and accepted the{" "}
                                        <a href="/terms" target="_blank" className="!text-xs sm:!text-sm text-hh-orange underline hover:text-orange-600">
                                            Terms of Use
                                        </a>
                                        {" "}and{" "}
                                        <a href="/privacy" target="_blank" className="!text-xs sm:!text-sm text-hh-orange underline hover:text-orange-600">
                                            Privacy Policy
                                        </a>
                                    </label>
                                </div>
                            </div>

                        <div className="space-y-2">
                            <button
                                onClick={bookAnother}
                                className="bg-black shadow w-full py-3 sm:py-2 text-white rounded font-medium touch-manipulation"
                            >
                                <span
                                    className={`${styles.paragraph} !text-sm sm:!text-base font-medium`}
                                >
                                    Book another service
                                </span>
                            </button>
                        
                            
                            <button
                                onClick={proceedToPayment}
                                disabled={!agreed}
                                className={`shadow border w-full py-3 sm:py-2 rounded font-medium touch-manipulation ${
                                    !agreed
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300"
                                        : "bg-hh-orange text-white border-hh-orange hover:bg-orange-600"
                                }`}
                            >
                                <span
                                    className={`${styles.paragraph} !text-sm sm:!text-base font-medium`}
                                >
                                    {isReschedule 
                                        ? 'Reschedule Booking' 
                                        : isMemberFreeBooking 
                                        ? 'Confirm Booking' 
                                        : 'Proceed to payment'}
                                </span>
                            </button>
                        </div>
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
            <p
                className={`${styles.paragraph} !text-sm text-black font-medium`}
            >
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
