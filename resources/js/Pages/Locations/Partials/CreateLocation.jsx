import { Dialog } from "@headlessui/react";
import { useForm } from "@inertiajs/react";
import React from "react";

export default function CreateLocation({ item = {}, onClose, saunas = [] }) {
    const isEdit = Boolean(item.id);

    /* ---------- defaults ---------- */
    const defaultRanges = {
        morning: { start: "06:00", end: "11:00" },
        afternoon: { start: "12:00", end: "16:00" },
        evening: { start: "17:00", end: "20:00" },
        night: { start: "20:00", end: "23:00" },
    };

    /* ---------- inertia form ---------- */
    const { data, setData, post, put, processing, errors } = useForm({
        name: item.name ?? "",
        address: item.address ?? "",
        timezone: item.timezone ?? "Africa/Johannesburg",
        image: null,
        sauna_id: item.sauna_id ?? "",
        weekdays: item.weekdays ?? [],
        periods: (item.periods ?? []).filter(Boolean),
        custom_times: {
            ...defaultRanges,
            ...(item.times || {}),
        },
    });

    /* ---------- local state for UI control ---------- */
    const [enabledPeriods, setEnabledPeriods] = React.useState(
        new Set(data.periods)
    );

    /* ---------- helpers ---------- */
    const toggleWeekday = (i) => {
        const w = new Set(data.weekdays);
        w.has(i) ? w.delete(i) : w.add(i);
        setData("weekdays", [...w]);
    };

    const togglePeriod = (p) => {
        const nxt = new Set(enabledPeriods);
        nxt.has(p) ? nxt.delete(p) : nxt.add(p);
        const cleaned = Array.from(nxt).filter(Boolean);
        setEnabledPeriods(new Set(cleaned));
        setData("periods", cleaned);
    };

    // ✅ This now updates the nested state within useForm
    const changeTime = (p, field, val) => {
        setData("custom_times", {
            ...data.custom_times,
            [p]: {
                ...data.custom_times[p],
                [field]: val,
            },
        });
    };

    /* ---------- submit ---------- */
    const submit = (e) => {
        e.preventDefault();

        const options = {
            onSuccess: onClose,
            // ✅ Transform the data right before sending
            transform: (values) => {
                // Filter custom_times to only include keys from the 'periods' array
                const filteredTimes = Object.fromEntries(
                    values.periods.map((p) => [p, values.custom_times[p]])
                );
                return { ...values, custom_times: filteredTimes };
            },
        };

        if (isEdit) {
            // `put` automatically handles POST + _method spoofing for file uploads
            put(route("locations.update", item.id), options);
        } else {
            post(route("locations.store"), options);
        }
    };

    /* ---------- ui ---------- */
    return (
        <Dialog open onClose={onClose} className="relative z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

            {/* Scroll container (lets the modal scroll on small screens) */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
                    <Dialog.Panel
                        className={[
                            // Mobile: full-screen sheet
                            "w-screen h-[100dvh] sm:w-full sm:h-auto",
                            // Desktop: centered card with constrained height
                            "sm:max-w-md sm:max-h-[85dvh]",
                            // Visuals + scrolling
                            "bg-white shadow-lg rounded-none sm:rounded-xl overflow-y-auto",
                        ].join(" ")}
                    >
                        {/* Sticky header so the title/close never scroll away */}
                        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
                            <div className="px-4 py-3 sm:px-6">
                                <Dialog.Title className="text-lg font-semibold">
                                    {isEdit ? "Edit Location" : "New Location"}
                                </Dialog.Title>
                            </div>
                        </div>

                        {/* Form content */}
                        <form
                            onSubmit={submit}
                            encType="multipart/form-data"
                            className="px-4 py-4 sm:px-6 sm:py-6 space-y-3"
                        >
                            {/* ---- name / address / tz ---- */}
                            <input
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="Name"
                                className="w-full border p-2 rounded"
                            />
                            {errors.name && (
                                <p className="text-red-600 text-sm">
                                    {errors.name}
                                </p>
                            )}

                            <textarea
                                value={data.address}
                                onChange={(e) =>
                                    setData("address", e.target.value)
                                }
                                placeholder="Address"
                                className="w-full border p-2 rounded"
                            />
                            {errors.address && (
                                <p className="text-red-600 text-sm">
                                    {errors.address}
                                </p>
                            )}

                            <input
                                value={data.timezone}
                                onChange={(e) =>
                                    setData("timezone", e.target.value)
                                }
                                placeholder="Timezone"
                                className="w-full border p-2 rounded"
                            />
                            {errors.timezone && (
                                <p className="text-red-600 text-sm">
                                    {errors.timezone}
                                </p>
                            )}

                            {/* ---- sauna ---- */}
                            <label className="block mb-2 font-medium">
                                Sauna
                            </label>
                            <select
                                value={data.sauna_id}
                                onChange={(e) =>
                                    setData("sauna_id", e.target.value)
                                }
                                className="w-full border p-2 rounded mb-4"
                            >
                                <option value="">– pick a sauna –</option>
                                {saunas.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            {errors.sauna_id && (
                                <p className="text-red-600 text-sm">
                                    {errors.sauna_id}
                                </p>
                            )}

                            {/* ---- weekdays ---- */}
                            <label className="block mb-2 font-medium">
                                Weekdays
                            </label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {[
                                    "Sun",
                                    "Mon",
                                    "Tue",
                                    "Wed",
                                    "Thu",
                                    "Fri",
                                    "Sat",
                                ].map((d, i) => (
                                    <label
                                        key={i}
                                        className="flex items-center gap-1"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.weekdays.includes(i)}
                                            onChange={() => toggleWeekday(i)}
                                        />
                                        {d}
                                    </label>
                                ))}
                            </div>
                            {errors.weekdays && (
                                <p className="text-red-600 text-sm">
                                    {errors.weekdays}
                                </p>
                            )}

                            {/* ---- periods ---- */}
                            <label className="block mb-2 font-medium">
                                Periods
                            </label>
                            <div className="space-y-3 mb-6">
                                {[
                                    "morning",
                                    "afternoon",
                                    "evening",
                                    "night",
                                ].map((p) => {
                                    const on = enabledPeriods.has(p);
                                    const cap = p[0].toUpperCase() + p.slice(1);
                                    const { start, end } = data.custom_times[p];

                                    return (
                                        <div
                                            key={p}
                                            className="flex items-center gap-3"
                                        >
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={on}
                                                    onChange={() =>
                                                        togglePeriod(p)
                                                    }
                                                />
                                                <span className="capitalize w-20">
                                                    {cap}
                                                </span>
                                            </label>

                                            {on && (
                                                <>
                                                    <input
                                                        type="time"
                                                        value={start}
                                                        onChange={(e) =>
                                                            changeTime(
                                                                p,
                                                                "start",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="border p-1 rounded"
                                                    />
                                                    <span>–</span>
                                                    <input
                                                        type="time"
                                                        value={end}
                                                        onChange={(e) =>
                                                            changeTime(
                                                                p,
                                                                "end",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="border p-1 rounded"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {errors.periods && (
                                <p className="text-red-600 text-sm">
                                    {errors.periods}
                                </p>
                            )}
                            {Object.keys(errors)
                                .filter((k) => k.startsWith("custom_times"))
                                .map((k) => (
                                    <p key={k} className="text-red-600 text-sm">
                                        {errors[k]}
                                    </p>
                                ))}

                            {/* ---- image ---- */}
                            <input
                                type="file"
                                onChange={(e) =>
                                    setData("image", e.target.files[0])
                                }
                                className="w-full border p-2 rounded"
                            />
                            {errors.image && (
                                <p className="text-red-600 text-sm">
                                    {errors.image}
                                </p>
                            )}

                            {/* Sticky footer so actions are always reachable */}
                            <div className="sticky bottom-0 -mx-4 sm:-mx-6 border-t bg-white/95 backdrop-blur px-4 sm:px-6 pt-4 pb-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="py-2 px-4 bg-blue-600 text-white rounded disabled:bg-blue-300"
                                >
                                    {processing
                                        ? "Saving..."
                                        : isEdit
                                        ? "Update"
                                        : "Create"}
                                </button>
                            </div>
                        </form>
                    </Dialog.Panel>
                </div>
            </div>
        </Dialog>
    );
}
