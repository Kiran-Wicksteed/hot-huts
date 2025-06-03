import { MapPinIcon } from "@heroicons/react/24/outline";
import styles from "../../../styles";
import { useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";

const morningSlots = [
    {
        id: 1,
        time: "06:00AM - 06:20AM",
        spotsLeft: "3 SLOTS LEFT",
    },
    {
        id: 2,
        time: "06:00AM - 06:20AM",
        spotsLeft: "3 SLOTS LEFT",
    },
    {
        id: 3,
        time: "06:00AM - 06:20AM",
        spotsLeft: "3 SLOTS LEFT",
    },
    {
        id: 4,
        time: "06:00AM - 06:20AM",
        spotsLeft: "3 SLOTS LEFT",
    },
    {
        id: 5,
        time: "06:00AM - 06:20AM",
        spotsLeft: "3 SLOTS LEFT",
    },
    {
        id: 6,
        time: "06:00AM - 06:20AM",
        spotsLeft: "3 SLOTS LEFT",
    },
    {
        id: 7,
        time: "06:00AM - 06:20AM",
        spotsLeft: "3 SLOTS LEFT",
    },
    {
        id: 8,
        time: "06:00AM - 06:20AM",
        spotsLeft: "3 SLOTS LEFT",
    },
];

export default function TimeDate({
    nextStep,
    prevStep,
    updateFormData,
    formData,
}) {
    const { location, services, date, time } = formData;
    const [selectedTime, setSelectedTime] = useState(null);
    const prices = {
        people: 80,
        honey: 30,
        revive: 40,
    };

    // Update service quantities
    const updateService = (field, value) => {
        updateFormData({
            services: {
                ...services,
                [field]: Math.max(0, value),
            },
        });
    };

    const calculateTotal = () => {
        return (
            services.people * prices.people +
            services.honey * prices.honey +
            services.revive * prices.revive
        );
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString("en-ZA", {
            style: "currency",
            currency: "ZAR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    const total = calculateTotal();

    // Update time slot selection
    const handleTimeSelect = (item) => {
        setSelectedTime(item.id);
        updateFormData({ time: item.time });
    };

    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            {" "}
            <h1
                className={`${styles.h3} !text-2xl !text-black font-normal max-w-3xl`}
            >
                Feel the Chill, Embrace the Heat — sauna sessions by the sea.{" "}
                <span className="text-hh-orange block">{location.name}</span>
            </h1>
            <div className=" grid grid-cols-3 gap-x-20 relative mt-10">
                <div className="col-span-2  bg-white">
                    <h3 className={`${styles.h2} text-black font-medium`}>
                        Pick a slot on a{" "}
                        <span className="text-hh-orange font-semibold">
                            {location.day}
                        </span>
                    </h3>
                    <div className="space-y-10">
                        <div>
                            <p
                                className={`${styles.paragraph} mb-6 underline !text-lg text-black font-medium`}
                            >
                                Morining Slots
                            </p>
                            <div className="h-[485px] overflow-y-scroll scroll-container space-y-2">
                                {morningSlots.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`border bg-white rounded shadow p-6 flex items-center justify-between cursor-pointer mr-2 ${
                                            selectedTime === item.id
                                                ? "border-hh-orange"
                                                : "border-hh-gray"
                                        }`}
                                        onClick={() => handleTimeSelect(item)}
                                    >
                                        <p
                                            className={`${styles.paragraph} text-black font-medium `}
                                        >
                                            {item.time}
                                        </p>
                                        <div>
                                            <p
                                                className={`${styles.paragraph} text-[#999999]  font-normal`}
                                            >
                                                3 SLOTS LEFT
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p
                                className={`${styles.paragraph} mb-6 underline !text-lg text-black font-medium`}
                            >
                                Evening Slots
                            </p>
                            <div className="h-[485px] overflow-y-scroll scroll-container space-y-2">
                                {morningSlots.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`border bg-white rounded shadow p-6 flex items-center justify-between cursor-pointer mr-2 ${
                                            selectedTime === item.id
                                                ? "border-hh-orange"
                                                : "border-hh-gray"
                                        }`}
                                        onClick={() => handleTimeSelect(item)}
                                    >
                                        <p
                                            className={`${styles.paragraph} text-black font-medium `}
                                        >
                                            {item.time}
                                        </p>
                                        <div>
                                            <p
                                                className={`${styles.paragraph} text-[#999999]  font-normal`}
                                            >
                                                3 SLOTS LEFT
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-span-1 border border-hh-gray bg-white rounded-md shadow overflow-hidden h-fit sticky top-12">
                    <div className="p-8">
                        <h4
                            className={`${styles.h3} !mb-4 font-medium text-black`}
                        >
                            Summary
                        </h4>
                        <div className="flex items-center gap-x-2">
                            <div className="bg-hh-orange py-1 px-4 shadow flex items-center gap-1 text-white rounded">
                                <MapPinIcon className="h-5 w-5" />
                                <p
                                    className={`${styles.paragraph} uppercase !text-sm`}
                                >
                                    {location.day}
                                </p>
                            </div>
                            <div className="bg-hh-orange py-1 px-4 shadow flex items-center gap-1 text-white rounded">
                                <p
                                    className={`${styles.paragraph} uppercase !text-sm`}
                                >
                                    15 minutes
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-x-2 mt-6 mb-6 text-hh-orange">
                                <MapPinIcon className="h-6 w-6 shrink-0" />
                                <h3
                                    className={`${styles.h3}  !mb-0  font-medium`}
                                >
                                    {location.name}
                                </h3>
                            </div>

                            <div className="flex justify-between items-end border border-hh-gray  p-2 rounded">
                                <div className="flex items-center">
                                    <p
                                        className={`${styles.paragraph} text-black font-medium !mb-0`}
                                    >
                                        Single Sauna Session
                                    </p>
                                </div>
                                <div className="flex items-center gap-x-4">
                                    <div className="flex gap-x-1">
                                        <button
                                            onClick={() =>
                                                updateService(
                                                    "people",
                                                    services.people - 1
                                                )
                                            }
                                            aria-label="Decrease people quantity"
                                        >
                                            <MinusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                        </button>
                                        <span
                                            className={`${styles.paragraph} font-medium text-black w-6 text-center flex justify-center items-center`}
                                        >
                                            {" "}
                                            {services.people}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateService(
                                                    "people",
                                                    Math.min(
                                                        8,
                                                        services.people + 1
                                                    )
                                                )
                                            }
                                            aria-label="Increase people quantity"
                                        >
                                            <PlusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-end border border-hh-gray  p-2 rounded">
                                <div className="flex items-center">
                                    <p
                                        className={`${styles.paragraph} text-black font-medium !mb-0`}
                                    >
                                        Hot Honey
                                    </p>
                                </div>
                                <div className="flex items-center gap-x-4">
                                    <div className="flex gap-x-1">
                                        <button
                                            onClick={() =>
                                                updateService(
                                                    "honey",
                                                    services.honey - 1
                                                )
                                            }
                                            aria-label="Decrease honey quantity"
                                        >
                                            <MinusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                        </button>
                                        <span
                                            className={`${styles.paragraph} font-medium text-black w-6 text-center flex justify-center items-center`}
                                        >
                                            {" "}
                                            {services.honey}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateService(
                                                    "honey",
                                                    Math.min(
                                                        8,
                                                        services.honey + 1
                                                    )
                                                )
                                            }
                                            aria-label="Increase honey quantity"
                                        >
                                            <PlusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-end border border-hh-gray  p-2 rounded">
                                <div className="flex items-center">
                                    <p
                                        className={`${styles.paragraph} text-black font-medium !mb-0`}
                                    >
                                        REVIVE + Water Combo
                                    </p>
                                </div>
                                <div className="flex items-center gap-x-4">
                                    <div className="flex gap-x-1">
                                        <button
                                            onClick={() =>
                                                updateService(
                                                    "revive",
                                                    services.revive - 1
                                                )
                                            }
                                            aria-label="Decrease revive quantity"
                                        >
                                            <MinusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                        </button>
                                        <span
                                            className={`${styles.paragraph} font-medium text-black w-6 text-center flex justify-center items-center`}
                                        >
                                            {" "}
                                            {services.revive}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateService(
                                                    "revive",
                                                    Math.min(
                                                        8,
                                                        services.revive + 1
                                                    )
                                                )
                                            }
                                            aria-label="Increase revive quantity"
                                        >
                                            <PlusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 flex justify-between gap-x-2 items-center">
                                {" "}
                                <div className="bg-white w-full py-3 shadow flex items-center justify-center gap-1 text-hh-orange rounded border border-hh-orange">
                                    <p
                                        className={`${styles.paragraph} uppercase  !text-sm`}
                                    >
                                        {date || "Date selected"}
                                    </p>
                                </div>
                                <div className="bg-white w-full py-3 shadow flex items-center justify-center gap-1 text-hh-orange rounded border border-hh-orange">
                                    <p
                                        className={`${styles.paragraph} uppercase !text-sm`}
                                    >
                                        {time || "Time selected"}
                                    </p>
                                </div>
                            </div>
                            <h4
                                className={`${styles.h3} !mb-4 font-medium text-hh-orange pt-8`}
                            >
                                Total: {formatCurrency(total)}
                            </h4>
                            <div className="flex items-center gap-x-2">
                                <input
                                    type="checkbox"
                                    id="honey"
                                    name="honey"
                                    className="h-4 w-4 text-hh-orange ring-white border-hh-orange  ring focus:ring-hh-orange rounded bg-white"
                                />

                                <label
                                    htmlFor="message"
                                    className={`${styles.paragraph}  text-hh-gray !text-sm`}
                                >
                                    I agree that I have read and accepted the
                                    Terms of Use and Privacy Policy
                                </label>
                            </div>
                            <div className="flex items-center gap-x-2 pt-6">
                                <div className="bg-white border  border-hh-orange py-1 px-4 shadow flex items-center gap-1 text-hh-orange rounded">
                                    <button
                                        onClick={prevStep}
                                        className={`${styles.paragraph} uppercase whitespace-nowrap`}
                                    >
                                        go back
                                    </button>
                                </div>
                                <div className="bg-hh-orange py-1 w-full px-4 shadow flex items-center justify-center gap-1 text-white rounded">
                                    <button
                                        onClick={nextStep}
                                        className={`${styles.paragraph} uppercase `}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
