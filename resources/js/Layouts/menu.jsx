import {
    ClockIcon,
    MapPinIcon,
    QueueListIcon,
    ShoppingCartIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import styles from "../../styles";
import { useCart } from "@/context/CartContext";
import { router } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function Menu({ currentStep }) {
    const { items, removeItem } = useCart();

    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    // Close on outside click / Esc
    useEffect(() => {
        function onClickOutside(e) {
            if (!open) return;
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                btnRef.current &&
                !btnRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }
        function onKey(e) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onClickOutside);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClickOutside);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const subtotal = useMemo(
        () => items.reduce((t, it) => t + Number(it.lineTotal || 0), 0),
        [items]
    );

    const goToCheckout = () => {
        try {
            localStorage.setItem("hh_step", "4"); // jump wizard to Checkout
        } catch {}
        setOpen(false);
        router.visit(route("index"));
    };

    const hasItems = items.length > 0;

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

                        {/* Basket with dropdown */}
                        <li className="relative">
                            <button
                                ref={btnRef}
                                type="button"
                                disabled={!hasItems}
                                onClick={() => hasItems && setOpen((v) => !v)}
                                className={`${
                                    styles.paragraph
                                }  flex items-center gap-2 rounded py-2  ${
                                    hasItems
                                        ? " text-hh-orange hover:bg-orange-50"
                                        : " text-gray-400 cursor-default"
                                }`}
                                aria-haspopup="menu"
                                aria-expanded={open}
                            >
                                <ShoppingCartIcon className="h-6 w-6" />
                                <span className={`${styles.paragraph}`}>
                                    Basket
                                </span>
                                <span
                                    className={`ml-1 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs ${
                                        hasItems
                                            ? "bg-hh-orange text-white"
                                            : "bg-gray-200 text-gray-500"
                                    }`}
                                >
                                    {items.length}
                                </span>
                            </button>

                            {/* Dropdown */}
                            {open && (
                                <div
                                    ref={menuRef}
                                    role="menu"
                                    className="absolute right-0 mt-2 w-[340px] z-50 rounded-md border border-hh-orange bg-white shadow-lg"
                                >
                                    <div className="p-3 max-h-80 overflow-y-auto">
                                        {items.map((it) => (
                                            <div
                                                key={it.id}
                                                className="border border-gray-200 rounded p-3 mb-3 last:mb-0"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-medium text-black">
                                                            {it.kind === "event"
                                                                ? it.event_name
                                                                : "Sauna session"}
                                                        </p>
                                                        <p className="text-xs text-black/60">
                                                            {it.location_name}
                                                            {it.date
                                                                ? ` • ${it.date}`
                                                                : ""}
                                                            {it.timeRange
                                                                ? ` • ${it.timeRange}`
                                                                : ""}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            removeItem(it.id)
                                                        }
                                                        className="text-xs text-red-600 hover:text-red-700"
                                                        title="Remove"
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {/* tiny table */}
                                                <div className="mt-2 grid grid-cols-8 gap-y-1 text-sm">
                                                    <span className="col-span-5 text-black/60">
                                                        Qty
                                                    </span>
                                                    <span className="col-span-3 text-right">
                                                        {it.people ?? 1}
                                                    </span>

                                                    <span className="col-span-5 text-black/60">
                                                        Amount
                                                    </span>
                                                    <span className="col-span-3 text-right">
                                                        R
                                                        {Number(
                                                            it.lineTotal || 0
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* footer */}
                                    <div className="border-t border-gray-200 p-3">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-black/60">
                                                Subtotal
                                            </span>
                                            <span className="text-sm font-medium">
                                                R{subtotal.toFixed(2)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={goToCheckout}
                                            className="w-full bg-hh-orange text-white py-2 rounded text-sm font-medium"
                                        >
                                            View cart & checkout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}
