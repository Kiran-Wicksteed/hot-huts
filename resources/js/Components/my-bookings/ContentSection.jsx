import styles from "../../../styles";
import { usePage } from "@inertiajs/react";
import FrontendSidebar from "@/Layouts/FrontendSidebar";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
    ClockIcon,
    ShoppingCartIcon,
    MapPinIcon,
    CalendarIcon,
} from "@heroicons/react/24/outline";

const ProgressCircle = ({ points }) => {
    // Calculate progress percentage (0-100)
    const normalizedPoints = points % 4;
    const progress =
        normalizedPoints === 0 && points > 0 ? 100 : normalizedPoints * 25;

    return (
        <div className="relative h-14 w-14">
            {/* Background circle (empty state) */}
            <div className="absolute inset-0 rounded-full border border-hh-gray shadow" />

            {/* Progress fill */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `conic-gradient(
              #FF5733 0% ${progress}%, 
              transparent ${progress}% 100%
            )`,
                    mask: "radial-gradient(white 55%",
                    WebkitMask: "radial-gradient(white 55%)",
                }}
            />
        </div>
    );
};

export default function ContentSection() {
    const [startDate, setStartDate] = useState(new Date());
    const { auth } = usePage().props;
    const user = auth.user;
    const loyaltyPoints = 1;

    const asset = (path) => {
        return `/storage/${path}`;
    };

    return (
        <div
            className={`${styles.boxWidth} py-12 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20 flex gap-x-16`}
        >
            <FrontendSidebar />
            <div>
                <div className="flex justify-between items-center ">
                    <div className="flex gap-x-4  items-center">
                        {user.photo != null ? (
                            <div className=" h-14 w-14 overflow-hidden shrink-0 rounded-full">
                                <img
                                    alt=""
                                    src={asset(user.photo)}
                                    className="object-cover top-0 left-0 w-full h-full"
                                />
                            </div>
                        ) : (
                            <UserIcon
                                aria-hidden="true"
                                className="h-14 w-14 text-white bg-hh-orange rounded-full p-1.5"
                            />
                        )}

                        <p className={`${styles.paragraph} text-black `}>
                            Good morning,{" "}
                            <span className="font-medium"> {user.name}</span>
                        </p>
                    </div>
                    <div className="flex gap-x-4  items-center">
                        <p
                            className={`${styles.paragraph} !text-2xl text-black font-medium"`}
                        >
                            Loyalty Points received
                        </p>
                        <ProgressCircle points={loyaltyPoints} />
                    </div>
                </div>
                <div className="grid grid-cols-10 gap-x-10 mt-10">
                    <div className="col-span-5">
                        <div>
                            <h1
                                className={`${styles.h2} font-medium text-hh-orange`}
                            >
                                My Bookings
                            </h1>
                            <h3
                                className={`${styles.h3} font-medium text-black`}
                            >
                                Upcoming
                            </h3>
                            <div className="border border-hh-gray px-6 py-16 rounded-md flex flex-col justify-center items-center shadow-md">
                                <CalendarIcon className="h-16 w-16 text-hh-gray" />
                                <h4
                                    className={`${styles.h3} !mb-0 mt-4 font-medium text-black`}
                                >
                                    No upcoming bookings
                                </h4>
                                <p
                                    className={`${styles.paragraph} font-medium text-hh-gray`}
                                >
                                    Your upcoming bookings will appear here
                                </p>
                                <button className="bg-hh-orange rounded border border-hh-orange py-2 px-6 w-fit mt-4">
                                    <span
                                        className={`${styles.paragraph} text-white uppercase`}
                                    >
                                        Book now
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between pt-20">
                                <h3
                                    className={`${styles.h3} font-medium text-black`}
                                >
                                    Past Bookings
                                </h3>
                            </div>
                            <div className="border border-hh-gray bg-white rounded-md shadow grid grid-cols-3 overflow-hidden items-center mt-6">
                                <div className="col-span-1">
                                    <img
                                        src="/storage/images/colourful-huts.png"
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="col-span-2 p-6 ">
                                    <h3
                                        className={`${styles.paragraph}  text-black font-medium`}
                                    >
                                        Camps Bay Tidal Pool
                                    </h3>
                                    <p
                                        className={`${styles.paragraph} text-sm text-black`}
                                    >
                                        Tue, 19 March 2025 at 9:20AM
                                    </p>
                                    <p
                                        className={`${styles.paragraph} text-sm text-hh-gray mt-2`}
                                    >
                                        Single Sauna Session
                                    </p>
                                    <button
                                        className={`text-hh-orange uppercase font-medium ${styles.paragraph}`}
                                    >
                                        Book Again
                                    </button>
                                </div>
                            </div>
                            <div className="border border-hh-gray bg-white rounded-md shadow grid grid-cols-3 overflow-hidden items-center mt-8">
                                <div className="col-span-1">
                                    <img
                                        src="/storage/images/colourful-huts.png"
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="col-span-2 p-6 ">
                                    <h3
                                        className={`${styles.paragraph}  text-black font-medium`}
                                    >
                                        Camps Bay Tidal Pool
                                    </h3>
                                    <p
                                        className={`${styles.paragraph} text-sm text-black`}
                                    >
                                        Tue, 19 March 2025 at 9:20AM
                                    </p>
                                    <p
                                        className={`${styles.paragraph} text-sm text-hh-gray mt-2`}
                                    >
                                        Single Sauna Session
                                    </p>
                                    <button
                                        className={`text-hh-orange uppercase font-medium ${styles.paragraph}`}
                                    >
                                        Book Again
                                    </button>
                                </div>
                            </div>
                            <div className="border border-hh-gray bg-white rounded-md shadow grid grid-cols-3 overflow-hidden items-center mt-8">
                                <div className="col-span-1">
                                    <img
                                        src="/storage/images/colourful-huts.png"
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="col-span-2 p-6 ">
                                    <h3
                                        className={`${styles.paragraph}  text-black font-medium`}
                                    >
                                        Camps Bay Tidal Pool
                                    </h3>
                                    <p
                                        className={`${styles.paragraph} text-sm text-black`}
                                    >
                                        Tue, 19 March 2025 at 9:20AM
                                    </p>
                                    <p
                                        className={`${styles.paragraph} text-sm text-hh-gray mt-2`}
                                    >
                                        Single Sauna Session
                                    </p>
                                    <button
                                        className={`text-hh-orange uppercase font-medium ${styles.paragraph}`}
                                    >
                                        Book Again
                                    </button>
                                </div>
                            </div>
                            <div className="border border-hh-gray bg-white rounded-md shadow grid grid-cols-3 overflow-hidden items-center mt-8">
                                <div className="col-span-1">
                                    <img
                                        src="/storage/images/colourful-huts.png"
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="col-span-2 p-6 ">
                                    <h3
                                        className={`${styles.paragraph}  text-black font-medium`}
                                    >
                                        Camps Bay Tidal Pool
                                    </h3>
                                    <p
                                        className={`${styles.paragraph} text-sm text-black`}
                                    >
                                        Tue, 19 March 2025 at 9:20AM
                                    </p>
                                    <p
                                        className={`${styles.paragraph} text-sm text-hh-gray mt-2`}
                                    >
                                        Single Sauna Session
                                    </p>
                                    <button
                                        className={`text-hh-orange uppercase font-medium ${styles.paragraph}`}
                                    >
                                        Book Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative lg:col-span-5 space-y-8">
                        <div className="border border-hh-gray rounded-md bg-white p-8 space-y-6">
                            <div className=" border border-hh-gray rounded-md  shadow-md">
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    showOutsideMonthDays={false}
                                    inline // This makes the calendar always visible
                                    className="border border-hh-gray rounded-md" // Move border styling here
                                />
                            </div>
                            <div className=" border border-hh-gray rounded-md  shadow-md p-6">
                                <h4
                                    className={`${styles.h3} font-medium text-black`}
                                >
                                    Upcoming Events
                                </h4>
                                <div className="space-y-2">
                                    <div className="border border-hh-orange rounded bg-white flex gap-x-4 p-2 items-center">
                                        <div className="h-16 w-16"></div>
                                        <div>
                                            <p
                                                className={`${styles.paragraph} text-black mb-2`}
                                            >
                                                Name of event
                                            </p>
                                            <div className="flex gap-x-2 items-center">
                                                <div className="flex gap-x-1 items-center">
                                                    <MapPinIcon className="text-hh-orange h-5 w-5" />
                                                    <p
                                                        className={`${styles.paragraph} text-xs text-[#999999]`}
                                                    >
                                                        St James Tidal Pool
                                                    </p>
                                                </div>
                                                <div className="flex gap-x-1 items-center">
                                                    <ClockIcon className="text-hh-orange h-5 w-5" />
                                                    <p
                                                        className={`${styles.paragraph} text-xs text-[#999999]`}
                                                    >
                                                        5 May 2025
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border border-hh-orange rounded bg-white flex gap-x-4 p-2 items-center">
                                        <div className="h-16 w-16"></div>
                                        <div>
                                            <p
                                                className={`${styles.paragraph} text-black mb-2`}
                                            >
                                                Name of event
                                            </p>
                                            <div className="flex gap-x-2 items-center">
                                                <div className="flex gap-x-1 items-center">
                                                    <MapPinIcon className="text-hh-orange h-5 w-5" />
                                                    <p
                                                        className={`${styles.paragraph} text-xs text-[#999999]`}
                                                    >
                                                        St James Tidal Pool
                                                    </p>
                                                </div>
                                                <div className="flex gap-x-1 items-center">
                                                    <ClockIcon className="text-hh-orange h-5 w-5" />
                                                    <p
                                                        className={`${styles.paragraph} text-xs text-[#999999]`}
                                                    >
                                                        5 May 2025
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border border-hh-orange rounded bg-white flex gap-x-4 p-2 items-center">
                                        <div className="h-16 w-16"></div>
                                        <div>
                                            <p
                                                className={`${styles.paragraph} text-black mb-2`}
                                            >
                                                Name of event
                                            </p>
                                            <div className="flex gap-x-2 items-center">
                                                <div className="flex gap-x-1 items-center">
                                                    <MapPinIcon className="text-hh-orange h-5 w-5" />
                                                    <p
                                                        className={`${styles.paragraph} text-xs text-[#999999]`}
                                                    >
                                                        St James Tidal Pool
                                                    </p>
                                                </div>
                                                <div className="flex gap-x-1 items-center">
                                                    <ClockIcon className="text-hh-orange h-5 w-5" />
                                                    <p
                                                        className={`${styles.paragraph} text-xs text-[#999999]`}
                                                    >
                                                        5 May 2025
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border border-hh-orange rounded bg-white flex gap-x-4 p-2 items-center">
                                        <div className="h-16 w-16"></div>
                                        <div>
                                            <p
                                                className={`${styles.paragraph} text-black mb-2`}
                                            >
                                                Name of event
                                            </p>
                                            <div className="flex gap-x-2 items-center">
                                                <div className="flex gap-x-1 items-center">
                                                    <MapPinIcon className="text-hh-orange h-5 w-5" />
                                                    <p
                                                        className={`${styles.paragraph} text-xs text-[#999999]`}
                                                    >
                                                        St James Tidal Pool
                                                    </p>
                                                </div>
                                                <div className="flex gap-x-1 items-center">
                                                    <ClockIcon className="text-hh-orange h-5 w-5" />
                                                    <p
                                                        className={`${styles.paragraph} text-xs text-[#999999]`}
                                                    >
                                                        5 May 2025
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border border-hh-gray rounded-md bg-white p-8 space-y-6">
                            <div className="bg-white rounded border border-hh-orange py-2 px-6 w-fit">
                                <p
                                    className={`${styles.paragraph} text-hh-orange uppercase`}
                                >
                                    Completed
                                </p>
                            </div>
                            <p
                                className={`${styles.h3} font-medium text-black`}
                            >
                                Wed, 29 March 2025 at 9:00AM
                            </p>
                            <div className="divide-y divide-hh-gray">
                                <div className="flex gap-x-4 items-center py-2">
                                    <div className="border border-hh-gray p-1 rounded-lg shadow">
                                        <ShoppingCartIcon className="h-6 w-6 text-black" />
                                    </div>
                                    <div className="">
                                        <p
                                            className={`${styles.paragraph} text-sm text-black`}
                                        >
                                            Book Again
                                        </p>
                                        <p
                                            className={`${styles.paragraph} text-sm text-hh-gray`}
                                        >
                                            Book your next sauna
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-x-4 items-center py-2">
                                    <div className="border border-hh-gray p-1 rounded-lg shadow">
                                        <MapPinIcon className="h-6 w-6 text-black" />
                                    </div>
                                    <div className="">
                                        <p
                                            className={`${styles.paragraph} text-sm text-black`}
                                        >
                                            Venue Details
                                        </p>
                                        <p
                                            className={`${styles.paragraph} text-sm text-hh-gray`}
                                        >
                                            St James Tidal Pool
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p
                                    className={`${styles.paragraph} text-sm text-black`}
                                >
                                    Invoice Details
                                </p>
                                <div className="border border-hh-gray py-1.5 px-2 flex justify-between items-center rounded mt-4">
                                    <p
                                        className={`${styles.paragraph} text-sm text-[#2C2C2C]`}
                                    >
                                        Single Sauna Session
                                    </p>
                                    <p
                                        className={`${styles.paragraph} text-sm text-[#2C2C2C]`}
                                    >
                                        R210
                                    </p>
                                </div>
                                <div className="border border-hh-gray py-1.5 px-2 flex justify-between items-center rounded mt-4">
                                    <p
                                        className={`${styles.paragraph} text-sm text-[#2C2C2C]`}
                                    >
                                        Hot Honey
                                    </p>
                                    <p
                                        className={`${styles.paragraph} text-sm text-[#2C2C2C]`}
                                    >
                                        R60
                                    </p>
                                </div>
                                <div className="border border-hh-gray py-1.5 px-2 flex justify-between items-center rounded mt-4">
                                    <p
                                        className={`${styles.paragraph} text-sm text-[#2C2C2C]`}
                                    >
                                        REVIVE + Water Combo
                                    </p>
                                    <p
                                        className={`${styles.paragraph} text-sm text-[#2C2C2C]`}
                                    >
                                        R80
                                    </p>
                                </div>
                                <div className="border-b shadow border-hh-gray py-1.5 px-2 flex justify-between items-center rounded mt-4">
                                    <p
                                        className={`${styles.paragraph} text-sm text-[#2C2C2C]`}
                                    >
                                        Total
                                    </p>
                                    <p
                                        className={`${styles.paragraph} text-sm text-[#2C2C2C]`}
                                    >
                                        R350
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
