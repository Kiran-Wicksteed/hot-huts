import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import styles from "../../../styles";
import CreateSauna from "./Partials/CreateSauna";
import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";

export default function LocationsPage({ saunas }) {
    const [editing, setEditing] = useState(null);

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
                                Add a new sauna
                            </p>
                        </button>
                    </div>
                    <div className="col-span-full  mb-6">
                        <div>
                            {" "}
                            <h4
                                className={`${styles.h3} !mb-0 font-medium text-black `}
                            >
                                Sauna List
                            </h4>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 p-6 gap-x-4">
                        <div className="col-span-1">
                            <p className={`${styles.paragraph} text-black`}>
                                Sauna ID
                            </p>
                        </div>
                        <div className="col-span-2 ">
                            <p className={`${styles.paragraph} text-black`}>
                                Name
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Description
                            </p>
                        </div>
                        <div className="col-span-3">
                            <p className={`${styles.paragraph} text-black`}>
                                Schedule
                            </p>
                        </div>
                    </div>
                    <div className="col-span-full space-y-4">
                        {saunas.data.map((sauna) => (
                            <div
                                key={sauna.id}
                                className="col-span-full bg-white shadow grid grid-cols-12  gap-x-4 items-center border border-hh-gray rounded p-6"
                            >
                                <div className="col-span-1">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] `}
                                    >
                                        {sauna.id}
                                    </p>
                                </div>
                                <div className="col-span-2 ">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {sauna.name}
                                    </p>
                                </div>

                                <div className="col-span-2">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {sauna.description}
                                    </p>
                                </div>
                                <div className="col-span-5">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        <Link
                                            href={route(
                                                "saunas.schedules.index",
                                                sauna.id
                                            )}
                                            className="text-hh-orange hover:underline"
                                        >
                                            Manage Schedule
                                        </Link>
                                    </p>
                                </div>

                                <div className="col-span-2 flex gap-x-4 w-full justify-end items-center">
                                    <span
                                        onClick={() => setEditing(sauna)}
                                        className={`${styles.paragraph} !mb-0 text-black hover:text-hh-orange transition-all !text-sm cursor-pointer`}
                                    >
                                        Edit
                                    </span>
                                    <Link
                                        href={route("saunas.destroy", sauna.id)}
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
                        <div className="col-span-full flex justify-end gap-x-2 mt-4">
                            {saunas.links.map((link, i) => {
                                // Skip the "Previous" / "Next" placeholders here if you only want numbers
                                // If you want them, treat them the same but give them a different label.
                                if (
                                    link.label.includes("Previous") ||
                                    link.label.includes("Next")
                                ) {
                                    return null;
                                }

                                return (
                                    <Link
                                        key={i}
                                        href={link.url || "#"}
                                        preserveScroll
                                        className={[
                                            "rounded-full w-10 h-10 shadow flex items-center justify-center",
                                            link.active
                                                ? "bg-hh-orange text-white"
                                                : "bg-white text-[#999]",
                                            !link.url &&
                                                "opacity-40 cursor-not-allowed",
                                        ].join(" ")}
                                    >
                                        {/* `label` is a string—no need for dangerouslySetInnerHTML on numbers */}
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {editing !== null && (
                    <CreateSauna
                        item={editing}
                        onClose={() => setEditing(null)}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
