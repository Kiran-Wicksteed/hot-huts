import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React from "react";
import CreateFamilyResource from "./Partials/CreateFamilyResource";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "@inertiajs/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { Head } from "@inertiajs/react";

dayjs.extend(relativeTime);

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Index({ resources }) {
    const asset = (path) => {
        return `/storage/${path}`;
    };

    console.log(resources);
    return (
        <AuthenticatedLayout>
            <Head title="Family Documents" />
            <div className=" ">
                <div className="mx-auto ml-[15%] 2xl:ml-[10%] sm:px-6 lg:px-8">
                    <div className="flex gap-10">
                        <h1>
                            <span className="font-medium">Family: </span>
                            Secure Document Storage
                        </h1>
                        <CreateFamilyResource />
                    </div>
                    <ul role="list" className="divide-y divide-gray-100 mt-12">
                        {resources &&
                            resources.map((resource) => (
                                <li
                                    key={resource.id}
                                    className="flex items-center justify-between gap-x-6 py-5 "
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-col items-start gap-x-3">
                                            <h5 className="font-medium text-gray-900">
                                                {resource.title}
                                            </h5>
                                            <small className="  text-gray-900">
                                                {resource.description}
                                            </small>
                                        </div>
                                        <div className="mt-1 flex items-center gap-x-2 text-sm/6 text-gray-500">
                                            <p className="whitespace-nowrap">
                                                <small className=" t text-gray-600">
                                                    {dayjs(
                                                        resource.created_at
                                                    ).fromNow()}
                                                </small>
                                            </p>
                                            <svg
                                                viewBox="0 0 2 2"
                                                className="size-0.5 fill-current"
                                            >
                                                <circle r={1} cx={1} cy={1} />
                                            </svg>
                                            <small className="truncate">
                                                Published by{" "}
                                                {resource.user.name}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="flex flex-none items-center gap-x-4 ">
                                        <a
                                            href={asset(resource.file)}
                                            download
                                            className=" flex rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 "
                                        >
                                            Download Document
                                            <span className="sr-only">
                                                , {resource.title}
                                            </span>
                                            <ArrowDownTrayIcon className="w-4 h-4 ml-2" />{" "}
                                        </a>
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
                                                    <Link
                                                        href={route(
                                                            "resources.destroy",
                                                            resource.id
                                                        )}
                                                        as="button"
                                                        method="delete"
                                                        className=" "
                                                    >
                                                        <span className="text-sm/3 p-1">
                                                            Delete Document
                                                        </span>
                                                    </Link>
                                                </MenuItem>
                                            </MenuItems>
                                        </Menu>
                                    </div>
                                </li>
                            ))}
                        {!resources.length && (
                            <p>No family documents to display</p>
                        )}
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
