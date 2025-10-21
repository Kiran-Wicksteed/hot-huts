import { Head } from "@inertiajs/react";
import Footer from "@/Layouts/Footer";
import ConfirmedMenu from "@/Layouts/ConfirmedMenu";
import FrontendSidebar from "@/Layouts/FrontendSidebar";
import styles from "../../../../styles";
import { TicketIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function MyCoupons({ coupons }) {
    return (
        <>
            <Head title="My Coupons" />
            <ConfirmedMenu />
            
            <div className={`${styles.boxWidth} py-6 sm:py-12 px-2 sm:px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20 flex flex-col lg:flex-row gap-6 lg:gap-x-16`}>
                <div className="lg:block">
                    <FrontendSidebar />
                </div>
                
                <div className="flex-1">
                    <h1 className={`${styles.h2} !text-2xl sm:!text-3xl font-semibold text-black mb-6`}>
                        My Coupons
                    </h1>
                    
                    {coupons.length === 0 ? (
                        <div className="border border-hh-gray px-6 py-16 rounded-md flex flex-col justify-center items-center shadow-md">
                            <TicketIcon className="h-16 w-16 text-hh-gray" />
                            <h4 className={`${styles.h3} !text-lg mt-4 font-medium text-black text-center`}>
                                No coupons available
                            </h4>
                            <p className={`${styles.paragraph} text-center mt-2 text-hh-gray max-w-md`}>
                                Coupons from cancelled bookings will appear here. They can be used for future bookings.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {coupons.map((coupon) => (
                                <div
                                    key={coupon.id}
                                    className="border border-hh-gray rounded-lg p-6 shadow-md bg-white hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        {/* Left side - Coupon info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <TicketIcon className="h-6 w-6 text-hh-orange" />
                                                <h3 className="text-xl font-semibold text-black">
                                                    {coupon.code}
                                                </h3>
                                                {coupon.is_valid ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                                        <CheckCircleIcon className="h-4 w-4" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                                                        <XCircleIcon className="h-4 w-4" />
                                                        {coupon.status_label}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <ClockIcon className="h-4 w-4" />
                                                    <span>Expires: {coupon.expires_at}</span>
                                                </div>
                                                
                                                {coupon.source_booking_ref && (
                                                    <p className="text-gray-600">
                                                        From booking: <span className="font-medium">{coupon.source_booking_ref}</span>
                                                    </p>
                                                )}
                                                
                                                <p className="text-gray-600">
                                                    Created: {coupon.created_at}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Right side - Balance */}
                                        <div className="sm:text-right">
                                            <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                                            <p className="text-3xl font-bold text-hh-orange">
                                                R{coupon.remaining_value.toFixed(2)}
                                            </p>
                                            
                                            {coupon.used_value > 0 && (
                                                <div className="mt-3 text-sm">
                                                    <p className="text-gray-600">
                                                        Original: <span className="font-medium">R{coupon.original_value.toFixed(2)}</span>
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Used: <span className="font-medium">R{coupon.used_value.toFixed(2)}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Progress bar */}
                                    {coupon.used_value > 0 && (
                                        <div className="mt-4">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-hh-orange h-2 rounded-full transition-all"
                                                    style={{ width: `${(coupon.remaining_value / coupon.original_value) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {((coupon.remaining_value / coupon.original_value) * 100).toFixed(0)}% remaining
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Info box */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">How to use your coupons</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Enter your coupon code at checkout when making a new booking</li>
                            <li>• Coupons can be partially used - any remaining balance stays on the coupon</li>
                            <li>• Coupons expire 6 months after issue date</li>
                            <li>• Only one coupon can be used per booking</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <Footer />
        </>
    );
}
