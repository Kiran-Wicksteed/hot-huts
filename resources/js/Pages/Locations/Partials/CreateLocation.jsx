// resources/js/Pages/Locations/Partials/CreateLocation.jsx
import { Dialog } from "@headlessui/react";
import { useForm, router } from "@inertiajs/react";
import React from "react";

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PERIODS = ["morning", "afternoon", "evening", "night"];
const DEFAULT_RANGE = {
    morning: { start: "06:00", end: "11:00" },
    afternoon: { start: "12:00", end: "16:00" },
    evening: { start: "17:00", end: "20:00" },
    night: { start: "20:00", end: "23:00" },
};

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export default function CreateLocation({ item = {}, onClose, saunas = [] }) {
    const isEdit = Boolean(item.id);

    // Build default day_times (only for selected days)
    const initialDayTimes = item.day_times
        ? item.day_times
        : (item.weekdays ?? []).reduce((acc, w) => {
              acc[w] = deepClone(DEFAULT_RANGE);
              return acc;
          }, {});

    const { data, setData, post, processing, errors, transform } = useForm({
        name: item.name ?? "",
        address: item.address ?? "",
        timezone: item.timezone ?? "Africa/Johannesburg",
        image: null,
        sauna_id: item.sauna_id ?? "",
        day_times: initialDayTimes, // <-- NEW
    });

    const hasDay = (w) => !!data.day_times?.[w];

    const toggleWeekday = (w) => {
        const cur = { ...(data.day_times || {}) };
        if (cur[w]) {
            delete cur[w];
        } else {
            cur[w] = deepClone(DEFAULT_RANGE);
        }
        setData("day_times", cur);
    };

    const togglePeriod = (w, p) => {
        const cur = { ...(data.day_times || {}) };
        const day = { ...(cur[w] || {}) };
        if (day[p]) {
            delete day[p];
        } else {
            day[p] = {
                ...(DEFAULT_RANGE[p] || { start: "08:00", end: "17:00" }),
            };
        }
        cur[w] = day;
        setData("day_times", cur);
    };

    const changeTime = (w, p, field, val) => {
        const cur = { ...(data.day_times || {}) };
        const day = { ...(cur[w] || {}) };
        const rng = { ...(day[p] || {}) };
        rng[field] = (val ?? "").slice(0, 5);
        day[p] = rng;
        cur[w] = day;
        setData("day_times", cur);
    };

    const submit = (e) => {
        e.preventDefault();

        const fix = (t) => (t ?? "").slice(0, 5);

        transform((values) => {
            // prune empty days / periods & normalise times
            const dt = {};
            Object.entries(values.day_times || {}).forEach(([w, periods]) => {
                const cleaned = {};
                Object.entries(periods || {}).forEach(([p, rng]) => {
                    if (rng?.start && rng?.end) {
                        cleaned[p] = {
                            start: fix(rng.start),
                            end: fix(rng.end),
                        };
                    }
                });
                if (Object.keys(cleaned).length) dt[w] = cleaned;
            });

            const out = {
                name: values.name,
                address: values.address,
                timezone: values.timezone,
                sauna_id: values.sauna_id ? Number(values.sauna_id) : "",
                day_times: dt,
                ...(isEdit ? { _method: "PUT" } : {}),
            };

            if (values.image instanceof File) out.image = values.image;

            return out;
        });

        const url = isEdit
            ? route("locations.update", item.id)
            : route("locations.store");
        post(url, {
            onSuccess: onClose,
            forceFormData: true,
            headers: isEdit ? { "X-HTTP-Method-Override": "PUT" } : {},
        });
    };

    return (
        <Dialog open onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
                    <Dialog.Panel className="w-screen h-[100dvh] sm:w-full sm:h-auto sm:max-w-md sm:max-h-[85dvh] bg-white shadow-lg rounded-none sm:rounded-xl overflow-y-auto">
                        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b">
                            <div className="px-4 py-3 sm:px-6">
                                <Dialog.Title className="text-lg font-semibold">
                                    {isEdit ? "Edit Location" : "New Location"}
                                </Dialog.Title>
                            </div>
                        </div>

                        <form
                            onSubmit={submit}
                            encType="multipart/form-data"
                            className="px-4 py-4 sm:px-6 sm:py-6 space-y-3"
                        >
                            {/* name/address/tz */}
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

                            {/* sauna */}
                            <label className="block mb-2 font-medium">
                                Sauna
                            </label>
                            <select
                                value={data.sauna_id}
                                onChange={(e) =>
                                    setData("sauna_id", e.target.value)
                                }
                                className="w-full border p-2 rounded mb-2"
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

                            {/* weekdays + per-day periods/times */}
                            <label className="block mb-2 font-medium">
                                Availability by day
                            </label>

                            <div className="space-y-3">
                                {DAY_SHORT.map((label, w) => {
                                    const on = hasDay(w);
                                    return (
                                        <div
                                            key={w}
                                            className="border rounded p-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={on}
                                                        onChange={() =>
                                                            toggleWeekday(w)
                                                        }
                                                    />
                                                    <span className="font-medium">
                                                        {label}
                                                    </span>
                                                </label>
                                                {/* quick copy: copy previous day's config */}
                                                {on && w > 0 && (
                                                    <button
                                                        type="button"
                                                        className="text-xs underline"
                                                        onClick={() => {
                                                            if (!hasDay(w - 1))
                                                                return;
                                                            const prev =
                                                                data.day_times[
                                                                    w - 1
                                                                ];
                                                            setData(
                                                                "day_times",
                                                                {
                                                                    ...data.day_times,
                                                                    [w]: deepClone(
                                                                        prev
                                                                    ),
                                                                }
                                                            );
                                                        }}
                                                    >
                                                        Copy from{" "}
                                                        {DAY_SHORT[w - 1]}
                                                    </button>
                                                )}
                                            </div>

                                            {on && (
                                                <div className="mt-2 space-y-2">
                                                    {PERIODS.map((p) => {
                                                        const enabled =
                                                            !!data.day_times?.[
                                                                w
                                                            ]?.[p];
                                                        const rng =
                                                            data.day_times?.[
                                                                w
                                                            ]?.[p] || {};
                                                        return (
                                                            <div
                                                                key={p}
                                                                className="flex items-center gap-3"
                                                            >
                                                                <label className="flex items-center gap-2 w-32">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            enabled
                                                                        }
                                                                        onChange={() =>
                                                                            togglePeriod(
                                                                                w,
                                                                                p
                                                                            )
                                                                        }
                                                                    />
                                                                    <span className="capitalize">
                                                                        {p}
                                                                    </span>
                                                                </label>
                                                                {enabled && (
                                                                    <>
                                                                        <input
                                                                            type="time"
                                                                            value={
                                                                                rng.start ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                changeTime(
                                                                                    w,
                                                                                    p,
                                                                                    "start",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            className="border p-1 rounded"
                                                                        />
                                                                        <span>
                                                                            –
                                                                        </span>
                                                                        <input
                                                                            type="time"
                                                                            value={
                                                                                rng.end ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                changeTime(
                                                                                    w,
                                                                                    p,
                                                                                    "end",
                                                                                    e
                                                                                        .target
                                                                                        .value
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
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* field-level errors */}
                            {Object.keys(errors)
                                .filter((k) => k.startsWith("day_times"))
                                .map((k) => (
                                    <p key={k} className="text-red-600 text-sm">
                                        {errors[k]}
                                    </p>
                                ))}

                            {/* image */}
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

                            {/* actions */}
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
