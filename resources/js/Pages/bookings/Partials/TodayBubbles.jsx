import React, { useState } from "react";
import { router } from "@inertiajs/react";

export default function TodayBubbles({
    slots,
    bookings,
    formatTime,
    addonServices,
}) {
    const bySlot = React.useMemo(() => {
        const map = new Map();
        bookings.forEach((b) => {
            if (!map.has(b.timeslot_id)) map.set(b.timeslot_id, []);
            map.get(b.timeslot_id).push(b);
        });
        return map;
    }, [bookings]);

    const [openFormSlot, setOpenFormSlot] = useState(null);
    const [formData, setFormData] = useState({
        guest_name: "",
        guest_email: "",
        people: 1,
        services: [],
    });

    const buildServicesPayload = () => {
        const map = {};
        formData.services.forEach((s) => {
            const svc = addonServices.find((as) => as.id === s.id);
            if (svc) {
                map[svc.code] = s.quantity; // ✅ backend expects code => qty
            }
        });
        return map;
    };

    const handleSubmit = (slotId) => {
        router.post(
            route("admin.bookings.store"),
            {
                booking_type: "sauna", // for admin panel this is always sauna slots
                timeslot_id: slotId,
                people: formData.people,
                guest_name: formData.guest_name,
                guest_email: formData.guest_email,
                services: buildServicesPayload(),
            },
            {
                onSuccess: () => {
                    setOpenFormSlot(null);
                    setFormData({
                        guest_name: "",
                        guest_email: "",
                        people: 1,
                        services: [],
                    });
                },
            }
        );
    };
    const toggleService = (id) => {
        setFormData((f) => {
            const exists = f.services.find((s) => s.id === id);
            if (exists) {
                return {
                    ...f,
                    services: f.services.filter((s) => s.id !== id),
                };
            } else {
                return {
                    ...f,
                    services: [...f.services, { id, quantity: 1 }],
                };
            }
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
            onSuccess: () => {
                // Inertia will refetch props so capacity updates automatically
            },
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
                                                    {b.guest_name ||
                                                        b.user?.name ||
                                                        "Guest"}
                                                </span>{" "}
                                                x {b.people}
                                            </p>
                                            {b.guest_email && (
                                                <p className="text-gray-500 text-xs">
                                                    {b.guest_email}
                                                </p>
                                            )}

                                            {b.services &&
                                                b.services.length > 0 && (
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
                                        <button
                                            onClick={() => handleDelete(b.id)}
                                            className="text-red-500 hover:text-red-700 text-xs ml-2"
                                            title="Delete booking"
                                        >
                                            ✕
                                        </button>
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
                                            handleSubmit(slot.id);
                                        }}
                                        className="space-y-2 text-sm"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Customer name"
                                            value={formData.guest_name}
                                            onChange={(e) =>
                                                setFormData((f) => ({
                                                    ...f,
                                                    guest_name: e.target.value,
                                                }))
                                            }
                                            className="w-full border rounded p-1"
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Customer email"
                                            value={formData.guest_email}
                                            onChange={(e) =>
                                                setFormData((f) => ({
                                                    ...f,
                                                    guest_email: e.target.value,
                                                }))
                                            }
                                            className="w-full border rounded p-1"
                                        />

                                        <input
                                            type="number"
                                            min="1"
                                            max={slot.capacity - booked}
                                            value={formData.people}
                                            onChange={(e) =>
                                                setFormData((f) => ({
                                                    ...f,
                                                    people: parseInt(
                                                        e.target.value,
                                                        10
                                                    ),
                                                }))
                                            }
                                            className="w-full border rounded p-1"
                                            required
                                        />
                                        {addonServices &&
                                            addonServices.length > 0 && (
                                                <div className="space-y-1">
                                                    <p className="text-xs font-medium">
                                                        Add-on Services:
                                                    </p>
                                                    {addonServices.map(
                                                        (svc) => {
                                                            const selected =
                                                                formData.services.find(
                                                                    (s) =>
                                                                        s.id ===
                                                                        svc.id
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
                                                                        {
                                                                            svc.name
                                                                        }
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
                                                                                    )
                                                                                )
                                                                            }
                                                                            className="w-16 border rounded p-0.5 text-xs"
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            )}
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
        </div>
    );
}
