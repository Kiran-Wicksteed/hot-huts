import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function CancelBookingModal({ booking, isOpen, onClose }) {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (isOpen && booking) {
            setLoading(true);
            fetch(route('bookings.cancel.preview', booking.id))
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    setPreview(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load cancellation preview', err);
                    setPreview({
                        can_cancel: false,
                        message: 'Failed to load cancellation details. Please try again or contact support.'
                    });
                    setLoading(false);
                });
        }
    }, [isOpen, booking]);

    const handleCancel = () => {
        setConfirming(true);
        router.post(
            route('bookings.cancel', booking.id),
            { reason },
            {
                onSuccess: () => {
                    onClose();
                    setReason('');
                    setConfirming(false);
                },
                onError: () => {
                    setConfirming(false);
                },
            }
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Cancel Booking
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            <p className="mt-2 text-gray-600">Loading cancellation details...</p>
                        </div>
                    ) : preview && !preview.can_cancel ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">{preview.message}</p>
                        </div>
                    ) : preview ? (
                        <>
                            {/* Booking Details */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Booking Amount:</span>
                                        <span className="font-medium">R{preview.booking_amount?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Session Time:</span>
                                        <span className="font-medium">
                                            {new Date(preview.session_time).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Hours Until Session:</span>
                                        <span className="font-medium">{Math.floor(preview.hours_until_session)} hours</span>
                                    </div>
                                </div>
                            </div>

                            {/* Refund Information */}
                            <div className={`rounded-lg p-4 mb-6 border ${
                                preview.refund_percentage === 100 
                                    ? 'bg-green-50 border-green-200'
                                    : preview.refund_percentage === 50
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-red-50 border-red-200'
                            }`}>
                                <h3 className="font-semibold mb-3">
                                    {preview.refund_percentage === 100 && '✓ Full Refund'}
                                    {preview.refund_percentage === 50 && '⚠ Partial Refund'}
                                    {preview.refund_percentage === 0 && '✗ No Refund'}
                                </h3>
                                <p className="text-sm mb-3">{preview.message}</p>
                                
                                {preview.refund_amount_cents > 0 && (
                                    <div className="bg-white rounded p-3 mt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Refund Amount:</span>
                                            <span className="text-lg font-bold text-green-600">
                                                R{(preview.refund_amount_cents / 100).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">
                                            You will receive a coupon code that can be used for future bookings. 
                                            The coupon can be partially redeemed and expires in 6 months.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Cancellation Policy */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-blue-900 mb-2">Cancellation Policy</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• <strong>More than 24 hours:</strong> Full refund as coupon</li>
                                    <li>• <strong>4-24 hours:</strong> 50% refund as coupon</li>
                                    <li>• <strong>Less than 4 hours:</strong> No refund</li>
                                </ul>
                            </div>

                            {/* Optional Reason */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Cancellation (Optional)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Let us know why you're cancelling..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    disabled={confirming}
                                >
                                    Keep Booking
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={confirming}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {confirming ? 'Cancelling...' : 'Confirm Cancellation'}
                                </button>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
