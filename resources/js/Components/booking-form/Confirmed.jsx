import styles from "../../../styles";
import { usePage } from "@inertiajs/react";
import dayjs from "dayjs";

export default function Confirmed() {
    const { booking } = usePage().props; // <- comes from controller
    const sessionLine = booking.services.find(
        (s) => s.pivot.quantity > 0 && s.category === "session"
    );
    const addonLines = booking.services.filter(
        (s) => s.category === "addon" && s.pivot.quantity > 0
    );

    return (
        <div className={`max-w-2xl mx-auto py-32`}>
            <h1
                className={`${styles.h3} !mb-2 !text-2xl font-medium !text-hh-orange text-center`}
            >
                Thanks {booking.user.name}, your booking is confirmed
            </h1>
            <p
                className={`${styles.paragraph} !text-3xl !text-black font-medium text-center`}
            >
                {booking.timeslot.schedule.location.name} —{" "}
                {dayjs(booking.timeslot.starts_at).format(
                    "D MMMM YYYY [at] HH:mm"
                )}
            </p>

            <div className="space-y-2 mt-10">
                <Line
                    item="Single Sauna Session"
                    qty={sessionLine.pivot.quantity}
                />

                {addonLines.map((l) => (
                    <Line key={l.id} item={l.name} qty={l.pivot.quantity} />
                ))}
            </div>
        </div>
    );
}

const Line = ({ item, qty }) => (
    <div className="bg-white flex justify-between py-2 px-6 shadow rounded border border-hh-gray">
        <p className={`${styles.paragraph} text-[#2C2C2C]`}>{item}</p>
        <p className={`${styles.paragraph} text-[#2C2C2C]`}>{qty}</p>
    </div>
);
