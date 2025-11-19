import { Dialog } from "@headlessui/react";
import { useForm } from "@inertiajs/react";

export default function CreateMembershipService({ item, onClose }) {
    const isEdit = Boolean(item.id);
    const { data, setData, post, put, processing, errors } = useForm({
        code: item.code || "",
        name: item.name || "",
        description: item.description || "",
        price: item.price ?? "",
        is_active: item.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();

        const opts = { onSuccess: onClose };

        if (isEdit) {
            put(route("membership-services.update", item.id), opts);
        } else {
            post(route("membership-services.store"), opts);
        }
    };

    return (
        <Dialog open onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Dialog.Panel className="bg-white p-6 rounded shadow w-full max-w-lg">
                <Dialog.Title className="text-lg font-semibold mb-4">
                    {isEdit ? "Edit membership service" : "New membership service"}
                </Dialog.Title>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                        <input
                            value={data.code}
                            onChange={(e) => setData("code", e.target.value)}
                            placeholder="E.g. MEMBER_MONTHLY"
                            className="w-full border p-2 rounded"
                        />
                        {errors.code && <p className="text-red-600 text-sm mt-1">{errors.code}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Monthly membership"
                            className="w-full border p-2 rounded"
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="What does this membership include?"
                            rows={3}
                            className="w-full border p-2 rounded"
                        />
                        {errors.description && (
                            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (R)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.price}
                            onChange={(e) => setData("price", e.target.value)}
                            placeholder="799"
                            className="w-full border p-2 rounded"
                        />
                        {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={Boolean(data.is_active)}
                            onChange={(e) => setData("is_active", e.target.checked)}
                            className="mr-2"
                        />
                        <label className="text-sm">Active</label>
                    </div>
                    {errors.is_active && <p className="text-red-600 text-sm">{errors.is_active}</p>}

                    <button
                        disabled={processing}
                        className="w-full py-2 bg-hh-orange text-white rounded disabled:opacity-60"
                    >
                        {isEdit ? "Update" : "Create"}
                    </button>
                </form>
            </Dialog.Panel>
        </Dialog>
    );
}
