import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import styles from "../../../styles";
import { Link } from "@inertiajs/react";
import { useState } from "react";
import CreateService from "./Partials/CreateService";

export default function ServicesPage({ services }) {
    const [editing, setEditing] = useState(null);

    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px]  ">
                <div className="relative lg:col-span-full  overflow-hidden pt-6 pb-12">
                    <div className="col-span-full flex justify-between items-center mb-6 gap-x-6">
                        {" "}
                        <button
                            onClick={() => setEditing({})}
                            className="bg-white shadow-md  border text-hh-orange border-hh-orange hover:bg-hh-orange hover:text-white p-2 px-8 rounded transition-all cursor-pointer"
                        >
                            <p
                                className={`${styles.paragraph} whitespace-nowrap`}
                            >
                                Add a new service
                            </p>
                        </button>
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
                                ID
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Code
                            </p>
                        </div>
                        <div className="col-span-2 ">
                            <p className={`${styles.paragraph} text-black`}>
                                Name
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Category
                            </p>
                        </div>
                        <div className="col-span-2 ">
                            <p className={`${styles.paragraph} text-black`}>
                                Price
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Active
                            </p>
                        </div>
                    </div>
                    <div className="col-span-full space-y-4">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="col-span-full bg-white shadow grid grid-cols-12  gap-x-4 items-center border border-hh-gray rounded p-6"
                            >
                                <div className="col-span-1">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        {service.id}
                                    </p>
                                </div>
                                <div className="col-span-2 ">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {service.code}
                                    </p>
                                </div>
                                <div className="col-span-2 ">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {service.name}
                                    </p>
                                </div>
                                <div className="col-span-2 ">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {service.category}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        R{service.price}
                                    </p>
                                </div>
                                <div className="col-span-1">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {service.active ? "Yes" : "No"}
                                    </p>
                                </div>
                                <div className="col-span-2 flex gap-x-4 w-full justify-end items-center">
                                    <p
                                        onClick={() => setEditing(service)}
                                        className={`${styles.paragraph} mr-4 !mb-0 !pb-0 text-black hover:text-hh-orange transition-all !text-sm cursor-pointer`}
                                    >
                                        Edit
                                    </p>
                                    <Link
                                        href={route(
                                            "services.destroy",
                                            service.id
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
                    <CreateService
                        item={editing}
                        onClose={() => setEditing(null)}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
