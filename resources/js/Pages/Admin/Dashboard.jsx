import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/20/solid";
import DeleteUserForm from "../Admin/Partials/DeleteUserForm";
import ApproveUserForm from "../Admin/Partials/ApproveUserForm";
import ChangePermissions from "./Partials/ChangePermissions";
import { useState, useEffect } from "react";
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

export default function UserList({ users, organizations }) {
    const [openPermissionsDialog, setopenPermissionsDialog] = useState(null);
    const [openDialogId, setOpenDialogId] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        organization_id: "",
    });

    const handleOpenPermissionsDialog = (userId) => {
        setopenPermissionsDialog(userId);
    };

    const handleClosePermissionsDialog = () => {
        setopenPermissionsDialog(null);
    };

    const handleOpenDialog = (userId) => {
        setOpenDialogId(userId);
    };

    const handleCloseDialog = () => {
        setOpenDialogId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.change-organization.update", { user: openDialogId }));
        setOpenDialogId(null);
    };

    const FindOrgName = (orgId) => {
        const org = organizations.find((org) => org.id === orgId);
        return org ? org.orgName : "Unknown Organization";
    };

    const asset = (path) => {
        return `/storage/${path}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="User Management" />

            <div className="">
                <div className="mx-auto ml-[15%] 2xl:ml-[10%] sm:px-6 lg:px-8">
                    <div className="flex gap-10">
                        <h1>Manage Users</h1>
                        {/* <CreateChat organization={organization} /> */}
                    </div>
                    <div className="mt-10 ">
                        <ul
                            role="list"
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4"
                        >
                            {users.map((user) => (
                                <li
                                    key={user.email}
                                    className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg glass text-center shadow"
                                >
                                    <div className="flex flex-1 items-center flex-col p-8">
                                        {user.photo != null ? (
                                            <div className="mx-auto h-32 w-32 overflow-hidden shrink-0 rounded-full">
                                                <img
                                                    alt=""
                                                    src={asset(user.photo)}
                                                    className="object-cover top-0 left-0 w-full h-full"
                                                />
                                            </div>
                                        ) : (
                                            <UserCircleIcon
                                                aria-hidden="true"
                                                className="h-32 w-32 text-gray-300"
                                            />
                                        )}

                                        <h3 className="mt-6 text-base font-medium text-gray-900">
                                            {user.name}
                                        </h3>
                                        <p className="text-xs mb-4">
                                            {user.email}
                                        </p>
                                        <dl className="flex grow flex-col justify-between">
                                            <dd>
                                                <p className="text-sm font-light text-d-blue-dark">
                                                    {user.is_approved
                                                        ? "Approved user"
                                                        : "Awaiting approval"}
                                                </p>
                                            </dd>

                                            <dd className="mt-4">
                                                <span className="inline-flex items-center rounded-full bg-d-accent-green px-2 py-1 text-xs font-medium text-d-blue-dark border-d-blue-dark border ring-1 ring-inset ring-green-600/20">
                                                    {user.organization_id !=
                                                    null
                                                        ? FindOrgName(
                                                              user.organization_id
                                                          )
                                                        : "No Organization"}
                                                </span>
                                            </dd>
                                        </dl>
                                        <div>
                                            <button
                                                onClick={() =>
                                                    handleOpenDialog(user.id)
                                                }
                                                className="text-sm font-light underline"
                                            >
                                                Change organization
                                            </button>
                                            <Dialog
                                                open={user.id === openDialogId}
                                                onClose={handleCloseDialog}
                                                className="relative z-10"
                                            >
                                                <DialogBackdrop
                                                    transition
                                                    className="fixed inset-0 bg-gray-100/95 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                                                />

                                                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                                        <DialogPanel
                                                            transition
                                                            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                                                        >
                                                            <form
                                                                onSubmit={
                                                                    handleSubmit
                                                                }
                                                                encType="multipart/form-data"
                                                            >
                                                                <div className="sm:flex sm:items-start gap-5">
                                                                    <div className="mx-auto mr-20 flex size-12 shrink-0 items-center justify-center rounded-full bg-d-accent-green sm:mx-0 sm:size-10">
                                                                        <BuildingLibraryIcon
                                                                            aria-hidden="true"
                                                                            className="size-6 text-d-blue-dark"
                                                                        />
                                                                    </div>
                                                                    <div className="">
                                                                        <h3 className="mb-6">
                                                                            Select
                                                                            a
                                                                            new
                                                                            organization
                                                                            for{" "}
                                                                            {
                                                                                user.name
                                                                            }
                                                                        </h3>
                                                                        <select
                                                                            id="organization_id"
                                                                            name="organization_id"
                                                                            value={
                                                                                data.organization_id
                                                                            }
                                                                            className="mt-1 block w-full"
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                setData(
                                                                                    "organization_id",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            required
                                                                        >
                                                                            <option value="">
                                                                                Select
                                                                                an
                                                                                organization
                                                                            </option>
                                                                            {organizations.map(
                                                                                (
                                                                                    organization
                                                                                ) => (
                                                                                    <option
                                                                                        key={
                                                                                            organization.id
                                                                                        }
                                                                                        value={
                                                                                            organization.id
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            organization.orgName
                                                                                        }
                                                                                    </option>
                                                                                )
                                                                            )}
                                                                        </select>
                                                                        <InputError
                                                                            message={
                                                                                errors.organization_id
                                                                            }
                                                                            className="mt-2"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                                    <PrimaryButton
                                                                        className="ms-4"
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                    >
                                                                        Save
                                                                    </PrimaryButton>
                                                                    <button
                                                                        type="button"
                                                                        data-autofocus
                                                                        onClick={
                                                                            handleCloseDialog
                                                                        }
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
                                        </div>
                                        <div>
                                            <p className="text-sm  mt-4 !mb-0">
                                                Permissions:{" "}
                                            </p>
                                            <div>
                                                <div className="flex justify-center gap-2 text-xs mt-1">
                                                    {user.is_admin === 1 && (
                                                        <div className="border rounded-full px-2 py-1">
                                                            admin
                                                        </div>
                                                    )}
                                                    {user.is_editor === 1 && (
                                                        <div className="border rounded-full px-2 py-1">
                                                            editor
                                                        </div>
                                                    )}
                                                    {user.is_family === 1 && (
                                                        <div className="border rounded-full px-2 py-1">
                                                            family
                                                        </div>
                                                    )}
                                                    {!user.is_admin &&
                                                        !user.is_editor &&
                                                        !user.is_family && (
                                                            <div className="border rounded-full px-2 py-1">
                                                                user
                                                            </div>
                                                        )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleOpenPermissionsDialog(
                                                        user.id
                                                    )
                                                }
                                                className="text-sm font-light underline"
                                            >
                                                Edit permissions
                                            </button>
                                            <ChangePermissions
                                                handleClosePermissionsDialog={
                                                    handleClosePermissionsDialog
                                                }
                                                setopenPermissionsDialog={
                                                    setopenPermissionsDialog
                                                }
                                                openPermissionsDialog={
                                                    openPermissionsDialog
                                                }
                                                user={user}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="-mt-px flex divide-x divide-gray-200">
                                            <div className="flex w-0 flex-1">
                                                <ApproveUserForm user={user} />
                                            </div>
                                            <DeleteUserForm user={user} />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
