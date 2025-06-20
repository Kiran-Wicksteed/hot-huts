import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Slots({ schedule, sauna }) {
    const { timeslots } = schedule;

    console.log("schedule:", schedule);
    console.log("timeslots:", timeslots);

    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px] ">
                <div className="p-6 space-y-6">
                    <Link
                        href={route("saunas.schedules.index", sauna.id)}
                        className="text-hh-orange"
                    >
                        ← Back to schedule
                    </Link>

                    <h1 className="text-2xl font-bold">
                        {sauna.name},&nbsp;
                        {new Date(schedule.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}{" "}
                        ({schedule.period})
                    </h1>

                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th>Slot</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Capacity</th>
                                <th>Booked</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timeslots.map((ts, i) => (
                                <tr key={ts.id} className="border-b">
                                    <td>Slot {i + 1}</td>
                                    <td>{ts.starts_at.slice(11, 16)}</td>
                                    <td>{ts.ends_at.slice(11, 16)}</td>
                                    <td>{ts.capacity}</td>
                                    <td>
                                        {ts.bookings.reduce(
                                            (t, b) => t + b.people,
                                            0
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
