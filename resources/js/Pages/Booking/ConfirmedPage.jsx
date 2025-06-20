import Confirmed from "@/Components/booking-form/Confirmed";
import ConfirmedMenu from "@/Layouts/ConfirmedMenu";
import Footer from "@/Layouts/Footer";
export default function ConfirmedPage({ booking }) {
    return (
        <>
            <ConfirmedMenu />
            <Confirmed booking={booking} />
            <Footer />
        </>
    ); // just reuse it
}
