import React from "react";
import { useEffect } from "react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import {
    ExclamationTriangleIcon,
    BuildingLibraryIcon,
    KeyIcon,
} from "@heroicons/react/24/outline";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, useForm } from "@inertiajs/react";

const ChangePermissions = ({
    handleClosePermissionsDialog,
    user,
    openPermissionsDialog,
    setopenPermissionsDialog,
}) => {
    const { data, setData, patch, processing, errors, reset } = useForm({
        is_editor: user.is_editor,
        is_admin: user.is_admin,
        is_family: user.is_family,
    });

    const handlePermissionsChange = (e) => {
        const value = e.target.value;

        if (value === "user") {
            setData((prevData) => ({
                ...prevData,
                is_admin: 0,
                is_editor: 0,
            }));
        } else if (value === "admin") {
            setData((prevData) => ({
                ...prevData,
                is_admin: 1,
                is_editor: 1,
            }));
        } else if (value === "editor") {
            setData((prevData) => ({
                ...prevData,
                is_admin: 0,
                is_editor: 1,
            }));
        }
    };

    const handleFamilyChange = (e) => {
        setData((prevData) => ({
            ...prevData,
            is_family: e.target.checked ? 1 : 0,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route("admin.change-permissions.update", { user: user.id }), {
            onSuccess: () => {
                handleClosePermissionsDialog();
            },
            onError: (errors) => {
                console.error(errors); // Log errors to the console
                // Optionally, you can set error messages in the state to display them in the UI
            },
        });
    };

    const getCurrentPermissionLevel = () => {
        if (data.is_admin) return "admin";
        if (data.is_editor) return "editor";
        return "user";
    };
    return (
        <Dialog
            open={user.id === openPermissionsDialog}
            onClose={handleClosePermissionsDialog}
            className="relative z-20"
        >
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-100/95 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10  w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                        >
                            <div className="sm:flex sm:items-start gap-5">
                                <div className="mx-auto mr-20 flex size-12 shrink-0 items-center justify-center rounded-full bg-d-accent-green sm:mx-0 sm:size-10">
                                    <KeyIcon
                                        aria-hidden="true"
                                        className="size-6 text-d-blue-dark"
                                    />
                                </div>
                                <div className="">
                                    <h3 className="mb-6">
                                        Edit permissions for {user.name}
                                    </h3>
                                    <InputLabel
                                        htmlFor="permissions"
                                        value="User access level"
                                    />
                                    <select
                                        id="permissions"
                                        name="permissions"
                                        value={getCurrentPermissionLevel()}
                                        className="mt-1 block w-full"
                                        onChange={handlePermissionsChange}
                                        required
                                    >
                                        <option value="">
                                            Select user permissions
                                        </option>
                                        <option value="user">
                                            User (Can view content but cannot
                                            make any changes. Limited to
                                            read-only access.)
                                        </option>
                                        <option value="admin">
                                            Admin (Has full access, including
                                            viewing, editing, and managing
                                            users, roles, and system settings.)
                                        </option>
                                        <option value="editor">
                                            Editor (Can view and edit content,
                                            but cannot manage users or system
                                            settings.)
                                        </option>
                                    </select>
                                    <InputLabel
                                        htmlFor="is_family"
                                        value="Family"
                                        className="mt-4"
                                    />
                                    <div className="flex">
                                        <input
                                            id="is_family"
                                            type="checkbox"
                                            name="is_family"
                                            checked={data.is_family === 1}
                                            onChange={handleFamilyChange}
                                            className="mt-1 block mr-2"
                                        />
                                        <span>
                                            Grant access to the family area
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <PrimaryButton
                                    className="ms-4"
                                    disabled={processing}
                                >
                                    Update permissions
                                </PrimaryButton>
                                <button
                                    type="button"
                                    data-autofocus
                                    onClick={handleClosePermissionsDialog}
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default ChangePermissions;
