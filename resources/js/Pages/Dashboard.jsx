import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Link, usePage } from "@inertiajs/react";
import styles from "../../styles";
import {
    ChevronDownIcon,
    ClockIcon,
    MapIcon,
    MinusIcon,
    NumberedListIcon,
    PlusIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Dashboard() {
    const [quantity, setQuantity] = useState(0);
    const [honeyQuantity, setHoneyQuantity] = useState(0);
    const [reviveQuantity, setReviveQuantity] = useState(0);
    const [startDate, setStartDate] = useState(new Date());
    const { auth } = usePage().props;
    const user = auth.user;

    const asset = (path) => {
        return `/storage/${path}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Home
                </h2>
            }
        >
            <Head title="Dashboard Home" />

            <div className="mx-auto ml-[256px]  ">
                <div className="mx-auto ">
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-12 lg:grid-cols-10 lg:grid-rows-1">
                        {/* <div className="relative lg:col-span-4  h-80 border border-hh-gray rounded-md bg-white ">
                            <div className="relative  h-full flex flex-col justify-end overflow-hidden">
                                <div className="m-2  border border-hh-gray rounded-md h-full ">
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        showOutsideMonthDays={false}
                                        inline // This makes the calendar always visible
                                        className="border border-hh-gray rounded-md" // Move border styling here
                                    />
                                </div>
                            </div>
                        </div> */}
                        {/* <div className="relative lg:col-span-6 overflow-y-scroll h-80 border border-hh-gray rounded-md  bg-white">
                            <div className="relative  h-full flex flex-col ">
                                <div className="p-6">
                                    <h4
                                        className={`${styles.h3} font-medium text-black`}
                                    >
                                        Bookings
                                    </h4>
                                    <div className="flex border-b border-hh-gray pb-2">
                                        <div className="flex-initial w-40 flex items-center text-black gap-x-2">
                                            <ClockIcon className="h-6 w-6 shrink-0" />
                                            <p
                                                className={`${styles.paragraph} `}
                                            >
                                                Times
                                            </p>
                                        </div>
                                        <div className="flex w-10"></div>
                                        <div className="flex-initial w-40 flex items-center text-black gap-x-2">
                                            {" "}
                                            <MapIcon className="h-6 w-6 shrink-0" />
                                            <p
                                                className={`${styles.paragraph} `}
                                            >
                                                Location
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40 pl-4 flex items-center text-black gap-x-2">
                                            {" "}
                                            <UserCircleIcon className="h-6 w-6 shrink-0" />
                                            <p
                                                className={`${styles.paragraph} `}
                                            >
                                                Names
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40 flex items-center justify-end text-black gap-x-2">
                                            {" "}
                                            <NumberedListIcon className="h-6 w-6 shrink-0" />
                                            <p
                                                className={`${styles.paragraph} `}
                                            >
                                                Available
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex mt-3 h-14">
                                        <div className="flex-initial w-40">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                6:00AM - 6:20AM
                                            </p>
                                        </div>
                                        <div className="flex w-10 mt-1">
                                            <span class="relative flex size-3">
                                                <span className="h-14 w-px bg-[#EBEEF0] absolute top-0 left-1/2 -translate-x-1/2"></span>
                                                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-hh-orange opacity-75"></span>
                                                <span class="relative inline-flex size-3 rounded-full bg-hh-orange"></span>
                                            </span>
                                        </div>
                                        <div className="flex-initial w-40">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                St James Tidal Pool
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40 pl-4">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                Samantha Jones
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40  flex justify-center">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm `}
                                            >
                                                5 pax
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex h-14">
                                        <div className="flex-initial w-40">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                6:00AM - 6:20AM
                                            </p>
                                        </div>
                                        <div className="flex w-10 mt-1">
                                            <span class="relative flex size-3">
                                                <span className="h-14 w-px bg-[#EBEEF0] absolute top-0 left-1/2 -translate-x-1/2"></span>
                                                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-hh-orange opacity-75"></span>
                                                <span class="relative inline-flex size-3 rounded-full bg-hh-orange"></span>
                                            </span>
                                        </div>
                                        <div className="flex-initial w-40">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                St James Tidal Pool
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40 pl-4">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                Samantha Jones
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40  flex justify-center">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm `}
                                            >
                                                5 pax
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex h-14">
                                        <div className="flex-initial w-40">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                6:00AM - 6:20AM
                                            </p>
                                        </div>
                                        <div className="flex w-10 mt-1">
                                            <span class="relative flex size-3">
                                                <span className="h-14 w-px bg-[#EBEEF0] absolute top-0 left-1/2 -translate-x-1/2"></span>
                                                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-hh-orange opacity-75"></span>
                                                <span class="relative inline-flex size-3 rounded-full bg-hh-orange"></span>
                                            </span>
                                        </div>
                                        <div className="flex-initial w-40">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                St James Tidal Pool
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40 pl-4">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                Samantha Jones
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40  flex justify-center">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm `}
                                            >
                                                5 pax
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex h-14">
                                        <div className="flex-initial w-40">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                6:00AM - 6:20AM
                                            </p>
                                        </div>
                                        <div className="flex w-10 mt-1">
                                            <span class="relative flex size-3">
                                                <span className="h-14 w-px bg-[#EBEEF0] absolute top-0 left-1/2 -translate-x-1/2"></span>
                                                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-hh-orange opacity-75"></span>
                                                <span class="relative inline-flex size-3 rounded-full bg-hh-orange"></span>
                                            </span>
                                        </div>
                                        <div className="flex-initial w-40">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                St James Tidal Pool
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40 pl-4">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                Samantha Jones
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40  flex justify-center">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm `}
                                            >
                                                5 pax
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex h-14">
                                        <div className="flex-initial w-40">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                6:00AM - 6:20AM
                                            </p>
                                        </div>
                                        <div className="flex w-10 mt-1">
                                            <span class="relative flex size-3">
                                                <span className="h-14 w-px bg-[#EBEEF0] absolute top-0 left-1/2 -translate-x-1/2"></span>
                                                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-hh-orange opacity-75"></span>
                                                <span class="relative inline-flex size-3 rounded-full bg-hh-orange"></span>
                                            </span>
                                        </div>
                                        <div className="flex-initial w-40">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                St James Tidal Pool
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40 pl-4">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                Samantha Jones
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40  flex justify-center">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm `}
                                            >
                                                5 pax
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex h-14">
                                        <div className="flex-initial w-40">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                6:00AM - 6:20AM
                                            </p>
                                        </div>
                                        <div className="flex w-10 mt-1">
                                            <span class="relative flex size-3">
                                                <span className="h-14 w-px bg-[#EBEEF0] absolute top-0 left-1/2 -translate-x-1/2"></span>
                                                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-hh-orange opacity-75"></span>
                                                <span class="relative inline-flex size-3 rounded-full bg-hh-orange"></span>
                                            </span>
                                        </div>
                                        <div className="flex-initial w-40">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                St James Tidal Pool
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40 pl-4">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                            >
                                                Samantha Jones
                                            </p>
                                        </div>
                                        <div className="flex-initial w-40  flex justify-center">
                                            <p
                                                className={`${styles.paragraph} !text-[#999999] !text-sm `}
                                            >
                                                5 pax
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                        <div className="relative lg:col-span-6 overflow-hidden   border border-hh-gray rounded-md  bg-hh-orange">
                            <div className="relative  h-full flex flex-col  overflow-hidden">
                                <div className="p-6">
                                    <h4
                                        className={`${styles.h3} !mb-4 font-medium text-white`}
                                    >
                                        Quick bookings form:
                                    </h4>

                                    <form action="#" method="POST">
                                        <div>
                                            <p
                                                className={`${styles.paragraph} font-medium text-white`}
                                            >
                                                Basic Information
                                            </p>
                                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                                <div>
                                                    <label
                                                        htmlFor="full-name"
                                                        className="sr-only"
                                                    >
                                                        Full Name
                                                    </label>
                                                    <div className="mt-2.5">
                                                        <input
                                                            id="full-name"
                                                            name="full-name"
                                                            type="text"
                                                            autoComplete="given-name"
                                                            placeholder="Full Name"
                                                            className="focus:ring-none block w-full border-0 bg-transparent font-medium  rounded-lg px-3.5 py-2 text-white shadow-sm ring-1  ring-white placeholder:text-white/90 focus:outline-none focus:ring-1 focus:ring-white sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="last-name"
                                                        className="sr-only"
                                                    >
                                                        Email Address
                                                    </label>
                                                    <div className="mt-2.5">
                                                        <input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            autoComplete="email"
                                                            placeholder="Email Address"
                                                            className="focus:ring-none block w-full border-0 bg-transparent font-medium  rounded-lg px-3.5 py-2 text-white shadow-sm ring-1  ring-white placeholder:text-white/90 focus:outline-none focus:ring-1 focus:ring-white sm:text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="phone-number"
                                                        className="sr-only"
                                                    >
                                                        Phone Number
                                                    </label>
                                                    <div className="mt-2.5">
                                                        <input
                                                            id="phone-number"
                                                            name="phone-number"
                                                            type="tel"
                                                            autoComplete="tel"
                                                            placeholder="Phone Number"
                                                            className="focus:ring-none block w-full border-0 bg-transparent font-medium  rounded-lg px-3.5 py-2 text-white shadow-sm ring-1  ring-white placeholder:text-white/90 focus:outline-none focus:ring-1 focus:ring-white sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="location"
                                                        className="sr-only"
                                                    >
                                                        Location
                                                    </label>
                                                    <div className="mt-2.5">
                                                        <input
                                                            id="location"
                                                            name="location"
                                                            type="text"
                                                            autoComplete="tel"
                                                            placeholder="Location"
                                                            className="focus:ring-none block w-full border-0 bg-transparent font-medium  rounded-lg px-3.5 py-2 text-white shadow-sm ring-1  ring-white placeholder:text-white/90 focus:outline-none focus:ring-1 focus:ring-white sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-2 flex justify-between items-center mt-2 p-2">
                                                    <label
                                                        htmlFor="amount"
                                                        className={`${styles.paragraph} font-medium text-white`}
                                                    >
                                                        Amount of people
                                                    </label>
                                                    <div className="flex gap-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setQuantity(
                                                                    (prev) =>
                                                                        Math.max(
                                                                            0,
                                                                            prev -
                                                                                1
                                                                        )
                                                                )
                                                            }
                                                            className="focus:outline-none"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <MinusIcon className="h-8 w-8 text-hh-orange bg-white rounded-lg p-1.5" />
                                                        </button>
                                                        <span
                                                            className={`${styles.paragraph} font-medium text-white w-6 text-center flex justify-center items-center`}
                                                        >
                                                            {" "}
                                                            {quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setQuantity(
                                                                    (prev) =>
                                                                        prev + 1
                                                                )
                                                            }
                                                            className="focus:outline-none"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <PlusIcon className="h-8 w-8 text-hh-orange bg-white rounded-lg p-1.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="sm:col-span-2 flex justify-between items-center mt-2 border border-white rounded-lg p-2">
                                                    <div className="flex items-center gap-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="honey"
                                                            name="honey"
                                                            className="h-4 w-4 text-hh-orange focus:ring-white border-none  ring ring-white rounded bg-white"
                                                        />

                                                        <label
                                                            htmlFor="message"
                                                            className={`${styles.paragraph} font-medium text-white`}
                                                        >
                                                            Hot honey / R30
                                                        </label>
                                                    </div>
                                                    <div className="flex gap-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setHoneyQuantity(
                                                                    (prev) =>
                                                                        Math.max(
                                                                            0,
                                                                            prev -
                                                                                1
                                                                        )
                                                                )
                                                            }
                                                            className="focus:outline-none"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <MinusIcon className="h-8 w-8 text-hh-orange bg-white rounded-lg p-1.5" />
                                                        </button>
                                                        <span
                                                            className={`${styles.paragraph} font-medium text-white w-6 text-center flex justify-center items-center`}
                                                        >
                                                            {" "}
                                                            {honeyQuantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setHoneyQuantity(
                                                                    (prev) =>
                                                                        prev + 1
                                                                )
                                                            }
                                                            className="focus:outline-none"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <PlusIcon className="h-8 w-8 text-hh-orange bg-white rounded-lg p-1.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="sm:col-span-2 flex justify-between items-center  border border-white rounded-lg p-2">
                                                    <div className="flex items-center gap-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="honey"
                                                            name="honey"
                                                            className="h-4 w-4 text-hh-orange focus:ring-white border-none  ring ring-white rounded bg-white"
                                                        />

                                                        <label
                                                            htmlFor="message"
                                                            className={`${styles.paragraph} font-medium text-white`}
                                                        >
                                                            REVIVE + Water Combo
                                                            / R40
                                                        </label>
                                                    </div>
                                                    <div className="flex gap-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setReviveQuantity(
                                                                    (prev) =>
                                                                        Math.max(
                                                                            0,
                                                                            prev -
                                                                                1
                                                                        )
                                                                )
                                                            }
                                                            className="focus:outline-none"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <MinusIcon className="h-8 w-8 text-hh-orange bg-white rounded-lg p-1.5" />
                                                        </button>
                                                        <span
                                                            className={`${styles.paragraph} font-medium text-white w-6 text-center flex justify-center items-center`}
                                                        >
                                                            {" "}
                                                            {reviveQuantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setReviveQuantity(
                                                                    (prev) =>
                                                                        prev + 1
                                                                )
                                                            }
                                                            className="focus:outline-none"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <PlusIcon className="h-8 w-8 text-hh-orange bg-white rounded-lg p-1.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-8">
                                                <button
                                                    type="submit"
                                                    className="rounded-md bg-white px-3.5 py-2.5 text-center uppercase font-semibold text-hh-orange shadow-sm  border border-white hover:bg-hh-orange hover:text-white transition-all"
                                                >
                                                    Book this spot
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="relative lg:col-span-4 overflow-hidden border border-hh-gray rounded-md h-[547px] bg-white">
                            <div className="relative  h-full flex flex-col  overflow-y-scroll">
                                <div className="p-6">
                                    <h4
                                        className={`${styles.h3} !mb-4 font-medium text-black text-center`}
                                    >
                                        Indemnity form.
                                    </h4>
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] text-center `}
                                    >
                                        Please scan the QR code to continue
                                    </p>
                                    <img
                                        src={asset("/images/qr-code.png")}
                                        alt="QR Code"
                                        className="h-3/4 w-full object-contain "
                                    />
                                </div>
                            </div>
                        </div>
                        {/* <div className="relative lg:col-span-full overflow-hidden border border-hh-gray rounded-md  bg-white p-6">
                            <h4
                                className={`${styles.h3} !mb-4 font-medium text-black `}
                            >
                                Locations: Weekly bookings
                            </h4>
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between w-full">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        St James Tidal Pool
                                    </p>
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        80%
                                    </p>
                                </div>

                                <div className="w-full h-2 rounded bg-hh-gray"></div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between w-full">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        St James Tidal Pool
                                    </p>
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        80%
                                    </p>
                                </div>

                                <div className="w-full h-2 rounded bg-hh-gray"></div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between w-full">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        St James Tidal Pool
                                    </p>
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        80%
                                    </p>
                                </div>

                                <div className="w-full h-2 rounded bg-hh-gray"></div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between w-full">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        St James Tidal Pool
                                    </p>
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        80%
                                    </p>
                                </div>

                                <div className="w-full h-2 rounded bg-hh-gray"></div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between w-full">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        St James Tidal Pool
                                    </p>
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        80%
                                    </p>
                                </div>

                                <div className="w-full h-2 rounded bg-hh-gray"></div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between w-full">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        St James Tidal Pool
                                    </p>
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        80%
                                    </p>
                                </div>

                                <div className="w-full h-2 rounded bg-hh-gray"></div>
                            </div>
                        </div> */}
                        {/* <div className="relative lg:col-span-full  overflow-hidden pt-6 pb-12">
                            <div className="col-span-full flex justify-between items-center mb-6">
                                <div>
                                    {" "}
                                    <h4
                                        className={`${styles.h3} !mb-0 font-medium text-black `}
                                    >
                                        Locations: Weekly bookings
                                    </h4>
                                </div>
                                <div className="flex gap-x-4 items-center">
                                    <div className="bg-white shadow-md flex items-center gap-x-2 border border-hh-gray p-2 rounded">
                                        <p
                                            className={`${styles.paragraph} text-black`}
                                        >
                                            St James Tidal Pool
                                        </p>
                                        <ChevronDownIcon className="text-black h-6 w-6" />
                                    </div>
                                    <div className="bg-white shadow-md flex items-center gap-x-2 border border-hh-gray p-2 rounded">
                                        <p
                                            className={`${styles.paragraph} text-black`}
                                        >
                                            Last 30 days
                                        </p>
                                        <ChevronDownIcon className="text-black h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-12 p-6 gap-x-4">
                                <div className="col-span-1">
                                    <p
                                        className={`${styles.paragraph} text-black`}
                                    >
                                        #No
                                    </p>
                                </div>
                                <div className="col-span-2 -ml-6">
                                    <p
                                        className={`${styles.paragraph} text-black`}
                                    >
                                        Customer Name
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p
                                        className={`${styles.paragraph} text-black`}
                                    >
                                        Date & Time
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p
                                        className={`${styles.paragraph} text-black`}
                                    >
                                        Service
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p
                                        className={`${styles.paragraph} text-black`}
                                    >
                                        Location
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p
                                        className={`${styles.paragraph} text-black`}
                                    >
                                        Duration
                                    </p>
                                </div>
                                <div className="col-span-1">
                                    <p
                                        className={`${styles.paragraph} text-black`}
                                    >
                                        Status
                                    </p>
                                </div>
                            </div>
                            <div className="col-span-full space-y-4">
                                <div className="col-span-full bg-white shadow grid grid-cols-12  gap-x-4 items-center border border-hh-gray rounded p-6">
                                    <div className="col-span-1">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] `}
                                        >
                                            01
                                        </p>
                                    </div>
                                    <div className="col-span-2 flex gap-x-2 items-center -ml-6">
                                        <div className="bg-[#999999] rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm `}
                                            >
                                                VM
                                            </p>
                                        </div>
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Valentino Morose
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            04 May 2025, 6:20AM
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Single Sauna Session
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            St James Tidal Pool
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            20 minutes
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <div className="bg-hh-orange rounded-full px-4 py-2">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm text-center`}
                                            >
                                                Paid
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-full bg-white shadow grid grid-cols-12 gap-x-4 items-center border border-hh-gray rounded p-6">
                                    <div className="col-span-1">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] `}
                                        >
                                            02
                                        </p>
                                    </div>
                                    <div className="col-span-2 flex gap-x-2 items-center -ml-6">
                                        <div className="bg-[#999999] rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm `}
                                            >
                                                VM
                                            </p>
                                        </div>
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Valentino Morose
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            04 May 2025, 6:20AM
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Single Sauna Session
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            St James Tidal Pool
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            20 minutes
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <div className="bg-hh-orange rounded-full px-4 py-2">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm text-center`}
                                            >
                                                Paid
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-full bg-white shadow grid grid-cols-12 gap-x-4 items-center border border-hh-gray rounded p-6">
                                    <div className="col-span-1">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] `}
                                        >
                                            03
                                        </p>
                                    </div>
                                    <div className="col-span-2 flex gap-x-2 items-center -ml-6">
                                        <div className="bg-[#999999] rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm `}
                                            >
                                                VM
                                            </p>
                                        </div>
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Valentino Morose
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            04 May 2025, 6:20AM
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Single Sauna Session
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            St James Tidal Pool
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            20 minutes
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <div className="bg-hh-orange rounded-full px-4 py-2">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm text-center`}
                                            >
                                                Paid
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-full bg-white shadow grid grid-cols-12 gap-x-4 items-center border border-hh-gray rounded p-6">
                                    <div className="col-span-1">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] `}
                                        >
                                            04
                                        </p>
                                    </div>
                                    <div className="col-span-2 flex gap-x-2 items-center -ml-6">
                                        <div className="bg-[#999999] rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm `}
                                            >
                                                VM
                                            </p>
                                        </div>
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Valentino Morose
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            04 May 2025, 6:20AM
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Single Sauna Session
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            St James Tidal Pool
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            20 minutes
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <div className="bg-hh-orange rounded-full px-4 py-2">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm text-center`}
                                            >
                                                Paid
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-full bg-white shadow grid grid-cols-12 gap-x-4 items-center border border-hh-gray rounded p-6">
                                    <div className="col-span-1">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] `}
                                        >
                                            05
                                        </p>
                                    </div>
                                    <div className="col-span-2 flex gap-x-2 items-center -ml-6">
                                        <div className="bg-[#999999] rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm `}
                                            >
                                                VM
                                            </p>
                                        </div>
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Valentino Morose
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            04 May 2025, 6:20AM
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            Single Sauna Session
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            St James Tidal Pool
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                        >
                                            20 minutes
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <div className="bg-hh-orange rounded-full px-4 py-2">
                                            <p
                                                className={`${styles.paragraph} !text-white !text-sm text-center`}
                                            >
                                                Paid
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-full flex justify-end gap-x-2">
                                    <div className="bg-white rounded-full w-10 h-10 flex justify-center items-center shadow">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] `}
                                        >
                                            01
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-full w-10 h-10 flex justify-center items-center shadow">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] `}
                                        >
                                            02
                                        </p>
                                    </div>
                                    <div className="bg-hh-orange rounded-full w-10 h-10 flex justify-center items-center shadow">
                                        <p
                                            className={`${styles.paragraph} !text-white `}
                                        >
                                            03
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-full w-10 h-10 flex justify-center items-center shadow">
                                        <p
                                            className={`${styles.paragraph} !text-[#999999] `}
                                        >
                                            04
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
