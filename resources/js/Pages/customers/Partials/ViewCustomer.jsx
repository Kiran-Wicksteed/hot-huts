// resources/js/Pages/Customers/Partials/ViewCustomer.jsx
import React, { useEffect, useState } from "react";
import { useForm, router } from "@inertiajs/react";
import styles from "../../../../styles";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";

export default function ViewCustomer({ open, onClose, detail }) {
    const [editMode, setEditMode] = useState(false);
    const [showLoyaltyForm, setShowLoyaltyForm] = useState(false);
    const [loyaltyPoints, setLoyaltyPoints] = useState('');
    const [submittingLoyalty, setSubmittingLoyalty] = useState(false);
    
    const { auth } = usePage().props;
    const user = auth.user;

    console.log("detail", detail);

    const isDayStaff = Boolean(Number(user?.is_editor ?? 0));
    
    const { data, setData, processing, errors, clearErrors } = useForm({
        name: detail?.name ?? "",
        email: detail?.email ?? "",
        contact_number: detail?.contact_number ?? "",
        is_admin: !!detail?.is_admin,
        is_editor: !!detail?.is_editor,
        photo: null,
    });

    useEffect(() => {
        if (!open) setEditMode(false);
    }, [open]);

    const handleAdjustLoyaltyPoints = async (e) => {
        e.preventDefault();
        
        if (!detail.loyalty) {
            alert("Loyalty account not found for this user.");
            return;
        }

        if (!loyaltyPoints || loyaltyPoints === "0") {
            alert("Please enter a valid number of points");
            return;
        }

        setSubmittingLoyalty(true);

        try {
            const response = await axios.post(
                route('customers.adjustLoyaltyPoints', detail.id),
                { points: parseInt(loyaltyPoints) },
                {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }
            );

            alert(response.data.message || 'Loyalty points updated successfully!');
            setShowLoyaltyForm(false);
            setLoyaltyPoints('');
            
            // Refresh the customer data
            router.reload({ only: ['customerDetail'] });
        } catch (error) {
            console.error('Error updating loyalty points:', error);
            const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              'Failed to update loyalty points. Please try again.';
            alert(errorMessage);
        } finally {
            setSubmittingLoyalty(false);
        }
    };

    // Safe accessors
    const detailPhoto = detail?.photo ?? null;
    const detailName = detail?.name ?? "";
    const detailEmail = detail?.email ?? "";
    const detailInitials =
        detail?.initials ??
        (detailName
            ? detailName
                  .split(" ")
                  .map((p) => p.slice(0, 1))
                  .slice(0, 2)
                  .join("")
            : "CU");

    // Avatar preview
    const [previewUrl, setPreviewUrl] = useState(detailPhoto);
    useEffect(() => {
        if (data.photo instanceof File) {
            const url = URL.createObjectURL(data.photo);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreviewUrl(detailPhoto);
    }, [data.photo, detailPhoto]);

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

    const onSubmit = (e) => {
        e.preventDefault();
        if (!detail) return;

        router.post(
            `/customers/${detail.id}`,
            { ...data, _method: "put" },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    // 1) Refresh the drawer data
                    router.get(
                        route("customers.show", detail.id),
                        {},
                        {
                            preserveScroll: true,
                            preserveState: true,
                            only: ["customerDetail"],
                            replace: true,
                        }
                    );

                    // 2) Refresh the list in the background (keeps drawer open)
                    router.get(
                        route("customers.index"),
                        {},
                        {
                            preserveScroll: true,
                            preserveState: true,
                            only: ["customers"],
                            replace: true,
                        }
                    );

                    setEditMode(false);
                },
                onError: (errors) => {
                    // 422 shows here; for 403/500 you can also use onFinish and check flash or use a global error handler
                    console.error(errors);
                },
            }
        );
    };

    // ----- Render guards -----
    if (!open) return null;

    // IMPORTANT: require a *real* record before rendering the full drawer
    if (!detail?.id) {
        return (
            <div className="fixed inset-0 z-50">
                <div
                    className="absolute inset-0 bg-black/30"
                    onClick={onClose}
                    aria-hidden="true"
                />
                <div className="absolute right-0 top-0 h-full w-full max-w-6xl bg-white shadow-xl border-l border-hh-gray rounded-l-xl overflow-y-auto">
                    <div className="p-6 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg px-3 py-1.5 text-sm border hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <SkeletonBox />
                            <SkeletonBox />
                            <SkeletonBox />
                        </div>
                        <div className="h-48 bg-gray-50 rounded-xl border animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

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
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        {previewUrl ? (
                            <div>
                                <img
                                    src={previewUrl}
                                    alt={detailName}
                                    className="h-10 w-10 rounded-full  object-cover"
                                />
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    className={`${styles.paragraph} text-hh-orange underline text-xs`}
                                >
                                    View image
                                </a>
                            </div>
                        ) : (
                            <div className="bg-hh-orange/90 text-white h-10 w-10 rounded-full flex items-center justify-center">
                                <span className="font-semibold">
                                    {detailInitials}
                                </span>
                            </div>
                        )}
                        <div>
                            <h3 className={`${styles.h4} !mb-0`}>
                                {detailName}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {detailEmail}
                            </p>
                            <div className="mt-1">
                                <span
                                    className={
                                        (detail?.is_admin
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800") +
                                        " inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                    }
                                >
                                    {detail?.is_admin ? "Admin" : "Customer"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {detail?.is_admin === false && (
                            <button
                                onClick={async () => {
                                    if (!confirm('Are you sure you want to grant a 3-month membership to this user?')) {
                                        return;
                                    }

                                    try {
                                        const response = await axios.post(
                                            route('admin.users.memberships.store', detail.id),
                                            {},
                                            {
                                                headers: {
                                                    'Accept': 'application/json',
                                                    'X-Requested-With': 'XMLHttpRequest'
                                                }
                                            }
                                        );

                                        alert(response.data.message || 'Membership granted successfully!');
                                        // Update the detail prop to reflect the new membership
                                        const updatedDetail = { ...detail, membership: response.data.membership };
                                        // Trigger a re-render with the updated data
                                        router.reload({ only: ['customerDetail'] });
                                    } catch (error) {
                                        console.error('Error granting membership:', error);
                                        const errorMessage = error.response?.data?.error || 
                                                          error.response?.data?.message || 
                                                          'Failed to grant membership. Please try again.';
                                        alert(errorMessage);
                                    }
                                }}
                                className="rounded-lg px-3 py-1.5 text-sm border bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                disabled={detail?.membership !== null}
                            >
                                {detail?.membership ? 'Membership Active' : 'Grant Membership'}
                            </button>
                        )}
                        {!editMode ? (
                            <button
                                onClick={() => {
                                    setEditMode(true);
                                    setData((prev) => ({
                                        ...prev,
                                        name: detail.name ?? "",
                                        email: detail.email ?? "",
                                        contact_number:
                                            detail.contact_number ?? "",
                                        is_admin: !!detail.is_admin,
                                        is_editor: !!detail.is_editor,
                                        photo: null,
                                    }));
                                    clearErrors();
                                }}
                                className="rounded-lg px-3 py-1.5 text-sm border hover:bg-gray-50"
                            >
                                Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    form="customer-edit-form"
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg px-3 py-1.5 text-sm border bg-black text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    {processing ? "Saving..." : "Save"}
                                </button>
                                <button
                                    onClick={() => {
                                        setData((prev) => ({
                                            ...prev,
                                            name: detail.name ?? "",
                                            email: detail.email ?? "",
                                            contact_number:
                                                detail.contact_number ?? "",
                                            is_admin: !!detail.is_admin,
                                            is_editor: !!detail.is_editor,
                                            photo: null,
                                        }));
                                        clearErrors();
                                        setEditMode(false);
                                    }}
                                    className="rounded-lg px-3 py-1.5 text-sm border hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </>
                        )}

                        <button
                            onClick={onClose}
                            className="rounded-lg px-3 py-1.5 text-sm border hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    {/* Overview */}
                    <div className="grid grid-cols-4 gap-4">
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
                            label="No Shows"
                            value={detail.stats?.no_show_count ?? 0}
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

                    {/* Loyalty Points Section */}
                    {detail.loyalty && (
                        <div className="border rounded-xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className={`${styles.h5} !mb-0`}>
                                    Loyalty Points
                                </h4>
                                <button
                                    onClick={() => setShowLoyaltyForm(!showLoyaltyForm)}
                                    className="text-sm font-medium text-hh-orange hover:text-orange-600 transition-colors"
                                >
                                    {showLoyaltyForm ? "Cancel" : "Adjust Points"}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                                    <p className="text-sm text-orange-800 font-medium">
                                        Current Balance
                                    </p>
                                    <p className="text-3xl font-bold text-hh-orange mt-1">
                                        {detail.loyalty.points_balance}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border">
                                    <p className="text-sm text-gray-600 font-medium">
                                        Lifetime Points
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {detail.loyalty.lifetime_points}
                                    </p>
                                </div>
                            </div>

                            {showLoyaltyForm && (
                                <form onSubmit={handleAdjustLoyaltyPoints} className="bg-gray-50 rounded-lg p-4 space-y-3 border">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Points to Add/Remove
                                        </label>
                                        <input
                                            type="number"
                                            value={loyaltyPoints}
                                            onChange={(e) => setLoyaltyPoints(e.target.value)}
                                            placeholder="e.g., 100 or -50"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hh-orange"
                                            disabled={submittingLoyalty}
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Use positive numbers to add, negative to remove
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submittingLoyalty}
                                        className="w-full px-4 py-2 bg-hh-orange text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        {submittingLoyalty ? "Updating..." : "Update Points"}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Contact / Quick Edit */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h4 className={`${styles.h5} !mb-2`}>Contact</h4>

                            {!editMode ? (
                                <>
                                    <Line label="Name" value={detail.name} />
                                    <Line label="Email" value={detail.email} />
                                    <Line
                                        label="Phone"
                                        value={detail.contact_number || "—"}
                                    />
                                    <Line
                                        label="Role"
                                        value={
                                            detail.is_admin
                                                ? "Admin"
                                                : "Customer"
                                        }
                                    />

                                    <Line
                                        label="Admin level"
                                        value={
                                            detail.is_editor
                                                ? "Day staff"
                                                : "Full admin"
                                        }
                                    />
                                </>
                            ) : (
                                <form
                                    id="customer-edit-form"
                                    onSubmit={onSubmit}
                                    className="space-y-4"
                                >
                                    <Field label="Name" error={errors.name}>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            className="w-full rounded-lg border px-3 py-2 text-sm"
                                            required
                                        />
                                    </Field>
                                    <Field label="Email" error={errors.email}>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                            className="w-full rounded-lg border px-3 py-2 text-sm"
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Phone"
                                        error={errors.contact_number}
                                    >
                                        <input
                                            type="text"
                                            value={data.contact_number ?? ""}
                                            onChange={(e) =>
                                                setData(
                                                    "contact_number",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-lg border px-3 py-2 text-sm"
                                            placeholder="Optional"
                                        />
                                    </Field>
                                    <Field label="Avatar" error={errors.photo}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setData(
                                                    "photo",
                                                    e.target.files?.[0] ?? null
                                                )
                                            }
                                            className="block w-full text-sm"
                                        />
                                    </Field>
                                    {!isDayStaff && (
                                        <div>
                                            <Field label="Role">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">
                                                        Admin access
                                                    </span>
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                !!data.is_admin
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "is_admin",
                                                                    e.target
                                                                        .checked
                                                                )
                                                            }
                                                            className="h-4 w-4"
                                                        />
                                                        <span className="text-sm text-gray-700">
                                                            Make this user an
                                                            admin
                                                        </span>
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                                                    Admins can access the
                                                    dashboard and manage other
                                                    users.
                                                </p>
                                            </Field>
                                            <Field>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">
                                                        Day staff access
                                                    </span>
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                !!data.is_editor
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "is_editor",
                                                                    e.target
                                                                        .checked
                                                                )
                                                            }
                                                            className="h-4 w-4"
                                                        />
                                                        <span className="text-sm text-gray-700">
                                                            Set the user as day
                                                            staff (limited admin
                                                            access)
                                                        </span>
                                                    </label>
                                                </div>
                                            </Field>
                                        </div>
                                    )}
                                </form>
                            )}
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

/* Small UI helpers */
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
function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="text-xs text-gray-500">{label}</span>
            <div className="mt-1">{children}</div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </label>
    );
}
function SkeletonBox() {
    return (
        <div className="rounded-xl border p-4 bg-gray-50 animate-pulse h-[72px]" />
    );
}
