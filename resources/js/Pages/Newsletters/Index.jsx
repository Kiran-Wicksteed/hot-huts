import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React from "react";
import { useState } from "react";
import CreateNewsletter from "./Partials/CreateNewsletter";
// import EditPolicy from "./Partials/EditPolicy";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { Link, usePage, Head } from "@inertiajs/react";
dayjs.extend(relativeTime);

export default function Index({ organization, newsletters }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const asset = (path) => {
        return `/storage/${path}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Newsletters" />
            <div className=" ">
                <div className="mx-auto ml-[10%] sm:px-6 lg:px-8">
                    <div className="flex gap-10">
                        <h1>Newsletters</h1>
                        <CreateNewsletter organization={organization} />
                    </div>
                    <div className="mt-10 space-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16">
                        {newsletters &&
                            newsletters.map((newsletter) => (
                                <article
                                    key={newsletter.id}
                                    className="flex  border-gray-300 border  flex-col items-start justify-between bg-white p-4"
                                >
                                    <div className="flex justify-between w-full">
                                        <div className="flex items-center gap-x-4 text-xs">
                                            <small className="  text-d-accent-blue-medium">
                                                {new Date(
                                                    newsletter.created_at
                                                ).toLocaleString()}
                                            </small>
                                        </div>
                                        {user.is_admin === 1 && (
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
                                                                "newsletters.destroy",
                                                                newsletter.id
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
                                                    <MenuItem>
                                                        <Link
                                                            href={route(
                                                                "newsletters.destroy",
                                                                newsletter.id
                                                            )}
                                                            as="button"
                                                            method="delete"
                                                            className=" "
                                                        >
                                                            <span className="block px-3 py-1 text-sm/6 text-gray-900 data-[focus]:bg-gray-50 data-[focus]:outline-none">
                                                                Send email
                                                            </span>
                                                        </Link>
                                                    </MenuItem>
                                                </MenuItems>
                                            </Menu>
                                        )}
                                    </div>
                                    <div className="group relative">
                                        <a
                                            href={route("newsletters.show", {
                                                newsletter: newsletter.id,
                                            })}
                                        >
                                            <h2 className="   text-gray-900 group-hover:text-gray-600">
                                                {newsletter.title}
                                            </h2>
                                        </a>
                                        <p className="mt-5 line-clamp-3 font-medium text-gray-600">
                                            {newsletter.description}
                                        </p>
                                        <a
                                            href={route("newsletters.show", {
                                                newsletter: newsletter.id,
                                            })}
                                        >
                                            <div className="fixed-height-container fade-to-white">
                                                <p className="mt-5 line-clamp-3  text-gray-600 max-w-4xl">
                                                    <div
                                                        className="mt-4"
                                                        dangerouslySetInnerHTML={{
                                                            __html: newsletter.content,
                                                        }}
                                                    />
                                                </p>
                                            </div>
                                        </a>
                                    </div>
                                    <div className="relative mt-8 flex items-center gap-x-4">
                                        {newsletter.user.photo != null ? (
                                            <div className="mx-auto h-10 w-10 overflow-hidden shrink-0 rounded-full">
                                                <img
                                                    alt=""
                                                    src={asset(
                                                        newsletter.user.photo
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

                                        <div className="">
                                            <p className="font-semibold text-gray-900">
                                                <span className="absolute inset-0" />
                                                {newsletter.user.name}
                                            </p>
                                            <small className="text-gray-600">
                                                {newsletter.user.title}
                                            </small>
                                        </div>
                                    </div>
                                </article>
                            ))}
                    </div>
                    {!newsletters.length && <p>No newsletters to display</p>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
