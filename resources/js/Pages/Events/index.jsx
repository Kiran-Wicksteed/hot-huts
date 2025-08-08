import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import EventForm from "./Partials/EventForm";
import styles from "../../../styles";

export default function EventsIndex({ events }) {
    const [editing, setEditing] = useState(null);

    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px]">
                {/* Header + “Add” button */}
                <div className="flex justify-between items-center pt-6 pb-4">
                    <h2 className={`${styles.h3} font-medium`}>
                        Event Templates
                    </h2>

                    <button
                        onClick={() => setEditing({})}
                        className="bg-white border border-hh-orange text-hh-orange hover:bg-hh-orange hover:text-white py-2 px-6 rounded shadow transition-all"
                    >
                        Add Event
                    </button>
                </div>

                {/* Table head */}
                <div className="grid grid-cols-12 gap-x-4 p-4">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-3">Name</div>
                    <div className="col-span-4">Description</div>
                    <div className="col-span-2">Default Price</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Rows */}
                <div className="space-y-3">
                    {events.data.map((event) => (
                        <div
                            key={event.id}
                            className="grid grid-cols-12 gap-x-4 items-center bg-white p-4 rounded border shadow"
                        >
                            <div className="col-span-1 text-[#999]">
                                {event.id}
                            </div>
                            <div className="col-span-3">{event.name}</div>
                            <div className="col-span-4 text-sm text-[#666] truncate">
                                {event.description}
                            </div>
                            <div className="col-span-2">
                                R{(event.default_price / 100).toFixed(2)}
                            </div>

                            <div className="col-span-2 flex justify-end gap-x-4 text-sm">
                                <Link
                                    href={route(
                                        "events.occurrences.index",
                                        event.id
                                    )}
                                    className="text-hh-orange hover:underline"
                                >
                                    Manage Dates
                                </Link>

                                <span
                                    onClick={() => setEditing(event)}
                                    className="cursor-pointer hover:text-hh-orange"
                                >
                                    Edit
                                </span>

                                <Link
                                    href={route("events.destroy", event.id)}
                                    as="button"
                                    method="delete"
                                    preserveScroll
                                    className="hover:text-hh-orange"
                                >
                                    Delete
                                </Link>
                            </div>
                        </div>
                    ))}

                    {/* Pagination, identical to your example */}
                    <div className="flex justify-end gap-x-2 mt-4">
                        {events.links
                            .filter(
                                (l) =>
                                    !l.label.includes("Previous") &&
                                    !l.label.includes("Next")
                            )
                            .map((link, i) => (
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
                                    {link.label}
                                </Link>
                            ))}
                    </div>
                </div>

                {editing !== null && (
                    <EventForm
                        item={editing}
                        onClose={() => setEditing(null)}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
