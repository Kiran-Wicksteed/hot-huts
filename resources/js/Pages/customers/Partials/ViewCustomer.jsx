// resources/js/Pages/Customers/Partials/ViewCustomer.jsx
import React from "react";
import styles from "../../../../styles";

export default function ViewCustomer({ open, onClose, detail }) {
    if (!open || !detail) return null;

    const fmtMoney = (v) => {
        const n = Number(v);
        return Number.isFinite(n)
            ? new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "ZAR",
              }).format(n)
            : "—";
    };

    const fmtDT = (v) => (v ? new Date(v).toLocaleString() : "—");

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className="absolute right-0 top-0 h-full w-full max-w-6xl bg-white shadow-xl border-l border-hh-gray rounded-l-xl overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-label="Customer details"
            >
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        {detail.photo ? (
                            <img
                                src={detail.photo}
                                alt={detail.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="bg-hh-orange/90 text-white h-10 w-10 rounded-full flex items-center justify-center">
                                <span className="font-semibold">
                                    {detail.initials}
                                </span>
                            </div>
                        )}
                        <div>
                            <h3 className={`${styles.h4} !mb-0`}>
                                {detail.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {detail.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg px-3 py-1.5 text-sm border hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Overview */}
                    <div className="grid grid-cols-3 gap-4">
                        <StatBox
                            label="Bookings"
                            value={detail.stats?.bookings_count ?? 0}
                        />
                        <StatBox
                            label="Last Booking"
                            value={
                                <span className="text-sm">
                                    {fmtDT(detail.stats?.last_booking_at)}
                                </span>
                            }
                        />
                        <StatBox
                            label="Account Created"
                            value={
                                <span className="text-sm">
                                    {fmtDT(detail.created_at)}
                                </span>
                            }
                        />
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h4 className={`${styles.h5} !mb-2`}>Contact</h4>
                            <Line label="Email" value={detail.email} />
                            <Line
                                label="Phone"
                                value={detail.contact_number || "—"}
                            />
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <div className="space-y-3">
                        <h4 className={`${styles.h5} !mb-1`}>
                            Recent Bookings
                        </h4>
                        <div className="overflow-hidden rounded-xl border">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <Th>ID</Th>
                                        <Th>Type</Th>
                                        <Th>When</Th>
                                        <Th>People</Th>
                                        <Th>Status</Th>
                                        <Th>Payment</Th>
                                        <Th>Location</Th>
                                        <Th>Total</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(detail.recent_bookings ?? []).length ===
                                        0 && (
                                        <tr>
                                            <td
                                                className="p-4 text-gray-500"
                                                colSpan={8}
                                            >
                                                No bookings yet
                                            </td>
                                        </tr>
                                    )}
                                    {(detail.recent_bookings ?? []).map((b) => (
                                        <tr key={b.id} className="border-t">
                                            <Td>{b.id}</Td>
                                            <Td className="capitalize">
                                                {b.booking_type}
                                            </Td>
                                            <Td>
                                                <div className="flex flex-col">
                                                    <span>
                                                        {fmtDT(b.start) !== "—"
                                                            ? fmtDT(b.start)
                                                            : fmtDT(
                                                                  b.created_at
                                                              )}
                                                    </span>
                                                    {b.end && (
                                                        <span className="text-xs text-gray-500">
                                                            → {fmtDT(b.end)}
                                                        </span>
                                                    )}
                                                </div>
                                            </Td>
                                            <Td>{b.people ?? "—"}</Td>
                                            <Td className="capitalize">
                                                {b.status ?? "—"}
                                            </Td>
                                            <Td className="uppercase">
                                                {b.payment_method ?? "—"}
                                            </Td>
                                            <Td>{b.location ?? "—"}</Td>
                                            <Td>{fmtMoney(b.price)}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value }) {
    return (
        <div className="rounded-xl border p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
        </div>
    );
}
function Line({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-gray-500 text-xs">{label}</span>
            <span className="text-sm font-medium text-gray-900 truncate max-w-[280px]">
                {String(value)}
            </span>
        </div>
    );
}
function Th({ children }) {
    return (
        <th className="text-left text-gray-500 font-medium p-3">{children}</th>
    );
}
function Td({ children, className = "" }) {
    return <td className={`p-3 ${className}`}>{children}</td>;
}
