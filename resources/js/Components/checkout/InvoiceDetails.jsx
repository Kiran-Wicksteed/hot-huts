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

export default function InvoiceDetails() {
    const [peopleQuantity, setPeopleQuantity] = useState(0);
    const [selectedTime, setSelectedTime] = useState(null);

    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <div className=" grid grid-cols-3 gap-x-8 relative">
                <div className="col-span-2  border border-hh-gray  rounded-md shadow bg-white p-6">
                    <h1
                        className={`${styles.h2} text-hh-orange font-medium !mb-0`}
                    >
                        Single sauna session
                    </h1>
                    <p className={`${styles.h3} !mb-4 font-medium text-black`}>
                        St James Tidal Pool
                    </p>
                    <div className="bg-[#F5F5F5] rounded-md p-6">
                        <div className="justify-between flex">
                            <div>
                                <p
                                    className={`${styles.h3} !mb-2 font-medium text-black/50`}
                                >
                                    Invoice Details
                                </p>
                                <p
                                    className={`${styles.paragraph}  text-black`}
                                >
                                    INV-10839
                                </p>
                                <p
                                    className={`${styles.paragraph} !text-sm text-black/50`}
                                >
                                    23 April 2025
                                </p>
                            </div>
                            <div>
                                <p
                                    className={`${styles.paragraph} !mb-2 font-medium text-black !text-lg`}
                                >
                                    Samantha Jones
                                </p>
                                <p
                                    className={`${styles.paragraph} text-right !text-sm text-black/50`}
                                >
                                    Billed to:
                                    <span className="block">123 Sisipi St</span>
                                    <span className="block">Cape Town</span>
                                    <span className="block">
                                        South Africa 7967
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-8 mt-8 ">
                        <div className="col-span-3">
                            {" "}
                            <p
                                className={`${styles.paragraph} !text-sm text-black/50`}
                            >
                                Item
                            </p>
                        </div>
                        <div className="col-span-2">
                            {" "}
                            <p
                                className={`${styles.paragraph} !text-sm text-black/50`}
                            >
                                Quantity
                            </p>
                        </div>
                        <div className="col-span-2">
                            {" "}
                            <p
                                className={`${styles.paragraph} !text-sm text-black/50`}
                            >
                                Amount
                            </p>
                        </div>
                        <div className="col-span-1">
                            {" "}
                            <p
                                className={`${styles.paragraph} !text-sm text-black/50`}
                            >
                                Total
                            </p>
                        </div>
                        <div className="col-span-full divide-y divide-[#F5F5F5] mt-6 ">
                            <div className="grid grid-cols-8  h-16 border-t border-[#F5F5F5] items-center">
                                <div className="col-span-3">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black w-1/2`}
                                    >
                                        Single sauna session St James Tidal Pool
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        3
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        R80
                                    </p>
                                </div>
                                <div className="col-span-1">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black `}
                                    >
                                        R210
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-8 h-16 items-center">
                                <div className="col-span-3">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black `}
                                    >
                                        Hot Honey
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        1
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        R30
                                    </p>
                                </div>
                                <div className="col-span-1">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black `}
                                    >
                                        R60
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-8 h-16 items-center">
                                <div className="col-span-3">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black w-1/2`}
                                    >
                                        REVIVE + Water combo
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        1
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        R40
                                    </p>
                                </div>
                                <div className="col-span-1">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black `}
                                    >
                                        R80
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-full grid grid-cols-8 bg-[#F5F5F5] py-4 mt-8 rounded">
                            <div className="col-span-3"></div>
                            <div className="col-span-2"></div>
                            <div className="col-span-2">
                                {" "}
                                <p
                                    className={`${styles.paragraph} !text-sm text-black/50`}
                                >
                                    Total Amount:
                                </p>
                            </div>
                            <div className="col-span-1">
                                {" "}
                                <p
                                    className={`${styles.paragraph} !text-sm text-black`}
                                >
                                    R350
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-span-1 sticky top-12">
                    <div className="p-8  border border-hh-gray bg-white rounded-md shadow h-fit">
                        <h4
                            className={`${styles.h3} !mb-4 font-medium text-black`}
                        >
                            Client Information
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
}
