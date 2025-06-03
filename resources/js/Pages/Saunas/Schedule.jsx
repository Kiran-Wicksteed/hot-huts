import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Dialog } from "@headlessui/react";
import SaunaWizard from "./Partials/SaunaWizard";

export default function Schedule({ sauna, locations, flash }) {
    console.log("saunas:", sauna);
    const [show, setShow] = useState(false);
    const [form, setForm] = useState({
        location_id: "",
        date: new Date(),
    });

    /* helpers */
    const add = () => {
        router.post(
            route("saunas.schedules.store", sauna.id),
            {
                location_id: form.location_id,
                date: form.date.toISOString().slice(0, 10),
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

    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px] space-y-6">
                <h1 className="text-2xl font-bold">{sauna.name} — Schedule</h1>
                <button
                    onClick={() => setShow(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    + Add day
                </button>
                <SaunaWizard sauna={sauna} locations={locations} />
                {/* simple table – replace with calendar later if you wish */}
                <table className="w-full text-left mt-4">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Location</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sauna.schedules.map((s) => (
                            <tr key={s.id} className="border-b">
                                <td>{s.date}</td>
                                <td>{s.location.name}</td>
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

                            <button
                                onClick={add}
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
