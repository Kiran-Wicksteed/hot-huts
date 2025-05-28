import { MapPinIcon } from "@heroicons/react/24/outline";
import styles from "../../../styles";
import { useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";

export default function EventsSection() {
    const [honeyQuantity, setHoneyQuantity] = useState(0);
    const [reviveQuantity, setReviveQuantity] = useState(0);
    const [peopleQuantity, setPeopleQuantity] = useState(0);
    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <div className=" grid grid-cols-2 gap-x-20">
                <div className="col-span-1 border border-hh-gray bg-white rounded-md shadow overflow-hidden">
                    <img
                        src="/storage/images/banner-image.png"
                        alt=""
                        className="w-full h-40 object-cover"
                    />
                    <div className="p-8">
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
                        <div className="space-y-4">
                            <h3
                                className={`${styles.h2} mt-6 text-black font-medium`}
                            >
                                Single Sauna Session
                            </h3>
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
                                            setReviveQuantity(
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
                    </div>
                </div>
                <div className="col-span-1 border border-hh-gray bg-white rounded-md shadow overflow-hidden">
                    <img
                        src="/storage/images/pattern-banner.png"
                        alt=""
                        className="w-full h-40 object-cover"
                    />
                    <div className="p-8">
                        <div className="flex items-center gap-x-2">
                            <div className="bg-hh-orange py-1 px-4 shadow flex items-center gap-1 text-white rounded">
                                <p
                                    className={`${styles.paragraph} uppercase !text-sm`}
                                >
                                    World Sauna Day
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3
                                className={`${styles.h2} mt-6 !mb-4 text-black font-medium`}
                            >
                                Sound Bath with Leandra Besters
                            </h3>
                            <p
                                className={`${styles.paragraph} !text-sm text-black !mb-4`}
                            >
                                We’re bringing our unbelievable sauna & sound
                                offering to Simon’s Town on the 27th April. Come
                                through and have a sauna, a sound bath, a swim,
                                and unmatched vibes!
                            </p>
                            <div className="flex justify-between items-center border border-hh-gray px-2 py-1 rounded w-fit">
                                <div className="flex items-center gap-x-2">
                                    <input
                                        type="checkbox"
                                        id="honey"
                                        name="honey"
                                        className="h-4 w-4 text-hh-orange ring-white border-hh-orange  ring focus:ring-hh-orange rounded bg-white"
                                    />

                                    <label
                                        htmlFor="message"
                                        className={`${styles.paragraph} font-medium text-black`}
                                    >
                                        Single Sauna Session (15 minuets)*
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-between items-end pr-2 pt-6">
                                <div className="flex items-center">
                                    <p
                                        className={`${styles.h2} text-hh-orange font-medium !mb-0`}
                                    >
                                        R280
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
                            <p
                                className={`text-hh-gray ${styles.paragraph} !text-xs pt-2`}
                            >
                                *A 15 minute sauna is automatically included
                                with our sound bath package
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
