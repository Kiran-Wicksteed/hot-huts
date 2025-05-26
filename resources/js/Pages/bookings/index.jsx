import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState } from "react";
import styles from "../../../styles";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

export default function BookingPage() {
    const [quantity, setQuantity] = useState(0);
    const [honeyQuantity, setHoneyQuantity] = useState(0);
    const [reviveQuantity, setReviveQuantity] = useState(0);
    const [bookingPercentage, setBookingPercentage] = useState(75);
    const [eventBookings, setEventBookings] = useState(80);
    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px]  ">
                {/* REFINE SEARCH */}
                <div className="relative shadow border border-hh-gray rounded-md  bg-white p-6">
                    <form action="#" method="POST">
                        <label className={`${styles.paragraph} text-black`}>
                            Refine your search
                        </label>
                        <div className="flex gap-x-4 items-center mt-4">
                            <Menu as="div" className="relative  text-left">
                                <div>
                                    <MenuButton className=" w-56 justify-between bg-white shadow-md flex  gap-x-2 border border-hh-gray py-2 px-6 rounded  text-sm  hover:bg-gray-50">
                                        <span
                                            className={`${styles.paragraph} text-black `}
                                        >
                                            Province
                                        </span>
                                        <ChevronDownIcon
                                            aria-hidden="true"
                                            className="text-black h-6 w-6"
                                        />
                                    </MenuButton>
                                </div>

                                <MenuItems
                                    transition
                                    className="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                >
                                    <div className="py-1">
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Edit
                                            </a>
                                        </MenuItem>
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Duplicate
                                            </a>
                                        </MenuItem>
                                    </div>
                                    <div className="py-1">
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Archive
                                            </a>
                                        </MenuItem>
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Move
                                            </a>
                                        </MenuItem>
                                    </div>
                                    <div className="py-1">
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Share
                                            </a>
                                        </MenuItem>
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Add to favorites
                                            </a>
                                        </MenuItem>
                                    </div>
                                    <div className="py-1">
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Delete
                                            </a>
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </Menu>
                            <Menu as="div" className="relative  text-left">
                                <div>
                                    <MenuButton className=" w-56 justify-between bg-white shadow-md flex  gap-x-2 border border-hh-gray py-2 px-6 rounded  text-sm  hover:bg-gray-50">
                                        <span
                                            className={`${styles.paragraph} text-black `}
                                        >
                                            Province
                                        </span>
                                        <ChevronDownIcon
                                            aria-hidden="true"
                                            className="text-black h-6 w-6"
                                        />
                                    </MenuButton>
                                </div>

                                <MenuItems
                                    transition
                                    className="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                >
                                    <div className="py-1">
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Edit
                                            </a>
                                        </MenuItem>
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Duplicate
                                            </a>
                                        </MenuItem>
                                    </div>
                                    <div className="py-1">
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Archive
                                            </a>
                                        </MenuItem>
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Move
                                            </a>
                                        </MenuItem>
                                    </div>
                                    <div className="py-1">
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Share
                                            </a>
                                        </MenuItem>
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Add to favorites
                                            </a>
                                        </MenuItem>
                                    </div>
                                    <div className="py-1">
                                        <MenuItem>
                                            <a
                                                href="#"
                                                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                            >
                                                Delete
                                            </a>
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </Menu>
                            <div>
                                <button
                                    type="submit"
                                    className="rounded-md bg-white px-6 py-2 text-center uppercase font-semibold text-hh-orange shadow-sm  border border-hh-orange hover:bg-hh-orange hover:text-white transition-all"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </form>
                    <div className="flex w-full justify-between items-center mt-8">
                        <p
                            className={`${styles.paragraph} cursor-pointer text-black hover:text-hh-orange hover:underline transition-all`}
                        >
                            St James Tidal Pool
                        </p>
                        <p
                            className={`${styles.paragraph} cursor-pointer text-black hover:text-hh-orange hover:underline transition-all`}
                        >
                            St James Tidal Pool
                        </p>
                        <p
                            className={`${styles.paragraph} cursor-pointer text-black hover:text-hh-orange hover:underline transition-all`}
                        >
                            St James Tidal Pool
                        </p>
                        <p
                            className={`${styles.paragraph} cursor-pointer text-black hover:text-hh-orange hover:underline transition-all`}
                        >
                            St James Tidal Pool
                        </p>
                        <p
                            className={`${styles.paragraph} cursor-pointer text-black hover:text-hh-orange hover:underline transition-all`}
                        >
                            St James Tidal Pool
                        </p>
                        <p
                            className={`${styles.paragraph} cursor-pointer text-black hover:text-hh-orange hover:underline transition-all`}
                        >
                            St James Tidal Pool
                        </p>
                    </div>
                </div>

                {/* ANALYTIC QUANTATIES */}
                <div className="grid grid-cols-3 gap-x-4 mt-6 ">
                    <div className="relative shadow border border-hh-gray rounded-md  bg-white p-6 flex justify-between">
                        <div>
                            <p
                                className={`${styles.h2} text-hh-orange font-medium !mb-0`}
                            >
                                2,0210
                            </p>
                            <p
                                className={`${styles.paragraph} text-hh-gray !text-sm`}
                            >
                                Total monthly bookings
                            </p>
                        </div>
                    </div>
                    <div className="relative shadow border border-hh-gray rounded-md  bg-white p-6 flex justify-between">
                        <div>
                            <p
                                className={`${styles.h2} text-hh-orange font-medium !mb-0`}
                            >
                                89
                            </p>
                            <p
                                className={`${styles.paragraph} text-hh-gray !text-sm`}
                            >
                                Todays bookings
                            </p>
                        </div>
                    </div>
                    <div className="relative shadow border border-hh-gray rounded-md  bg-white p-6 flex justify-between">
                        <div>
                            <p
                                className={`${styles.h2} text-hh-orange font-medium !mb-0`}
                            >
                                R 52,510
                            </p>
                            <p
                                className={`${styles.paragraph} text-hh-gray !text-sm`}
                            >
                                Total revenue
                            </p>
                        </div>
                    </div>
                </div>

                {/* FORM SECTION */}
                <form className="grid gap-y-1 mt-6">
                    <div className="relative shadow border border-hh-gray rounded-md  bg-hh-orange p-10 ">
                        <div className=" max-w-4xl mx-auto ">
                            <p
                                className={`${styles.paragraph} font-medium text-white`}
                            >
                                Client Information
                            </p>
                            <div className="grid grid-cols-3 gap-x-4 ">
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
                            </div>
                        </div>
                    </div>
                    <div className="relative shadow border border-hh-gray rounded-md  bg-hh-orange p-10 ">
                        <div className=" max-w-4xl mx-auto ">
                            <p
                                className={`${styles.paragraph} font-medium text-white`}
                            >
                                Booking Information
                            </p>
                            <div className="grid grid-cols-3 gap-4 items-center mt-4">
                                <div>
                                    <Menu
                                        as="div"
                                        className="relative  text-left"
                                    >
                                        <div>
                                            <MenuButton className=" w-full justify-between items-center  shadow-md flex  gap-x-2 border border-white px-3.5 py-3 rounded-lg  text-sm  hover:bg-white/10">
                                                <span
                                                    className={`${styles.paragraph} text-white !text-sm`}
                                                >
                                                    Select Service
                                                </span>
                                                <ChevronDownIcon
                                                    aria-hidden="true"
                                                    className="text-white h-6 w-6"
                                                />
                                            </MenuButton>
                                        </div>

                                        <MenuItems
                                            transition
                                            className="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                        >
                                            <div className="py-1">
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Edit
                                                    </a>
                                                </MenuItem>
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Duplicate
                                                    </a>
                                                </MenuItem>
                                            </div>
                                            <div className="py-1">
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Archive
                                                    </a>
                                                </MenuItem>
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Move
                                                    </a>
                                                </MenuItem>
                                            </div>
                                            <div className="py-1">
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Share
                                                    </a>
                                                </MenuItem>
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Add to favorites
                                                    </a>
                                                </MenuItem>
                                            </div>
                                            <div className="py-1">
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Delete
                                                    </a>
                                                </MenuItem>
                                            </div>
                                        </MenuItems>
                                    </Menu>
                                </div>
                                <div className="flex items-center justify-between border border-white px-3.5 py-3 rounded-lg">
                                    <label
                                        htmlFor="amount"
                                        className={`${styles.paragraph} sm:text-sm text-white`}
                                    >
                                        Amount of people
                                    </label>
                                    <div className="flex gap-x-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuantity((prev) =>
                                                    Math.max(0, prev - 1)
                                                )
                                            }
                                            className="focus:outline-none"
                                            aria-label="Increase quantity"
                                        >
                                            <MinusIcon className="h-6 w-6 text-hh-orange bg-white rounded-lg p-1.5" />
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
                                                setQuantity((prev) => prev + 1)
                                            }
                                            className="focus:outline-none"
                                            aria-label="Increase quantity"
                                        >
                                            <PlusIcon className="h-6 w-6 text-hh-orange bg-white rounded-lg p-1.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-x-2">
                                            <input
                                                type="checkbox"
                                                id="honey"
                                                name="honey"
                                                className="h-4 w-4 text-hh-orange focus:ring-white border-none  ring ring-white rounded bg-white"
                                            />

                                            <label
                                                htmlFor="message"
                                                className={`${styles.paragraph} font-medium !text-sm text-white`}
                                            >
                                                Hot honey
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
                                                <MinusIcon className="h-6 w-6 text-hh-orange bg-white rounded-lg p-1.5" />
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
                                                        (prev) => prev + 1
                                                    )
                                                }
                                                className="focus:outline-none"
                                                aria-label="Increase quantity"
                                            >
                                                <PlusIcon className="h-6 w-6 text-hh-orange bg-white rounded-lg p-1.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-x-2">
                                            <input
                                                type="checkbox"
                                                id="honey"
                                                name="honey"
                                                className="h-4 w-4 text-hh-orange focus:ring-white border-none  ring ring-white rounded bg-white"
                                            />

                                            <label
                                                htmlFor="message"
                                                className={`${styles.paragraph} font-medium text-white !text-sm`}
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
                                                <MinusIcon className="h-6 w-6 text-hh-orange bg-white rounded-lg p-1.5" />
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
                                                        (prev) => prev + 1
                                                    )
                                                }
                                                className="focus:outline-none"
                                                aria-label="Increase quantity"
                                            >
                                                <PlusIcon className="h-6 w-6 text-hh-orange bg-white rounded-lg p-1.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="full-name"
                                        className="sr-only"
                                    >
                                        Date
                                    </label>
                                    <div>
                                        <input
                                            id="date"
                                            name="date"
                                            type="date"
                                            autoComplete="given-name"
                                            className="focus:ring-none block w-full border-0 bg-transparent font-medium  rounded-lg px-3.5 py-3.5 text-white shadow-sm ring-1  ring-white placeholder:text-white/90 focus:outline-none focus:ring-1 focus:ring-white sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="full-name"
                                        className="sr-only"
                                    >
                                        Time
                                    </label>
                                    <div>
                                        <input
                                            id="time"
                                            name="time"
                                            type="time"
                                            autoComplete="given-name"
                                            className="focus:ring-none block w-full border-0 bg-transparent font-medium  rounded-lg px-3.5 py-3.5 text-white shadow-sm ring-1  ring-white placeholder:text-white/90 focus:outline-none focus:ring-1 focus:ring-white sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Menu
                                        as="div"
                                        className="relative  text-left "
                                    >
                                        <div>
                                            <MenuButton className=" w-full justify-between  shadow-md flex items-center gap-x-2 border border-white px-3.5 py-3 rounded-lg  text-sm  hover:bg-white/10">
                                                <span
                                                    className={`${styles.paragraph} text-white !text-sm`}
                                                >
                                                    Select Loaction
                                                </span>
                                                <ChevronDownIcon
                                                    aria-hidden="true"
                                                    className="text-white h-6 w-6"
                                                />
                                            </MenuButton>
                                        </div>

                                        <MenuItems
                                            transition
                                            className="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                        >
                                            <div className="py-1">
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Edit
                                                    </a>
                                                </MenuItem>
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Duplicate
                                                    </a>
                                                </MenuItem>
                                            </div>
                                            <div className="py-1">
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Archive
                                                    </a>
                                                </MenuItem>
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Move
                                                    </a>
                                                </MenuItem>
                                            </div>
                                            <div className="py-1">
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Share
                                                    </a>
                                                </MenuItem>
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Add to favorites
                                                    </a>
                                                </MenuItem>
                                            </div>
                                            <div className="py-1">
                                                <MenuItem>
                                                    <a
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                                    >
                                                        Delete
                                                    </a>
                                                </MenuItem>
                                            </div>
                                        </MenuItems>
                                    </Menu>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative shadow border border-hh-gray rounded-md  bg-hh-orange p-10 ">
                        <div className=" max-w-4xl mx-auto ">
                            <p
                                className={`${styles.paragraph} font-medium text-white`}
                            >
                                Client Information
                            </p>

                            <div className="divide-y divide-white mt-4">
                                <p
                                    className={`${styles.paragraph} !text-white py-2`}
                                >
                                    Subtotal
                                </p>
                                <div className="py-2 flex justify-between">
                                    <p
                                        className={`${styles.paragraph} !text-white `}
                                    >
                                        Total
                                    </p>
                                    <p
                                        className={`${styles.paragraph} !text-white `}
                                    >
                                        R200
                                    </p>
                                </div>
                                <div className="py-4 flex gap-x-8 items-center">
                                    <div className="flex items-center gap-x-2">
                                        <input
                                            type="checkbox"
                                            id="payment-link"
                                            name="payment-link"
                                            className="h-4 w-4 text-hh-orange focus:ring-white border-none  ring ring-white rounded bg-white"
                                        />

                                        <label
                                            htmlFor="message"
                                            className={`${styles.paragraph} font-medium !text-sm text-white`}
                                        >
                                            Send payment link
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-x-2">
                                        <input
                                            type="checkbox"
                                            id="paid"
                                            name="paid"
                                            className="h-4 w-4 text-hh-orange focus:ring-white border-none  ring ring-white rounded bg-white"
                                        />

                                        <label
                                            htmlFor="message"
                                            className={`${styles.paragraph} font-medium !text-sm text-white`}
                                        >
                                            Mark as paid
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-x-2">
                                        <input
                                            type="checkbox"
                                            id="pending"
                                            name="pending"
                                            className="h-4 w-4 text-hh-orange focus:ring-white border-none  ring ring-white rounded bg-white"
                                        />

                                        <label
                                            htmlFor="message"
                                            className={`${styles.paragraph} font-medium !text-sm text-white`}
                                        >
                                            Mark as pending
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end items-center gap-x-6">
                                <button
                                    type="submit"
                                    className="rounded-md  text-white px-6 py-2 text-center uppercase font-semibold text-whiteshadow-sm  border border-white hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-white px-6 py-2 text-center uppercase font-semibold text-hh-orange shadow-sm  border border-hh-orange hover:bg-gray-50  transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* RECENT BOOKINGS */}

                <div className="relative lg:col-span-full  overflow-hidden pt-6 pb-6">
                    <div className="col-span-full flex justify-between items-center mb-6">
                        <div>
                            {" "}
                            <h4
                                className={`${styles.h3} !mb-0 font-medium text-black `}
                            >
                                Recent bookings
                            </h4>
                        </div>
                        <div className="flex gap-x-4 items-center">
                            <div className="bg-white shadow-md flex items-center gap-x-2 border border-hh-gray p-2 rounded">
                                <p className={`${styles.paragraph} text-black`}>
                                    St James Tidal Pool
                                </p>
                                <ChevronDownIcon className="text-black h-6 w-6" />
                            </div>
                            <div className="bg-white shadow-md flex items-center gap-x-2 border border-hh-gray p-2 rounded">
                                <p className={`${styles.paragraph} text-black`}>
                                    Last 30 days
                                </p>
                                <ChevronDownIcon className="text-black h-6 w-6" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 p-6 gap-x-4">
                        <div className="col-span-1">
                            <p className={`${styles.paragraph} text-black`}>
                                #No
                            </p>
                        </div>
                        <div className="col-span-2 -ml-6">
                            <p className={`${styles.paragraph} text-black`}>
                                Customer Name
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Date & Time
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Service
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Location
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Duration
                            </p>
                        </div>
                        <div className="col-span-1">
                            <p className={`${styles.paragraph} text-black`}>
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
                </div>

                {/* BENTO SECTION */}

                <div className="grid grid-cols-3 gap-4 pt-10 pb-12">
                    <div className="shadow border border-hh-gray rounded-md  bg-white py-6 ">
                        {" "}
                        <h4
                            className={`${styles.h3} !mb-0 font-medium text-black px-6`}
                        >
                            Total Average
                        </h4>
                        <div className="divide-y divide-hh-gray ">
                            <div className="flex justify-between items-center px-6 py-4">
                                <p
                                    className={`${styles.paragraph} !text-black`}
                                >
                                    January
                                </p>
                                <p
                                    className={`${styles.paragraph} text-green-500`}
                                >
                                    62%
                                </p>
                            </div>
                            <div className="flex justify-between items-center px-6 py-4">
                                <p
                                    className={`${styles.paragraph} !text-black`}
                                >
                                    February
                                </p>
                                <p
                                    className={`${styles.paragraph} text-green-500`}
                                >
                                    48%
                                </p>
                            </div>
                            <div className="flex justify-between items-center px-6 py-4">
                                <p
                                    className={`${styles.paragraph} !text-black`}
                                >
                                    March
                                </p>
                                <p
                                    className={`${styles.paragraph} text-red-500`}
                                >
                                    48%
                                </p>
                            </div>
                            <div className="flex justify-between items-center px-6 py-4">
                                <p
                                    className={`${styles.paragraph} !text-black`}
                                >
                                    April
                                </p>
                                <p
                                    className={`${styles.paragraph} text-green-500`}
                                >
                                    54%
                                </p>
                            </div>
                            <div className="flex justify-between items-center px-6 py-4">
                                <p
                                    className={`${styles.paragraph} !text-black`}
                                >
                                    May
                                </p>
                                <p
                                    className={`${styles.paragraph} text-red-500`}
                                >
                                    44%
                                </p>
                            </div>
                            <div className="flex justify-between items-center px-6 pt-4">
                                <p
                                    className={`${styles.paragraph} !text-black`}
                                >
                                    June
                                </p>
                                <p
                                    className={`${styles.paragraph} text-red-500`}
                                >
                                    39%
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid-rows-2 grid gap-4 col-span-1">
                        <div className="shadow border border-hh-gray rounded-md  bg-white p-6 row-span-1 flex flex-col justify-between">
                            {" "}
                            <h4
                                className={`${styles.h3} !mb-0 font-medium text-black `}
                            >
                                Total Bookings
                            </h4>
                            <div className="flex justify-between items-center">
                                <div className="relative h-16 w-16">
                                    <motion.svg
                                        className="h-full w-full"
                                        viewBox="0 0 64 64"
                                    >
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="30"
                                            fill="none"
                                            stroke="#e0e0e0"
                                            strokeWidth="4"
                                        />
                                        <motion.circle
                                            cx="32"
                                            cy="32"
                                            r="30"
                                            fill="none"
                                            stroke="#FF7022"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            initial={{
                                                strokeDasharray: 188,
                                                strokeDashoffset: 188,
                                            }}
                                            animate={{
                                                strokeDashoffset:
                                                    188 *
                                                    (1 -
                                                        bookingPercentage /
                                                            100),
                                            }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </motion.svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.p
                                            key={bookingPercentage}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`${styles.paragraph} text-black !text-sm`}
                                        >
                                            {bookingPercentage}%
                                        </motion.p>
                                    </div>
                                </div>
                                <div>
                                    <p
                                        className={`${styles.h2} text-hh-orange font-medium text-right !mb-0`}
                                    >
                                        {bookingPercentage}%
                                    </p>
                                    <p
                                        className={`${styles.paragraph} text-hh-gray !text-sm`}
                                    >
                                        Weekly bookings
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="shadow border border-hh-gray rounded-md  bg-white p-6 row-span-1 flex flex-col justify-between">
                            {" "}
                            <h4
                                className={`${styles.h3} !mb-0 font-medium text-black `}
                            >
                                Total Sales
                            </h4>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-x-4 h-full">
                                    <div className="w-1 h-20 rounded-md bg-hh-gray"></div>
                                    <div className="w-1 h-20 rounded-md bg-hh-gray"></div>
                                    <div className="w-1 h-20 rounded-md bg-hh-gray"></div>
                                    <div className="w-1 h-20 rounded-md bg-hh-gray"></div>
                                    <div className="w-1 h-20 rounded-md bg-hh-gray"></div>
                                    <div className="w-1 h-20 rounded-md bg-hh-gray"></div>
                                </div>
                                <div>
                                    <p
                                        className={`${styles.h2} text-hh-orange font-medium text-right !mb-0`}
                                    >
                                        R22300
                                    </p>
                                    <p
                                        className={`${styles.paragraph} text-hh-gray !text-sm`}
                                    >
                                        Revenue today
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="shadow border border-hh-gray rounded-md  bg-white py-6">
                        {" "}
                        <h4
                            className={`${styles.h3} !mb-0 font-medium text-black px-6`}
                        >
                            Total Bookings
                        </h4>
                        <div className="flex justify-center items-center h-full">
                            <div className="relative h-48 w-48">
                                <motion.svg
                                    className="h-full w-full"
                                    viewBox="0 0 64 64"
                                >
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="30"
                                        fill="none"
                                        stroke="#e0e0e0"
                                        strokeWidth="4"
                                    />
                                    <motion.circle
                                        cx="32"
                                        cy="32"
                                        r="30"
                                        fill="none"
                                        stroke="#FF7022"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        initial={{
                                            strokeDasharray: 188,
                                            strokeDashoffset: 188,
                                        }}
                                        animate={{
                                            strokeDashoffset:
                                                188 * (1 - eventBookings / 100),
                                        }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </motion.svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.p
                                        key={eventBookings}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`${styles.paragraph} text-black !text-2xl`}
                                    >
                                        {eventBookings}%
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
