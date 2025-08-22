/*****************************************************************
 *  Bookings > Admin dashboard
 *  – analytics cards at the top
 *  – “Bookings today” bubble view with per‑slot capacity
 *  – recent bookings table (unchanged)
 *****************************************************************/

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState, useMemo } from "react";
import styles from "../../../styles";
import TodayBubbles from "./Partials/TodayBubbles";
import { router } from "@inertiajs/react";
import { motion } from "framer-motion";

export default function BookingPage({
    stats,
    bookings, // paginated list
    locations, // [{id,name}]
    filters, // {location_id, period}
    bookingsToday, // today’s sauna‑only bookings (already eager‑loaded in controller)
    slotsToday, // ALL sauna time‑slots for today (+ schedule/location)
    addonServices,
}) {
    console.log("🔍 Inertia props:", {
        stats,
        bookings,
        locations,
        filters,
        bookingsToday,
        slotsToday,
        addonServices,
    });
    /* ────────────────────────────────────────────────────────────
     1. local state / filters
  ──────────────────────────────────────────────────────────── */
    const [locationFilter, setLocationFilter] = useState(
        filters.location_id
            ? String(filters.location_id)
            : locations.length > 0
            ? String(locations[0].id) // 👈 default to first
            : ""
    );
    const [periodFilter, setPeriodFilter] = useState(filters.period || "30");
    const [dateFilter, setDateFilter] = useState(
        filters.date || new Date().toISOString().slice(0, 10)
    );

    /* ────────────────────────────────────────────────────────────
     2. helper: format “09:20” etc.  Accepts either ISO or “HH:MM:SS”.
  ──────────────────────────────────────────────────────────── */
    const formatTime = (t) => t.slice(0, 5);

    /* ────────────────────────────────────────────────────────────
     3. derive today’s slots after location filter
  ──────────────────────────────────────────────────────────── */
    const filteredSlots = useMemo(() => {
        if (!locationFilter) return slotsToday;
        return slotsToday.filter(
            (slot) => String(slot.location_id) === locationFilter
        );
    }, [slotsToday, locationFilter]);

    return (
        <AuthenticatedLayout>
            <div className="ml-[256px] p-6">
                {/* ════════════════════════════════════════════════════════
            ANALYTICS (unchanged – collapse if you want)
        ════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-3 gap-4">
                    <AnalyticsCard
                        label="Total bookings this month"
                        value={stats.bookingsThisMonth}
                    />
                    <AnalyticsCard
                        label="Today’s bookings"
                        value={stats.todaysBookings}
                    />
                    <AnalyticsCard
                        label="Revenue this month"
                        value={`R ${stats.totalRevenue}`}
                    />
                </div>

                {/* ════════════════════════════════════════════════════════
            BOOKINGS TODAY – bubble grid
        ════════════════════════════════════════════════════════ */}
                <section className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className={`${styles.h3} font-medium`}>
                            Bookings for {dateFilter}
                        </h4>
                        <div>
                            <select
                                value={locationFilter}
                                onChange={(e) =>
                                    setLocationFilter(e.target.value)
                                }
                                className="border rounded p-2 bg-white w-fit"
                            >
                                {locations.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => {
                                    setDateFilter(e.target.value);
                                    router.get(
                                        route("bookings.index"),
                                        {
                                            location_id: locationFilter,
                                            period: periodFilter,
                                            date: e.target.value,
                                        },
                                        { preserveState: true, replace: true }
                                    );
                                }}
                                className="border rounded p-2 bg-white ml-4"
                            />
                        </div>
                    </div>

                    <TodayBubbles
                        slots={filteredSlots}
                        bookings={bookingsToday}
                        formatTime={formatTime}
                        addonServices={addonServices}
                    />
                </section>

                {/* ════════════════════════════════════════════════════════
            RECENT BOOKINGS TABLE  (your old table – untouched)
        ════════════════════════════════════════════════════════ */}
                {/* … keep your existing table code here if you still want it … */}
            </div>
        </AuthenticatedLayout>
    );
}

/* ────────────────────────────────────────────────────────────
   Re‑usable little card
──────────────────────────────────────────────────────────── */
const AnalyticsCard = ({ label, value }) => (
    <div className="shadow border border-hh-gray rounded-md bg-white p-6">
        <p className={`${styles.h2} text-hh-orange font-medium mb-1`}>
            {value}
        </p>
        <p className={`${styles.paragraph} text-hh-gray text-sm`}>{label}</p>
    </div>
);
