// resources/js/Pages/loyalty/index.jsx
import { usePage, Link, useForm } from "@inertiajs/react";
import styles from "../../../styles";
import FrontendSidebar from "@/Layouts/FrontendSidebar";
import ConfirmedMenu from "@/Layouts/ConfirmedMenu";
import Footer from "@/Layouts/Footer";
import ProgressCircle from "@/Components/common/ProgressCircle";

import {
    TicketIcon,
    CheckCircleIcon,
    LockClosedIcon,
    ClipboardDocumentIcon,
    UserIcon,
    GiftIcon,
} from "@heroicons/react/24/outline";

export default function LoyaltyIndex({
    vouchers = [],
    available_to_redeem = 0,
}) {
    const { auth, loyalty = {}, flash = {} } = usePage().props;
    const user = auth.user;

    const points = Number(loyalty.points ?? 0);
    const unit = Number(loyalty.unit ?? 10); // default to 10 if not sent
    const toNext = unit - (points % unit || unit);

    const rewardTypes = loyalty?.types ?? [];
    const primaryType = rewardTypes[0] ?? null; // e.g. "Free Sauna"

    const { post, processing } = useForm({
        reward_type_id: primaryType?.id ?? "",
    });

    const onRedeem = (e) => {
        e.preventDefault();
        if (!primaryType) return;
        if (points < Number(primaryType.points_cost)) return;
        post(route("loyalty.redeem"));
    };

    const asset = (path) => `${path}`;

    return (
        <>
            <ConfirmedMenu />
            <div
                className={`${styles.boxWidth} py-6 sm:py-12 px-2 sm:px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20 flex flex-col lg:flex-row gap-6 lg:gap-x-16`}
            >
                {/* Sidebar */}
                <div className="lg:block">
                    <FrontendSidebar />
                </div>

                {/* Content */}
                <div className="flex-1">
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
                        <div className="flex gap-x-3 sm:gap-x-4 items-center">
                            {user.photo ? (
                                <div className="h-12 w-12 sm:h-14 sm:w-14 overflow-hidden shrink-0 rounded-full">
                                    <img
                                        alt=""
                                        src={asset(user.photo)}
                                        className="object-cover top-0 left-0 w-full h-full"
                                    />
                                </div>
                            ) : (
                                <UserIcon
                                    aria-hidden="true"
                                    className="h-12 w-12 sm:h-14 sm:w-14 text-white bg-hh-orange rounded-full p-1.5"
                                />
                            )}

                            <p
                                className={`${styles.paragraph} !text-sm sm:!text-base text-black`}
                            >
                                Good {greeting()},{" "}
                                <span className="font-medium">
                                    {" "}
                                    {user.name}
                                </span>
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-x-4 items-center">
                            <p
                                className={`${styles.paragraph} !text-sm sm:!text-lg lg:!text-xl text-black font-medium text-center sm:text-left`}
                            >
                                Loyalty progress
                            </p>
                            <ProgressCircle points={points} unit={unit} />
                        </div>
                    </div>

                    {/* Flash message */}
                    {flash?.success && (
                        <div className="mt-4 border border-green-300 bg-green-50 text-green-800 rounded p-3 text-sm">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mt-4 border border-red-300 bg-red-50 text-red-800 rounded p-3 text-sm">
                            {flash.error}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <StatCard label="Total points" value={points} />
                        <StatCard
                            label="Points to next reward"
                            value={toNext}
                        />
                        <StatCard label="Points per reward" value={unit} />
                        <StatCard
                            label="Rewards ready to claim"
                            value={available_to_redeem}
                        />
                    </div>

                    {/* Redeem section */}
                    <section className="mt-8 border border-hh-gray rounded-md p-4 sm:p-6 bg-white/95">
                        <div className="flex items-start sm:items-center gap-3">
                            <GiftIcon className="h-6 w-6 text-hh-orange shrink-0" />
                            <h3
                                className={`${styles.h3} !text-lg font-medium text-black`}
                            >
                                Redeem a reward
                            </h3>
                        </div>

                        {primaryType ? (
                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <p className="text-sm text-black">
                                        {primaryType.name} — costs{" "}
                                        <span className="font-semibold">
                                            {primaryType.points_cost}
                                        </span>{" "}
                                        points
                                    </p>
                                    <p className="text-xs text-hh-gray">
                                        You have {points} point
                                        {points === 1 ? "" : "s"}.
                                    </p>
                                </div>

                                <form
                                    onSubmit={onRedeem}
                                    className="flex gap-3"
                                >
                                    {/* Hidden field for reward_type_id so the Controller receives it via useForm() */}
                                    <input
                                        type="hidden"
                                        name="reward_type_id"
                                        value={primaryType.id}
                                        readOnly
                                    />
                                    <button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            points <
                                                Number(
                                                    primaryType.points_cost
                                                ) ||
                                            !primaryType?.id
                                        }
                                        className={`inline-flex items-center gap-2 rounded px-4 py-2 border font-medium transition
                    ${
                        processing || points < Number(primaryType.points_cost)
                            ? "border-hh-gray text-hh-gray cursor-not-allowed"
                            : "border-hh-orange text-white bg-hh-orange hover:bg-hh-orange/90"
                    }`}
                                        title={
                                            points <
                                            Number(primaryType.points_cost)
                                                ? "Not enough points yet"
                                                : "Redeem now"
                                        }
                                    >
                                        {processing
                                            ? "Redeeming..."
                                            : `Redeem ${primaryType.name}`}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <p className="text-sm text-hh-gray mt-2">
                                No active rewards available.
                            </p>
                        )}
                    </section>

                    {/* Vouchers / Rewards list */}
                    <section className="mt-8">
                        <h2
                            className={`${styles.h2} !text-xl sm:!text-2xl font-medium text-hh-orange`}
                        >
                            My Loyalty Vouchers
                        </h2>

                        {!vouchers || vouchers.length === 0 ? (
                            <div className="border border-hh-gray px-4 sm:px-6 py-12 sm:py-16 rounded-md flex flex-col justify-center items-center shadow-md bg-white/95 mt-4">
                                <TicketIcon className="h-12 w-12 sm:h-16 sm:w-16 text-hh-gray" />
                                <h4
                                    className={`${styles.h3} !text-base sm:!text-lg mt-4 font-medium text-black text-center`}
                                >
                                    No vouchers yet
                                </h4>
                                <p
                                    className={`${styles.paragraph} !text-sm text-hh-gray text-center`}
                                >
                                    Book sessions to earn points and unlock
                                    vouchers.
                                </p>
                                <Link
                                    href={route("index")}
                                    className="bg-hh-orange rounded py-3 px-6 text-white mt-4 font-medium text-sm"
                                >
                                    Book now
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vouchers.map((v) => (
                                    <VoucherCard
                                        key={v.id || v.code}
                                        voucher={v}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* How it works */}
                    <section className="mt-10 border border-hh-gray rounded-md p-4 sm:p-6 bg-white/95">
                        <h3
                            className={`${styles.h3} !text-lg font-medium text-black`}
                        >
                            How loyalty works
                        </h3>
                        <ul className="list-disc pl-5 mt-2 text-sm text-black space-y-1">
                            <li>
                                Earn points for completed bookings (shown
                                above).
                            </li>
                            <li>Redeem rewards when you have enough points.</li>
                            <li>
                                Your redeemed rewards appear in “My Loyalty
                                Vouchers”.
                            </li>
                        </ul>
                    </section>
                </div>
            </div>

            <Footer />
        </>
    );
}

/* ------------------------ small subcomponents ------------------------ */

function StatCard({ label, value }) {
    return (
        <div className="border border-hh-gray bg-white/95 rounded-md p-4">
            <p className="text-sm text-hh-gray">{label}</p>
            <p className="text-2xl font-semibold text-black">{value}</p>
        </div>
    );
}

function VoucherCard({ voucher }) {
    const {
        code = voucher.code,
        discountText = voucher.name || "Voucher",
        expires_at = voucher.expires_at,
        status = voucher.status, // issued | reserved | redeemed | expired
        used = voucher.used, // legacy compatibility
        issued_points = voucher.issued_points,
        issued_at = voucher.issued_at,
        redeemed_at = voucher.redeemed_at,
    } = voucher;

    const available = status ? status === "issued" : !used;
    const usedUp = status ? status === "redeemed" : !!used;
    const locked = status ? status === "reserved" : false;
    const expired = status ? status === "expired" : false;

    let badgeText = "Issued";
    if (locked) badgeText = "Reserved";
    if (usedUp) badgeText = "Redeemed";
    if (expired) badgeText = "Expired";

    const border = expired
        ? "border-hh-gray"
        : locked
        ? "border-hh-gray"
        : usedUp
        ? "border-hh-gray"
        : "border-hh-orange";

    const tone = expired || locked || usedUp ? "text-hh-gray" : "text-black";

    const copyCode = async () => {
        try {
            await navigator.clipboard?.writeText(code);
        } catch (e) {
            // noop
        }
    };

    return (
        <div
            className={`border ${border} rounded-md bg-white/95 p-4 sm:p-5 shadow`}
        >
            <div className="flex items-center gap-3">
                {available && (
                    <CheckCircleIcon className="h-6 w-6 text-hh-orange" />
                )}
                {usedUp && <CheckCircleIcon className="h-6 w-6 text-hh-gray" />}
                {locked && <LockClosedIcon className="h-6 w-6 text-hh-gray" />}

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${tone}`}>
                            {discountText}
                        </p>
                        <span className="text-[11px] uppercase tracking-wide bg-gray-100 border border-hh-gray rounded px-2 py-0.5 text-hh-gray">
                            {badgeText}
                        </span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-hh-gray">
                        {issued_points != null && (
                            <span>Issued for {issued_points} pts</span>
                        )}
                        {issued_at && (
                            <span>• Issued: {formatDate(issued_at)}</span>
                        )}
                        {redeemed_at && (
                            <span>• Redeemed: {formatDate(redeemed_at)}</span>
                        )}
                        {expires_at && (
                            <span>• Expires: {formatDate(expires_at)}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <code
                    className={`text-sm ${
                        available ? "text-black" : "text-hh-gray"
                    } bg-gray-50 border border-hh-gray rounded px-2 py-1`}
                >
                    {code}
                </code>

                <button
                    type="button"
                    onClick={copyCode}
                    className={`inline-flex items-center gap-2 text-xs font-medium border rounded px-3 py-1
            ${
                available
                    ? "border-hh-orange text-hh-orange hover:bg-hh-orange/10"
                    : "border-hh-gray text-hh-gray"
            }`}
                    title="Copy voucher code"
                >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                    Copy
                </button>
            </div>

            {!available && !usedUp && locked && (
                <p className="text-xs text-hh-gray mt-2">
                    Reserved for an in-progress booking.
                </p>
            )}
            {usedUp && <p className="text-xs text-hh-gray mt-2">Used</p>}
            {expired && <p className="text-xs text-hh-gray mt-2">Expired</p>}
        </div>
    );
}

/* ------------------------------- helpers ------------------------------- */

function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
}

function formatDate(input) {
    try {
        const d = new Date(input);
        if (isNaN(d.getTime())) return String(input);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
    } catch {
        return String(input);
    }
}
