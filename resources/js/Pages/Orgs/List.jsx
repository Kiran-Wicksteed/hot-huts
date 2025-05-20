import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const people = [
    {
        name: "Leslie Alexander",
        email: "leslie.alexander@example.com",
        role: "Co-Founder / CEO",
        imageUrl:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        lastSeen: "3h ago",
        lastSeenDateTime: "2023-01-23T13:23Z",
    },
    {
        name: "Michael Foster",
        email: "michael.foster@example.com",
        role: "Co-Founder / CTO",
        imageUrl:
            "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        lastSeen: "3h ago",
        lastSeenDateTime: "2023-01-23T13:23Z",
    },
    {
        name: "Dries Vincent",
        email: "dries.vincent@example.com",
        role: "Business Relations",
        imageUrl:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        lastSeen: null,
    },
    {
        name: "Lindsay Walton",
        email: "lindsay.walton@example.com",
        role: "Front-end Developer",
        imageUrl:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        lastSeen: "3h ago",
        lastSeenDateTime: "2023-01-23T13:23Z",
    },
    {
        name: "Courtney Henry",
        email: "courtney.henry@example.com",
        role: "Designer",
        imageUrl:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        lastSeen: "3h ago",
        lastSeenDateTime: "2023-01-23T13:23Z",
    },
    {
        name: "Tom Cook",
        email: "tom.cook@example.com",
        role: "Director of Product",
        imageUrl:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        lastSeen: null,
    },
];

