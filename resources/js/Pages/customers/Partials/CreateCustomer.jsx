// resources/js/Pages/Customers/CreateCustomer.jsx
import { Dialog } from "@headlessui/react";
import { useForm } from "@inertiajs/react";
import React from "react";

export default function CreateCustomer({ onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        contact_number: "",
        password: "",
        password_confirmation: "",
        photo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("customers.store"), {
            onSuccess: () => {
                reset();
                onClose?.();
            },
            preserveScroll: true,
        });
    };

    return (
        <Dialog open onClose={onClose} className="relative z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

            {/* Scroll container */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
                    <Dialog.Panel className="w-screen h-[100dvh] sm:w-full sm:h-auto sm:max-w-md sm:max-h-[85dvh] bg-white shadow-lg rounded-none sm:rounded-xl overflow-y-auto">
                        {/* Sticky header */}
                        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b">
                            <div className="px-4 py-3 sm:px-6">
                                <Dialog.Title className="text-lg font-semibold">
                                    Add Customer
                                </Dialog.Title>
                            </div>
                        </div>

                        <form
                            onSubmit={submit}
                            encType="multipart/form-data"
                            className="px-4 py-4 sm:px-6 sm:py-6 space-y-3"
                        >
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Full name
                                </label>
                                <input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    placeholder="Jane Doe"
                                    className="w-full border p-2 rounded"
                                />
                                {errors.name && (
                                    <p className="text-red-600 text-sm">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    placeholder="jane@example.com"
                                    className="w-full border p-2 rounded"
                                />
                                {errors.email && (
                                    <p className="text-red-600 text-sm">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Contact number */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Contact number
                                </label>
                                <input
                                    value={data.contact_number}
                                    onChange={(e) =>
                                        setData(
                                            "contact_number",
                                            e.target.value
                                        )
                                    }
                                    placeholder="+27 82 123 4567"
                                    className="w-full border p-2 rounded"
                                />
                                {errors.contact_number && (
                                    <p className="text-red-600 text-sm">
                                        {errors.contact_number}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="w-full border p-2 rounded"
                                />
                                {errors.password && (
                                    <p className="text-red-600 text-sm">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Confirm password
                                </label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            {/* Photo (optional) */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Profile photo (optional)
                                </label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.gif"
                                    onChange={(e) =>
                                        setData(
                                            "photo",
                                            e.target.files?.[0] ?? null
                                        )
                                    }
                                    className="w-full border p-2 rounded"
                                />
                                {errors.photo && (
                                    <p className="text-red-600 text-sm">
                                        {errors.photo}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="sticky bottom-0 -mx-4 sm:-mx-6 border-t bg-white/95 backdrop-blur px-4 sm:px-6 pt-4 pb-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="py-2 px-4 bg-hh-orange text-white rounded disabled:bg-gray-400"
                                >
                                    {processing ? "Saving..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </Dialog.Panel>
                </div>
            </div>
        </Dialog>
    );
}
