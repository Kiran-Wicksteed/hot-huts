import { Dialog } from "@headlessui/react";
import { useForm } from "@inertiajs/react";
import React from "react";

export default function CreateLocation({ item, onClose, saunas }) {
    const isEdit = Boolean(item.id);

    /* Inertia form ---------------------- */
    const { data, setData, post, put, processing, errors } = useForm({
        name: item.name || "",
        address: item.address || "",
        timezone: item.timezone || "Africa/Johannesburg",
        image: null,
        sauna_id: item.sauna_id ?? "",
        weekdays: item.weekdays ?? [], // [] of numbers 0‑6
        periods: item.periods ?? [], // [] of strings
    });

    /* local UI state only (for custom times) */
    const [enabledPeriods, setEnabledPeriods] = React.useState(
        new Set(data.periods ?? [])
    );
    const [times, setTimes] = React.useState({
        morning: { start: "06:00", end: "11:00" },
        afternoon: { start: "12:00", end: "16:00" },
        evening: { start: "17:00", end: "20:00" },
        night: { start: "20:00", end: "23:00" },
    });

    /* sync helper so Inertia always has the plain string‑array it already expects */
    const syncPeriodsToForm = (nextSet) =>
        setData("periods", Array.from(nextSet));

    /* toggle weekday 0–6 ---------------------------------------------------- */
    const toggleWeekday = (i) => {
        const w = new Set(data.weekdays ?? []);
        w.has(i) ? w.delete(i) : w.add(i);
        setData("weekdays", [...w]);
    };

    /* period helpers -------------------------------------------------------- */
    const togglePeriod = (p) => {
        const nxt = new Set(enabledPeriods);
        nxt.has(p) ? nxt.delete(p) : nxt.add(p);
        setEnabledPeriods(nxt);
        syncPeriodsToForm(nxt);
    };

    const changeTime = (p, field, val) =>
        setTimes((prev) => ({ ...prev, [p]: { ...prev[p], [field]: val } }));

    /* submit ---------------------------------------------------------------- */
    const submit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: onClose };

        // 🟠  If you later want to send `times` to the backend, merge here:
        //     post(route(...), { ...data, custom_times: times }, opts)

        isEdit
            ? put(route("locations.update", item.id), opts)
            : post(route("locations.store"), opts);
    };

    /* UI -------------------------------------------------------------------- */
    return (
        <Dialog
            open
            onClose={onClose}
            className="fixed inset-0 flex items-center justify-center"
        >
            <Dialog.Panel className="bg-white p-6 rounded shadow w-full max-w-md space-y-3">
                <Dialog.Title className="text-lg font-semibold mb-2">
                    {isEdit ? "Edit Location" : "New Location"}
                </Dialog.Title>

                <form onSubmit={submit} className="space-y-3">
                    {/* name / address / tz ---------------------------------------- */}
                    <input
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Name"
                        className="w-full border p-2 rounded"
                    />
                    {errors.name && (
                        <p className="text-red-600 text-sm">{errors.name}</p>
                    )}

                    <textarea
                        value={data.address}
                        onChange={(e) => setData("address", e.target.value)}
                        placeholder="Address"
                        className="w-full border p-2 rounded"
                    />
                    {errors.address && (
                        <p className="text-red-600 text-sm">{errors.address}</p>
                    )}

                    <input
                        value={data.timezone}
                        onChange={(e) => setData("timezone", e.target.value)}
                        placeholder="Timezone"
                        className="w-full border p-2 rounded"
                    />
                    {errors.timezone && (
                        <p className="text-red-600 text-sm">
                            {errors.timezone}
                        </p>
                    )}

                    {/* sauna ------------------------------------------------------- */}
                    <label className="block mb-2 font-medium">Sauna</label>
                    <select
                        value={data.sauna_id ?? ""}
                        onChange={(e) => setData("sauna_id", e.target.value)}
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

                    {/* weekdays ---------------------------------------------------- */}
                    <label className="block mb-2 font-medium">Weekdays</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                            (d, i) => (
                                <label
                                    key={i}
                                    className="flex items-center gap-1"
                                >
                                    <input
                                        type="checkbox"
                                        checked={
                                            data.weekdays?.includes(i) ?? false
                                        }
                                        onChange={() => toggleWeekday(i)}
                                    />
                                    {d}
                                </label>
                            )
                        )}
                    </div>
                    {errors.weekdays && (
                        <p className="text-red-600 text-sm">
                            {errors.weekdays}
                        </p>
                    )}

                    {/* NEW periods UI --------------------------------------------- */}
                    <label className="block mb-2 font-medium">Periods</label>
                    <div className="space-y-3 mb-6">
                        {["morning", "afternoon", "evening", "night"].map(
                            (p) => {
                                const on = enabledPeriods.has(p);
                                const lab = p[0].toUpperCase() + p.slice(1);
                                const { start, end } = times[p];

                                return (
                                    <div
                                        key={p}
                                        className="flex items-center gap-3"
                                    >
                                        {/* enable/disable */}
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={on}
                                                onChange={() => togglePeriod(p)}
                                            />
                                            <span className="capitalize">
                                                {lab}
                                            </span>
                                        </label>

                                        {/* custom time pickers */}
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
                            }
                        )}
                    </div>
                    {errors.periods && (
                        <p className="text-red-600 text-sm">{errors.periods}</p>
                    )}

                    {/* image upload ----------------------------------------------- */}
                    <input
                        type="file"
                        onChange={(e) => setData("image", e.target.files[0])}
                        className="w-full border p-2 rounded"
                    />
                    {errors.image && (
                        <p className="text-red-600 text-sm">{errors.image}</p>
                    )}

                    <button
                        disabled={processing}
                        className="w-full py-2 bg-blue-600 text-white rounded"
                    >
                        {isEdit ? "Update" : "Create"}
                    </button>
                </form>
            </Dialog.Panel>
        </Dialog>
    );
}
