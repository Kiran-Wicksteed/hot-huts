import { Link } from "@inertiajs/react";
import {
    BookmarkIcon,
    GiftIcon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import styles from "../../styles";

function SidebarLink({ href, icon: Icon, active, children }) {
    const base =
        "shadow bg-white border rounded py-2 w-48 px-6 flex items-center gap-x-2 transition-colors";
    const off =
        "text-black border-hh-gray hover:bg-hh-orange/10 hover:border-hh-orange";
    const on = "!bg-hh-orange text-white border-hh-orange";
    return (
        <Link href={href} className={`${base} ${active ? on : off}`}>
            <Icon className="h-6 w-6 shrink-0" />
            <span className={`${styles.paragraph} whitespace-nowrap`}>
                {children}
            </span>
        </Link>
    );
}

export default function FrontendSidebar() {
    // relies on Ziggy route() helper being available (it is used elsewhere already)
    const isBookings = route().current("my-bookings.*");
    const isLoyalty = route().current("loyalty.*");

    return (
        <div className="pr-8 lg:pr-16 border-r border-hh-gray">
            <div className="sticky top-16 space-y-2">
                <SidebarLink
                    href={route("user.dashboard")}
                    icon={BookmarkIcon}
                    active={isBookings}
                >
                    My Bookings
                </SidebarLink>

                <SidebarLink
                    href={route("loyalty.index")}
                    icon={GiftIcon}
                    active={isLoyalty}
                >
                    Loyalty
                </SidebarLink>

                <Link
                    href={route("logout")}
                    method="post"
                    as="button"
                    className="mt-2 inline-flex items-center gap-2 text-hh-gray hover:text-black"
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Log Out
                </Link>
            </div>
        </div>
    );
}
