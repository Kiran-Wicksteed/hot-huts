import { Dialog } from "@headlessui/react";
import { useForm } from "@inertiajs/react";

export default function CreateSauna({ item, onClose }) {
    const isEdit = Boolean(item.id);
    console.log("onclose", onClose);
    const { data, setData, post, put, processing, errors } = useForm({
        name: item.name || "",
        description: item.description || "",
        capacity: item.capacity || 1,
    });

    const submit = (e) => {
        e.preventDefault();

        const opts = { onSuccess: onClose };

        isEdit
            ? put(route("saunas.update", item.id), opts)
            : post(route("saunas.store"), opts);
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
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Description"
                        className="w-full border p-2 rounded"
                    />
                    {errors.description && (
                        <p className="text-red-600 text-sm">
                            {errors.description}
                        </p>
                    )}

                    <input
                        type="number"
                        value={data.capacity}
                        onChange={(e) => setData("capacity", e.target.value)}
                        placeholder="Capacity"
                        className="w-full border p-2 rounded"
                    />
                    {errors.capacity && (
                        <p className="text-red-600 text-sm">
                            {errors.capacity}
                        </p>
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
