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

export default function PaymentPage() {
    const [totalInvoices, setTotalInvoices] = useState(2500);
    const [totalRefunds, setTotalRefunds] = useState(100);
    const [totalPaid, setTotalPaid] = useState(2500);
    const [totalUnpaid, setTotalUnpaid] = useState(6);
    const [expandedRow, setExpandedRow] = useState(null);

    const invoicesData = [
        {
            id: 1,
            customerInitials: "VM",
            customerName: "Valentino Morose",
            date: "04 May 2025, 6:20AM",
            service: "Single Sauna Session",
            method: "Credit",
            amount: "20 mins",
            status: "Paid",
        },
        {
            id: 2,
            customerInitials: "VM",
            customerName: "Valentino Morose",
            date: "04 May 2025, 6:20AM",
            service: "Single Sauna Session",
            method: "Credit",
            amount: "20 mins",
            status: "Paid",
        },
    ];
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
                                Total Invoice
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
                        <div className="flex gap-x-4 items-center">
                            <div className="bg-white shadow-md flex items-center gap-x-2 border border-hh-gray p-2 rounded">
                                <p className={`${styles.paragraph} text-black`}>
                                    This Month
                                </p>
                                <ChevronDownIcon className="text-black h-6 w-6" />
                            </div>
                            <div className="bg-white shadow-md flex items-center gap-x-2 border border-hh-gray p-2 rounded">
                                <p className={`${styles.paragraph} text-black`}>
                                    All Invoice
                                </p>
                                <ChevronDownIcon className="text-black h-6 w-6" />
                            </div>
                        </div>
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
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Service
                            </p>
                        </div>
                        <div className="col-span-1">
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
                        {invoicesData.map((invoice, index) => (
                            <div key={invoice.id} className="col-span-full">
                                <div className=" bg-white shadow grid grid-cols-12  gap-x-4 items-center border border-hh-gray rounded p-6">
                                    <div className="col-span-1">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] `}
                                        >
                                            01
                                        </p>
                                    </div>
                                    <div className="col-span-2 flex gap-x-2 items-center -ml-6">
                                        <div className="bg-[#999999] rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm `}
                                            >
                                                VM
                                            </p>
                                        </div>
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Valentino Morose
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            04 May 2025, 6:20AM
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Single Sauna Session
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Credit
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            20 mins
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <div className="bg-hh-orange rounded-full px-4 py-2">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm text-center`}
                                            >
                                                Paid
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
                                            className={`${styles.paragraph} !text-[#999999] `}
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
                                {/* Expanded Content */}
                                {expandedRow === index && (
                                    <div className="bg-white p-6 border  border-hh-gray rounded mt-1 divide-y divide-hh-gray">
                                        <div className="grid grid-cols-7 gap-4 max-w-4xl mx-auto pb-6">
                                            <h4
                                                className={`${styles.paragraph} text-black font-medium mb-4 col-span-full`}
                                            >
                                                Payment Details
                                            </h4>
                                            <div className="col-span-2">
                                                <h4
                                                    className={`${styles.paragraph} text-black !text-sm font-medium !mb-4`}
                                                >
                                                    Client details
                                                </h4>
                                                <p
                                                    className={`${styles.paragraph} !text-[#999999] !text-xs`}
                                                >
                                                    Valentino Morose
                                                </p>
                                                <p
                                                    className={`${styles.paragraph} !text-[#999999] !text-xs`}
                                                >
                                                    customer@example.com
                                                </p>
                                            </div>
                                            <div>
                                                <h4
                                                    className={`${styles.paragraph} text-black !text-sm font-medium !mb-4`}
                                                >
                                                    Mode
                                                </h4>
                                                <p
                                                    className={`${styles.paragraph} !text-[#999999] !text-xs`}
                                                >
                                                    Credit Card
                                                </p>
                                            </div>
                                            <div className="col-span-2 ml-8">
                                                <h4
                                                    className={`${styles.paragraph} text-black !text-sm font-medium !mb-4`}
                                                >
                                                    Transaction ID
                                                </h4>
                                                <p
                                                    className={`${styles.paragraph} !text-[#999999] !text-xs`}
                                                >
                                                    1248673958603
                                                </p>
                                            </div>
                                            <div>
                                                <h4
                                                    className={`${styles.paragraph} text-black !text-sm font-medium !mb-4`}
                                                >
                                                    Status
                                                </h4>
                                                <p
                                                    className={`${styles.paragraph} !text-[#999999] !text-xs`}
                                                >
                                                    Paid
                                                </p>
                                            </div>
                                            <div className="flex items-end flex-col gap-y-2 -mt-6">
                                                <div className="bg-hh-orange rounded-full px-4 py-2 block">
                                                    <p
                                                        className={`${styles.paragraph} !text-white !text-sm text-center`}
                                                    >
                                                        Refund
                                                    </p>
                                                </div>
                                                <div className="bg-white rounded-full px-4 py-2 block border border-hh-orange">
                                                    <p
                                                        className={`${styles.paragraph} !text-hh-orange !text-sm text-center`}
                                                    >
                                                        Invoice
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className=" max-w-4xl mx-auto py-6">
                                            <h4
                                                className={`${styles.paragraph} text-black font-medium mb-4 col-span-full`}
                                            >
                                                Booking
                                            </h4>
                                            <div className="grid grid-cols-7 px-2">
                                                <div className="col-span-2">
                                                    <p
                                                        className={`${styles.paragraph} !text-black !text-sm`}
                                                    >
                                                        Service
                                                    </p>
                                                </div>
                                                <div className="-ml-6">
                                                    <p
                                                        className={`${styles.paragraph} !text-black !text-sm`}
                                                    >
                                                        Date
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p
                                                        className={`${styles.paragraph} !text-black !text-sm`}
                                                    >
                                                        Time
                                                    </p>
                                                </div>
                                                <div className="-ml-6">
                                                    <p
                                                        className={`${styles.paragraph} !text-black !text-sm`}
                                                    >
                                                        Price
                                                    </p>
                                                </div>
                                                <div>
                                                    <p
                                                        className={`${styles.paragraph} !text-black !text-sm`}
                                                    >
                                                        Amount
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-span-full rounded-lg border border-hh-gray p-2 grid grid-cols-7 mt-2">
                                                <div className="col-span-2">
                                                    <p
                                                        className={`${styles.paragraph} !text-[#999999] !text-xs`}
                                                    >
                                                        Single Sauna Session
                                                    </p>
                                                </div>
                                                <div className="col-span-1 -ml-6">
                                                    <p
                                                        className={`${styles.paragraph} !text-[#999999] !text-xs`}
                                                    >
                                                        07 May 2025
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p
                                                        className={`${styles.paragraph} !text-[#999999] !text-xs`}
                                                    >
                                                        6:20AM to 6:40AM
                                                    </p>
                                                </div>
                                                <div className="col-span-1 -ml-6">
                                                    <p
                                                        className={`${styles.paragraph} !text-[#999999] !text-xs`}
                                                    >
                                                        R210
                                                    </p>
                                                </div>
                                                <div className="col-span-1">
                                                    <p
                                                        className={`${styles.paragraph} !text-[#999999] !text-xs`}
                                                    >
                                                        5PAX
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="max-w-4xl mx-auto pt-6">
                                            <div className="divide-y divide-hh-gray ">
                                                <h4
                                                    className={`${styles.paragraph} text-black font-medium mb-4 col-span-full`}
                                                >
                                                    Payment Summary
                                                </h4>
                                                <p
                                                    className={`${styles.paragraph} !text-black py-2 mt-4`}
                                                >
                                                    Subtotal
                                                </p>
                                                <div className="py-2 flex justify-between">
                                                    <p
                                                        className={`${styles.paragraph} !text-black `}
                                                    >
                                                        Total
                                                    </p>
                                                    <p
                                                        className={`${styles.paragraph} !text-black `}
                                                    >
                                                        R210
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="col-span-full flex justify-end gap-x-2 ">
                            <div className="bg-white rounded-full w-10 h-10 flex justify-center items-center shadow">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] `}
                                >
                                    01
                                </p>
                            </div>
                            <div className="bg-white rounded-full w-10 h-10 flex justify-center items-center shadow">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] `}
                                >
                                    02
                                </p>
                            </div>
                            <div className="bg-hh-orange rounded-full w-10 h-10 flex justify-center items-center shadow">
                                <p
                                    className={`${styles.paragraph} !text-white `}
                                >
                                    03
                                </p>
                            </div>
                            <div className="bg-white rounded-full w-10 h-10 flex justify-center items-center shadow">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] `}
                                >
                                    04
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* GRAPH SECTION */}
            </div>
        </AuthenticatedLayout>
    );
}
