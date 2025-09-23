import {
    ClockIcon,
    MapPinIcon,
    QueueListIcon,
    ShoppingCartIcon,
    XMarkIcon,
    Bars3Icon,
} from "@heroicons/react/24/outline";
import styles from "../../styles";
import { useCart } from "@/context/CartContext";
import { router } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function Menu({ currentStep }) {
    const { items, removeItem } = useCart();

    const [open, setOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    const goToStep = (step) => {
        try {
            localStorage.setItem("hh_step", step.toString());
        } catch {}
        setMobileMenuOpen(false);
        router.visit(route("index"));
    };

    const hasItems = items.length > 0;

    return (
        <div
            className={`${styles.boxWidth} absolute top-0 left-0 w-full py-2 sm:py-4 px-2 sm:px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <div className="border border-hh-orange bg-white/95 rounded-md shadow px-2 lg:px-4 2xl:px-0">
                <nav>
                    {/* Desktop Navigation */}
                    <ul className="hidden lg:flex justify-between max-w-6xl mx-auto items-center">
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
                            <button
                                onClick={() => goToStep(1)}
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
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => goToStep(2)}
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
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => goToStep(3)}
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
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => goToStep(4)}
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
                            </button>
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

                    {/* Mobile Navigation */}
                    <div className="lg:hidden flex justify-between items-center p-3">
                        <a href="/" className="-m-1.5 p-1.5">
                            <span className="sr-only">Hot Huts</span>
                            <img
                                alt="Picture of Hot Huts logo"
                                src="/storage/images/logo.png"
                                className="h-10 w-auto"
                            />
                        </a>

                        <div className="flex items-center gap-3">
                            {/* Mobile Basket */}
                            <div className="relative">
                                <button
                                    ref={btnRef}
                                    type="button"
                                    disabled={!hasItems}
                                    onClick={() =>
                                        hasItems && setOpen((v) => !v)
                                    }
                                    className={`flex items-center gap-1 rounded py-2 px-2 ${
                                        hasItems
                                            ? "text-hh-orange hover:bg-orange-50"
                                            : "text-gray-400 cursor-default"
                                    }`}
                                >
                                    <ShoppingCartIcon className="h-6 w-6" />
                                    <span
                                        className={`inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs ${
                                            hasItems
                                                ? "bg-hh-orange text-white"
                                                : "bg-gray-200 text-gray-500"
                                        }`}
                                    >
                                        {items.length}
                                    </span>
                                </button>

                                {/* Mobile Dropdown */}
                                {open && (
                                    <div
                                        ref={menuRef}
                                        role="menu"
                                        className="absolute right-0 mt-2 w-[300px] z-50 rounded-md border border-hh-orange bg-white shadow-lg"
                                    >
                                        <div className="p-3 max-h-60 overflow-y-auto">
                                            {items.map((it) => (
                                                <div
                                                    key={it.id}
                                                    className="border border-gray-200 rounded p-2 mb-2 last:mb-0"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-black truncate">
                                                                {it.kind ===
                                                                "event"
                                                                    ? it.event_name
                                                                    : "Sauna session"}
                                                            </p>
                                                            <p className="text-xs text-black/60 truncate">
                                                                {
                                                                    it.location_name
                                                                }
                                                                {it.date
                                                                    ? ` • ${it.date}`
                                                                    : ""}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                removeItem(
                                                                    it.id
                                                                )
                                                            }
                                                            className="text-xs text-red-600 hover:text-red-700 ml-2"
                                                            title="Remove"
                                                        >
                                                            <XMarkIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="mt-1 flex justify-between text-sm">
                                                        <span className="text-black/60">
                                                            Qty:{" "}
                                                            {it.people ?? 1}
                                                        </span>
                                                        <span className="font-medium">
                                                            R
                                                            {Number(
                                                                it.lineTotal ||
                                                                    0
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
                                                Checkout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="text-hh-orange p-2"
                            >
                                <Bars3Icon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {mobileMenuOpen && (
                        <div
                            className="lg:hidden fixed inset-0 z-50 bg-black/50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <div
                                className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg font-semibold text-hh-orange">
                                            Menu
                                        </h2>
                                        <button
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="text-gray-500"
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            onClick={() => goToStep(1)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                                currentStep === 1
                                                    ? "bg-hh-orange/10 text-hh-orange"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            <MapPinIcon className="h-5 w-5" />
                                            <span className="font-medium">
                                                Locations
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => goToStep(2)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                                currentStep === 2
                                                    ? "bg-hh-orange/10 text-hh-orange"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            <QueueListIcon className="h-5 w-5" />
                                            <span className="font-medium">
                                                Services
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => goToStep(3)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                                currentStep === 3
                                                    ? "bg-hh-orange/10 text-hh-orange"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            <ClockIcon className="h-5 w-5" />
                                            <span className="font-medium">
                                                Date & Time
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => goToStep(4)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                                currentStep === 4
                                                    ? "bg-hh-orange/10 text-hh-orange"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            <ShoppingCartIcon className="h-5 w-5" />
                                            <span className="font-medium">
                                                Check Out
                                            </span>
                                        </button>

                                        <div className="pt-4 border-t border-gray-200">
                                            <a
                                                href="/my-bookings"
                                                className="block w-full text-center border border-hh-orange text-hh-orange py-3 rounded-lg font-medium"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                            >
                                                My Bookings
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </nav>
            </div>
        </div>
    );
}
