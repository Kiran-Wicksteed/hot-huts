import Confirmed from "@/Components/booking-form/Confirmed";
import ConfirmedMenu from "@/Layouts/ConfirmedMenu";
import Footer from "@/Layouts/Footer";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function ConfirmedPage({
    booking,
    bookings = [],
    summary = null,
}) {
    const { clearCart, regenerateCartKey } = useCart();
    useEffect(() => {
        clearCart({ rekey: true });
        regenerateCartKey();
        try {
            localStorage.removeItem("hh_step");
            localStorage.removeItem("hh_form");
        } catch {}
    }, []);

    return (
        <>
            <ConfirmedMenu />
            <Confirmed
                booking={booking}
                bookings={bookings}
                summary={summary}
            />
            <Footer />
        </>
    );
}
