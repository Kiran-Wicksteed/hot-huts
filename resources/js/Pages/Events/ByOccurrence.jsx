import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function BookingsByOccurrence({ bookings }) {
    return (
        <AuthenticatedLayout>
            <div className="ml-[256px] p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Bookings for this Event
                </h2>

                {bookings.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {bookings.map((b) => (
                            <li key={b.id} className="py-3">
                                <p>
                                    <span className="font-medium">
                                        {b.guest}
                                    </span>{" "}
                                    ({b.email})
                                </p>
                                <p>People: {b.people}</p>

                                <p>Status: {b.status}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-sm">No bookings yet.</p>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
