// TodayBubbles.jsx
import React, { useState, useMemo, useEffect } from "react";
import { router } from "@inertiajs/react";

function ConfirmUpdateDialog({
    open,
    onCancel,
    onConfirm,
    value,
    setValue,
    saving,
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-4">
                <h3 className="font-semibold text-sm mb-2">Confirm update</h3>
                <p className="text-xs text-gray-600 mb-3">
                    Please enter the payment method used for this update (e.g.
                    Cash, Card, EFT, Voucher).
                </p>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Cash / Card / EFT …"
                    className="w-full border rounded p-2 text-sm mb-4"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1 text-xs bg-gray-200 rounded"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(value.trim())}
                        disabled={saving || !value.trim()}
                        className="px-3 py-1 text-xs bg-hh-orange text-white rounded disabled:opacity-50"
                    >
                        {saving ? "Saving…" : "Confirm & Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function EditBookingModal({
    open,
    onClose,
    booking,
    slot,
    addonServices,
    bookedInSlot,
}) {
    const [saving, setSaving] = useState(false);
    const [people, setPeople] = useState(booking?.people ?? 1);
    const [paymentMethod, setPaymentMethod] = useState(
        booking?.payment_method ?? ""
    );
    const [bookingType, setBookingType] = useState(booking?.booking_type ?? "");
    const [noShow, setNoShow] = useState(booking?.no_show ?? false);
    const [services, setServices] = useState(() => {
        const map = new Map();
        booking?.services?.forEach((s) => map.set(s.id, s.quantity));
        return map;
    });

    // NEW: confirmation state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [updatedVia, setUpdatedVia] = useState("");

    useEffect(() => {
        if (open) {
            setPeople(booking?.people ?? 1);
            setPaymentMethod(booking?.payment_method ?? "");
            setBookingType(booking?.booking_type ?? "");
            setNoShow(booking?.no_show ?? false);
            const map = new Map();
            booking?.services?.forEach((s) => map.set(s.id, s.quantity));
            setServices(map);
            setConfirmOpen(false);
            setUpdatedVia("");
        }
    }, [open, booking]);

    const toggleService = (id) => {
        setServices((prev) => {
            const m = new Map(prev);
            if (m.has(id)) m.delete(id);
            else m.set(id, 1);
            return m;
        });
    };
    const setQty = (id, qty) => {
        setServices((prev) => {
            const m = new Map(prev);
            m.set(id, Math.max(1, qty || 1));
            return m;
        });
    };

    const buildServicesPayload = () => {
        const out = {};
        addonServices.forEach((svc) => {
            if (services.has(svc.id)) out[svc.code] = services.get(svc.id);
        });
        return out;
    };

    // Step 1: open confirm
    const beginSave = () => setConfirmOpen(true);

    // Step 2: actually save with updated_via
    const handleConfirmAndSave = (via) => {
        if (!via) return; // guard
        setSaving(true);
        router.put(
            route("admin.bookings.update", booking.id),
            {
                people,
                payment_method: paymentMethod || null,
                booking_type: bookingType || null,
                no_show: !!noShow,
                services: buildServicesPayload(),
                updated_via: via, // 👈 send confirmation value
            },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
                onSuccess: () => {
                    setConfirmOpen(false);
                    onClose();
                },
            }
        );
    };

    const maxPeopleAllowed = Math.max(
        1,
        (slot?.capacity ?? 1) - (bookedInSlot ?? 0) + (booking?.people ?? 0)
    );

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">Edit booking</h3>
                    <button onClick={onClose} className="text-gray-500">
                        ✕
                    </button>
                </div>

                <div className="space-y-3 text-sm">
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Party size
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={maxPeopleAllowed}
                            value={people}
                            onChange={(e) =>
                                setPeople(() => {
                                    const v = parseInt(e.target.value, 10) || 1;
                                    return Math.min(
                                        Math.max(1, v),
                                        maxPeopleAllowed
                                    );
                                })
                            }
                            className="w-full border rounded p-1"
                        />
                        <p className="mt-1 text-[11px] text-gray-500">
                            Max for this change: {maxPeopleAllowed}+{" "}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Payment method
                        </label>
                        <input
                            type="text"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            placeholder="Cash / Card / EFT …"
                            className="w-full border rounded p-1"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Booking type
                        </label>
                        <input
                            type="text"
                            value={bookingType}
                            onChange={(e) => setBookingType(e.target.value)}
                            placeholder="e.g. Walk in"
                            className="w-full border rounded p-1"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="noShow"
                            type="checkbox"
                            checked={noShow}
                            onChange={(e) => setNoShow(e.target.checked)}
                        />
                        <label htmlFor="noShow" className="text-sm font-medium">
                            Tag as “No show”
                        </label>
                    </div>

                    {addonServices?.length > 0 && (
                        <div className="space-y-1">
                            <p className="text-xs font-medium">
                                Add-on Services
                            </p>
                            {addonServices.map((svc) => {
                                const selected = services.has(svc.id);
                                return (
                                    <div
                                        key={svc.id}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() =>
                                                toggleService(svc.id)
                                            }
                                        />
                                        <span className="flex-1">
                                            {svc.name}
                                        </span>
                                        {selected && (
                                            <input
                                                type="number"
                                                min="1"
                                                value={services.get(svc.id)}
                                                onChange={(e) =>
                                                    setQty(
                                                        svc.id,
                                                        parseInt(
                                                            e.target.value,
                                                            10
                                                        )
                                                    )
                                                }
                                                className="w-16 border rounded p-0.5 text-xs"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-xs bg-gray-200 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={beginSave}
                        disabled={saving}
                        className="px-3 py-1 text-xs bg-hh-orange text-white rounded"
                    >
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </div>

            {/* confirmation popup */}
            <ConfirmUpdateDialog
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleConfirmAndSave}
                value={updatedVia}
                setValue={setUpdatedVia}
                saving={saving}
            />
        </div>
    );
}

function UserSelect({ value, onChange }) {
    const [q, setQ] = useState("");
    const [options, setOptions] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const id = setTimeout(() => {
            const term = q.trim();
            if (term.length < 2) {
                setOptions([]);
                setOpen(false);
                return;
            }

            // Build current URL (keeps you on the same page)
            const url = window.location.pathname;

            // Merge existing query params (optional)
            const qp = Object.fromEntries(
                new URLSearchParams(window.location.search).entries()
            );

            router.get(
                url,
                { ...qp, q: term }, // pass q
                {
                    only: ["userResults"], // ask server for just this prop
                    preserveState: true, // don't blow away local state
                    preserveScroll: true,
                    replace: true, // don't grow history
                    onStart: () => setLoading(true),
                    onSuccess: (page) => {
                        const list = page.props?.userResults ?? [];
                        setOptions(Array.isArray(list) ? list : []);
                        setOpen(true);
                    },
                    onFinish: () => setLoading(false),
                }
            );
        }, 250);

        return () => clearTimeout(id);
    }, [q]);
    const picked = options.find((o) => o.id === value);

    return (
        <div className="relative">
            <label className="block text-xs font-medium mb-1">
                Attach to user
            </label>
            <input
                type="text"
                value={picked ? `${picked.name} <${picked.email}>` : q}
                onChange={(e) => {
                    onChange(null);
                    setQ(e.target.value);
                }}
                onFocus={() => setOpen(options.length > 0)}
                placeholder="Search by name or email..."
                className="w-full border rounded p-1"
            />
            {open && (
                <div className="absolute z-10 bg-white border rounded mt-1 max-h-48 overflow-auto w-full shadow">
                    {loading && (
                        <div className="p-2 text-xs text-gray-500">
                            Searching…
                        </div>
                    )}
                    {!loading &&
                        options.length === 0 &&
                        q.trim().length >= 2 && (
                            <div className="p-2 text-xs text-gray-500">
                                No matches
                            </div>
                        )}
                    {!loading &&
                        options.map((u) => (
                            <button
                                type="button"
                                key={u.id}
                                onClick={() => {
                                    onChange(u.id);
                                    setOpen(false);
                                }}
                                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100"
                            >
                                {u.name}{" "}
                                <span className="text-gray-500">
                                    &lt;{u.email}&gt;
                                </span>
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
}

export default function TodayBubbles({
    slots,
    bookings,
    formatTime,
    addonServices,
}) {
    const [editing, setEditing] = useState({
        open: false,
        booking: null,
        slot: null,
    });

    const bySlot = useMemo(() => {
        const map = new Map();
        bookings.forEach((b) => {
            if (!map.has(b.timeslot_id)) map.set(b.timeslot_id, []);
            map.get(b.timeslot_id).push(b);
        });
        return map;
    }, [bookings]);

    const [openFormSlot, setOpenFormSlot] = useState(null);
    const [formData, setFormData] = useState({
        user_id: null,
        people: 1,
        services: [],
        payment_method: "",
    });

    const buildServicesPayload = () => {
        const map = {};
        formData.services.forEach((s) => {
            const svc = addonServices.find((as) => as.id === s.id);
            if (svc) map[svc.code] = s.quantity; // backend expects code => qty
        });
        return map;
    };

    const handleSubmit = (slot, remaining) => {
        if (!formData.user_id) {
            alert("Please select a user to attach this booking to.");
            return;
        }

        if (formData.people > remaining) {
            alert(`Only ${remaining} spot(s) left in this slot.`);
            return;
        }

        router.post(
            route("admin.bookings.store"),
            {
                context: "sauna", // ← renamed from booking_type to avoid collision
                timeslot_id: slot.id,
                people: formData.people,
                timeslot_id: slot.id,
                user_id: formData.user_id,
                payment_method: formData.payment_method || null,
                services: buildServicesPayload(),
                // booking_type is set to "walk in" server-side; keep source of truth there
            },
            {
                onSuccess: () => {
                    setOpenFormSlot(null);
                    setFormData({
                        user_id: null,
                        people: 1,
                        services: [],
                        payment_method: "",
                    });
                },
            }
        );
    };

    const toggleService = (id) => {
        setFormData((f) => {
            const exists = f.services.find((s) => s.id === id);
            return exists
                ? { ...f, services: f.services.filter((s) => s.id !== id) }
                : { ...f, services: [...f.services, { id, quantity: 1 }] };
        });
    };

    const updateServiceQty = (id, qty) => {
        setFormData((f) => ({
            ...f,
            services: f.services.map((s) =>
                s.id === id ? { ...s, quantity: qty } : s
            ),
        }));
    };

    const handleDelete = (id) => {
        if (!confirm("Are you sure you would like to delete this booking?"))
            return;
        router.delete(route("admin.bookings.destroy", id), {
            preserveScroll: true,
        });
    };

    if (!slots || slots.length === 0) {
        return (
            <div className="bg-white p-6 rounded shadow border border-gray-200 text-center">
                <p className="text-gray-500">
                    No sauna slots configured for this day.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-10">
            {slots.map((slot) => {
                const list = bySlot.get(slot.id) ?? [];
                const booked = list.reduce((t, b) => t + b.people, 0);
                const full = booked >= slot.capacity;
                const remaining = Math.max(0, slot.capacity - booked);

                return (
                    <div
                        key={slot.id}
                        className="col-span-1 bg-white border border-hh-gray rounded-md shadow p-4"
                    >
                        {/* header */}
                        <div className="flex justify-between items-center mb-3">
                            <h5 className="font-semibold">
                                {formatTime(slot.starts_at)} –{" "}
                                {formatTime(slot.ends_at)}
                            </h5>
                            <p className="text-sm text-gray-500">
                                BOOKED:{" "}
                                <span
                                    className={`text-sm ${
                                        full ? "text-red-600" : "text-hh-orange"
                                    }`}
                                >
                                    {booked}/{slot.capacity}
                                </span>
                            </p>
                        </div>

                        {/* booking list */}
                        {list.length > 0 ? (
                            <ul className="space-y-3 max-h-80 overflow-y-auto pr-1 text-sm">
                                {list.map((b) => (
                                    <li
                                        key={b.id}
                                        className="border-b border-gray-400 pb-2 flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                Booked under:{" "}
                                                <span className="text-gray-700">
                                                    {b.user?.name ||
                                                        b.guest_name ||
                                                        "Guest"}
                                                </span>{" "}
                                                x {b.people}
                                                {b.no_show && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11px]">
                                                        NO SHOW
                                                    </span>
                                                )}
                                            </p>
                                            {(b.user?.email ||
                                                b.guest_email) && (
                                                <p className="text-gray-500 text-xs">
                                                    {b.user?.email ||
                                                        b.guest_email}
                                                </p>
                                            )}
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                                {b.is_pending && (
                                                    <span
                                                        className={[
                                                            "inline-flex items-center px-2 py-0.5 mb-2 rounded-full border",
                                                            b.booking_type?.toLowerCase() ===
                                                            "walk in"
                                                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                                                : "bg-blue-50 border-blue-200 text-blue-700",
                                                        ].join(" ")}
                                                        title="booking is pending"
                                                    >
                                                        {b.status_note}
                                                    </span>
                                                )}
                                                {b.booking_type && (
                                                    <span
                                                        className={[
                                                            "inline-flex items-center px-2 py-0.5 mb-2 rounded-full border",
                                                            b.booking_type?.toLowerCase() ===
                                                            "walk in"
                                                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                                                : "bg-blue-50 border-blue-200 text-blue-700",
                                                        ].join(" ")}
                                                        title="Booking type"
                                                    >
                                                        {b.booking_type}
                                                    </span>
                                                )}
                                                {b.payment_method && (
                                                    <span
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700"
                                                        title="Payment method"
                                                    >
                                                        {b.payment_method}
                                                    </span>
                                                )}
                                                {b.updated_via && (
                                                    <span
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700"
                                                        title="Updated via"
                                                    >
                                                        UPDATED •{" "}
                                                        {b.updated_via}
                                                    </span>
                                                )}
                                            </div>
                                            {b.services?.length > 0 && (
                                                <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                                                    {b.services.map((s) => (
                                                        <li key={s.id}>
                                                            {s.name} ×{" "}
                                                            {s.quantity}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                            <button
                                                onClick={() =>
                                                    setEditing({
                                                        open: true,
                                                        booking: b,
                                                        slot,
                                                        bookedInSlot: booked,
                                                    })
                                                }
                                                className="text-xs text-hh-orange hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(b.id)
                                                }
                                                className="text-red-500 hover:text-red-700 text-xs"
                                                title="Delete booking"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-xs text-gray-400">
                                No bookings yet
                            </p>
                        )}

                        {/* admin booking button + form */}
                        {!full && (
                            <div className="mt-4">
                                {openFormSlot === slot.id ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSubmit(slot, remaining);
                                        }}
                                        className="space-y-3 text-sm"
                                    >
                                        <UserSelect
                                            value={formData.user_id}
                                            onChange={(id) =>
                                                setFormData((f) => ({
                                                    ...f,
                                                    user_id: id,
                                                }))
                                            }
                                        />

                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Party size
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={remaining}
                                                value={formData.people}
                                                onChange={(e) =>
                                                    setFormData((f) => {
                                                        const val =
                                                            parseInt(
                                                                e.target.value,
                                                                10
                                                            ) || 1;
                                                        const clamped =
                                                            Math.min(
                                                                Math.max(
                                                                    1,
                                                                    val
                                                                ),
                                                                remaining
                                                            );
                                                        return {
                                                            ...f,
                                                            people: clamped,
                                                        };
                                                    })
                                                }
                                                className="w-full border rounded p-1"
                                                required
                                            />
                                            <p className="mt-1 text-[11px] text-gray-500">
                                                + Available in this slot:{" "}
                                                {remaining}+{" "}
                                            </p>
                                        </div>

                                        {addonServices?.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium">
                                                    Add-on Services:
                                                </p>
                                                {addonServices.map((svc) => {
                                                    const selected =
                                                        formData.services.find(
                                                            (s) =>
                                                                s.id === svc.id
                                                        );
                                                    return (
                                                        <div
                                                            key={svc.id}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    !!selected
                                                                }
                                                                onChange={() =>
                                                                    toggleService(
                                                                        svc.id
                                                                    )
                                                                }
                                                            />
                                                            <span>
                                                                {svc.name}
                                                            </span>
                                                            {selected && (
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={
                                                                        selected.quantity
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateServiceQty(
                                                                            svc.id,
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                                10
                                                                            ) ||
                                                                                1
                                                                        )
                                                                    }
                                                                    className="w-16 border rounded p-0.5 text-xs"
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Payment method
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Cash / Card / EFT"
                                                value={formData.payment_method}
                                                onChange={(e) =>
                                                    setFormData((f) => ({
                                                        ...f,
                                                        payment_method:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full border rounded p-1"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpenFormSlot(null)
                                                }
                                                className="px-3 py-1 text-xs bg-gray-200 rounded"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-3 py-1 text-xs bg-hh-orange text-white rounded"
                                            >
                                                Save Booking
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => setOpenFormSlot(slot.id)}
                                        className="mt-2 w-full text-xs px-3 py-1 bg-hh-orange text-white rounded"
                                    >
                                        + Add Booking
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
            <EditBookingModal
                open={editing.open}
                onClose={() =>
                    setEditing({ open: false, booking: null, slot: null })
                }
                booking={editing.booking}
                bookedInSlot={editing.bookedInSlot}
                slot={editing.slot}
                addonServices={addonServices}
            />
        </div>
    );
}
