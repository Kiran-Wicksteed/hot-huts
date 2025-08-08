import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link } from "@inertiajs/react";
import { useState } from "react";
import OccurrenceForm from "./Partials/OccurrenceForm";
import styles from "../../../styles";

export default function OccurrencesPage({ event, occurrences, locations }) {
    const [editing, setEditing] = useState(null);
    console.log("OccurrencesPage", { event, occurrences, locations });

    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px]">
                <div className="flex justify-between items-center pt-6 pb-4">
                    <h2 className={`${styles.h3}`}>{event.name}: Dates</h2>

                    <button
                        onClick={() => setEditing({})}
                        className="bg-white border border-hh-orange text-hh-orange hover:bg-hh-orange hover:text-white py-2 px-6 rounded shadow transition-all"
                    >
                        Add Date
                    </button>
                </div>

                {/* Table */}
                <div className="grid grid-cols-12 gap-x-4 p-4">
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Time</div>
                    <div className="col-span-3">Location</div>
                    <div className="col-span-2">Price</div>
                    <div className="col-span-1">Capacity</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="space-y-3">
                    {occurrences.data.map((occ) => (
                        <div
                            key={occ.id}
                            className="grid grid-cols-12 gap-x-4 items-center bg-white p-4 rounded border shadow"
                        >
                            <div className="col-span-2">{occ.occurs_on}</div>
                            <div className="col-span-2">
                                {occ.start_time.substr(0, 5)}&nbsp;–&nbsp;
                                {occ.end_time.substr(0, 5)}
                            </div>
                            <div className="col-span-3">
                                {occ.location.name}
                            </div>
                            <div className="col-span-2">
                                R{(occ.effective_price / 100).toFixed(2)}
                            </div>
                            <div className="col-span-1">
                                {occ.effective_capacity}
                            </div>
                            <div className="col-span-2 flex justify-end gap-x-4 text-sm">
                                <span
                                    onClick={() => setEditing(occ)}
                                    className="cursor-pointer hover:text-hh-orange"
                                >
                                    Edit
                                </span>
                                <Link
                                    href={route("events.occurrences.destroy", [
                                        event.id,
                                        occ.id,
                                    ])}
                                    method="delete"
                                    as="button"
                                    preserveScroll
                                    className="hover:text-hh-orange"
                                >
                                    Delete
                                </Link>
                            </div>
                        </div>
                    ))}

                    {/* Pagination identical pattern */}
                </div>

                {editing && ( // ← truthy check instead of !== null
                    <OccurrenceForm
                        eventId={event.id}
                        item={editing}
                        locations={locations}
                        onClose={() => setEditing(null)}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
