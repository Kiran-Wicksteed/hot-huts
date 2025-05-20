import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React from "react";
import {
    EnvelopeIcon,
    PhoneIcon,
    UserCircleIcon,
} from "@heroicons/react/20/solid";
import { Head } from "@inertiajs/react";

export default function Users({ organization, users }) {
    const asset = (path) => {
        return `/storage/${path}`;
    };
    return (
        <AuthenticatedLayout>
            <Head title="Team" />
            <div className="mx-auto ml-[10%] sm:px-6 lg:px-8">
                <ul
                    role="list"
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {users.map((user) => (
                        <li
                            key={user.email}
                            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
                        >
                            <div className="flex w-full items-center justify-between space-x-6 p-6">
                                <div className="flex-1 truncate">
                                    <div className="flex items-center space-x-3">
                                        <h6 className="truncate  font-medium text-gray-900">
                                            {user.name}
                                        </h6>
                                        <span className="inline-flex shrink-0 items-center rounded-full bg-purple-50-50 px-1.5 py-0.5 text-xs font-medium  text-white ring-1 ring-inset ring-d-blue-medium bg-d-blue-light">
                                            {user.is_editor ? "Editor" : "User"}
                                        </span>
                                    </div>
                                    <small className=" truncate  text-gray-500">
                                        {user.title}
                                    </small>
                                    <br />
                                    <br />
                                    <small className=" truncate  text-gray-800 mt-4">
                                        {user.email}
                                    </small>
                                    <br />
                                    <small className="mt-1 truncate  text-gray-800">
                                        {user.contact_number}
                                    </small>
                                </div>
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
                            </div>
                            <div>
                                <div className="-mt-px flex divide-x divide-gray-200">
                                    <div className="flex w-0 flex-1">
                                        <a
                                            href={`mailto:${user.email}`}
                                            className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                                        >
                                            <EnvelopeIcon
                                                aria-hidden="true"
                                                className="size-5 text-gray-400"
                                            />
                                            Email
                                        </a>
                                    </div>
                                    <div className="-ml-px flex w-0 flex-1">
                                        <a
                                            href={`tel:${user.contact_number}`}
                                            className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                                        >
                                            <PhoneIcon
                                                aria-hidden="true"
                                                className="size-5 text-gray-400"
                                            />
                                            Call
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </AuthenticatedLayout>
    );
}
