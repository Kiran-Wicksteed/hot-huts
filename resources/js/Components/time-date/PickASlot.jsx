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

export default function PickASlot() {
    const [honeyQuantity, setHoneyQuantity] = useState(0);
    const [reviveQuantity, setReviveQuantity] = useState(0);
    const [peopleQuantity, setPeopleQuantity] = useState(0);
    const [selectedTime, setSelectedTime] = useState(null);

    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <div className=" grid grid-cols-3 gap-x-20 relative">
                <div className="col-span-2  bg-white">
                    <h3 className={`${styles.h2} text-black font-medium`}>
                        Pick a slot on a{" "}
                        <span className="text-hh-orange font-semibold">
                            Wednesday
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
                                        onClick={() => setSelectedTime(item.id)}
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
                                        onClick={() => setSelectedTime(item.id)}
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
                                    Wednesday
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
                                    St James Tidal Pool
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
                                            type="button"
                                            onClick={() =>
                                                setPeopleQuantity((prev) =>
                                                    Math.max(0, prev - 1)
                                                )
                                            }
                                            className="focus:outline-none"
                                            aria-label="Increase quantity"
                                        >
                                            <MinusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                        </button>
                                        <span
                                            className={`${styles.paragraph} font-medium text-black w-6 text-center flex justify-center items-center`}
                                        >
                                            {" "}
                                            {peopleQuantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPeopleQuantity(
                                                    (prev) => prev + 1
                                                )
                                            }
                                            className="focus:outline-none"
                                            aria-label="Increase quantity"
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
                                            type="button"
                                            onClick={() =>
                                                setPeopleQuantity((prev) =>
                                                    Math.max(0, prev - 1)
                                                )
                                            }
                                            className="focus:outline-none"
                                            aria-label="Increase quantity"
                                        >
                                            <MinusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                        </button>
                                        <span
                                            className={`${styles.paragraph} font-medium text-black w-6 text-center flex justify-center items-center`}
                                        >
                                            {" "}
                                            {peopleQuantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPeopleQuantity(
                                                    (prev) => prev + 1
                                                )
                                            }
                                            className="focus:outline-none"
                                            aria-label="Increase quantity"
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
                                            type="button"
                                            onClick={() =>
                                                setPeopleQuantity((prev) =>
                                                    Math.max(0, prev - 1)
                                                )
                                            }
                                            className="focus:outline-none"
                                            aria-label="Increase quantity"
                                        >
                                            <MinusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                        </button>
                                        <span
                                            className={`${styles.paragraph} font-medium text-black w-6 text-center flex justify-center items-center`}
                                        >
                                            {" "}
                                            {peopleQuantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPeopleQuantity(
                                                    (prev) => prev + 1
                                                )
                                            }
                                            className="focus:outline-none"
                                            aria-label="Increase quantity"
                                        >
                                            <PlusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 flex justify-between gap-x-4 items-center">
                                {" "}
                                <div className="bg-white w-full py-3 shadow flex items-center justify-center gap-1 text-hh-orange rounded border border-hh-orange">
                                    <p
                                        className={`${styles.paragraph} uppercase `}
                                    >
                                        24/04/2025
                                    </p>
                                </div>
                                <div className="bg-white w-full py-3 shadow flex items-center justify-center gap-1 text-hh-orange rounded border border-hh-orange">
                                    <p
                                        className={`${styles.paragraph} uppercase `}
                                    >
                                        6:20AM
                                    </p>
                                </div>
                            </div>
                            <h4
                                className={`${styles.h3} !mb-4 font-medium text-hh-orange pt-8`}
                            >
                                Total:
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
                                    <p
                                        className={`${styles.paragraph} uppercase whitespace-nowrap`}
                                    >
                                        go back
                                    </p>
                                </div>
                                <div className="bg-hh-orange py-1 w-full px-4 shadow flex items-center justify-center gap-1 text-white rounded">
                                    <p
                                        className={`${styles.paragraph} uppercase `}
                                    >
                                        Continue
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
