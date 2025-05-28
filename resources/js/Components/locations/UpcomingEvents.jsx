import { useState } from "react";
import styles from "../../../styles";
import { ClockIcon, MapPinIcon } from "@heroicons/react/24/outline";

const upcomingEvents = [
    {
        id: 1,
        name: "Name of the event",
        location: "St James Tidal Pool",
        date: "1 May 2025",
    },
    {
        id: 2,
        name: "Name of the event",
        location: "St James Tidal Pool",
        date: "1 May 2025",
    },
    {
        id: 3,
        name: "Name of the event",
        location: "St James Tidal Pool",
        date: "1 May 2025",
    },
    {
        id: 4,
        name: "Name of the event",
        location: "St James Tidal Pool",
        date: "1 May 2025",
    },
];

export default function UpcomingEvents() {
    const [selectedTime, setSelectedTime] = useState(null);
    return (
        <div
            className={`${styles.boxWidth} py-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <h4 className={`${styles.h3} !mb-4 font-medium text-black`}>
                Upcoming Events
            </h4>

            <div className="space-y-4">
                {upcomingEvents.map((item, index) => (
                    <div
                        key={index}
                        className={`border  rounded shadow p-6 flex items-center justify-between cursor-pointer  ${
                            selectedTime === item.id
                                ? "border-hh-orange bg-white"
                                : "border-hh-gray bg-[#F7F7F7]"
                        }`}
                        onClick={() => setSelectedTime(item.id)}
                    >
                        <h4
                            className={`${styles.paragraph} font-normal text-black`}
                        >
                            {item.name}
                        </h4>
                        <div className="flex items-center gap-x-2">
                            <MapPinIcon className="h-6 w-6 text-hh-orange" />
                            <p
                                className={`${styles.paragraph} font-normal text-[#999999]`}
                            >
                                {item.location}
                            </p>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <ClockIcon className="h-6 w-6 text-hh-orange" />
                            <p
                                className={`${styles.paragraph} font-normal text-[#999999]`}
                            >
                                {item.date}
                            </p>
                        </div>
                        <button
                            className={` !mb-0 ${styles.h3}  ${
                                selectedTime === item.id
                                    ? "text-hh-orange  "
                                    : "text-[#999999]"
                            }`}
                            onClick={() => setSelectedTime(item.id)}
                        >
                            <span>Book Now</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
