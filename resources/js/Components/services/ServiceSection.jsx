import { MapPinIcon } from "@heroicons/react/24/outline";
import styles from "../../../styles";
import { useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";

export default function ServiceSection() {
    const [honeyQuantity, setHoneyQuantity] = useState(0);
    const [reviveQuantity, setReviveQuantity] = useState(0);
    const [peopleQuantity, setPeopleQuantity] = useState(0);
    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <div className="border border-hh-orange bg-white rounded-md shadow grid grid-cols-3 overflow-hidden items-center">
                <div className="col-span-1">
                    <img
                        src="/storage/images/colourful-huts.png"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="col-span-2 py-8 px-20 ">
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
                                15 MINUTES
                            </p>
                        </div>
                    </div>
                    <h3 className={`${styles.h2} mt-6 text-black font-medium`}>
                        Single Sauna Session
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center border border-hh-orange px-2 py-1 rounded">
                            <div className="flex items-center gap-x-2">
                                <input
                                    type="checkbox"
                                    id="honey"
                                    name="honey"
                                    className="h-4 w-4 text-hh-orange ring-white border-hh-orange  ring focus:ring-hh-orange rounded bg-white"
                                />

                                <label
                                    htmlFor="message"
                                    className={`${styles.paragraph} font-medium  text-black`}
                                >
                                    Hot honey / R30
                                </label>
                            </div>
                            <div className="flex gap-x-1">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setHoneyQuantity((prev) =>
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
                                    {honeyQuantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setHoneyQuantity((prev) => prev + 1)
                                    }
                                    className="focus:outline-none"
                                    aria-label="Increase quantity"
                                >
                                    <PlusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center border border-hh-orange px-2 py-1 rounded">
                            <div className="flex items-center gap-x-2">
                                <input
                                    type="checkbox"
                                    id="honey"
                                    name="honey"
                                    className="h-4 w-4 text-hh-orange ring-white border-hh-orange  ring focus:ring-hh-orange rounded bg-white"
                                />

                                <label
                                    htmlFor="message"
                                    className={`${styles.paragraph} font-medium  text-black`}
                                >
                                    REVIVE + Water Combo
                                </label>
                            </div>
                            <div className="flex gap-x-1">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setReviveQuantity((prev) =>
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
                                    {reviveQuantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setReviveQuantity((prev) => prev + 1)
                                    }
                                    className="focus:outline-none"
                                    aria-label="Increase quantity"
                                >
                                    <PlusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-end pr-2 pt-10">
                            <div className="flex items-center">
                                <p
                                    className={`${styles.h2} text-hh-orange font-medium !mb-0`}
                                >
                                    R80
                                    <span
                                        className={`!text-hh-gray font-normal  ${styles.paragraph}`}
                                    >
                                        {" "}
                                        / per person
                                    </span>
                                </p>
                            </div>
                            <div className="flex items-center gap-x-4">
                                <p
                                    className={`text-hh-gray ${styles.paragraph}`}
                                >
                                    No of poeple (max 8)
                                </p>
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
                    </div>
                    <div className="flex items-center gap-x-2 justify-end mt-8">
                        <div className="bg-white py-1 px-4 shadow  text-hh-orange rounded border-hh-orange border">
                            <p
                                className={`${styles.paragraph} uppercase !text-sm`}
                            >
                                Go back
                            </p>
                        </div>
                        <div className="bg-hh-orange py-1 px-4 shadow  text-white rounded border-hh-orange border">
                            <p
                                className={`${styles.paragraph} uppercase !text-sm`}
                            >
                                Continue
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
