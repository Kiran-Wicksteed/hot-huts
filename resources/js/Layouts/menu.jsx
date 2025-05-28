import {
    ClockIcon,
    MapIcon,
    MapPinIcon,
    QueueListIcon,
    ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import styles from "../../styles";

export default function Menu() {
    return (
        <div
            className={`${styles.boxWidth} py-4 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <div className="border border-hh-orange bg-white rounded-md shadow">
                <nav>
                    <ul className="flex justify-between max-w-6xl mx-auto items-center">
                        <li>
                            <a href="#" className="-m-1.5 p-1.5">
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
                                className={`${styles.paragraph} !font-medium !text-lg flex items-center gap-x-2 text-black hover:text-hh-orange w-fit cursor-pointer transition-all`}
                            >
                                <MapPinIcon className="h-6 w-6 " />
                                <span>Locations</span>
                            </p>
                        </li>
                        <li>
                            <p
                                className={`${styles.paragraph} !font-medium !text-lg flex items-center gap-x-2 text-black hover:text-hh-orange w-fit cursor-pointer transition-all`}
                            >
                                <QueueListIcon className="h-6 w-6 " />
                                <span>Services</span>
                            </p>
                        </li>
                        <li>
                            <p
                                className={`${styles.paragraph} !font-medium !text-lg flex items-center gap-x-2 text-black hover:text-hh-orange w-fit cursor-pointer transition-all`}
                            >
                                <ClockIcon className="h-6 w-6 " />
                                <span>Date & Time</span>
                            </p>
                        </li>
                        <li>
                            <p
                                className={`${styles.paragraph} !font-medium !text-lg flex items-center gap-x-2 text-black hover:text-hh-orange w-fit cursor-pointer transition-all`}
                            >
                                <ShoppingCartIcon className="h-6 w-6 " />
                                <span>Check Out</span>
                            </p>
                        </li>
                        <li>
                            <button
                                className={`${styles.paragraph} border border-hh-orange font-medium shadow !text-lg rounded p-4 text-hh-orange w-fit cursor-pointer transition-all`}
                            >
                                <span>My Bookings</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}
