import React from "react";

/**
 * points: integer, e.g. total loyalty points the user has
 * unit: how many points per voucher (default 4)
 */
export default function ProgressCircle({ points = 1, unit = 10 }) {
    const normalized = points % unit;
    const progress =
        normalized === 0 && points > 0 ? 100 : (normalized / unit) * 100;

    return (
        <div className="relative h-12 w-12 sm:h-14 sm:w-14">
            {/* Ring background */}
            <div className="absolute inset-0 rounded-full border border-hh-gray shadow bg-white" />
            {/* Conic progress */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `conic-gradient(#FF5733 ${progress}%, transparent ${progress}% 100%)`,
                    WebkitMask:
                        "radial-gradient(circle, transparent 55%, black 56%)",
                    mask: "radial-gradient(circle, transparent 55%, black 56%)",
                }}
                aria-hidden="true"
            />
            {/* Center number */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-black">
                    {normalized || (points > 0 ? unit : 0)}/{unit}
                </span>
            </div>
        </div>
    );
}
