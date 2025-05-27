import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import styles from "../../../styles";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function ServicesPage() {
    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px]  ">
                <div className="relative lg:col-span-full  overflow-hidden pt-6 pb-12">
                    <div className="col-span-full flex justify-between items-center mb-6 gap-x-6">
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
                                        placeholder="Service Name"
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
                                <p className={`${styles.paragraph} `}>Apply</p>
                            </div>
                            <div className="bg-white shadow-md  border text-hh-orange border-hh-orange hover:bg-hh-orange hover:text-white p-2 px-8 rounded transition-all cursor-pointer">
                                <p className={`${styles.paragraph} `}>Export</p>
                            </div>
                            <div className="bg-white shadow-md  border text-hh-orange border-hh-orange hover:bg-hh-orange hover:text-white p-2 px-8 rounded transition-all cursor-pointer">
                                <p
                                    className={`${styles.paragraph} whitespace-nowrap`}
                                >
                                    Add a service
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
                                Service List
                            </h4>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 p-6 gap-x-4">
                        <div className="col-span-1">
                            <p className={`${styles.paragraph} text-black`}>
                                #No
                            </p>
                        </div>
                        <div className="col-span-2 ">
                            <p className={`${styles.paragraph} text-black`}>
                                Name
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Day
                            </p>
                        </div>
                        <div className="col-span-2 -ml-6">
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
                                Price
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
                            <div className="col-span-2 ">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                >
                                    Single Sauna Session
                                </p>
                            </div>
                            <div className="col-span-2 ">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                >
                                    Wednesday
                                </p>
                            </div>
                            <div className="col-span-2 -ml-6">
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
                                    20 Minutes
                                </p>
                            </div>
                            <div className="col-span-1">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                >
                                    R80
                                </p>
                            </div>
                            <div className="col-span-2 flex justify-between w-full">
                                <p
                                    className={`${styles.paragraph} text-black hover:text-hh-orange transition-all !text-sm cursor-pointer`}
                                >
                                    Manage
                                </p>
                                <p
                                    className={`${styles.paragraph} text-black hover:text-hh-orange transition-all !text-sm cursor-pointer`}
                                >
                                    Edit
                                </p>
                                <p
                                    className={`${styles.paragraph} text-black hover:text-hh-orange transition-all !text-sm cursor-pointer`}
                                >
                                    Delete
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