export default function Test({ organizations, users }) {
    const [open, setOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [orgName, setOrgName] = useState("");

    useEffect(() => {
        const org = organizations.find((org) => org.id === selectedOrg);
        if (org) {
            setOrgName(org.orgName);
        }
    }, [selectedOrg]);

    const countActiveUsers = (orgId) => {
        return users.filter(
            (user) => user.organization_id === orgId && user.is_approved
        ).length;
    };

    const getAbsoluteUrl = (url) => {
        if (!url) return "#";
        return url.startsWith("http://") || url.startsWith("https://")
            ? url
            : `http://${url}`;
    };

    const asset = (path) => {
        return `/storage/${path}`;
    };

    console.log(organizations[1]);

    return (
        <AuthenticatedLayout>
            <Head title="Organizations" />

            <div className=" mb-10">
                <Modal
                    show={open}
                    onClose={() => setOpen(false)}
                    maxWidth="6xl"
                >
                    <h2 className="px-10 pt-10">The {orgName} team</h2>
                    <ul
                        role="list"
                        className="divide-y divide-gray-100 px-10 pb-5 pt-5 max-h-[70vh] overflow-y-auto"
                    >
                        {users
                            .filter(
                                (user) =>
                                    user.organization_id === selectedOrg &&
                                    user.is_approved
                            )
                            .map((user) => (
                                <li
                                    key={user.email}
                                    className="flex justify-between gap-x-6 py-5"
                                >
                                    <div className="flex min-w-0 gap-x-4">
                                        {user.photo != null ? (
                                            <div className=" h-12 w-12 overflow-hidden shrink-0 rounded-full">
                                                <img
                                                    alt=""
                                                    src={asset(user.photo)}
                                                    className="object-cover top-0 left-0 w-full h-full"
                                                />
                                            </div>
                                        ) : (
                                            <UserCircleIcon
                                                aria-hidden="true"
                                                className="h-12 w-12 text-gray-300"
                                            />
                                        )}
                                        <div className="min-w-0 flex-auto">
                                            <p className="font-semibold text-gray-900">
                                                {user.name}
                                            </p>
                                            <small className="mt-1 truncate text-gray-500">
                                                {user.email}
                                            </small>
                                            <br />
                                            <small className="mt-1 truncate  text-gray-500">
                                                {user.contact_number}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                                        <p className="text-sm/6 text-gray-900">
                                            {user.title}
                                        </p>
                                        {/* {person.lastSeen ? (
                                            <p className="mt-1 text-xs/5 text-gray-500">
                                                Last seen{" "}
                                                <time
                                                    dateTime={
                                                        person.lastSeenDateTime
                                                    }
                                                >
                                                    {person.lastSeen}
                                                </time>
                                            </p>
                                        ) : (
                                            <div className="mt-1 flex items-center gap-x-1.5">
                                                <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                                                    <div className="size-1.5 rounded-full bg-emerald-500" />
                                                </div>
                                                <p className="text-xs/5 text-gray-500">
                                                    Online
                                                </p>
                                            </div>
                                        )} */}
                                    </div>
                                </li>
                            ))}
                    </ul>
                </Modal>
                <div className="mx-auto ml-[10%] sm:px-6 lg:px-8 space-y-10">
                    <div className="flex gap-10">
                        <h1>Organization Profiles</h1>
                    </div>
                    {/* New Org Category Start */}
                    <div className=" ">
                        <h4 className=" text-left mb-6 font-medium">
                            Real Estate
                        </h4>
                        <ul
                            role="list"
                            className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
                        >
                            {organizations.map((organization) => {
                                if (organization.category === "Real Estate") {
                                    return (
                                        <li
                                            key={organization.id}
                                            className="overflow-hidden rounded-xl border border-gray-200"
                                        >
                                            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                                                <img
                                                    src={asset(
                                                        organization.photo
                                                    )}
                                                    className="size-24 flex-none rounded-lg bg-white object-contain ring-1 ring-gray-900/10"
                                                />
                                                <div className=" font-medium ">
                                                    {organization.orgName}
                                                </div>
                                            </div>
                                            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4  bg-white">
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1 ">
                                                        About
                                                    </dt>
                                                    <dd className="text-gray-700 text-left col-span-2">
                                                        {
                                                            organization.description
                                                        }
                                                    </dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-x-4 py-3 ">
                                                    <dt className="text-gray-500 col-span-1">
                                                        Website
                                                    </dt>
                                                    <dd className="text-gray-700 col-span-2 ">
                                                        <a
                                                            className="break-words break-before-all"
                                                            href={getAbsoluteUrl(
                                                                organization.website
                                                            )}
                                                            target="_blank"
                                                        >
                                                            {
                                                                organization.website
                                                            }
                                                        </a>
                                                    </dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1">
                                                        Active Users
                                                    </dt>
                                                    <dd className="text-gray-700 col-span-2">
                                                        {countActiveUsers(
                                                            organization.id
                                                        ) >= 1 ? (
                                                            <button
                                                                className="text-d-accent-blue-medium font-bold"
                                                                onClick={() => {
                                                                    setOpen(
                                                                        true
                                                                    );
                                                                    setSelectedOrg(
                                                                        organization.id
                                                                    );
                                                                }}
                                                            >
                                                                {countActiveUsers(
                                                                    organization.id
                                                                )}
                                                            </button>
                                                        ) : (
                                                            `0`
                                                        )}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    </div>
                    {/* Org Category End */}
                    {/* New Org Category Start */}
                    <div className=" ">
                        <h4 className="font-medium text-left mb-6 ">
                            Education
                        </h4>
                        <ul
                            role="list"
                            className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
                        >
                            {organizations.map((organization) => {
                                if (organization.category === "Education") {
                                    return (
                                        <li
                                            key={organization.id}
                                            className="overflow-hidden rounded-xl border border-gray-200"
                                        >
                                            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                                                <img
                                                    src={asset(
                                                        organization.photo
                                                    )}
                                                    className="size-24 flex-none rounded-lg bg-white object-contain ring-1 ring-gray-900/10"
                                                />
                                                <div className=" font-medium ">
                                                    {organization.orgName}
                                                </div>
                                            </div>
                                            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4  bg-white">
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1 ">
                                                        About
                                                    </dt>
                                                    <dd className="text-gray-700 text-left col-span-2">
                                                        {
                                                            organization.description
                                                        }
                                                    </dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1">
                                                        Website
                                                    </dt>
                                                    <dd className="text-gray-700 col-span-2">
                                                        <a
                                                            className="break-words break-before-all"
                                                            href={getAbsoluteUrl(
                                                                organization.website
                                                            )}
                                                            target="_blank"
                                                        >
                                                            {
                                                                organization.website
                                                            }
                                                        </a>
                                                    </dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1">
                                                        Active Users
                                                    </dt>
                                                    <dd className="text-gray-700 col-span-2">
                                                        {countActiveUsers(
                                                            organization.id
                                                        ) >= 1 ? (
                                                            <button
                                                                className="text-d-accent-blue-medium font-bold"
                                                                onClick={() => {
                                                                    setOpen(
                                                                        true
                                                                    );
                                                                    setSelectedOrg(
                                                                        organization.id
                                                                    );
                                                                }}
                                                            >
                                                                {countActiveUsers(
                                                                    organization.id
                                                                )}
                                                            </button>
                                                        ) : (
                                                            `0`
                                                        )}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    </div>
                    {/* Org Category End */}
                    {/* New Org Category Start */}
                    <div className=" ">
                        <h4 className="font-medium text-left mb-6 ">
                            Family Foundation
                        </h4>
                        <ul
                            role="list"
                            className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
                        >
                            {organizations.map((organization) => {
                                if (
                                    organization.category ===
                                    "Family Foundation"
                                ) {
                                    return (
                                        <li
                                            key={organization.id}
                                            className="overflow-hidden rounded-xl border border-gray-200"
                                        >
                                            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                                                <img
                                                    src={asset(
                                                        organization.photo
                                                    )}
                                                    className="size-24 flex-none rounded-lg bg-white object-contain ring-1 ring-gray-900/10"
                                                />
                                                <div className=" font-medium ">
                                                    {organization.orgName}
                                                </div>
                                            </div>
                                            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4  bg-white">
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1 ">
                                                        About
                                                    </dt>
                                                    <dd className="text-gray-700 text-left col-span-2">
                                                        {
                                                            organization.description
                                                        }
                                                    </dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1">
                                                        Website
                                                    </dt>
                                                    <dd className="text-gray-700 col-span-2">
                                                        <a
                                                            className=""
                                                            href={getAbsoluteUrl(
                                                                organization.website
                                                            )}
                                                            target="_blank"
                                                        >
                                                            {
                                                                organization.website
                                                            }
                                                        </a>
                                                    </dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1">
                                                        Active Users
                                                    </dt>
                                                    <dd className="text-gray-700 col-span-2">
                                                        {countActiveUsers(
                                                            organization.id
                                                        ) >= 1 ? (
                                                            <button
                                                                className="text-d-accent-blue-medium font-bold"
                                                                onClick={() => {
                                                                    setOpen(
                                                                        true
                                                                    );
                                                                    setSelectedOrg(
                                                                        organization.id
                                                                    );
                                                                }}
                                                            >
                                                                {countActiveUsers(
                                                                    organization.id
                                                                )}
                                                            </button>
                                                        ) : (
                                                            `0`
                                                        )}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    </div>
                    {/* Org Category End */}
                    {/* New Org Category Start */}
                    <div className=" ">
                        <h4 className="font-medium text-left mb-6 ">
                            Sustainable Water Solutions
                        </h4>
                        <ul
                            role="list"
                            className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
                        >
                            {organizations.map((organization) => {
                                if (
                                    organization.category ===
                                    "Sustainable Water Solutions"
                                ) {
                                    return (
                                        <li
                                            key={organization.id}
                                            className="overflow-hidden rounded-xl border border-gray-200"
                                        >
                                            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                                                <img
                                                    src={asset(
                                                        organization.photo
                                                    )}
                                                    className="size-24 flex-none rounded-lg bg-white object-contain ring-1 ring-gray-900/10"
                                                />
                                                <div className=" font-medium ">
                                                    {organization.orgName}
                                                </div>
                                            </div>
                                            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4  bg-white">
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1 ">
                                                        About
                                                    </dt>
                                                    <dd className="text-gray-700 text-left col-span-2">
                                                        {
                                                            organization.description
                                                        }
                                                    </dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1">
                                                        Website
                                                    </dt>
                                                    <dd className="text-gray-700 col-span-2">
                                                        <a
                                                            className=""
                                                            href={getAbsoluteUrl(
                                                                organization.website
                                                            )}
                                                            target="_blank"
                                                        >
                                                            {
                                                                organization.website
                                                            }
                                                        </a>
                                                    </dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1">
                                                        Active Users
                                                    </dt>
                                                    <dd className="text-gray-700 col-span-2">
                                                        {countActiveUsers(
                                                            organization.id
                                                        ) >= 1 ? (
                                                            <button
                                                                className="text-d-accent-blue-medium font-bold"
                                                                onClick={() => {
                                                                    setOpen(
                                                                        true
                                                                    );
                                                                    setSelectedOrg(
                                                                        organization.id
                                                                    );
                                                                }}
                                                            >
                                                                {countActiveUsers(
                                                                    organization.id
                                                                )}
                                                            </button>
                                                        ) : (
                                                            `0`
                                                        )}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    </div>
                    {/* Org Category End */}
                    {/* New Org Category Start */}
                    <div className=" ">
                        <h4 className="font-medium text-left mb-6 ">
                            Venture Capital
                        </h4>
                        <ul
                            role="list"
                            className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
                        >
                            {organizations.map((organization) => {
                                if (
                                    organization.category === "Venture Capital"
                                ) {
                                    return (
                                        <li
                                            key={organization.id}
                                            className="overflow-hidden rounded-xl border border-gray-200"
                                        >
                                            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                                                <img
                                                    src={asset(
                                                        organization.photo
                                                    )}
                                                    className="size-24 flex-none rounded-lg bg-white object-contain ring-1 ring-gray-900/10"
                                                />
                                                <div className=" font-medium ">
                                                    {organization.orgName}
                                                </div>
                                            </div>
                                            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4  bg-white">
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1 ">
                                                        About
                                                    </dt>
                                                    <dd className="text-gray-700 text-left col-span-2">
                                                        {
                                                            organization.description
                                                        }
                                                    </dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1">
                                                        Website
                                                    </dt>
                                                    <dd className="text-gray-700 col-span-2">
                                                        <a
                                                            className="break-words break-before-all"
                                                            href={getAbsoluteUrl(
                                                                organization.website
                                                            )}
                                                            target="_blank"
                                                        >
                                                            {
                                                                organization.website
                                                            }
                                                        </a>
                                                    </dd>
                                                </div>
                                                <div className="grid grid-cols-3 gap-x-4 py-3">
                                                    <dt className="text-gray-500 col-span-1">
                                                        Active Users
                                                    </dt>
                                                    <dd className="text-gray-700 col-span-2">
                                                        {countActiveUsers(
                                                            organization.id
                                                        ) >= 1 ? (
                                                            <button
                                                                className="text-d-accent-blue-medium font-bold"
                                                                onClick={() => {
                                                                    setOpen(
                                                                        true
                                                                    );
                                                                    setSelectedOrg(
                                                                        organization.id
                                                                    );
                                                                }}
                                                            >
                                                                {countActiveUsers(
                                                                    organization.id
                                                                )}
                                                            </button>
                                                        ) : (
                                                            `0`
                                                        )}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    </div>
                    {/* Org Category End */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
