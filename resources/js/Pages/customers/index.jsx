// resources/js/Pages/Customers/CustomerPage.jsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import styles from "../../../styles";
import { usePage, router, useForm } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import CreateCustomer from "./Partials/CreateCustomer";
import ViewCustomer from "./Partials/ViewCustomer";

export default function CustomerPage() {
    const page = usePage();
    const {
        customers = [], // <-- safe default
        auth = {},
        flash = {},
        filters = {},
        customerDetail = null, // <-- safe default
    } = page.props ?? {};

    const [createOpen, setCreateOpen] = React.useState(false);
    const [viewOpen, setViewOpen] = React.useState(false);

    const { data, setData, get } = useForm({
        search: filters.search || '',
    });

    function submit(e) {
        e.preventDefault();
        get(route('customers.index', data));
    }

    React.useEffect(() => {
        if (customerDetail?.id) setViewOpen(true); // only open for real records
    }, [customerDetail?.id]);

    const truncateEmail = (email, maxLength) =>
        email.length > maxLength
            ? email.substring(0, maxLength - 3) + "..."
            : email;

    const handleDelete = (id) => {
        if (!confirm("Delete this customer? This cannot be undone.")) return;
        router.delete(route("customers.destroy", id), { preserveScroll: true });
    };

    const handleView = (id) => {
        router.get(
            route("customers.show", id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ["customerDetail"], // fetch just the drawer payload
            }
        );
    };

    const handleCloseView = () => {
        setViewOpen(false);
        router.get(
            route("customers.index"),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                // refresh the list and clear the drawer payload in one go
                only: ["customers", "customerDetail"],
                replace: true,
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px]">
                <div className="relative lg:col-span-full overflow-hidden pt-6 pb-12">
                    <div className="col-span-full mb-6 flex items-center justify-between">
                        <div>
                            <h4
                                className={`${styles.h3} !mb-0 font-medium text-black`}
                            >
                                Customer List
                            </h4>
                            <form onSubmit={submit} className="mt-2 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    placeholder="Search by name..."
                                    className="bg-white shadow-md border border-hh-gray p-2 rounded"
                                />
                                <button
                                    type="submit"
                                    className="bg-hh-orange text-white px-4 py-2 rounded text-sm font-medium"
                                >
                                    Search
                                </button>
                            </form>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={route("customers.export")}
                                className="inline-flex items-center gap-2 rounded-lg border border-hh-orange px-4 py-2 text-hh-orange hover:bg-hh-orange/5 focus:outline-none focus:ring-2 focus:ring-hh-orange focus:ring-offset-2 text-sm font-medium"
                            >
                                Export CSV
                            </a>
                            <button
                                type="button"
                                onClick={() => setCreateOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-hh-orange px-4 py-2 text-white hover:bg-hh-orange/90 focus:outline-none focus:ring-2 focus:ring-hh-orange focus:ring-offset-2"
                            >
                                <span className="text-sm font-medium">
                                    Add customer
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="grid grid-cols-12 p-6 gap-x-4">
                        <div className="col-span-1">
                            <p className={styles.paragraph}>#No</p>
                        </div>
                        <div className="col-span-2 -ml-6">
                            <p className={styles.paragraph}>Full Name</p>
                        </div>
                        <div className="col-span-3">
                            <p className={styles.paragraph}>Email Address</p>
                        </div>
                        <div className="col-span-1 -ml-6">
                            <p className={styles.paragraph}>Number</p>
                        </div>
                        <div className="col-span-1">
                            <p className={styles.paragraph}>Role</p>
                        </div>
                        <div className="col-span-2 ml-8">
                            <p className={styles.paragraph}>Recent Booking</p>
                        </div>
                        <div className="col-span-1">
                            <p className={styles.paragraph}>Total</p>
                        </div>
                        <div className="col-span-1 text-right">
                            <p className={styles.paragraph}>Actions</p>
                        </div>
                    </div>

                    {/* Rows */}
                    <div className="col-span-full space-y-4">
                        {(customers ?? []).map((c, index) => {
                            const hasIndemnityName =
                                typeof c.indemnity_name === "string" &&
                                c.indemnity_name.trim().length > 0;
                            const displayName = hasIndemnityName
                                ? c.indemnity_name
                                : c.name;
                            return (
                                <div
                                    key={c.id}
                                    className="col-span-full bg-white shadow grid grid-cols-12 gap-x-4 items-center border border-hh-gray rounded p-6"
                                >
                                <div className="col-span-1">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999]`}
                                    >
                                        {String(index + 1).padStart(2, "0")}
                                    </p>
                                </div>

                                <div className="col-span-2 flex gap-x-2 items-start -ml-6">
                                    {/*
                                      * Prefer displaying the indemnity signature name when available so staff can
                                      * quickly confirm what the customer signed with; fall back to the standard name.
                                      */}
                                    <div className="bg-[#999999] rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                                        <p
                                            className={`${styles.paragraph} !text-white !text-sm`}
                                        >
                                            {c.initials}
                                        </p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            {displayName}
                                        </p>
                                        {hasIndemnityName &&
                                            c.name &&
                                            c.name !== c.indemnity_name && (
                                                <p
                                                    className={`${styles.paragraph} !text-[#666666] !text-xs`}
                                                >
                                                    {c.name}
                                                </p>
                                            )}
                                    </div>
                                </div>

                                <div className="col-span-3">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {truncateEmail(c.email, 24)}
                                    </p>
                                </div>

                                <div className="col-span-1 -ml-6">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {c.contact_number}
                                    </p>
                                </div>

                                <div className="col-span-1">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {c.role}
                                    </p>
                                </div>

                                <div className="col-span-2 ml-8">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {c.recent_appointment}
                                    </p>
                                </div>

                                <div className="col-span-1">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {c.total_appointments}
                                    </p>
                                </div>

                                <div className="col-span-1 flex justify-end gap-3">
                                    <button
                                        onClick={() => handleView(c.id)}
                                        className="text-hh-orange hover:text-hh-orange/80 text-sm font-medium"
                                        title="View details"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                        disabled={auth?.user?.id === c.id}
                                        title={
                                            auth?.user?.id === c.id
                                                ? "You can't delete yourself"
                                                : "Delete"
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                        })}
                    </div>
                </div>
            </div>

            {createOpen && (
                <CreateCustomer onClose={() => setCreateOpen(false)} />
            )}

            {/* Drawer / Modal */}
            <ViewCustomer
                open={viewOpen}
                onClose={handleCloseView}
                detail={customerDetail}
            />
        </AuthenticatedLayout>
    );
}
