import { Dialog } from "@headlessui/react";
import { useForm } from "@inertiajs/react";

export default function CreateRetailItem({ item = {}, onClose }) {
    const isEdit = Boolean(item.id);
    const { data, setData, post, put, processing, errors } = useForm({
        code: item.code || "",
        name: item.name || "",
        price: item.price ? Number(item.price).toFixed(2) : "",
        description: item.description || "",
        is_active: item.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        const payload = {
            ...data,
            price: Number(data.price || 0),
        };

        const options = {
            onSuccess: () => {
                onClose?.();
            },
            data: payload,
        };

        if (isEdit) {
            put(route("retail-items.update", item.id), options);
        } else {
            post(route("retail-items.store"), options);
        }
    };

    return (
        <Dialog
            open
            onClose={onClose}
            className="fixed inset-0 flex items-center justify-center"
        >
            <Dialog.Panel className="bg-white p-6 rounded shadow w-full max-w-md">
                <Dialog.Title className="text-lg font-semibold mb-4">
                    {isEdit ? "Edit Off-site Add-on" : "New Off-site Add-on"}
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

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.price}
                        onChange={(e) => setData("price", e.target.value)}
                        placeholder="Price (R)"
                        className="w-full border p-2 rounded"
                    />
                    {errors.price && (
                        <p className="text-red-600 text-sm">{errors.price}</p>
                    )}

                    <textarea
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full border p-2 rounded"
                        rows={3}
                    />
                    {errors.description && (
                        <p className="text-red-600 text-sm">{errors.description}</p>
                    )}

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={Boolean(data.is_active)}
                            onChange={(e) => setData("is_active", e.target.checked)}
                        />
                        <span>Active</span>
                    </label>

                    <div className="flex justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-hh-gray rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-hh-orange text-white rounded hover:bg-hh-orange/90 disabled:opacity-50"
                        >
                            {isEdit ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </Dialog.Panel>
        </Dialog>
    );
}
