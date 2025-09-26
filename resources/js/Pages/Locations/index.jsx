import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import styles from "../../../styles";
import CreateLocation from "./Partials/CreateLocation";
import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";

const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function LocationsPage({ locations, saunas }) {
    const [editing, setEditing] = useState(null);

    console.log("locations", locations);

    const asset = (path) => {
        return `/storage/${path}`;
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px]  ">
                <div className="relative lg:col-span-full  overflow-hidden pt-6 pb-12">
                    <div className="col-span-full flex justify-end mb-6">
                        <button
                            onClick={() => setEditing({})}
                            className="bg-white shadow-md  border text-hh-orange border-hh-orange hover:bg-hh-orange hover:text-white p-2 px-8 rounded transition-all cursor-pointer"
                        >
                            <p
                                className={`${styles.paragraph} whitespace-nowrap`}
                            >
                                Add a new location
                            </p>
                        </button>
                    </div>
                    <div className="col-span-full  mb-6">
                        <div>
                            {" "}
                            <h4
                                className={`${styles.h3} !mb-0 font-medium text-black `}
                            >
                                Location List
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
                                Image
                            </p>
                        </div>
                        <div className="col-span-3">
                            <p className={`${styles.paragraph} text-black`}>
                                Address
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Days
                            </p>
                        </div>
                    </div>
                    <div className="col-span-full space-y-4">
                        {locations.map((loc) => (
                            <div
                                key={loc.id}
                                className="col-span-full bg-white shadow grid grid-cols-12  gap-x-4 items-center border border-hh-gray rounded p-6"
                            >
                                <div className="col-span-1">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        {loc.id}
                                    </p>
                                </div>
                                <div className="col-span-2 ">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {loc.name}
                                    </p>
                                </div>
                                <div className="col-span-2 ">
                                    {loc.image_path ? (
                                        <img
                                            src={loc.image_path}
                                            alt={loc.name}
                                            className="h-12 w-12 object-cover rounded"
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-400">
                                            No image
                                        </span>
                                    )}
                                </div>
                                <div className="col-span-3">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {loc.address}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {(Array.isArray(loc.weekdays)
                                            ? loc.weekdays
                                            : Array.from(loc.weekdays || [])
                                        )
                                            .map((i) => DAY_NAMES_SHORT[i])
                                            .filter(Boolean)
                                            .join(", ")}
                                    </p>
                                </div>

                                <div className="col-span-2 flex gap-x-4 w-full justify-end items-center">
                                    <span
                                        onClick={() => setEditing(loc)}
                                        className={`${styles.paragraph} !mb-0 text-black hover:text-hh-orange transition-all !text-sm cursor-pointer`}
                                    >
                                        Edit
                                    </span>
                                    <Link
                                        href={route(
                                            "locations.destroy",
                                            loc.id
                                        )}
                                        as="button"
                                        method="delete"
                                        className=" "
                                    >
                                        <span
                                            className={`${styles.paragraph} !mb-0 !pb-0 text-black hover:text-hh-orange transition-all !text-sm cursor-pointer`}
                                        >
                                            Delete
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {editing !== null && (
                    <CreateLocation
                        item={editing}
                        saunas={saunas}
                        onClose={() => setEditing(null)}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
