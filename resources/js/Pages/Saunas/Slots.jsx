import React, { useEffect, useState } from "react";
import { useForm, Link, router } from "@inertiajs/react";

const AuthenticatedLayout = ({ children }) => (
    <div className="bg-gray-100 min-h-screen">
        <main>{children}</main>
    </div>
);

export default function Slots({ schedule, sauna }) {
    if (!schedule || !sauna) {
        return (
            <AuthenticatedLayout>
                <div className="p-6">Loading schedule details...</div>
            </AuthenticatedLayout>
        );
    }

    const [successMessage, setSuccessMessage] = useState("");
    const [currentTimeslots, setCurrentTimeslots] = useState(
        schedule?.timeslots || []
    );
    const [deletingId, setDeletingId] = useState(null);

    // Initialise useForm with your single field
    const { data, setData, post, processing, errors, reset } = useForm({
        capacity: schedule?.timeslots?.[0]?.capacity || sauna?.capacity || 8,
    });

    // Keep local table in sync if parent props change
    useEffect(() => {
        setCurrentTimeslots(schedule?.timeslots || []);
        setData(
            "capacity",
            schedule?.timeslots?.[0]?.capacity || sauna?.capacity || 8
        );
    }, [schedule?.timeslots, sauna?.capacity]);

    const handleCapacityUpdate = (e) => {
        e.preventDefault();

        post(route("schedules.update-capacity", schedule.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Optimistically update UI (no full reload needed)
                const updated = (currentTimeslots || []).map((ts) => ({
                    ...ts,
                    capacity: parseInt(data.capacity, 10),
                }));
                setCurrentTimeslots(updated);
                setSuccessMessage("Capacity updated successfully.");
                setTimeout(() => setSuccessMessage(""), 3000);
            },
            onError: () => {
                setSuccessMessage("Failed to update capacity.");
                setTimeout(() => setSuccessMessage(""), 3000);
            },
        });
    };

    const handleDeleteTimeslot = (timeslotId) => {
        if (!confirm("Are you sure you want to delete this timeslot?")) {
            return;
        }

        setDeletingId(timeslotId);

        router.delete(route("timeslots.destroy", timeslotId), {
            preserveScroll: true,
            onSuccess: () => {
                // Remove from local state
                setCurrentTimeslots(
                    currentTimeslots.filter((ts) => ts.id !== timeslotId)
                );
                setSuccessMessage("Timeslot deleted successfully.");
                setTimeout(() => setSuccessMessage(""), 3000);
                setDeletingId(null);
            },
            onError: () => {
                setSuccessMessage("Failed to delete timeslot.");
                setTimeout(() => setSuccessMessage(""), 3000);
                setDeletingId(null);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="p-6 space-y-6">
                    <Link
                        href={
                            route
                                ? route("saunas.schedules.index", sauna.id)
                                : `/saunas/${sauna.id}/schedules`
                        }
                        className="text-orange-600 hover:text-orange-800"
                    >
                        ← Back to schedule
                    </Link>

                    <h1 className="text-2xl font-bold">
                        {sauna.name},{" "}
                        {new Date(schedule.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}{" "}
                        ({schedule.period})
                    </h1>

                    <form
                        onSubmit={handleCapacityUpdate}
                        className="flex items-center space-x-4 p-4 bg-gray-200 rounded-lg"
                    >
                        <label htmlFor="capacity" className="font-semibold">
                            Set Capacity for all slots:
                        </label>
                        <input
                            type="number"
                            id="capacity"
                            value={data.capacity}
                            onChange={(e) =>
                                setData("capacity", e.target.value)
                            }
                            className="border-gray-300 rounded-md shadow-sm"
                            min="1"
                            disabled={processing}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition disabled:opacity-50"
                            disabled={processing}
                        >
                            {processing ? "Updating…" : "Update Capacity"}
                        </button>

                        {successMessage && (
                            <div className="text-green-600 font-medium">
                                {successMessage}
                            </div>
                        )}
                        {errors.capacity && (
                            <div className="text-red-600 font-medium">
                                {errors.capacity}
                            </div>
                        )}
                    </form>

                    <table className="w-full text-left">
                        <thead className="border-b">
                            <tr className="text-gray-600">
                                <th className="py-2">Slot</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Capacity</th>
                                <th>Booked</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(currentTimeslots || []).map((ts, i) => {
                                const bookedCount = (ts.bookings || []).reduce(
                                    (t, b) => t + (b.people ?? 0),
                                    0
                                );
                                const hasBookings = bookedCount > 0;

                                return (
                                    <tr key={ts.id ?? i} className="border-b">
                                        <td className="py-2">Slot {i + 1}</td>
                                        <td>{ts.starts_at?.slice(11, 16)}</td>
                                        <td>{ts.ends_at?.slice(11, 16)}</td>
                                        <td>{ts.capacity}</td>
                                        <td>{bookedCount}</td>
                                        <td>
                                            <button
                                                onClick={() =>
                                                    handleDeleteTimeslot(ts.id)
                                                }
                                                disabled={
                                                    hasBookings ||
                                                    deletingId === ts.id
                                                }
                                                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={
                                                    hasBookings
                                                        ? "Cannot delete timeslot with bookings"
                                                        : "Delete timeslot"
                                                }
                                            >
                                                {deletingId === ts.id
                                                    ? "Deleting…"
                                                    : "Delete"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
