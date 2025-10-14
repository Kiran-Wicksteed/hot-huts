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
import { router, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";

export default function BookingPage({
    stats,
    bookings, // paginated list
    locations, // [{id,name}]
    filters, // {location_id, period}
    bookingsForDate, // today's sauna‑only bookings (already eager‑loaded in controller)
    slotsToday, // ALL sauna time‑slots for today (+ schedule/location)
    addonServices,
}) {
    const { auth } = usePage().props;
    const user = auth.user;
    const canSeePayments = Boolean(Number(user?.is_editor ?? 0));

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
    const [timeFilter, setTimeFilter] = useState("all");

    /* ────────────────────────────────────────────────────────────
     2. helper: format "09:20" etc.  Accepts either ISO or "HH:MM:SS".
  ──────────────────────────────────────────────────────────── */
    const formatTime = (t) => t.slice(0, 5);

    /* ────────────────────────────────────────────────────────────
     3. derive today's slots after location and time filters
  ──────────────────────────────────────────────────────────── */
    const filteredSlots = useMemo(() => {
        let slots = slotsToday;
        
        // Filter by location
        if (locationFilter) {
            slots = slots.filter(
                (slot) => String(slot.location_id) === locationFilter
            );
        }
        
        // Filter by time of day
        if (timeFilter !== "all") {
            slots = slots.filter((slot) => {
                if (!slot.starts_at) return false;
                
                // Parse the time string to get hour
                const [hourStr] = slot.starts_at.split(':');
                const hour = parseInt(hourStr, 10);
                
                if (timeFilter === "morning") {
                    return hour < 12;
                }
                if (timeFilter === "afternoon") {
                    return hour >= 12;
                }
                return true;
            });
        }
        
        return slots;
    }, [slotsToday, locationFilter, timeFilter]);

    const filteredBookings = useMemo(() => {
        if (timeFilter === "all") return bookingsForDate;
        
        const filtered = bookingsForDate.filter((booking) => {
            if (!booking.starts_at) return false;

            // Parse the time string to get hour
            const [hourStr] = booking.starts_at.split(':');
            const hour = parseInt(hourStr, 10);

            if (timeFilter === "morning") {
                return hour < 12;
            }
            if (timeFilter === "afternoon") {
                return hour >= 12;
            }
            return true;
        });
        
        return filtered;
    }, [bookingsForDate, timeFilter]);

    return (
        <AuthenticatedLayout>
            <div className="ml-[256px] p-6">
                {/* ════════════════════════════════════════════════════════
            ANALYTICS (unchanged – collapse if you want)
        ════════════════════════════════════════════════════════ */}
                {!canSeePayments && (
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
                )}

                {/* ════════════════════════════════════════════════════════
            BOOKINGS TODAY – bubble grid
        ════════════════════════════════════════════════════════ */}
                <section className="mt-12">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <h4 className={`${styles.h3} font-medium`}>
                            Bookings for {dateFilter}
                        </h4>
                        <div className="flex items-center gap-3 flex-wrap">
                            <select
                                value={locationFilter}
                                onChange={(e) => {
                                    const newLocationId = e.target.value;
                                    setLocationFilter(newLocationId);
                                    router.get(
                                        route("bookings.index"),
                                        {
                                            location_id: newLocationId,
                                            period: periodFilter,
                                            date: dateFilter,
                                        },
                                        { preserveState: true, replace: true }
                                    );
                                }}
                                className="border rounded p-2 bg-white text-sm"
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
                                className="border rounded p-2 bg-white text-sm"
                            />

                            <div className="inline-flex items-center gap-2 bg-gray-100 rounded p-1">
                                <button
                                    type="button"
                                    onClick={() => setTimeFilter("all")}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${timeFilter === "all" ? "bg-hh-orange text-white shadow-sm" : "bg-transparent text-gray-700 hover:bg-white"}`}>
                                    All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTimeFilter("morning")}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${timeFilter === "morning" ? "bg-hh-orange text-white shadow-sm" : "bg-transparent text-gray-700 hover:bg-white"}`}>
                                    Morning
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTimeFilter("afternoon")}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${timeFilter === "afternoon" ? "bg-hh-orange text-white shadow-sm" : "bg-transparent text-gray-700 hover:bg-white"}`}>
                                    Afternoon
                                </button>
                            </div>
                        </div>
                    </div>

                    <TodayBubbles
                        slots={filteredSlots}
                        bookings={filteredBookings}
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
