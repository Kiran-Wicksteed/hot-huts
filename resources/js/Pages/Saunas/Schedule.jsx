import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Dialog } from "@headlessui/react";
import SaunaWizard from "./Partials/SaunaWizard";
import { Link } from "@inertiajs/react";

export default function Schedule({ sauna, locations }) {
    console.log("saunas:", sauna);
    const [show, setShow] = useState(false);
    const [periods, setPeriods] = useState([]);
    const [form, setForm] = useState({
        location_id: "",
        date: new Date(),
    });

    const toggle = (p) =>
        setPeriods(
            periods.includes(p)
                ? periods.filter((x) => x !== p)
                : [...periods, p]
        );

    /* helpers */
    const add = () => {
        router.post(
            route("saunas.schedules.store", sauna.id),
            {
                location_id: form.location_id,
                date: form.date.toISOString().slice(0, 10),
                periods: periods,
            },
            { onSuccess: () => setShow(false), preserveScroll: true }
        );
    };

    const remove = (id) => {
        if (confirm("Remove this day?")) {
            router.delete(route("saunas.schedules.destroy", [sauna.id, id]), {
                preserveScroll: true,
            });
        }
    };

    const generate = () => {
        if (!confirm("Generate the next 60 days of slots?")) return;
        router.post(route("saunas.schedules.generate", sauna.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px] ">
                <h1 className="text-2xl font-bold">{sauna.name} — Schedule</h1>
                <button
                    onClick={() => setShow(true)}
                    className="px-4 py-2 bg-hh-orange mr-4 text-white rounded"
                >
                    + Add day
                </button>
                <button
                    onClick={generate}
                    className="px-4 py-2 bg-hh-orange mr-4 text-white rounded"
                >
                    + Generate next 60 days
                </button>
                {/* <SaunaWizard sauna={sauna} locations={locations} /> */}
                {/* simple table – replace with calendar later if you wish */}
                <table className="w-full text-left mt-4">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody className="space-y-4">
                        {sauna.schedules.map((s) => (
                            <tr key={s.id} className="border-b ">
                                <td>
                                    {" "}
                                    {new Date(s.date).toLocaleDateString(
                                        "en-GB",
                                        {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        }
                                    )}
                                </td>
                                <td>
                                    {s.location.name}
                                    &nbsp;
                                    <span className="text-sm text-gray-500">
                                        {s.period}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <Link
                                        href={route("saunas.schedules.slots", [
                                            sauna.id,
                                            s.id,
                                        ])}
                                        className="hover:underline"
                                    >
                                        View slots
                                    </Link>
                                </td>
                                <td className="text-right">
                                    <button
                                        onClick={() => remove(s.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Add-day modal */}
                {show && (
                    <Dialog
                        open
                        onClose={() => setShow(false)}
                        className="fixed inset-0 flex items-center justify-center p-4"
                    >
                        <Dialog.Panel className="bg-white p-6 rounded shadow w-full max-w-sm space-y-4">
                            <Dialog.Title className="text-lg font-semibold">
                                Add a schedule day
                            </Dialog.Title>

                            <select
                                value={form.location_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        location_id: e.target.value,
                                    })
                                }
                                className="w-full border p-2 rounded"
                            >
                                <option value="">Choose location…</option>
                                {locations.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.name}
                                    </option>
                                ))}
                            </select>

                            <DatePicker
                                selected={form.date}
                                onChange={(date) => setForm({ ...form, date })}
                                className="w-full border p-2 rounded"
                                dateFormat="yyyy-MM-dd"
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
                                onClick={add}
                                disabled={
                                    !form.location_id || periods.length === 0
                                }
                                className="w-full py-2 bg-blue-600 text-white rounded"
                            >
                                Save
                            </button>
                        </Dialog.Panel>
                    </Dialog>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
