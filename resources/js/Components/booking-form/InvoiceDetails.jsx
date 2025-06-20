import { useState } from "react";
import { router } from "@inertiajs/react";
import dayjs from "dayjs";
import {
    UserIcon,
    EnvelopeIcon,
    MapPinIcon,
    PhoneIcon,
} from "@heroicons/react/24/outline";
import styles from "../../../styles";

// 🔄  tiny helper: pick only addons > 0
const chosenAddons = (services, catalogue) =>
    catalogue
        .filter((s) => s.category === "addon" && (services[s.code] ?? 0) > 0)
        .map((s) => ({
            ...s,
            qty: services[s.code],
            line: services[s.code] * s.price,
        }));

export default function InvoiceDetails({
    nextStep,
    prevStep,
    formData,
    services: catalogue, // 🔄 pass full catalogue from the page
}) {
    const { location, services, timeslot_id } = formData;
    const people = services.people;

    /* 🔄  prices come from services table */
    const sessionSvc = catalogue.find((s) => s.code === "SAUNA_SESSION");
    const baseLine = people * sessionSvc.price;

    const addonsLines = chosenAddons(services, catalogue);
    const addonsTotal = addonsLines.reduce((t, l) => t + l.line, 0);

    const grandTotal = baseLine + addonsTotal;

    const invoiceDate = dayjs().format("D MMMM YYYY");

    /* 🔄  POST booking then move to payment step */
    const makeBooking = () => {
        console.log("Creating booking with data:", {
            timeslot_id,
            people,
            services: Object.fromEntries(
                addonsLines.map((l) => [l.code, l.qty])
            ),
        });
        router.post(
            route("bookings.store"),
            {
                timeslot_id,
                people,
                services: Object.fromEntries(
                    addonsLines.map((l) => [l.code, l.qty])
                ),
            },
            {
                onSuccess: () => {
                    localStorage.removeItem("hh_step");
                    localStorage.removeItem("hh_form");
                },
            }
        );
    };

    const handleBookAnother = () => {
        localStorage.removeItem("hh_step");
        localStorage.removeItem("hh_form");
        router.visit(route("index"));
    };

    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <div className="grid grid-cols-3 gap-x-8">
                {/* ------------ LEFT PANEL (invoice) ------------- */}
                <div className="col-span-2 border border-hh-gray rounded-md shadow bg-white p-6">
                    <h1 className={`${styles.h2} text-hh-orange font-medium`}>
                        Single sauna session
                    </h1>
                    <p className={`${styles.h3} font-medium text-black mb-4`}>
                        {location.name}
                    </p>

                    {/* HEADER BOX */}
                    <div className="bg-[#F5F5F5] rounded-md p-6 mb-8">
                        <div className="flex justify-between">
                            <div>
                                <p
                                    className={`${styles.h3} font-medium text-black/50 mb-2`}
                                >
                                    Invoice Details
                                </p>
                                <p className={`${styles.paragraph} text-black`}>
                                    —
                                </p>
                                <p
                                    className={`${styles.paragraph} text-sm text-black/50`}
                                >
                                    {invoiceDate}
                                </p>
                            </div>
                            {/* Replace hard-coded customer details with auth.user */}
                            {/* … */}
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <div className="grid grid-cols-8 gap-y-2">
                        <Header />
                        <Line
                            item={`Session @ ${location.name}`}
                            qty={people}
                            unit={sessionSvc.price}
                            total={baseLine}
                        />
                        {addonsLines.map((l) => (
                            <Line
                                key={l.id}
                                item={l.name}
                                qty={l.qty}
                                unit={l.price}
                                total={l.line}
                            />
                        ))}
                    </div>

                    {/* TOTAL */}
                    <div className="grid grid-cols-8 bg-[#F5F5F5] rounded py-4 mt-8">
                        <div className="col-span-5" />
                        <p
                            className={`${styles.paragraph} col-span-2 text-right text-black/50`}
                        >
                            Total Amount:
                        </p>
                        <p
                            className={`${styles.paragraph} col-span-1 text-black`}
                        >
                            R{grandTotal.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* ------------- RIGHT PANEL (customer) ------------- */}
                <div className="col-span-1">
                    {/* client info … unchanged … */}

                    <div className="space-y-2 mt-6">
                        <button
                            onClick={makeBooking} // 🔄 create booking
                            className="shadow border border-hh-orange w-full py-2 text-white bg-hh-orange rounded"
                        >
                            <span className={`${styles.paragraph} font-medium`}>
                                Proceed to payment
                            </span>
                        </button>
                        <button
                            onClick={handleBookAnother} // 🔄 handle book another
                            className="bg-black shadow w-full py-2 text-white rounded"
                        >
                            <span className={`${styles.paragraph} font-medium`}>
                                Book another session
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- small sub-components ---------- */
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

const Line = ({ item, qty, unit, total }) => (
    <>
        <p className={`${styles.paragraph} col-span-3 text-sm text-black`}>
            {item}
        </p>
        <p className={`${styles.paragraph} col-span-2 text-sm text-black/50`}>
            {qty}
        </p>
        <p className={`${styles.paragraph} col-span-2 text-sm text-black/50`}>
            R{unit}
        </p>
        <p className={`${styles.paragraph} col-span-1 text-sm text-black`}>
            R{total}
        </p>
    </>
);
