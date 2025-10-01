import React, { useEffect, useRef } from "react";

// This component receives props from the Laravel controller via Inertia
export default function RedirectToGateway({
    entityId,
    checkoutId,
    checkoutScriptUrl,
}) {
    // useRef to hold a reference to the observer so we can disconnect it
    const observer = useRef(null);
    // Create a ref for the payment form div
    const paymentFormRef = useRef(null);

    // The useEffect hook runs once when the component mounts.
    useEffect(() => {
        let isMounted = true;

        const script = document.createElement("script");
        script.src = checkoutScriptUrl;
        script.async = true;

        script.onload = () => {
            if (!isMounted || !window.Checkout) {
                console.error(
                    "Component unmounted or Checkout object not found."
                );
                return;
            }

            console.log("Peach Payments script loaded.");
            try {
                const checkout = window.Checkout.initiate({
                    key: entityId,
                    checkoutId: checkoutId,
                    // Configure payment method ordering - lower numbers appear first
                    options: {
                        ordering: {
                            APPLEPAY: 1,
                            GOOGLEPAY: 2,
                            SAMSUNGPAY: 3,
                            CARD: 4,
                        },
                        // Optionally specify which payment methods to show
                        // paymentMethods: {
                        //     include: ["CARD", "APPLEPAY", "GOOGLEPAY"],
                        // }
                    },
                });

                const paymentFormDiv = paymentFormRef.current;
                if (paymentFormDiv) {
                    const fallback =
                        paymentFormDiv.querySelector(".fallback-content");
                    if (fallback) {
                        fallback.style.display = "none";
                    }

                    const styleIframe = (iframe) => {
                        console.log("Found iframe, setting its height.");
                        iframe.style.width = "100%";
                        iframe.style.height = "70vh";
                        iframe.style.border = "none";
                    };

                    observer.current = new MutationObserver(
                        (mutationsList, obs) => {
                            for (const mutation of mutationsList) {
                                if (mutation.type === "childList") {
                                    const iframe =
                                        paymentFormDiv.querySelector("iframe");
                                    if (iframe) {
                                        styleIframe(iframe);
                                        obs.disconnect();
                                        return;
                                    }
                                }
                            }
                        }
                    );

                    // Start observing the payment form div for new children
                    observer.current.observe(paymentFormDiv, {
                        childList: true,
                        subtree: true,
                    });

                    checkout.render("#payment-form");
                    console.log("Payment form rendered.");
                }
            } catch (error) {
                console.error("Error rendering Peach Payments form:", error);
            }
        };

        script.onerror = () => {
            console.error("Failed to load the Peach Payments script.");
        };

        document.head.appendChild(script);

        // Cleanup function to run when the component unmounts
        return () => {
            isMounted = false;

            // Clear the style interval
            if (paymentFormRef.current?.dataset.styleIntervalId) {
                clearInterval(
                    Number(paymentFormRef.current.dataset.styleIntervalId)
                );
            }

            if (observer.current) {
                observer.current.disconnect();
            }
            const existingScript = document.querySelector(
                `script[src="${checkoutScriptUrl}"]`
            );
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };
    }, [checkoutScriptUrl, entityId, checkoutId]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-2xl p-4 sm:p-8 bg-white rounded-lg min-h-[80vh] shadow-md">
                <h1 className="mb-4 text-xl sm:text-2xl font-bold text-center text-gray-800">
                    Complete Your Payment
                </h1>

                <div id="payment-form" ref={paymentFormRef}>
                    {/* Fallback content while the script loads */}
                    <div className="fallback-content flex flex-col items-center justify-center py-8">
                        <svg
                            className="w-12 h-12 text-blue-600 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <p className="mt-4 text-gray-600">
                            Loading payment form...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
