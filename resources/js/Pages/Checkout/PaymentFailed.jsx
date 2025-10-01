import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import ConfirmedMenu from "@/Layouts/ConfirmedMenu";
import Footer from "@/Layouts/Footer";
import {
    ClockIcon,
    MapIcon,
    MapPinIcon,
    QueueListIcon,
    ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import styles from "../../../styles";

export default function PaymentFailed() {
    const { props } = usePage();
    const { message = "Unfortunately your payment was unsuccessful " } = props;

    return (
        <div>
            <ConfirmedMenu />
            <div className="max-w-3xl mx-auto py-16 flex flex-col items-center justify-center">
                <h1 className={`${styles.h1}`}>Payment failed.</h1>
                <p className={`${styles.paragraph} !mb-6 `}>
                    Unfortunately your payment was unsuccessful.
                </p>
                <div className="space-x-3">
                    <li className="list-none inline-block">
                        <a
                            href="/"
                            className={`${styles.paragraph} text-hh-orange !font-medium border-hh-orange border p-4 rounded-sm !lg:text-lg flex items-center lg:gap-x-2 w-fit cursor-pointer transition-all`}
                        >
                            <ShoppingCartIcon className="h-6 w-6 " />
                            <span>Please try again</span>
                        </a>
                    </li>
                </div>
            </div>
            <Footer />
        </div>
    );
}
