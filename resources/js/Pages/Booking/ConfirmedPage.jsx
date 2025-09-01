import Confirmed from "@/Components/booking-form/Confirmed";
import ConfirmedMenu from "@/Layouts/ConfirmedMenu";
import Footer from "@/Layouts/Footer";

export default function ConfirmedPage({
    booking,
    bookings = [],
    summary = null,
}) {
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
