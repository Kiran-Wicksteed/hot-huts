import { Link, usePage } from "@inertiajs/react";
import {
    BookmarkIcon,
    InformationCircleIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";
import styles from "../../styles";

export default function FrontendSidebar() {
    return (
        <div className="pr-16  border-r border-hh-gray ">
            <div className="sticky top-16 space-y-2">
                <button className="shadow bg-white border-hh-gray border rounded py-2 w-48 px-6 flex items-center gap-x-2 text-black">
                    <BookmarkIcon className="h-6 w-6 shrink-0" />
                    <span className={`${styles.paragraph}  whitespace-nowrap`}>
                        My Bookings
                    </span>
                </button>
                <Link href={route("logout")} method="post" as="button">
                    Log Out
                </Link>
            </div>
        </div>
    );
}
