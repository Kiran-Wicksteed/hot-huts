import { MapPinIcon } from "@heroicons/react/24/outline";
import styles from "../../../styles";
import { useState } from "react";

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
];

export default function Calendar() {
    const [selectedTime, setSelectedTime] = useState(null);
    return (
        <div
            className={`${styles.boxWidth} pt-16 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20 grid grid-cols-5 gap-6`}
        >
            <div className="col-span-3 grid grid-rows-3 gap-y-6">
                <div className="border border-hh-gray bg-white  shadow  p-6 row-span-1"></div>
                <div className="border border-hh-gray bg-white  shadow  p-6 row-span-2">
                    <h3 className={`${styles.h2} text-black font-medium`}>
                        Location
                    </h3>
                    <div className="space-y-4">
                        <div className="border border-hh-gray bg-white rounded shadow  p-6 flex items-center">
                            <p
                                className={`${styles.paragraph} text-black font-normal flex-initial w-3/5`}
                            >
                                St James Tidal Pool
                            </p>
                            <div className="flex items-center text-hh-orange flex-initial w-2/5 gap-x-2">
                                <MapPinIcon className="h-6 w-6" />
                                <p
                                    className={`${styles.paragraph}  font-normal`}
                                >
                                    Wednesday
                                </p>
                            </div>
                        </div>
                        <div className="border border-hh-gray bg-white rounded shadow  p-6 flex items-center">
                            <p
                                className={`${styles.paragraph} text-black font-normal flex-initial w-3/5`}
                            >
                                Simon's Town - Long Beach{" "}
                            </p>
                            <div className="flex items-center text-hh-orange flex-initial w-2/5 gap-x-2">
                                <MapPinIcon className="h-6 w-6" />
                                <p
                                    className={`${styles.paragraph}  font-normal`}
                                >
                                    Sunday
                                </p>
                            </div>
                        </div>
                        <div className="border border-hh-gray bg-white rounded shadow  p-6 flex items-center">
                            <p
                                className={`${styles.paragraph} text-black font-normal flex-initial w-3/5`}
                            >
                                Dalebrook Tidal Pool
                            </p>
                            <div className="flex items-center text-hh-orange flex-initial w-2/5 gap-x-2">
                                <MapPinIcon className="h-6 w-6" />
                                <p
                                    className={`${styles.paragraph}  font-normal`}
                                >
                                    Monday & Friday
                                </p>
                            </div>
                        </div>
                        <div className="border border-hh-gray bg-white rounded shadow  p-6 flex items-center">
                            <p
                                className={`${styles.paragraph} text-black font-normal flex-initial w-3/5`}
                            >
                                Camps Bay Tidal Pool
                            </p>
                            <div className="flex items-center text-hh-orange flex-initial w-2/5 gap-x-2">
                                <MapPinIcon className="h-6 w-6" />
                                <p
                                    className={`${styles.paragraph}  font-normal`}
                                >
                                    Wednesday & Saturday
                                </p>
                            </div>
                        </div>
                        <div className="border border-hh-gray bg-white rounded shadow  p-6 flex items-center">
                            <p
                                className={`${styles.paragraph} text-black font-normal flex-initial w-3/5`}
                            >
                                Kleinbaai Beach
                            </p>
                            <div className="flex items-center text-hh-orange flex-initial w-2/5 gap-x-2">
                                <MapPinIcon className="h-6 w-6" />
                                <p
                                    className={`${styles.paragraph}  font-normal`}
                                >
                                    Tuesday
                                </p>
                            </div>
                        </div>
                        <div className="border border-hh-gray bg-white rounded shadow  p-6 flex items-center">
                            <p
                                className={`${styles.paragraph} text-black font-normal flex-initial w-3/5`}
                            >
                                Saunders Rock Beach
                            </p>
                            <div className="flex items-center text-hh-orange flex-initial w-2/5 gap-x-2">
                                <MapPinIcon className="h-6 w-6" />
                                <p
                                    className={`${styles.paragraph}  font-normal`}
                                >
                                    Friday & Sunday
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-span-2 grid grid-rows-3 gap-y-6">
                <div className="border border-hh-gray bg-white  shadow  p-6 row-span-3">
                    <h3 className={`${styles.h2} !mb-8 text-black font-medium`}>
                        Times
                    </h3>
                    <div className="space-y-20">
                        <div>
                            <p
                                className={`${styles.paragraph} mb-6 underline !text-lg text-black font-medium`}
                            >
                                Morining Slots
                            </p>
                            <div className="h-[330px] overflow-y-scroll scroll-container">
                                {morningSlots.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`border bg-white rounded shadow p-6 flex items-center mt-2 cursor-pointer mr-2 ${
                                            selectedTime === item.id
                                                ? "border-hh-orange"
                                                : "border-hh-gray"
                                        }`}
                                        onClick={() => setSelectedTime(item.id)}
                                    >
                                        <p
                                            className={`${styles.paragraph} text-black font-medium flex-initial w-3/5`}
                                        >
                                            {item.time}
                                        </p>
                                        <div className=" flex-initial w-2/5 ">
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
                            <div className="h-[330px] overflow-y-scroll scroll-container">
                                {morningSlots.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`border bg-white rounded shadow p-6 flex items-center mt-2 cursor-pointer mr-2 ${
                                            selectedTime === item.id
                                                ? "border-hh-orange"
                                                : "border-hh-gray"
                                        }`}
                                        onClick={() => setSelectedTime(item.id)}
                                    >
                                        <p
                                            className={`${styles.paragraph} text-black font-medium flex-initial w-3/5`}
                                        >
                                            {item.time}
                                        </p>
                                        <div className=" flex-initial w-2/5 ">
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
            </div>
        </div>
    );
}
