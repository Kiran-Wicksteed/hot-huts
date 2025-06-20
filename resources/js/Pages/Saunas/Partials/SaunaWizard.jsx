import { Dialog } from "@headlessui/react";
import { router } from "@inertiajs/react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function WeekdayWizard({ sauna, locations }) {
    const [open, setOpen] = useState(false);
    const [locId, setLocId] = useState("");
    const [days, setDays] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [start, setStart] = useState(new Date());
    const weekdays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const toggleDay = (d) =>
        setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d]);

    const toggle = (p) =>
        setPeriods(
            periods.includes(p)
                ? periods.filter((x) => x !== p)
                : [...periods, p]
        );

    const save = () => {
        router.post(
            route("saunas.schedules.bulkWeekday", sauna.id),
            {
                location_id: locId,
                weekdays: days,
                start_date: start.toISOString().slice(0, 10),
                days_ahead: 30,
                periods: periods,
            },
            { onSuccess: () => setOpen(false), preserveScroll: true }
        );
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded"
            >
                Bulk weekday wizard
            </button>

            {open && (
                <Dialog
                    open
                    onClose={() => setOpen(false)}
                    className="fixed inset-0 flex items-center justify-center p-4"
                >
                    <Dialog.Panel className="bg-white p-6 rounded shadow max-w-md w-full space-y-4">
                        <Dialog.Title className="text-lg font-semibold">
                            Schedule {sauna.name} for the next 30 days
                        </Dialog.Title>

                        {/* Location select */}
                        <select
                            value={locId}
                            onChange={(e) => setLocId(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Choose location…</option>
                            {locations.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.name}
                                </option>
                            ))}
                        </select>

                        {/* Weekday tick-boxes */}
                        <div className="grid grid-cols-7 gap-2">
                            {weekdays.map((d, i) => (
                                <label
                                    key={d}
                                    className={`border rounded p-2 text-center cursor-pointer ${
                                        days.includes(d)
                                            ? "bg-blue-600 text-white"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        value={d}
                                        checked={days.includes(d)}
                                        onChange={() => toggleDay(d)}
                                        className="hidden"
                                    />
                                    {labels[i]}
                                </label>
                            ))}
                        </div>

                        {/* Start date picker (optional) */}

                        <label className="block text-sm font-medium mb-2">
                            Start date
                        </label>
                        <DatePicker
                            selected={start}
                            onChange={setStart}
                            dateFormat="yyyy-MM-dd"
                            className="w-full border p-2 rounded"
                        />

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={periods.includes("morning")}
                                onChange={() => toggle("morning")}
                            />
                            Morning (06:00-11:00)
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={periods.includes("evening")}
                                onChange={() => toggle("evening")}
                            />
                            Evening (17:00-20:00)
                        </label>

                        <button
                            disabled={!locId || days.length === 0}
                            onClick={save}
                            className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                        >
                            Generate schedules
                        </button>
                    </Dialog.Panel>
                </Dialog>
            )}
        </>
    );
}
