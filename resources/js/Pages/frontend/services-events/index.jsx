import EventsSection from "@/Components/services-events/EventsSection";
import Hero from "@/Components/services-events/Hero";
import Footer from "@/Layouts/Footer";
import Menu from "@/Layouts/menu";

export default function ServicesEventsPage() {
    return (
        <>
            <Menu />
            <Hero />
            <EventsSection />
            <Footer />
        </>
    );
}
