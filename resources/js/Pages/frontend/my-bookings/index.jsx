import ContentSection from "@/Components/my-bookings/ContentSection";
import Footer from "@/Layouts/Footer";
import ConfirmedMenu from "@/Layouts/ConfirmedMenu";

export default function MyBookings({ events, upcoming, past }) {
    return (
        <>
            <ConfirmedMenu />
            <ContentSection upcoming={upcoming} events={events} past={past} />
            <Footer />
        </>
    );
}
