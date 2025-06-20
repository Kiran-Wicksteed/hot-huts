import { Dialog } from "@headlessui/react";
import { useForm } from "@inertiajs/react";

export default function CreateService({ item, onClose }) {
    const isEdit = Boolean(item.id);
    console.log("onclose", onClose);
    const { data, setData, post, put, processing, errors } = useForm({
        code: item.code || "",
        name: item.name || "",
        category: item.category || "",
        price: item.price || "",
        active: item.active || false,
    });

    const submit = (e) => {
        e.preventDefault();

        const opts = { onSuccess: onClose };

        isEdit
            ? put(route("services.update", item.id), opts)
            : post(route("services.store"), opts);
    };

    return (
        <Dialog
            open
            onClose={onClose}
            className="fixed inset-0 flex items-center justify-center"
        >
            <Dialog.Panel className="bg-white p-6 rounded shadow w-full max-w-md">
                <Dialog.Title className="text-lg font-semibold mb-4">
                    {isEdit ? "Edit Service" : "New Service"}
                </Dialog.Title>

                <form onSubmit={submit} className="space-y-3">
                    <input
                        value={data.code}
                        onChange={(e) => setData("code", e.target.value)}
                        placeholder="Code"
                        className="w-full border p-2 rounded"
                    />
                    {errors.code && (
                        <p className="text-red-600 text-sm">{errors.code}</p>
                    )}
                    <input
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Name"
                        className="w-full border p-2 rounded"
                    />
                    {errors.name && (
                        <p className="text-red-600 text-sm">{errors.name}</p>
                    )}

                    <select
                        value={data.category}
                        onChange={(e) => setData("category", e.target.value)}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">Select Category</option>
                        <option value="session">Session</option>
                        <option value="addon">Addon</option>
                    </select>
                    {errors.category && (
                        <p className="text-red-600 text-sm">
                            {errors.category}
                        </p>
                    )}

                    <input
                        type="number"
                        value={data.price}
                        onChange={(e) => setData("price", e.target.value)}
                        placeholder="Price"
                        className="w-full border p-2 rounded"
                    />
                    {errors.price && (
                        <p className="text-red-600 text-sm">{errors.price}</p>
                    )}

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={data.active}
                            onChange={(e) =>
                                setData("active", e.target.checked)
                            }
                            className="mr-2"
                        />
                        <label>Active</label>
                    </div>
                    {errors.active && (
                        <p className="text-red-600 text-sm">{errors.active}</p>
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
