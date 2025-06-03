import { Dialog } from "@headlessui/react";
import { useForm } from "@inertiajs/react";

export default function CreateLocation({ item, onClose }) {
    const isEdit = Boolean(item.id);
    console.log("onclose", onClose);
    const { data, setData, post, put, processing, errors } = useForm({
        name: item.name || "",
        address: item.address || "",
        timezone: item.timezone || "Africa/Johannesburg",
        image: null,
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
