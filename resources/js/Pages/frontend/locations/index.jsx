import Menu from "@/Layouts/menu";
import Hero from "@/Components/locations/Hero";
import Calendar from "@/Components/locations/Calendar";
import SliderSection from "@/Components/locations/Slider";
import UpcomingEvents from "@/Components/locations/UpcomingEvents";

export default function LocationPage() {
    return (
        <>
            <Menu />
            <Hero />
            <Calendar />
            <SliderSection />
            <UpcomingEvents />
        </>
    );
}
