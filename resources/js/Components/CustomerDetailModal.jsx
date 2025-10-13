import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CustomerDetailModal({ userId, onClose }) {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoyaltyForm, setShowLoyaltyForm] = useState(false);
    const [loyaltyPoints, setLoyaltyPoints] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        axios
            .get(route("customers.show", userId), {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Accept": "application/json",
                },
            })
            .then((response) => {
                setCustomer(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError("Failed to load customer details");
                setLoading(false);
                console.error(err);
            });
    }, [userId]);

    const handleAdjustLoyaltyPoints = async (e) => {
        e.preventDefault();
        
        if (!loyaltyPoints || loyaltyPoints === "0") {
            alert("Please enter a valid number of points");
            return;
        }

        setSubmitting(true);

        try {
            const response = await axios.post(
                route("customers.adjustLoyaltyPoints", userId),
                {
                    points: parseInt(loyaltyPoints),
                }
            );

            // Update customer data with new loyalty info
            setCustomer({
                ...customer,
                loyalty: response.data.loyalty,
            });

            // Reset form
            setLoyaltyPoints("");
            setShowLoyaltyForm(false);
            
            alert(response.data.message);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to adjust loyalty points");
        } finally {
            setSubmitting(false);
        }
    };

    if (!userId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Customer Details
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hh-orange"></div>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {customer && !loading && (
                        <div className="space-y-6">
                            {/* Profile Section */}
                            <div className="flex items-start gap-4">
                                {customer.photo ? (
                                    <img
                                        src={customer.photo}
                                        alt={customer.name}
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-hh-orange text-white flex items-center justify-center text-2xl font-semibold">
                                        {customer.initials}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="text-2xl font-semibold text-gray-900">
                                        {customer.name}
                                    </h4>
                                    <p className="text-gray-600 mt-1">
                                        {customer.email}
                                    </p>
                                    {customer.contact_number && (
                                        <p className="text-gray-600 mt-1">
                                            {customer.contact_number}
                                        </p>
                                    )}
                                    <div className="flex gap-2 mt-2">
                                        {customer.is_admin && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                Admin
                                            </span>
                                        )}
                                        {customer.is_editor && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Editor
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">
                                        Total Bookings
                                    </p>
                                    <p className="text-2xl font-semibold text-hh-orange mt-1">
                                        {customer.stats.bookings_count}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">
                                        No Shows
                                    </p>
                                    <p className="text-2xl font-semibold text-red-600 mt-1">
                                        {customer.stats.no_show_count}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">
                                        Last Booking
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        {customer.stats.last_booking_at
                                            ? new Date(
                                                  customer.stats.last_booking_at
                                              ).toLocaleDateString()
                                            : "Never"}
                                    </p>
                                </div>
                            </div>

                            {/* Loyalty Points Section */}
                            {customer.loyalty && (
                                <div className="border-t border-b py-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="text-lg font-semibold text-gray-900">
                                            Loyalty Points
                                        </h5>
                                        <button
                                            onClick={() => setShowLoyaltyForm(!showLoyaltyForm)}
                                            className="text-sm font-medium text-hh-orange hover:text-orange-600 transition-colors"
                                        >
                                            {showLoyaltyForm ? "Cancel" : "Adjust Points"}
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                                            <p className="text-sm text-orange-800 font-medium">
                                                Current Balance
                                            </p>
                                            <p className="text-3xl font-bold text-hh-orange mt-1">
                                                {customer.loyalty.points_balance}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-600 font-medium">
                                                Lifetime Points
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                                {customer.loyalty.lifetime_points}
                                            </p>
                                        </div>
                                    </div>

                                    {showLoyaltyForm && (
                                        <form onSubmit={handleAdjustLoyaltyPoints} className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Points to Add/Remove
                                                </label>
                                                <input
                                                    type="number"
                                                    value={loyaltyPoints}
                                                    onChange={(e) => setLoyaltyPoints(e.target.value)}
                                                    placeholder="e.g., 100 or -50"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hh-orange"
                                                    disabled={submitting}
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Use positive numbers to add, negative to remove
                                                </p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full px-4 py-2 bg-hh-orange text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            >
                                                {submitting ? "Updating..." : "Update Points"}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Recent Bookings */}
                            {customer.recent_bookings &&
                                customer.recent_bookings.length > 0 && (
                                    <div>
                                        <h5 className="text-lg font-semibold text-gray-900 mb-3">
                                            Recent Bookings
                                        </h5>
                                        <div className="space-y-3">
                                            {customer.recent_bookings.map(
                                                (booking) => (
                                                    <div
                                                        key={booking.id}
                                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {booking.location ||
                                                                        "Location N/A"}
                                                                </p>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {booking.start
                                                                        ? new Date(
                                                                              booking.start
                                                                          ).toLocaleString()
                                                                        : "Time N/A"}
                                                                </p>
                                                                <div className="flex gap-2 mt-2">
                                                                    <span className="text-xs text-gray-500">
                                                                        {
                                                                            booking.people
                                                                        }{" "}
                                                                        {booking.people ===
                                                                        1
                                                                            ? "person"
                                                                            : "people"}
                                                                    </span>
                                                                    {booking.payment_method && (
                                                                        <span className="text-xs text-gray-500">
                                                                            •{" "}
                                                                            {
                                                                                booking.payment_method
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        booking.status ===
                                                                        "paid"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : booking.status ===
                                                                              "pending"
                                                                            ? "bg-yellow-100 text-yellow-800"
                                                                            : "bg-gray-100 text-gray-800"
                                                                    }`}
                                                                >
                                                                    {
                                                                        booking.status
                                                                    }
                                                                </span>
                                                                {booking.price && (
                                                                    <p className="text-sm font-medium text-gray-900 mt-2">
                                                                        R{" "}
                                                                        {booking.price.toFixed(
                                                                            2
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Member Since */}
                            <div className="text-sm text-gray-500 pt-4 border-t">
                                Member since{" "}
                                {new Date(
                                    customer.created_at
                                ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
