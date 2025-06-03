import {
    ClockIcon,
    MapIcon,
    MapPinIcon,
    QueueListIcon,
    ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import styles from "../../styles";

export default function Menu({ currentStep }) {
    const steps = {
        1: "locations",
        2: "services",
        3: "datetime",
        4: "checkout",
    };

    return (
        <div
            className={`${styles.boxWidth} py-4 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <div className="border border-hh-orange bg-white rounded-md shadow">
                <nav>
                    <ul className="flex justify-between max-w-6xl mx-auto items-center">
                        <li>
                            <a href="/" className="-m-1.5 p-1.5">
                                <span className="sr-only">Hot Huts</span>
                                <img
                                    alt="Picture of Hot Huts logo"
                                    src="/storage/images/logo.png"
                                    className="h-14 w-auto"
                                />
                            </a>
                        </li>
                        <li>
                            <p
                                className={`${
                                    styles.paragraph
                                } !font-medium !text-lg flex items-center gap-x-2 w-fit cursor-pointer transition-all ${
                                    currentStep === 1
                                        ? "text-hh-orange"
                                        : "text-black hover:text-hh-orange"
                                }`}
                            >
                                <MapPinIcon className="h-6 w-6 " />
                                <span>Locations</span>
                            </p>
                        </li>
                        <li>
                            <p
                                className={`${
                                    styles.paragraph
                                } !font-medium !text-lg flex items-center gap-x-2 w-fit cursor-pointer transition-all ${
                                    currentStep === 2
                                        ? "text-hh-orange"
                                        : "text-black hover:text-hh-orange"
                                }`}
                            >
                                <QueueListIcon className="h-6 w-6 " />
                                <span>Services</span>
                            </p>
                        </li>
                        <li>
                            <p
                                className={`${
                                    styles.paragraph
                                } !font-medium !text-lg flex items-center gap-x-2 w-fit cursor-pointer transition-all ${
                                    currentStep === 3
                                        ? "text-hh-orange"
                                        : "text-black hover:text-hh-orange"
                                }`}
                            >
                                <ClockIcon className="h-6 w-6 " />
                                <span>Date & Time</span>
                            </p>
                        </li>
                        <li>
                            <p
                                className={`${
                                    styles.paragraph
                                } !font-medium !text-lg flex items-center gap-x-2 w-fit cursor-pointer transition-all ${
                                    currentStep === 4
                                        ? "text-hh-orange"
                                        : "text-black hover:text-hh-orange"
                                }`}
                            >
                                <ShoppingCartIcon className="h-6 w-6 " />
                                <span>Check Out</span>
                            </p>
                        </li>
                        <li>
                            <a
                                href="/my-bookings"
                                className={`${styles.paragraph} border border-hh-orange font-medium shadow !text-lg rounded p-4 text-hh-orange w-fit cursor-pointer transition-all`}
                            >
                                <span>My Bookings</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}
