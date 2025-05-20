import React from "react";
import { useForm } from "@inertiajs/react";
import { TrashIcon } from "@heroicons/react/20/solid";

export default function DeleteOrganizationButton({ organization }) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to delete this organization?")) {
            destroy(route("admin.organizations.destroy", organization.id), {
                onSuccess: () =>
                    console.log("Organization deleted successfully"),
                onError: (errors) => console.log(errors),
            });
        }
    };

    return (
        <form onSubmit={handleDelete}>
            <button
                className="w-full relative  inline-flex   flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                type="submit"
                disabled={processing}
            >
                <TrashIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-gray-400"
                />
                Delete Organization
            </button>
        </form>
    );
}
