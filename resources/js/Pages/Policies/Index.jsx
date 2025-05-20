import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React from "react";
import { useState } from "react";
import CreatePolicy from "./Partials/CreatePolicy";
import EditPolicy from "./Partials/EditPolicy";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { Link, Head } from "@inertiajs/react";

dayjs.extend(relativeTime);

export default function Index({ organization, policies }) {
    const [open, setOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);

    const openDialog = (policy) => {
        setSelectedPolicy(policy);
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
        setSelectedPolicy(null);
    };

    const asset = (path) => {
        return `/storage/${path}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Policies & Procedures" />
            <div className=" ">
                <div className="mx-auto ml-[15%] 2xl:ml-[10%] sm:px-6 lg:px-8">
                    <div className="flex gap-10">
                        <h1>
                            <span className="font-medium">
                                {organization.orgName}&apos;s{" "}
                            </span>
                            Policies & Procedures
                        </h1>
                        <CreatePolicy organization={organization} />
                    </div>
                    <ul className="mx-auto  grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {policies &&
                            policies.map((policy) => (
                                <article
                                    key={policy.id}
                                    className="flex max-w-xl flex-col items-start justify-between bg-white p-4"
                                >
                                    <div className="flex justify-between w-full">
                                        <div className="flex items-center gap-x-4 text-xs">
                                            <small className=" text-sm text-gray-600">
                                                {new Date(
                                                    policy.created_at
                                                ).toLocaleString()}
                                            </small>
                                        </div>
                                        <Menu
                                            as="div"
                                            className="relative flex-none"
                                        >
                                            <MenuButton className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                                                <span className="sr-only">
                                                    Open options
                                                </span>
                                                <EllipsisVerticalIcon
                                                    aria-hidden="true"
                                                    className="size-5"
                                                />
                                            </MenuButton>
                                            <MenuItems
                                                transition
                                                className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                                            >
                                                <MenuItem>
                                                    <button
                                                        onClick={() =>
                                                            openDialog(policy)
                                                        }
                                                        className="block px-3 py-1 text-sm/6 text-gray-900 data-[focus]:bg-gray-50 data-[focus]:outline-none"
                                                    >
                                                        Edit
                                                    </button>
                                                </MenuItem>
                                                <MenuItem>
                                                    <Link
                                                        href={route(
                                                            "policies.destroy",
                                                            policy.id
                                                        )}
                                                        as="button"
                                                        method="delete"
                                                        className=" "
                                                    >
                                                        <span className="block px-3 py-1 text-sm/6 text-gray-900 data-[focus]:bg-gray-50 data-[focus]:outline-none">
                                                            Delete
                                                        </span>
                                                    </Link>
                                                </MenuItem>
                                            </MenuItems>
                                        </Menu>
                                    </div>
                                    <div className="group relative">
                                        <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
                                            <a
                                                href={route(
                                                    "organizations.policies.show",
                                                    {
                                                        organization:
                                                            organization.id,
                                                        policy: policy.id,
                                                    }
                                                )}
                                            >
                                                <span className="absolute inset-0" />
                                                {policy.title}
                                            </a>
                                        </h3>
                                        <p className="mt-5 line-clamp-3 text-sm/6 text-gray-600">
                                            {policy.description}
                                        </p>
                                        <a
                                            href={route(
                                                "organizations.policies.show",
                                                {
                                                    organization:
                                                        organization.id,
                                                    policy: policy.id,
                                                }
                                            )}
                                        >
                                            <div className="fixed-height-container fade-to-white">
                                                <p className="mt-5 line-clamp-3 text-sm/6 text-gray-600">
                                                    <div
                                                        className="mt-4"
                                                        dangerouslySetInnerHTML={{
                                                            __html: policy.content,
                                                        }}
                                                    />
                                                </p>
                                            </div>
                                        </a>
                                    </div>
                                    <div className="relative mt-8 flex items-center gap-x-4">
                                        {policy.user.photo != null ? (
                                            <div className="mx-auto h-10 w-10 overflow-hidden shrink-0 rounded-full">
                                                <img
                                                    alt=""
                                                    src={asset(
                                                        policy.user.photo
                                                    )}
                                                    className="object-cover top-0 left-0 w-full h-full"
                                                />
                                            </div>
                                        ) : (
                                            <UserCircleIcon
                                                aria-hidden="true"
                                                className="h-12 w-12 text-gray-300"
                                            />
                                        )}

                                        <div className="text-sm/6">
                                            <p className="font-semibold text-gray-900">
                                                <span className="absolute inset-0" />
                                                {policy.user.name}
                                            </p>
                                            <p className="text-gray-600">
                                                {policy.user.title}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                    </ul>
                    {!policies.length && (
                        <p>No policies to display for {organization.orgName}</p>
                    )}
                </div>
            </div>
            {selectedPolicy && (
                <EditPolicy
                    policy={selectedPolicy}
                    open={open}
                    setOpen={setOpen}
                    onClose={closeDialog}
                    organization={organization}
                />
            )}
        </AuthenticatedLayout>
    );
}
