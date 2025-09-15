import styles from "../../../styles";
import { usePage, Link } from "@inertiajs/react";
import FrontendSidebar from "@/Layouts/FrontendSidebar";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

import {
    ClockIcon,
    ShoppingCartIcon,
    MapPinIcon,
    CalendarIcon,
    UserIcon,
} from "@heroicons/react/24/outline";

export default function ContentSection({
    upcoming = [],
    events = [],
    past = [],
}) {
    const [startDate, setStartDate] = useState(new Date());
    const { auth } = usePage().props;
    const user = auth.user;
    const loyaltyPoints = 1;

    const asset = (path) => {
        return `/storage/${path}`;
    };

    return (
        <div
            className={`${styles.boxWidth} py-6 sm:py-12 px-2 sm:px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20 flex flex-col lg:flex-row gap-6 lg:gap-x-16`}
        >
            <div className="lg:block">
                <FrontendSidebar />
            </div>
            <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
                    <div className="flex gap-x-3 sm:gap-x-4 items-center">
                        {user.photo != null ? (
                            <div className="h-12 w-12 sm:h-14 sm:w-14 overflow-hidden shrink-0 rounded-full">
                                <img
                                    alt=""
                                    src={asset(user.photo)}
                                    className="object-cover top-0 left-0 w-full h-full"
                                />
                            </div>
                        ) : (
                            <UserIcon
                                aria-hidden="true"
                                className="h-12 w-12 sm:h-14 sm:w-14 text-white bg-hh-orange rounded-full p-1.5"
                            />
                        )}

                        <p className={`${styles.paragraph} !text-sm sm:!text-base text-black`}>
                            Good morning,{" "}
                            <span className="font-medium"> {user.name}</span>
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-x-4 items-center">
                        <p
                            className={`${styles.paragraph} !text-sm sm:!text-lg lg:!text-xl text-black font-medium text-center sm:text-left`}
                        >
                            Loyalty Points received
                        </p>
                        <ProgressCircle points={loyaltyPoints} />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-x-10 mt-6 sm:mt-10">
                    <div className="col-span-1 lg:col-span-5">
                        <div>
                            <h1
                                className={`${styles.h2} !text-xl sm:!text-2xl font-medium text-hh-orange`}
                            >
                                My Bookings
                            </h1>
                            <h3
                                className={`${styles.h3} !text-lg sm:!text-xl font-medium text-black`}
                            >
                                Upcoming
                            </h3>
                            <UpcomingSection />
                        </div>
                        <div>
                            <div className="flex flex-col items-between justify-start pt-12 sm:pt-20">
                                <h3
                                    className={`${styles.h3} !text-lg sm:!text-xl font-medium text-black`}
                                >
                                    Past Bookings
                                </h3>
                                <PastSection />
                            </div>
                        </div>
                    </div>
                    <div className="relative col-span-1 lg:col-span-5 space-y-6 sm:space-y-8">
                        <div className="border border-hh-gray rounded-md bg-white/95 p-0 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                            <div className="border border-hh-gray rounded-md shadow-md">
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    showOutsideMonthDays={false}
                                    inline // This makes the calendar always visible
                                    className="border border-hh-gray rounded-md w-full" // Move border styling here
                                />
                            </div>
                            {/* <div className=" border border-hh-gray rounded-md  shadow-md p-6">
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
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const UpcomingSection = () => {
    const asset = (path) => {
        return `/storage/${path}`;
    };
    const { auth, upcoming = [], past = [] } = usePage().props;
    const user = auth.user;

    if (upcoming.length === 0) {
        return (
            <div className="border border-hh-gray px-4 sm:px-6 py-12 sm:py-16 rounded-md flex flex-col justify-center items-center shadow-md">
                <CalendarIcon className="h-12 w-12 sm:h-16 sm:w-16 text-hh-gray" />
                <h4 className={`${styles.h3} !text-base sm:!text-lg mt-4 font-medium text-black text-center`}>
                    No upcoming bookings
                </h4>
                <p className={`${styles.paragraph} !text-sm text-hh-gray text-center`}>
                    Your upcoming bookings will appear here
                </p>
                <Link
                    href={route("index")} /* or wherever "book now" lives   */
                    className="bg-hh-orange rounded py-3 px-6 text-white mt-4 font-medium text-sm"
                >
                    Book now
                </Link>
            </div>
        );
    }

    return upcoming.map((b) => {
        const loc = b.timeslot.schedule.location;
        const start = dayjs(b.timeslot.starts_at);
        const oneLine = start.format("ddd, D MMM YYYY [at] h:mma");

        return (
            <div
                key={b.id}
                className="border border-hh-gray bg-white/95 rounded-md shadow grid grid-cols-1 sm:grid-cols-3 overflow-hidden items-center mt-4 sm:mt-6"
            >
                <div className="col-span-1 h-32 sm:h-auto">
                    <img
                        src={
                            loc.image_path
                                ? asset(loc.image_path)
                                : "/storage/images/placeholder.jpg"
                        }
                        alt={loc.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="col-span-1 sm:col-span-2 p-4 sm:p-6">
                    <h3
                        className={`${styles.paragraph} !text-sm sm:!text-base text-black font-medium`}
                    >
                        {loc.name}
                    </h3>

                    <p className={`${styles.paragraph} !text-xs sm:!text-sm text-black`}>
                        {oneLine}
                    </p>

                    <p
                        className={`${styles.paragraph} !text-xs sm:!text-sm text-hh-gray mt-1 sm:mt-2`}
                    >
                        {/* first service line label */}
                        {b.services[0]?.name ?? "Sauna Session"}
                    </p>
                </div>
            </div>
        );
    });
};
const PastSection = () => {
    const asset = (path) => {
        return `/storage/${path}`;
    };
    const { auth, upcoming = [], past = [] } = usePage().props;
    const user = auth.user;

    if (past.length === 0) {
        return (
            <div className="border border-hh-gray px-4 sm:px-6 py-12 sm:py-16 rounded-md flex flex-col justify-center items-center shadow-md">
                <CalendarIcon className="h-12 w-12 sm:h-16 sm:w-16 text-hh-gray" />
                <h4 className={`${styles.h3} !text-base sm:!text-lg mt-4 font-medium text-black text-center`}>
                    No past bookings
                </h4>
                <p className={`${styles.paragraph} !text-sm text-hh-gray text-center`}>
                    Your past bookings will appear here
                </p>
                <Link
                    href={route("index")} /* or wherever "book now" lives   */
                    className="bg-hh-orange rounded py-3 px-6 text-white mt-4 font-medium text-sm"
                >
                    Book now
                </Link>
            </div>
        );
    }

    return past.map((b) => {
        const loc = b.timeslot.schedule.location;
        const start = dayjs(b.timeslot.starts_at);
        const oneLine = start.format("ddd, D MMM YYYY [at] h:mma");

        return (
            <div
                key={b.id}
                className="border border-hh-gray bg-white/95 rounded-md shadow grid grid-cols-1 sm:grid-cols-3 overflow-hidden items-center mt-4 sm:mt-6"
            >
                <div className="col-span-1 h-32 sm:h-auto">
                    <img
                        src={
                            loc.image_path
                                ? asset(loc.image_path)
                                : "/storage/images/placeholder.jpg"
                        }
                        alt={loc.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="col-span-1 sm:col-span-2 p-4 sm:p-6">
                    <h3
                        className={`${styles.paragraph} !text-sm sm:!text-base text-black font-medium`}
                    >
                        {loc.name}
                    </h3>

                    <p className={`${styles.paragraph} !text-xs sm:!text-sm text-black`}>
                        {oneLine}
                    </p>

                    <p
                        className={`${styles.paragraph} !text-xs sm:!text-sm text-hh-gray mt-1 sm:mt-2`}
                    >
                        {/* first service line label */}
                        {b.services[0]?.name ?? "Sauna Session"}
                    </p>
                </div>
            </div>
        );
    });
};

const ProgressCircle = ({ points }) => {
    // Calculate progress percentage (0-100)
    const normalizedPoints = points % 4;
    const progress =
        normalizedPoints === 0 && points > 0 ? 100 : normalizedPoints * 25;
    return (
        <div className="relative h-12 w-12 sm:h-14 sm:w-14">
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
