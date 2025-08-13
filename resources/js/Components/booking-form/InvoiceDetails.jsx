import { router } from "@inertiajs/react";
import dayjs from "dayjs";
import styles from "../../../styles";

/* ---------- helper: return only add‑ons with qty > 0 ---------- */
const chosenAddons = (services, catalogue) =>
    catalogue
        .filter((s) => s.category === "addon" && (services[s.code] ?? 0) > 0)
        .map((s) => {
            const priceNum = Number(s.price); // 👈 ensure numeric
            return {
                ...s,
                price: priceNum,
                qty: services[s.code],
                line: services[s.code] * priceNum,
            };
        });

/* ----------------------------------------------------------------
   main component
----------------------------------------------------------------- */
export default function InvoiceDetails({
    nextStep,
    prevStep,
    formData,
    services: catalogue, // full catalogue
}) {
    /* ---------- destructure form data ---------- */
    const {
        booking_type = "sauna", // "sauna" | "event"
        location,
        services,
        timeslot_id,

        // event‑specific fields (undefined for sauna‑only)
        event_occurrence_id,
        event_name,
        event_people = 0,
        event_price_per_person = 0, // cents
        event_price = 0, // cents   (event+sauna package)
    } = formData;

    console.log("Formdata", formData);

    /* ---------- line‑item basics ---------- */
    const people = booking_type === "event" ? event_people : services.people;
    const itemName =
        booking_type === "event"
            ? `${event_name} + sauna`
            : `Session @ ${location.name}`;

    const sessionSvc = catalogue.find((s) => s.code === "SAUNA_SESSION");

    /* convert event prices from cents → rands */
    const eventUnitRand = (event_price / 100).toFixed(2);
    const eventLineRand = (event_price / 100).toFixed(2);

    /* unit + line price for the main row */
    const unitPrice =
        booking_type === "event"
            ? parseFloat(eventUnitRand)
            : parseFloat(sessionSvc.price);

    const baseLine =
        booking_type === "event"
            ? parseFloat(eventLineRand)
            : people * sessionSvc.price;

    /* ---------- add‑ons ---------- */
    const addonsLines = chosenAddons(services, catalogue);
    const addonsTotal = addonsLines.reduce((t, l) => t + l.line, 0);

    /* ---------- grand total ---------- */
    const grandTotal = baseLine + addonsTotal;
    const invoiceDate = dayjs().format("D MMMM YYYY");

    /* ---------- POST booking ---------- */
    const makeBooking = () => {
        console.log("Booking data:", {
            booking_type: formData.booking_type,
            timeslot_id,
            event_occurrence_id, // null for sauna‑only
            people,
            services: Object.fromEntries(
                addonsLines.map((l) => [l.code, l.qty])
            ),
        });
        router.post(
            route("bookings.store"),
            {
                booking_type: formData.booking_type,
                timeslot_id,
                event_occurrence_id, // null for sauna‑only
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

    /* ----------------------------------------------------------------
     render
  ----------------------------------------------------------------- */
    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <div className="grid grid-cols-3 gap-x-8">
                {/* =========== LEFT: invoice =========== */}
                <div className="col-span-2 border border-hh-gray rounded-md shadow bg-white p-6">
                    <h1 className={`${styles.h2} text-hh-orange font-medium`}>
                        {booking_type === "event"
                            ? event_name
                            : "Single sauna session"}
                    </h1>
                    <p className={`${styles.h3} font-medium text-black mb-4`}>
                        {location.name}
                    </p>

                    {/* invoice header */}
                    <div className="bg-[#F5F5F5] rounded-md p-6 mb-8">
                        <p
                            className={`${styles.h3} font-medium text-black/50 mb-2`}
                        >
                            Invoice Details
                        </p>
                        <p
                            className={`${styles.paragraph} text-sm text-black/50`}
                        >
                            {invoiceDate}
                        </p>
                    </div>

                    {/* items */}
                    <div className="grid grid-cols-8 gap-y-2">
                        <Header />

                        {/* main line item */}
                        <Line
                            item={itemName}
                            qty={people}
                            unit={unitPrice.toFixed(2)}
                            total={baseLine.toFixed(2)}
                        />

                        {/* add‑ons */}
                        {addonsLines.map((l) => (
                            <Line
                                key={l.id}
                                item={l.name}
                                qty={l.qty}
                                unit={l.price.toFixed(2)}
                                total={l.line.toFixed(2)}
                            />
                        ))}
                    </div>

                    {/* grand total */}
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

                {/* =========== RIGHT: actions =========== */}
                <div className="col-span-1">
                    <div className="space-y-2 mt-6">
                        <button
                            onClick={makeBooking}
                            className="shadow border border-hh-orange w-full py-2 text-white bg-hh-orange rounded"
                        >
                            <span className={`${styles.paragraph} font-medium`}>
                                Proceed to payment
                            </span>
                        </button>
                        <button
                            onClick={handleBookAnother}
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

/* --------- small sub‑components --------- */
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
