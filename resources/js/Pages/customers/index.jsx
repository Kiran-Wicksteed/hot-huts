import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import styles from "../../../styles";
import {
    ChevronDownIcon,
    MagnifyingGlassCircleIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { BarsArrowUpIcon, UsersIcon } from "@heroicons/react/24/solid";

export default function Dashboard() {
    const truncateEmail = (email, maxLength) => {
        if (email.length > maxLength) {
            return email.substring(0, maxLength - 3) + "...";
        }
        return email;
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px]  ">
                <div className="relative lg:col-span-full  overflow-hidden pt-6 pb-12">
                    <div className="col-span-full flex justify-between items-center mb-6 gap-x-2">
                        <div className="w-full">
                            <label htmlFor="query" className="sr-only">
                                Search
                            </label>
                            <div className=" flex">
                                <div className="ml-0.5 grid grow grid-cols-1 focus-within:relative">
                                    <input
                                        id="query"
                                        name="query"
                                        type="text"
                                        placeholder="Search Customer"
                                        className="focus:ring-none block w-full col-start-1 row-start-1 border-0 bg-white font-medium pl-10 rounded-lg px-3.5 py-2.5 text-black shadow-sm ring-1  ring-hh-gray placeholder:text-hh-gray focus:outline-none focus:ring-1 focus:ring-hh-gray sm:text-sm "
                                    />
                                    <MagnifyingGlassIcon
                                        aria-hidden="true"
                                        className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-x-4 items-center">
                            <div className="bg-white shadow-md  border text-hh-orange border-hh-orange hover:bg-hh-orange hover:text-white p-2 px-8 rounded transition-all cursor-pointer">
                                <p className={`${styles.paragraph} `}>Reset</p>
                            </div>
                            <div className="bg-white shadow-md  border text-hh-orange border-hh-orange hover:bg-hh-orange hover:text-white p-2 px-8 rounded transition-all cursor-pointer">
                                <p className={`${styles.paragraph} `}>Applu</p>
                            </div>
                            <div className="bg-white shadow-md  border text-hh-orange border-hh-orange hover:bg-hh-orange hover:text-white p-2 px-8 rounded transition-all cursor-pointer">
                                <p className={`${styles.paragraph} `}>Export</p>
                            </div>
                            <div className="bg-white shadow-md  border text-hh-orange border-hh-orange hover:bg-hh-orange hover:text-white p-2 px-8 rounded transition-all cursor-pointer">
                                <p
                                    className={`${styles.paragraph} whitespace-nowrap`}
                                >
                                    Add a customer
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-full  mb-6">
                        <div>
                            {" "}
                            <h4
                                className={`${styles.h3} !mb-0 font-medium text-black `}
                            >
                                Customer List
                            </h4>
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
                                Full Name
                            </p>
                        </div>
                        <div className="col-span-3">
                            <p className={`${styles.paragraph} text-black`}>
                                Email Address
                            </p>
                        </div>
                        <div className="col-span-1 -ml-6">
                            <p className={`${styles.paragraph} text-black`}>
                                Number
                            </p>
                        </div>
                        <div className="col-span-3 ml-8">
                            <p className={`${styles.paragraph} text-black`}>
                                Recent Appointment
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Total Appointments
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
                            <div className="col-span-3 ">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                >
                                    {truncateEmail(
                                        "valentinomorose@gmail.com",
                                        24
                                    )}
                                </p>
                            </div>
                            <div className="col-span-1 -ml-6">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                >
                                    0825684405
                                </p>
                            </div>
                            <div className="col-span-3 ml-8">
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
                                    2
                                </p>
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
            </div>
        </AuthenticatedLayout>
    );
}
