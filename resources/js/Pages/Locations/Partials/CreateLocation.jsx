import { Dialog } from "@headlessui/react";
import { useForm } from "@inertiajs/react";

export default function CreateLocation({ item, onClose, saunas }) {
    const isEdit = Boolean(item.id);
    console.log("onclose", onClose);
    const { data, setData, post, put, processing, errors } = useForm({
        name: item.name || "",
        address: item.address || "",
        timezone: item.timezone || "Africa/Johannesburg",
        image: null,
        sauna_id: item.sauna_id ?? "",
        weekdays: item.weekdays ?? [],
        periods: item.periods ?? [],
    });

    const submit = (e) => {
        e.preventDefault();

        const opts = { onSuccess: onClose };

        isEdit
            ? put(route("locations.update", item.id), opts)
            : post(route("locations.store"), opts);
    };

    return (
        <Dialog
            open
            onClose={onClose}
            className="fixed inset-0 flex items-center justify-center"
        >
            <Dialog.Panel className="bg-white p-6 rounded shadow w-full max-w-md">
                <Dialog.Title className="text-lg font-semibold mb-4">
                    {isEdit ? "Edit Location" : "New Location"}
                </Dialog.Title>

                <form onSubmit={submit} className="space-y-3">
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
                                        onChange={() => {
                                            const w = new Set(
                                                data.weekdays ?? []
                                            );
                                            w.has(i) ? w.delete(i) : w.add(i);
                                            setData("weekdays", [...w]);
                                        }}
                                    />
                                    {d}
                                </label>
                            )
                        )}
                    </div>
                    {errors["weekdays"] && (
                        <p className="text-red-600 text-sm">
                            {errors.weekdays}
                        </p>
                    )}

                    <label className="block mb-2 font-medium">Periods</label>
                    <div className="flex gap-4 mb-6">
                        {["morning", "afternoon", "evening", "night"].map(
                            (p) => (
                                <label
                                    key={p}
                                    className="flex items-center gap-1"
                                >
                                    <input
                                        type="checkbox"
                                        checked={
                                            data.periods?.includes(p) ?? false
                                        }
                                        onChange={() => {
                                            const s = new Set(
                                                data.periods ?? []
                                            );
                                            s.has(p) ? s.delete(p) : s.add(p);
                                            setData("periods", [...s]);
                                        }}
                                    />
                                    {p}
                                </label>
                            )
                        )}
                    </div>
                    {errors["periods"] && (
                        <p className="text-red-600 text-sm">{errors.periods}</p>
                    )}
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
