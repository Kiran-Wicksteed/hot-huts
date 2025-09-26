import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import InviteTeam from "@/Pages/TeamInvite/InviteTeam";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";

import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    TransitionChild,
    Transition,
} from "@headlessui/react";
import {
    CalendarIcon,
    ChartPieIcon,
    Cog6ToothIcon,
    DocumentDuplicateIcon,
    FolderIcon,
    UsersIcon,
    TruckIcon,
    XMarkIcon,
    Squares2X2Icon,
    BookmarkIcon,
    CreditCardIcon,
    UserCircleIcon,
    ServerStackIcon,
    MapIcon,
    MapPinIcon,
} from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/24/solid";

const foundation = [
    { name: "Dashboard", href: "#", icon: Squares2X2Icon, current: true },
    { name: "Team", href: "#", icon: UsersIcon, current: false },
    { name: "Projects", href: "#", icon: FolderIcon, current: false },
    { name: "Calendar", href: "#", icon: CalendarIcon, current: false },
    {
        name: "Documents",
        href: "#",
        icon: DocumentDuplicateIcon,
        current: false,
    },
    { name: "Reports", href: "#", icon: ChartPieIcon, current: false },
];
const teams = [
    { id: 1, name: "Heroicons", href: "#", initial: "H", current: false },
    { id: 2, name: "Tailwind Labs", href: "#", initial: "T", current: false },
    { id: 3, name: "Workcation", href: "#", initial: "W", current: false },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const page = usePage();
    const url = page.url;

    const isDayStaff = Boolean(Number(user?.is_editor ?? 0));

    const asset = (path) => {
        return `${path}`;
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <>
            <div className=" ">
                <nav className="!border-b !border-gray-200 bg-white !shadow-none z-50 fixed top-0 left-0 w-full">
                    <div className="mx-auto  px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <Link href="/">
                                <div className="flex gap-x-4">
                                    <ApplicationLogo className=" h-7 w-auto fill-current " />
                                    <p
                                        className={`text-hh-orange font-medium text-xl`}
                                    >
                                        Dashboard
                                    </p>
                                </div>
                            </Link>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <div className="flex">
                                                {user && user.photo ? (
                                                    <div className="mx-auto h-10 w-10 overflow-hidden shrink-0 rounded-full">
                                                        <img
                                                            alt=""
                                                            src={asset(
                                                                user.photo
                                                            )}
                                                            className="object-cover top-0 left-0 w-full h-full"
                                                        />
                                                    </div>
                                                ) : (
                                                    <UserIcon
                                                        aria-hidden="true"
                                                        className="h-10 w-10 text-white bg-hh-orange rounded-full p-1.5"
                                                    />
                                                )}
                                                <span className="inline-flex rounded-md">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                                    >
                                                        {user.name}

                                                        <svg
                                                            className="-me-0.5 ms-2 h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </div>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link
                                                href={route("profile.edit")}
                                            >
                                                Profile
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            <div className="-me-2 flex items-center sm:hidden">
                                <button
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState
                                        )
                                    }
                                    className="inline-flex items-center justify-center rounded-md p-1 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            className={
                                                !showingNavigationDropdown
                                                    ? "inline-flex"
                                                    : "hidden"
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={
                                                showingNavigationDropdown
                                                    ? "inline-flex"
                                                    : "hidden"
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className={
                            (showingNavigationDropdown ? "block" : "hidden") +
                            " sm:hidden"
                        }
                    >
                        {/* <div className="space-y-1 pb-3 pt-2">
                            <ResponsiveNavLink
                                href={route("dashboard")}
                                active={route().current("dashboard")}
                            >
                                Dashboard
                            </ResponsiveNavLink>
                        </div> */}

                        <div className="border-t border-gray-200 pb-1 pt-4">
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-800">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    {user.email}
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route("profile.edit")}>
                                    Profile
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    method="post"
                                    href={route("logout")}
                                    as="button"
                                >
                                    Log Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* <main>
                    <div className="grid grid-cols-4">
                        <nav
                            id="sidebar"
                            className="bg-white border-r border-gray-100 col-span-1 h-full"
                        >
                            <div className="px-4 py-8 space-y-4">
                                <NavLink
                                    href={route("dashboard")}
                                    active={route().current("dashboard")}
                                >
                                    Dashboard
                                </NavLink>
                                {user.is_admin && (
                                    //
                                    <NavLink
                                        href={route("dashboard")}
                                        active={route().current("admin/users")}
                                    >
                                        Manage Users
                                    </NavLink>
                                )}
                            </div>
                        </nav>
                        <section className="min-h-screen">{children}</section>
                    </div>
                </main> */}
            </div>
            {/* //tailwind section */}
            <div>
                <Dialog
                    open={sidebarOpen}
                    onClose={setSidebarOpen}
                    className="relative z-50 lg:hidden"
                >
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
                    />

                    <div className="fixed inset-0 flex">
                        <DialogPanel
                            transition
                            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
                        >
                            <TransitionChild>
                                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                                    <button
                                        type="button"
                                        onClick={() => setSidebarOpen(false)}
                                        className="-m-2.5 p-1.5"
                                    >
                                        <span className="sr-only">
                                            Close sidebar
                                        </span>
                                        <XMarkIcon
                                            aria-hidden="true"
                                            className="h-6 w-6 text-white"
                                        />
                                    </button>
                                </div>
                            </TransitionChild>
                            {/* Sidebar component, swap this element with another sidebar if you like */}
                            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                                <div className="flex h-16 shrink-0 items-center">
                                    <img
                                        alt="Your Company"
                                        src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                                        className="h-8 w-auto"
                                    />
                                </div>
                                <nav className="flex flex-1 flex-col">
                                    <ul
                                        role="list"
                                        className="flex flex-1 flex-col gap-y-7"
                                    >
                                        <li>
                                            <ul
                                                role="list"
                                                className="-mx-2 space-y-1"
                                            >
                                                {foundation.map((item) => (
                                                    <li key={item.name}>
                                                        <a
                                                            href={item.href}
                                                            className={classNames(
                                                                item.current
                                                                    ? "bg-gray-100 "
                                                                    : "text-gray-700 hover:bg-gray-100 hover:",
                                                                "group flex gap-x-3 rounded-md p-1 text-sm/6 font-semibold"
                                                            )}
                                                        >
                                                            <item.icon
                                                                aria-hidden="true"
                                                                className={classNames(
                                                                    item.current
                                                                        ? ""
                                                                        : "text-gray-400 group-hover:",
                                                                    "h-6 w-6 shrink-0"
                                                                )}
                                                            />
                                                            {item.name}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                        <li>
                                            <div className="text-xs/6 font-semibold text-gray-400">
                                                Your teams
                                            </div>
                                            <ul
                                                role="list"
                                                className="-mx-2 mt-2 space-y-1"
                                            >
                                                {teams.map((team) => (
                                                    <li key={team.name}>
                                                        <a
                                                            href={team.href}
                                                            className={classNames(
                                                                team.current
                                                                    ? "bg-gray-100 "
                                                                    : "text-gray-700 hover:bg-gray-100 hover:",
                                                                "group flex gap-x-3 rounded-md p-1 text-sm/6 font-semibold"
                                                            )}
                                                        >
                                                            <span
                                                                className={classNames(
                                                                    team.current
                                                                        ? "border-indigo-600 "
                                                                        : "border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:",
                                                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium"
                                                                )}
                                                            >
                                                                {team.initial}
                                                            </span>
                                                            <span className="truncate">
                                                                {team.name}
                                                            </span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                        <li className="mt-auto">
                                            <a
                                                href="#"
                                                className="group -mx-2 flex gap-x-3 rounded-md p-1 text-sm/6 font-semibold text-gray-700 hover:bg-gray-100 hover:"
                                            >
                                                <Cog6ToothIcon
                                                    aria-hidden="true"
                                                    className="h-6 w-6 shrink-0 text-gray-400 group-hover:"
                                                />
                                                Settings
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
                {/* Static sidebar for desktop */}
                <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex xl:w-64 lg:flex-col ">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex grow  flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white  pb-4">
                        <div className="flex h-16 shrink-0 items-center">
                            <div className="flex shrink-0 items-center"></div>
                        </div>

                        <nav
                            className={`${
                                user.is_approved === true
                                    ? `opacity-100 pointer-events-auto`
                                    : `opacity-50 pointer-events-none`
                            } flex flex-1 flex-col px-6`}
                        >
                            <ul
                                role="list"
                                className="flex flex-1 flex-col gap-y-7 "
                            >
                                <li>
                                    <ul role="list" className=" space-y-3 ">
                                        <li>
                                            <a
                                                href={route("dashboard")}
                                                className={classNames(
                                                    route().current("dashboard")
                                                        ? "bg-gray-100 text-hh-orange border-l-2 border-l-hh-orange"
                                                        : "text-black hover:bg-gray-100 hover:",
                                                    "group flex gap-x-3  p-1 sidebar-item !font-medium"
                                                )}
                                            >
                                                <Squares2X2Icon
                                                    aria-hidden="true"
                                                    className={classNames(
                                                        route().current(
                                                            "dashboard"
                                                        )
                                                            ? "text-hh-orange"
                                                            : "text-black group-hover:",
                                                        "h-6 w-6 shrink-0"
                                                    )}
                                                />
                                                Dashboard
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href={route("bookings.index")}
                                                className={classNames(
                                                    route().current(
                                                        "bookings.index"
                                                    )
                                                        ? "bg-gray-100 text-hh-orange border-l-2 border-l-hh-orange"
                                                        : "text-black hover:bg-gray-100 hover:",
                                                    "group flex gap-x-3  p-1 sidebar-item !font-medium"
                                                )}
                                            >
                                                <BookmarkIcon
                                                    aria-hidden="true"
                                                    className={classNames(
                                                        route().current(
                                                            "bookings.index"
                                                        )
                                                            ? ""
                                                            : "text-black group-hover:",
                                                        "h-6 w-6 shrink-0"
                                                    )}
                                                />
                                                Bookings
                                            </a>
                                        </li>
                                        {!isDayStaff && (
                                            <li>
                                                <a
                                                    href={route(
                                                        "payments.index"
                                                    )}
                                                    className={classNames(
                                                        route().current(
                                                            "payments.index"
                                                        )
                                                            ? "bg-gray-100 text-hh-orange border-l-2 border-l-hh-orange"
                                                            : "text-black hover:bg-gray-100 hover:",
                                                        "group flex gap-x-3  p-1 sidebar-item !font-medium"
                                                    )}
                                                >
                                                    <CreditCardIcon
                                                        aria-hidden="true"
                                                        className={classNames(
                                                            route().current(
                                                                "payments.index"
                                                            )
                                                                ? ""
                                                                : "text-black group-hover:",
                                                            "h-6 w-6 shrink-0"
                                                        )}
                                                    />
                                                    Payments
                                                </a>
                                            </li>
                                        )}
                                        <li>
                                            <a
                                                href={route("customers.index")}
                                                className={classNames(
                                                    route().current(
                                                        "customers.index"
                                                    )
                                                        ? "bg-gray-100 text-hh-orange border-l-2 border-l-hh-orange"
                                                        : "text-black hover:bg-gray-100 hover:",
                                                    "group flex gap-x-3  p-1 sidebar-item !font-medium"
                                                )}
                                            >
                                                <UserCircleIcon
                                                    aria-hidden="true"
                                                    className={classNames(
                                                        route().current(
                                                            "customers.index"
                                                        )
                                                            ? ""
                                                            : "text-black group-hover:",
                                                        "h-6 w-6 shrink-0"
                                                    )}
                                                />
                                                Customers
                                            </a>
                                        </li>
                                        {!isDayStaff && (
                                            <li>
                                                <a
                                                    href={route(
                                                        "services.index"
                                                    )}
                                                    className={classNames(
                                                        route().current(
                                                            "services.index"
                                                        )
                                                            ? "bg-gray-100 text-hh-orange border-l-2 border-l-hh-orange"
                                                            : "text-black hover:bg-gray-100 hover:",
                                                        "group flex gap-x-3  p-1 sidebar-item !font-medium"
                                                    )}
                                                >
                                                    <ServerStackIcon
                                                        aria-hidden="true"
                                                        className={classNames(
                                                            route().current(
                                                                "services.index"
                                                            )
                                                                ? ""
                                                                : "text-black group-hover:",
                                                            "h-6 w-6 shrink-0"
                                                        )}
                                                    />
                                                    Services
                                                </a>
                                            </li>
                                        )}
                                        {!isDayStaff && (
                                            <li>
                                                <a
                                                    href={route("events.index")}
                                                    className={classNames(
                                                        route().current(
                                                            "events.index"
                                                        )
                                                            ? "bg-gray-100 text-hh-orange border-l-2 border-l-hh-orange"
                                                            : "text-black hover:bg-gray-100 hover:",
                                                        "group flex gap-x-3  p-1 sidebar-item !font-medium"
                                                    )}
                                                >
                                                    <CalendarIcon
                                                        aria-hidden="true"
                                                        className={classNames(
                                                            route().current(
                                                                "events.index"
                                                            )
                                                                ? ""
                                                                : "text-black group-hover:",
                                                            "h-6 w-6 shrink-0"
                                                        )}
                                                    />
                                                    Events
                                                </a>
                                            </li>
                                        )}
                                        {!isDayStaff && (
                                            <li>
                                                <a
                                                    href={route(
                                                        "locations.index"
                                                    )}
                                                    className={classNames(
                                                        route().current(
                                                            "locations.index"
                                                        )
                                                            ? "bg-gray-100 text-hh-orange border-l-2 border-l-hh-orange"
                                                            : "text-black hover:bg-gray-100 hover:",
                                                        "group flex gap-x-3  p-1 sidebar-item !font-medium"
                                                    )}
                                                >
                                                    <MapIcon
                                                        aria-hidden="true"
                                                        className={classNames(
                                                            route().current(
                                                                "locations.index"
                                                            )
                                                                ? ""
                                                                : "text-black group-hover:",
                                                            "h-6 w-6 shrink-0"
                                                        )}
                                                    />
                                                    Locations
                                                </a>
                                            </li>
                                        )}
                                        {!isDayStaff && (
                                            <li>
                                                <a
                                                    href={route("saunas.index")}
                                                    className={classNames(
                                                        route().current(
                                                            "saunas.index"
                                                        )
                                                            ? "bg-gray-100 text-hh-orange border-l-2 border-l-hh-orange"
                                                            : "text-black hover:bg-gray-100 hover:",
                                                        "group flex gap-x-3  p-1 sidebar-item !font-medium"
                                                    )}
                                                >
                                                    <MapPinIcon
                                                        aria-hidden="true"
                                                        className={classNames(
                                                            route().current(
                                                                "saunas.index"
                                                            )
                                                                ? ""
                                                                : "text-black group-hover:",
                                                            "h-6 w-6 shrink-0"
                                                        )}
                                                    />
                                                    Territories
                                                </a>
                                            </li>
                                        )}
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
                {/* //Content section */}
                <main className="pt-20  bg-[#F8F8F8]">
                    {url.includes("dashboard") && (
                        <div className="bg-white w-full h-64 absolute top-0 left-0"></div>
                    )}
                    <div className="px-4 sm:px-6 lg:px-8 relative min-h-[85vh]">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
