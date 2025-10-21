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
    retailItems, // retail items available for sale
    retailSales = [], // retail sales for the selected date
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
    const [showRetailModal, setShowRetailModal] = useState(false);
    const [retailSalesOpen, setRetailSalesOpen] = useState(false);
    const [retailForm, setRetailForm] = useState({
        retail_item_id: '',
        location_id: locationFilter || '',
        quantity: 1,
        sale_date: dateFilter,
        note: '',
    });

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

                    {/* ════════════════════════════════════════════════════════
            RETAIL SALES SECTION (ACCORDION)
        ════════════════════════════════════════════════════════ */}
                <section className="mt-8 mb-8 shadow border border-hh-gray rounded-md bg-white">
                    {/* Accordion Header */}
                    <div 
                        className="flex justify-between items-center p-6 cursor-pointer"
                        onClick={() => setRetailSalesOpen(!retailSalesOpen)}
                    >
                        <div className="flex items-center gap-3">
                            <svg 
                                className={`w-5 h-5 text-hh-orange transition-transform ${retailSalesOpen ? 'rotate-90' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <h2 className={`${styles.h3} font-medium mb-0`}>
                                Off-site Add-ons - {dateFilter}
                                {retailSales.length > 0 && (
                                    <span className={`ml-2 ${styles.paragraph} text-hh-gray font-normal`}>
                                        ({retailSales.length} {retailSales.length === 1 ? 'sale' : 'sales'} - R{(retailSales.reduce((sum, sale) => sum + sale.total_cents, 0) / 100).toFixed(2)})
                                    </span>
                                )}
                            </h2>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowRetailModal(true);
                            }}
                            className="px-4 py-2 bg-hh-orange text-white rounded hover:bg-hh-orange/90 transition-colors text-sm font-medium"
                        >
                            + Record Sale
                        </button>
                    </div>

                    {/* Accordion Content */}
                    <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            retailSalesOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="p-6 pt-0 border-t">
                            {retailSales.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className={`px-4 py-3 text-left ${styles.paragraph} text-hh-gray uppercase`}>Item</th>
                                        <th className={`px-4 py-3 text-left ${styles.paragraph} text-hh-gray uppercase`}>Location</th>
                                        <th className={`px-4 py-3 text-left ${styles.paragraph} text-hh-gray uppercase`}>Qty</th>
                                        <th className={`px-4 py-3 text-left ${styles.paragraph} text-hh-gray uppercase`}>Price Each</th>
                                        <th className={`px-4 py-3 text-left ${styles.paragraph} text-hh-gray uppercase`}>Total</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {retailSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50">
                                            <td className={`px-4 py-3 ${styles.paragraph}`}>{sale.item_name}</td>
                                            <td className={`px-4 py-3 ${styles.paragraph}`}>{sale.location_name}</td>
                                            <td className={`px-4 py-3 ${styles.paragraph}`}>{sale.quantity}</td>
                                            <td className={`px-4 py-3 ${styles.paragraph}`}>R{(sale.price_each / 100).toFixed(2)}</td>
                                            <td className={`px-4 py-3 ${styles.paragraph} font-medium text-hh-orange`}>R{(sale.total_cents / 100).toFixed(2)}</td>
                                            <td className={`px-4 py-3 ${styles.paragraph}`}>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this sale?')) {
                                                            router.delete(route('admin.retail-sales.destroy', sale.id));
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="4" className={`px-4 py-3 ${styles.paragraph} font-medium text-right`}>Total:</td>
                                        <td className={`px-4 py-3 ${styles.h3} font-medium text-hh-orange`}>
                                            R{(retailSales.reduce((sum, sale) => sum + sale.total_cents, 0) / 100).toFixed(2)}
                                        </td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                            ) : (
                                <p className={`${styles.paragraph} text-hh-gray text-center py-8`}>No retail sales recorded for this date.</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Retail Sale Modal */}
                {showRetailModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/30" onClick={() => setShowRetailModal(false)} />
                        <div className="relative bg-white rounded-md shadow-xl w-full max-w-md p-6">
                            <h3 className={`${styles.h3} font-medium mb-6`}>Record Retail Sale</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className={`block ${styles.paragraph} font-medium mb-2`}>Item</label>
                                    <select
                                        value={retailForm.retail_item_id}
                                        onChange={(e) => setRetailForm({...retailForm, retail_item_id: e.target.value})}
                                        className={`w-full border border-hh-gray rounded p-2 ${styles.paragraph}`}
                                        required
                                    >
                                        <option value="">Select an item...</option>
                                        {retailItems.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} - R{(item.price_cents / 100).toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`block ${styles.paragraph} font-medium mb-2`}>Location</label>
                                    <select
                                        value={retailForm.location_id}
                                        onChange={(e) => setRetailForm({...retailForm, location_id: e.target.value})}
                                        className={`w-full border border-hh-gray rounded p-2 ${styles.paragraph}`}
                                    >
                                        <option value="">Select location...</option>
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`block ${styles.paragraph} font-medium mb-2`}>Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={retailForm.quantity}
                                        onChange={(e) => setRetailForm({...retailForm, quantity: parseInt(e.target.value) || 1})}
                                        className={`w-full border border-hh-gray rounded p-2 ${styles.paragraph}`}
                                    />
                                </div>

                                <div>
                                    <label className={`block ${styles.paragraph} font-medium mb-2`}>Sale Date</label>
                                    <input
                                        type="date"
                                        value={retailForm.sale_date}
                                        onChange={(e) => setRetailForm({...retailForm, sale_date: e.target.value})}
                                        className={`w-full border border-hh-gray rounded p-2 ${styles.paragraph}`}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowRetailModal(false)}
                                    className={`px-4 py-2 border border-hh-gray rounded hover:bg-gray-50 transition-colors ${styles.paragraph} font-medium`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        router.post(route('admin.retail-sales.store'), retailForm, {
                                            onSuccess: () => {
                                                setShowRetailModal(false);
                                                setRetailForm({
                                                    retail_item_id: '',
                                                    location_id: locationFilter || '',
                                                    quantity: 1,
                                                    sale_date: dateFilter,
                                                    note: '',
                                                });
                                            }
                                        });
                                    }}
                                    className={`px-4 py-2 bg-hh-orange text-white rounded hover:bg-hh-orange/90 transition-colors ${styles.paragraph} font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                                    disabled={!retailForm.retail_item_id}
                                >
                                    Record Sale
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                    <TodayBubbles
                        slots={filteredSlots}
                        bookings={filteredBookings}
                        formatTime={formatTime}
                        addonServices={addonServices}
                        retailItems={retailItems}
                    />
                </section>

                
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
