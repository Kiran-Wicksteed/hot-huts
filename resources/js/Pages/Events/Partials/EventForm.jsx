import { useForm } from "@inertiajs/react";
import styles from "../../../../styles";

/**
 * Props
 * -----
 * item    – existing event object (or {} when creating)
 * onClose – callback to hide the modal
 *
 * Note: default_price is displayed in Rand for convenience and
 *       multiplied by 100 on save so the API still receives cents.
 */
export default function EventForm({ item = {}, onClose }) {
    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        transform, // we’ll use this to convert R → cents before submit
    } = useForm({
        name: item.name || "",
        description: item.description || "",
        // convert cents → Rand on load; blank if null
        default_price:
            item.default_price != null
                ? (item.default_price / 100).toFixed(2)
                : "",
        default_capacity: item.default_capacity ?? "",
        is_active: item.is_active ?? true,
    });

    /* ===============================================================
     *  Submit
     * ============================================================= */
    const save = () => {
        // Convert price back to cents just before request is sent
        transform((d) => ({
            ...d,
            default_price:
                d.default_price !== ""
                    ? Math.round(parseFloat(d.default_price) * 100)
                    : null,
        }));

        item.id
            ? put(route("events.update", item.id), { onSuccess: onClose })
            : post(route("events.store"), { onSuccess: onClose });
    };

    /* ===============================================================
     *  Render
     * ============================================================= */
    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-20">
            <div className="bg-white rounded shadow-lg w-full max-w-lg p-6">
                <h3 className={`${styles.h4} mb-4`}>
                    {item.id ? "Edit Event" : "Create Event"}
                </h3>

                {/* ---------- Name ---------- */}
                <label className="block mb-3">
                    <span className="block mb-1">Name</span>
                    <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                    />
                    {errors.name && (
                        <p className="text-red-600 text-sm">{errors.name}</p>
                    )}
                </label>

                {/* ---------- Description ---------- */}
                <label className="block mb-3">
                    <span className="block mb-1">Description</span>
                    <textarea
                        rows={3}
                        className="w-full border rounded p-2 resize-y"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                    />
                    {errors.description && (
                        <p className="text-red-600 text-sm">
                            {errors.description}
                        </p>
                    )}
                </label>

                <div className="grid grid-cols-2 gap-x-4">
                    {/* ---------- Price ---------- */}
                    <label className="block mb-3 col-span-1">
                        <span className="block mb-1">Default price (R)</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full border rounded p-2"
                            value={data.default_price}
                            onChange={(e) =>
                                setData("default_price", e.target.value)
                            }
                        />
                        {errors.default_price && (
                            <p className="text-red-600 text-sm">
                                {errors.default_price}
                            </p>
                        )}
                    </label>

                    {/* ---------- Capacity ---------- */}
                    <label className="block mb-3 col-span-1">
                        <span className="block mb-1">Default capacity</span>
                        <input
                            type="number"
                            min="1"
                            className="w-full border rounded p-2"
                            value={data.default_capacity}
                            onChange={(e) =>
                                setData("default_capacity", e.target.value)
                            }
                        />
                        {errors.default_capacity && (
                            <p className="text-red-600 text-sm">
                                {errors.default_capacity}
                            </p>
                        )}
                    </label>
                </div>

                {/* ---------- Active toggle ---------- */}
                <label className="inline-flex items-center mb-4">
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

                {/* ---------- Actions ---------- */}
                <div className="flex justify-end gap-x-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={save}
                        disabled={processing}
                        className="px-6 py-2 bg-hh-orange text-white rounded hover:opacity-90 disabled:opacity-50"
                        type="button"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
