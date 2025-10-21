import Confirmed from "@/Components/booking-form/Confirmed";
import ConfirmedMenu from "@/Layouts/ConfirmedMenu";
import Footer from "@/Layouts/Footer";

import { CartProvider } from "@/context/CartContext";

// Clear cart IMMEDIATELY before any React rendering
if (typeof window !== "undefined") {
    try {
        localStorage.removeItem("hh_cart_v1");
        localStorage.removeItem("hh_step");
        localStorage.removeItem("hh_form");
    } catch (e) {
        console.error("Failed to clear cart:", e);
    }
}

export default function ConfirmedPage({
    booking,
    bookings = [],
    summary = null,
}) {
    return (
        <CartProvider>
            <ConfirmedMenu />
            <Confirmed
                booking={booking}
                bookings={bookings}
                summary={summary}
            />
            <Footer />
        </CartProvider>
    );
}
