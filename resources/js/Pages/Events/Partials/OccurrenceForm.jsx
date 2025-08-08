import { useForm } from "@inertiajs/react";
import styles from "../../../../styles";

/**
 * OccurrenceForm
 * --------------
 * Props
 * • eventId   – parent template’s ID (needed for POST/PUT routes)
 * • item      – existing occurrence object OR {} when adding
 * • locations – array of { id, name } for the <select>
 * • onClose   – callback to hide the modal
 *
 * Money note: price is displayed in Rand, converted back to cents on submit.
 */
export default function OccurrenceForm({
    eventId,
    item = {},
    locations = [],
    onClose,
}) {
    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        transform, // used to re‑convert money
    } = useForm({
        location_id: item.location_id || (locations[0]?.id ?? ""),
        occurs_on: item.occurs_on || "",
        start_time: item.start_time?.substr(0, 5) || "", // HH:mm
        end_time: item.end_time?.substr(0, 5) || "",
        price: item.price != null ? (item.price / 100).toFixed(2) : "", // in R
        capacity: item.capacity ?? "",
        is_active: item.is_active ?? true,
    });

    /* ------------------------------------------------------------- */
    const save = () => {
        transform((d) => ({
            ...d,
            price:
                d.price !== "" ? Math.round(parseFloat(d.price) * 100) : null,
        }));

        const params = [eventId];
        if (item.id) params.push(item.id);

        item.id
            ? put(route("events.occurrences.update", params), {
                  onSuccess: onClose,
              })
            : post(route("events.occurrences.store", eventId), {
                  onSuccess: onClose,
              });
    };
    /* ------------------------------------------------------------- */

    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-20">
            <div className="bg-white rounded shadow-lg w-full max-w-lg p-6">
                <h3 className={`${styles.h4} mb-4`}>
                    {item.id ? "Edit Date" : "Add Date"}
                </h3>

                {/* ------- Location selector ------- */}
                <label className="block mb-3">
                    <span className="block mb-1">Location</span>
                    <select
                        className="w-full border rounded p-2"
                        value={data.location_id}
                        onChange={(e) => setData("location_id", e.target.value)}
                    >
                        {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                    </select>
                    {errors.location_id && (
                        <p className="text-red-600 text-sm">
                            {errors.location_id}
                        </p>
                    )}
                </label>

                {/* ------- Date & time ------- */}
                <div className="grid grid-cols-3 gap-x-4">
                    <label className="block mb-3 col-span-1">
                        <span className="block mb-1">Date</span>
                        <input
                            type="date"
                            className="w-full border rounded p-2"
                            value={data.occurs_on}
                            onChange={(e) =>
                                setData("occurs_on", e.target.value)
                            }
                        />
                        {errors.occurs_on && (
                            <p className="text-red-600 text-sm">
                                {errors.occurs_on}
                            </p>
                        )}
                    </label>

                    <label className="block mb-3 col-span-1">
                        <span className="block mb-1">Start time</span>
                        <input
                            type="time"
                            className="w-full border rounded p-2"
                            value={data.start_time}
                            onChange={(e) =>
                                setData("start_time", e.target.value)
                            }
                        />
                        {errors.start_time && (
                            <p className="text-red-600 text-sm">
                                {errors.start_time}
                            </p>
                        )}
                    </label>

                    <label className="block mb-3 col-span-1">
                        <span className="block mb-1">End time</span>
                        <input
                            type="time"
                            className="w-full border rounded p-2"
                            value={data.end_time}
                            onChange={(e) =>
                                setData("end_time", e.target.value)
                            }
                        />
                        {errors.end_time && (
                            <p className="text-red-600 text-sm">
                                {errors.end_time}
                            </p>
                        )}
                    </label>
                </div>

                {/* ------- Price & capacity overrides ------- */}
                <div className="grid grid-cols-2 gap-x-4">
                    <label className="block mb-3 col-span-1">
                        <span className="block mb-1">Price override (R)</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full border rounded p-2"
                            value={data.price}
                            onChange={(e) => setData("price", e.target.value)}
                            placeholder="Use template default"
                        />
                        {errors.price && (
                            <p className="text-red-600 text-sm">
                                {errors.price}
                            </p>
                        )}
                    </label>

                    <label className="block mb-3 col-span-1">
                        <span className="block mb-1">Capacity override</span>
                        <input
                            type="number"
                            min="1"
                            className="w-full border rounded p-2"
                            value={data.capacity}
                            onChange={(e) =>
                                setData("capacity", e.target.value)
                            }
                            placeholder="Use template default"
                        />
                        {errors.capacity && (
                            <p className="text-red-600 text-sm">
                                {errors.capacity}
                            </p>
                        )}
                    </label>
                </div>

                {/* ------- Active toggle ------- */}
                <label className="inline-flex items-centre mb-4">
                    <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 text-hh-orange border rounded"
                        checked={data.is_active}
                        onChange={(e) => setData("is_active", e.target.checked)}
                    />
                    <span>Active</span>
                </label>
                {errors.is_active && (
                    <p className="text-red-600 text-sm">{errors.is_active}</p>
                )}

                {/* ------- Actions ------- */}
                <div className="flex justify-end gap-x-4 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={save}
                        disabled={processing}
                        className="px-6 py-2 bg-hh-orange text-white rounded hover:opacity-90 disabled:opacity-50"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
