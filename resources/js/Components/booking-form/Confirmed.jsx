import styles from "../../../styles";
import dayjs from "dayjs";

/**
 * Props:
 *  - booking  (legacy: single booking object with relations)
 *  - bookings (array of normalized items when multi-cart)
 *  - summary  ({ order, count, grand_total_cents })
 */
export default function Confirmed({ booking, bookings = [], summary = null }) {
    const hasMulti = Array.isArray(bookings) && bookings.length > 0;

    // Use the legacy booking's user name for the greeting (works for both cases)
    const customerName = booking?.user?.name ?? "there";

    if (hasMulti) {
        const grandTotalCents =
            summary?.grand_total_cents ??
            bookings.reduce((t, b) => t + Number(b.total_cents || 0), 0);

        return (
            <div className="max-w-3xl mx-auto py-16">
                <h1
                    className={`${styles.h3} !mb-2 !text-2xl font-medium !text-hh-orange text-center`}
                >
                    Thanks {customerName}, your order is confirmed
                </h1>

                {summary?.order && (
                    <p
                        className={`${styles.paragraph} text-center text-black/70 mb-6`}
                    >
                        Order reference:{" "}
                        <span className="font-medium">{summary.order}</span>
                    </p>
                )}

                <div className="space-y-8 mt-8">
                    {bookings.map((b) => {
                        const dateStr = b.starts_at
                            ? dayjs(b.starts_at).format("D MMMM YYYY")
                            : null;
                        const timeStr =
                            b.starts_at && b.ends_at
                                ? `${dayjs(b.starts_at).format(
                                      "HH:mm"
                                  )} – ${dayjs(b.ends_at).format("HH:mm")}`
                                : null;

                        return (
                            <div
                                key={b.id}
                                className="bg-white border border-hh-gray rounded shadow p-6"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p
                                            className={`${styles.h3} !mb-1 text-black font-medium`}
                                        >
                                            {b.location_name ?? "Booking"}
                                        </p>
                                        <p
                                            className={`${styles.paragraph} text-black/70`}
                                        >
                                            {dateStr && <span>{dateStr}</span>}
                                            {dateStr && timeStr && (
                                                <span> · </span>
                                            )}
                                            {timeStr && <span>{timeStr}</span>}
                                        </p>
                                        <p
                                            className={`${styles.paragraph} text-black/70`}
                                        >
                                            Guests:{" "}
                                            <span className="font-medium">
                                                {b.people}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`${styles.paragraph} text-black/60`}
                                        >
                                            Item total
                                        </p>
                                        <p
                                            className={`${styles.h3} text-hh-orange font-medium`}
                                        >
                                            R
                                            {(
                                                Number(b.total_cents || 0) / 100
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Lines */}
                                <div className="space-y-2 mt-6">
                                    {(b.lines ?? []).map((l) => (
                                        <Line
                                            key={l.id ?? `${l.name}-${l.qty}`}
                                            item={l.name}
                                            qty={l.qty}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Grand total */}
                <div className="bg-[#FAFAFA] border border-hh-gray rounded p-4 mt-10">
                    <div className="flex justify-between items-center">
                        <p className={`${styles.paragraph} text-black/60`}>
                            Order total
                        </p>
                        <p
                            className={`${styles.h3} text-hh-orange font-medium`}
                        >
                            R{(Number(grandTotalCents) / 100).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ---------- Single-booking fallback (legacy) ----------
    const lines = (booking?.services ?? []).filter(
        (s) => (s?.pivot?.quantity ?? 0) > 0
    );

    // Location fallback: timeslot location OR event location
    const locationName =
        booking?.timeslot?.schedule?.location?.name ??
        booking?.event_occurrence?.location?.name ??
        "Hot Huts";

    // Time fallback: timeslot OR event occurrence timestamps if present
    const startsAt =
        booking?.timeslot?.starts_at ?? booking?.eventOccurrence?.start_at;
    const startsNice = startsAt
        ? dayjs(startsAt).format("D MMMM YYYY [at] HH:mm")
        : null;

    return (
        <div className="max-w-2xl mx-auto py-32">
            <h1
                className={`${styles.h3} !mb-2 !text-2xl font-medium !text-hh-orange text-center`}
            >
                Thanks {customerName}, your booking is confirmed
            </h1>
            <p
                className={`${styles.paragraph} !text-3xl !text-black font-medium text-center`}
            >
                {locationName}
                {startsNice ? ` — ${startsNice}` : ""}
            </p>

            <div className="space-y-2 mt-10">
                {lines.map((l) => (
                    <Line
                        key={l.id}
                        item={l.name ?? "Item"}
                        qty={l.pivot.quantity}
                    />
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
