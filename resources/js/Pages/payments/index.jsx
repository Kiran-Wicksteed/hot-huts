import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState } from "react";
import styles from "../../../styles";
import { motion } from "framer-motion";
import {
    DocumentArrowUpIcon,
    ReceiptRefundIcon,
    CurrencyDollarIcon,
    ArchiveBoxXMarkIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { usePage, useForm } from "@inertiajs/react";

export default function PaymentPage() {
    const { payments, stats, filters, locations } = usePage().props;
    const [expandedRow, setExpandedRow] = useState(null);

    const { totalInvoices, totalRefunds, totalPaid, totalUnpaid } = stats;

    const { data, setData, get, processing } = useForm({
        location_id: filters.location_id || "",
        date_start: filters.date_start || "",
        date_end: filters.date_end || "",
    });

    const applyFilters = (e) => {
        e.preventDefault();
        get(route("payments.index"), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px]">
                {/* ANALYTIC VISUAL */}

                <div className="relative shadow border border-hh-gray rounded-md  bg-white p-6 flex justify-between">
                    <div className="flex justify-center items-center h-full flex-col space-y-4 mx-auto">
                        <div className="relative h-36 w-36">
                            <motion.svg
                                className="h-full w-full"
                                viewBox="0 0 64 64"
                            >
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="30"
                                    fill="none"
                                    stroke="#e0e0e0"
                                    strokeWidth="4"
                                />
                                <motion.circle
                                    cx="32"
                                    cy="32"
                                    r="30"
                                    fill="none"
                                    stroke="#FF7022"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    initial={{
                                        strokeDasharray: 188,
                                        strokeDashoffset: 188,
                                    }}
                                    animate={{
                                        strokeDashoffset:
                                            188 * (1 - totalInvoices / 2500),
                                    }}
                                    transition={{ duration: 0.5 }}
                                />
                            </motion.svg>
                            <div className="absolute inset-0 flex items-center flex-col justify-center">
                                <DocumentArrowUpIcon className="h-14 w-14 text-hh-orange" />
                                <p
                                    className={`${styles.paragraph} text-black !text-xs`}
                                >
                                    Invoice
                                </p>
                            </div>
                        </div>
                        <div>
                            <p
                                className={`${styles.paragraph} text-black text-center`}
                            >
                                Total Orders
                            </p>
                            <p
                                className={`${styles.paragraph} text-black !text-2xl text-center`}
                            >
                                {totalInvoices}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center items-center h-full flex-col space-y-4 mx-auto">
                        <div className="relative h-36 w-36">
                            <motion.svg
                                className="h-full w-full"
                                viewBox="0 0 64 64"
                            >
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="30"
                                    fill="none"
                                    stroke="#e0e0e0"
                                    strokeWidth="4"
                                />
                                <motion.circle
                                    cx="32"
                                    cy="32"
                                    r="30"
                                    fill="none"
                                    stroke="#FF7022"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    initial={{
                                        strokeDasharray: 188,
                                        strokeDashoffset: 188,
                                    }}
                                    animate={{
                                        strokeDashoffset:
                                            188 * (1 - totalRefunds / 500),
                                    }}
                                    transition={{ duration: 0.5 }}
                                />
                            </motion.svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <ReceiptRefundIcon className="h-14 w-14 text-hh-orange" />
                                <p
                                    className={`${styles.paragraph} text-black !text-xs`}
                                >
                                    Refunds
                                </p>
                            </div>
                        </div>
                        <div>
                            <p
                                className={`${styles.paragraph} text-black text-center`}
                            >
                                Refunds
                            </p>
                            <p
                                className={`${styles.paragraph} text-black !text-2xl text-center`}
                            >
                                {totalRefunds}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center items-center h-full flex-col space-y-4 mx-auto">
                        <div className="relative h-36 w-36">
                            <motion.svg
                                className="h-full w-full"
                                viewBox="0 0 64 64"
                            >
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="30"
                                    fill="none"
                                    stroke="#e0e0e0"
                                    strokeWidth="4"
                                />
                                <motion.circle
                                    cx="32"
                                    cy="32"
                                    r="30"
                                    fill="none"
                                    stroke="#FF7022"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    initial={{
                                        strokeDasharray: 188,
                                        strokeDashoffset: 188,
                                    }}
                                    animate={{
                                        strokeDashoffset:
                                            188 * (1 - totalInvoices / 6000),
                                    }}
                                    transition={{ duration: 0.5 }}
                                />
                            </motion.svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <CurrencyDollarIcon className="h-14 w-14 text-hh-orange" />
                                <p
                                    className={`${styles.paragraph} text-black !text-xs`}
                                >
                                    Paid
                                </p>
                            </div>
                        </div>
                        <div>
                            <p
                                className={`${styles.paragraph} text-black text-center`}
                            >
                                Paid
                            </p>
                            <p
                                className={`${styles.paragraph} text-black !text-2xl text-center`}
                            >
                                {totalPaid}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center items-center h-full flex-col space-y-4 mx-auto">
                        <div className="relative h-36 w-36">
                            <motion.svg
                                className="h-full w-full"
                                viewBox="0 0 64 64"
                            >
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="30"
                                    fill="none"
                                    stroke="#e0e0e0"
                                    strokeWidth="4"
                                />
                                <motion.circle
                                    cx="32"
                                    cy="32"
                                    r="30"
                                    fill="none"
                                    stroke="#FF7022"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    initial={{
                                        strokeDasharray: 188,
                                        strokeDashoffset: 188,
                                    }}
                                    animate={{
                                        strokeDashoffset:
                                            188 * (1 - totalUnpaid / 50),
                                    }}
                                    transition={{ duration: 0.5 }}
                                />
                            </motion.svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <ArchiveBoxXMarkIcon className="h-14 w-14 text-hh-orange" />
                                <p
                                    className={`${styles.paragraph} text-black !text-xs`}
                                >
                                    Unpaid
                                </p>
                            </div>
                        </div>
                        <div>
                            <p
                                className={`${styles.paragraph} text-black text-center`}
                            >
                                Unpaid
                            </p>
                            <p
                                className={`${styles.paragraph} text-black !text-2xl text-center`}
                            >
                                {totalUnpaid}
                            </p>
                        </div>
                    </div>
                </div>

                {/* INVOICE LIST */}

                <div className="relative lg:col-span-full  overflow-hidden pt-6 pb-12">
                    <div className="col-span-full flex justify-between items-center mb-6">
                        <div>
                            {" "}
                            <h4
                                className={`${styles.h3} !mb-0 font-medium text-black `}
                            >
                                Invoice List
                            </h4>
                        </div>
                        <form
                            onSubmit={applyFilters}
                            className="flex gap-x-4 items-center mb-6"
                        >
                            {/* Location Filter */}
                            <select
                                value={data.location_id}
                                onChange={(e) =>
                                    setData("location_id", e.target.value)
                                }
                                className="bg-white shadow-md border border-hh-gray p-2 rounded"
                            >
                                <option value="">All Locations</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>

                            {/* Date Range */}
                            <input
                                type="date"
                                value={data.date_start}
                                onChange={(e) =>
                                    setData("date_start", e.target.value)
                                }
                                className="bg-white shadow-md border border-hh-gray p-2 rounded"
                            />
                            <input
                                type="date"
                                value={data.date_end}
                                onChange={(e) =>
                                    setData("date_end", e.target.value)
                                }
                                className="bg-white shadow-md border border-hh-gray p-2 rounded"
                            />

                            {/* Apply */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-hh-orange text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                Apply
                            </button>

                            {/* Export */}
                            <a
                                href={route("payments.export", {
                                    location_id: data.location_id || undefined,
                                    date_start: data.date_start || undefined,
                                    date_end: data.date_end || undefined,
                                })}
                                className="bg-green-600 text-white px-4 py-2 rounded"
                            >
                                Export CSV
                            </a>
                        </form>
                    </div>
                    <div className="grid grid-cols-12 p-6 gap-x-4">
                        <div className="col-span-1">
                            <p className={`${styles.paragraph} text-black`}>
                                #No
                            </p>
                        </div>
                        <div className="col-span-2 -ml-6">
                            <p className={`${styles.paragraph} text-black`}>
                                Customer Name
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Date & Time
                            </p>
                        </div>

                        <div className="col-span-3">
                            <p className={`${styles.paragraph} text-black`}>
                                Method
                            </p>
                        </div>
                        <div className="col-span-1">
                            <p className={`${styles.paragraph} text-black`}>
                                Amount
                            </p>
                        </div>
                        <div className="col-span-1">
                            <p className={`${styles.paragraph} text-black`}>
                                Status
                            </p>
                        </div>
                        <div className="col-span-2 ml-6">
                            <p className={`${styles.paragraph} text-black`}>
                                Booking Details
                            </p>
                        </div>
                    </div>
                    <div className="col-span-full space-y-4">
                        {payments.map((invoice, index) => (
                            <div key={invoice.id} className="col-span-full">
                                <div className="bg-white shadow grid grid-cols-12 gap-x-4 items-center border border-hh-gray rounded p-6">
                                    <div className="col-span-1">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999]`}
                                        >
                                            {String(index + 1).padStart(2, "0")}
                                        </p>
                                    </div>
                                    <div className="col-span-2 flex gap-x-2 items-center -ml-6">
                                        <div className="bg-[#999999] rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm`}
                                            >
                                                {invoice.customerInitials}
                                            </p>
                                        </div>
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            {invoice.customerName}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            {invoice.date}
                                        </p>
                                    </div>

                                    <div className="col-span-3">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            {invoice.method}
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            R{invoice.amount}
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <div className="bg-hh-orange rounded-full px-4 py-2">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm text-center`}
                                            >
                                                {invoice.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() =>
                                            setExpandedRow(
                                                expandedRow === index
                                                    ? null
                                                    : index
                                            )
                                        }
                                        className="col-span-2 flex items-center gap-x-2 ml-6 cursor-pointer"
                                    >
                                        <p
                                            className={`${styles.paragraph} !text-[#999999]`}
                                        >
                                            Details
                                        </p>
                                        <ChevronDownIcon
                                            className={`!text-[#999999] h-6 w-6 transition-transform ${
                                                expandedRow === index
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                        />
                                    </div>
                                </div>
                                {expandedRow === index && (
                                    <div className="bg-white p-6 border border-hh-gray rounded mt-1">
                                        <p className="text-sm">
                                            Transaction ID:{" "}
                                            {invoice.transactionId}
                                        </p>
                                        {/* Add more details if needed */}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* GRAPH SECTION */}
            </div>
        </AuthenticatedLayout>
    );
}
