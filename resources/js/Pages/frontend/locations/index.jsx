import Menu from "@/Layouts/Menu";
import Hero from "@/Components/locations/Hero";
import Calendar from "@/Components/locations/Calendar";
import SliderSection from "@/Components/locations/Slider";
import UpcomingEvents from "@/Components/locations/UpcomingEvents";
import Footer from "@/Layouts/Footer";

export default function LocationPage() {
    return (
        <>
            <Menu />
            <Hero />
            <Calendar />
            <SliderSection />
            <UpcomingEvents />
            <Footer />
        </>
    );
}
