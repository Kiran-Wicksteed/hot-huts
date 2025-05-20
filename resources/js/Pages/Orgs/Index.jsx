import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

import {
    EnvelopeIcon,
    PhoneIcon,
    UserCircleIcon,
} from "@heroicons/react/20/solid";
import DeleteOrganizationButton from "./Partials/DeleteOrganization";
import CreateOrganization from "./Partials/CreateOrganization";

export default function Test({ organizations }) {
    const asset = (path) => {
        return `/storage/${path}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Organization Management" />

            <div className=" ">
                <div className="mx-auto ml-[10%] sm:px-6 lg:px-8">
                    <div className="flex gap-10">
                        <h1>Manage Organizations</h1>
                        <CreateOrganization />
                    </div>
                    <div className="my-10 ">
                        <ul
                            role="list"
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                        >
                            {organizations.map((organization) => (
                                <li
                                    key={organization.orgName}
                                    className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg glass text-center shadow"
                                >
                                    <div className="flex flex-1 items-center justify-between flex-col p-8">
                                        <div className="flex items-center justify-center  h-full">
                                            {organization.photo != null ? (
                                                <div className="mx-auto h-auto w-full overflow-hidden shrink-0 flex items-center justify-center  ">
                                                    <img
                                                        alt=""
                                                        src={asset(
                                                            organization.photo
                                                        )}
                                                        className="object-cover top-0 left-0 w-full h-full "
                                                    />
                                                </div>
                                            ) : (
                                                <UserCircleIcon
                                                    aria-hidden="true"
                                                    className="h-32 w-32 text-gray-300"
                                                />
                                            )}
                                        </div>
                                        <h3 className="mt-6 text-sm font-medium text-gray-900">
                                            {organization.orgName}
                                        </h3>
                                    </div>
                                    <div>
                                        <div className=" flex divide-x divide-gray-200">
                                            <div className=" w-full ">
                                                <DeleteOrganizationButton
                                                    organization={organization}
                                                />
                                            </div>
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
