import { UserIcon } from "@heroicons/react/24/solid";
import styles from "../../../styles";
import { usePage } from "@inertiajs/react";
import {
    EnvelopeIcon,
    MapPinIcon,
    PhoneIcon,
} from "@heroicons/react/24/outline";

export default function InvoiceDetails() {
    const { auth } = usePage().props;
    const user = auth.user;

    const asset = (path) => {
        return `/storage/${path}`;
    };

    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <div className=" grid grid-cols-3 gap-x-8 relative">
                <div className="col-span-2  border border-hh-gray  rounded-md shadow bg-white p-6">
                    <h1
                        className={`${styles.h2} text-hh-orange font-medium !mb-0`}
                    >
                        Single sauna session
                    </h1>
                    <p className={`${styles.h3} !mb-4 font-medium text-black`}>
                        St James Tidal Pool
                    </p>
                    <div className="bg-[#F5F5F5] rounded-md p-6">
                        <div className="justify-between flex">
                            <div>
                                <p
                                    className={`${styles.h3} !mb-2 font-medium text-black/50`}
                                >
                                    Invoice Details
                                </p>
                                <p
                                    className={`${styles.paragraph}  text-black`}
                                >
                                    INV-10839
                                </p>
                                <p
                                    className={`${styles.paragraph} !text-sm text-black/50`}
                                >
                                    23 April 2025
                                </p>
                            </div>
                            <div>
                                <p
                                    className={`${styles.paragraph} !mb-2 font-medium text-black !text-lg`}
                                >
                                    {user.name}
                                </p>
                                <p
                                    className={`${styles.paragraph} text-right !text-sm text-black/50`}
                                >
                                    Billed to:
                                    <span className="block">123 Sisipi St</span>
                                    <span className="block">Cape Town</span>
                                    <span className="block">
                                        South Africa 7967
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-8 mt-8 ">
                        <div className="col-span-3">
                            {" "}
                            <p
                                className={`${styles.paragraph} !text-sm text-black/50`}
                            >
                                Item
                            </p>
                        </div>
                        <div className="col-span-2">
                            {" "}
                            <p
                                className={`${styles.paragraph} !text-sm text-black/50`}
                            >
                                Quantity
                            </p>
                        </div>
                        <div className="col-span-2">
                            {" "}
                            <p
                                className={`${styles.paragraph} !text-sm text-black/50`}
                            >
                                Amount
                            </p>
                        </div>
                        <div className="col-span-1">
                            {" "}
                            <p
                                className={`${styles.paragraph} !text-sm text-black/50`}
                            >
                                Total
                            </p>
                        </div>
                        <div className="col-span-full divide-y divide-[#F5F5F5] mt-6 ">
                            <div className="grid grid-cols-8  h-16 border-t border-[#F5F5F5] items-center">
                                <div className="col-span-3">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black w-1/2`}
                                    >
                                        Single sauna session St James Tidal Pool
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        3
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        R80
                                    </p>
                                </div>
                                <div className="col-span-1">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black `}
                                    >
                                        R210
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-8 h-16 items-center">
                                <div className="col-span-3">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black `}
                                    >
                                        Hot Honey
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        1
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        R30
                                    </p>
                                </div>
                                <div className="col-span-1">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black `}
                                    >
                                        R60
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-8 h-16 items-center">
                                <div className="col-span-3">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black w-1/2`}
                                    >
                                        REVIVE + Water combo
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        1
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black/50`}
                                    >
                                        R40
                                    </p>
                                </div>
                                <div className="col-span-1">
                                    {" "}
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black `}
                                    >
                                        R80
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-full grid grid-cols-8 bg-[#F5F5F5] py-4 mt-8 rounded">
                            <div className="col-span-3"></div>
                            <div className="col-span-2"></div>
                            <div className="col-span-2">
                                {" "}
                                <p
                                    className={`${styles.paragraph} !text-sm text-black/50`}
                                >
                                    Total Amount:
                                </p>
                            </div>
                            <div className="col-span-1">
                                {" "}
                                <p
                                    className={`${styles.paragraph} !text-sm text-black`}
                                >
                                    R350
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-span-1 ">
                    <div className="sticky top-12">
                        <div className="p-8  border border-hh-gray bg-white rounded-md shadow h-fit ">
                            <h4
                                className={`${styles.h3} !mb-4 font-medium text-black`}
                            >
                                Client Information
                            </h4>
                            <div className="flex gap-x-4 mt-4">
                                {user.photo != null ? (
                                    <div className=" h-10 w-10 overflow-hidden shrink-0 rounded-full">
                                        <img
                                            alt=""
                                            src={asset(user.photo)}
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
                                    <div
                                        className={`${styles.paragraph} inline-flex items-center  font-medium text-black transition duration-150 ease-in-out`}
                                    >
                                        {user.name}
                                    </div>
                                </span>
                            </div>
                            <dl className="mt-10 space-y-4 text-base/7 text-black/50">
                                <div className="flex gap-x-4">
                                    <dt className="flex-none">
                                        <span className="sr-only">Email</span>
                                        <EnvelopeIcon
                                            aria-hidden="true"
                                            className="h-7 w-6 text-black/50"
                                        />
                                    </dt>
                                    <dd>
                                        <a
                                            href="mailto:hello@example.com"
                                            className="hover:text-black"
                                        >
                                            {user.email}
                                        </a>
                                    </dd>
                                </div>

                                <div className="flex gap-x-4">
                                    <dt className="flex-none">
                                        <span className="sr-only">
                                            Telephone
                                        </span>
                                        <PhoneIcon
                                            aria-hidden="true"
                                            className="h-7 w-6 text-black/50"
                                        />
                                    </dt>
                                    <dd>
                                        <a
                                            href="tel:+12 3456 7890"
                                            className="hover:text-black"
                                        >
                                            +12 3456 7890
                                        </a>
                                    </dd>
                                </div>
                                <div className="flex gap-x-4">
                                    <dt className="flex-none">
                                        <span className="sr-only">Address</span>
                                        <MapPinIcon
                                            aria-hidden="true"
                                            className="h-7 w-6 text-black/50"
                                        />
                                    </dt>
                                    <dd
                                        className={`${styles.paragraph} text-black/50`}
                                    >
                                        545 Mavis Island
                                        <br />
                                        Chicago, IL 99191
                                    </dd>
                                </div>
                                <button className="bg-white shadow border border-hh-orange px-10  py-1.5 text-hh-orange rounded">
                                    <span
                                        className={`${styles.paragraph} text-center font-medium`}
                                    >
                                        Edit my profile
                                    </span>
                                </button>
                            </dl>
                        </div>
                        <div className="space-y-2 mt-6">
                            <button className=" shadow border border-hh-orange w-full py-2 text-white bg-hh-orange rounded">
                                <span
                                    className={`${styles.paragraph} text-center font-medium`}
                                >
                                    Proceed to payment
                                </span>
                            </button>
                            <button className="bg-black shadow border border-black w-full  py-2 text-white rounded">
                                <span
                                    className={`${styles.paragraph} text-center font-medium`}
                                >
                                    Book another session
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
