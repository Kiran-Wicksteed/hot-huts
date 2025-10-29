import Menu from "@/Layouts/menu";
import Footer from "@/Layouts/Footer";
import { useState, useEffect } from "react";
import ServiceSection from "@/Components/booking-form/ServiceSection";
import TimeDate from "@/Components/booking-form/TimeDate";
import EventTimeDate from "@/Components/booking-form/EventTimeDate";
import InvoiceDetails from "@/Components/booking-form/InvoiceDetails";
import Locations from "@/Components/booking-form/Locations";
import { CartProvider } from "@/context/CartContext";

function usePersistedState(key, defaultValue) {
    const [state, setState] = useState(() => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}

export default function Index({ locations, services, addons, events, rescheduleContext }) {
    const [currentStep, setCurrentStep] = usePersistedState("hh_step", 1);
    const [formData, setFormData] = usePersistedState("hh_form", {
        event_occurrence_id: null,
        booking_type: "sauna",
        location: {
            day: "",
            name: "",
            period: "",
            time: "",
            id: "",
            image: "",
        },
        services: makeInitialServices(services),
        date: "",
        time: "",
        timeslot_id: "",
        payment: {},
    });

    console.log("events", events);

    const sessionService = services.find((s) => s.category === "session");

    function makeInitialServices(services) {
        const obj = {};

        // Add every addon as qty 0
        services
            .filter((s) => s.category === "addon")
            .forEach((s) => {
                obj[s.code] = 0;
            });

        // Always include people count for the base session.
        obj.people = 1;

        return obj;
    }

    const goToNextStep = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
            // Scroll to top on navigation
            window.scrollTo(0, 0);
        }
    };

    const goToPrevStep = () => {
        setCurrentStep((prev) => {
            let next = prev - 1;

            // If going back into step 2 while in event flow, skip to step 1 instead
            if (formData.booking_type === "event" && next === 2) {
                next = 1;
            }

            // clamp
            if (next < 1) next = 1;

            return next;
        });
        window.scrollTo(0, 0);
    };

    const updateFormData = (newData) => {
        setFormData((prev) => ({ ...prev, ...newData }));
    };

    const isEvent = formData.booking_type === "event";

    useEffect(() => {
        if (currentStep === 2 && formData.booking_type === "event") {
            setCurrentStep(3); // jump to EventTimeDate
            window.scrollTo(0, 0);
        }
    }, [currentStep, formData.booking_type]);

    return (
        <CartProvider>
            <Menu currentStep={currentStep} />
            <div>
                {currentStep === 1 && (
                    <Locations
                        events={events}
                        nextStep={goToNextStep}
                        updateFormData={updateFormData}
                    />
                )}

                {currentStep === 2 && (
                    <ServiceSection
                        addons={addons}
                        sessionService={sessionService}
                        nextStep={goToNextStep}
                        prevStep={goToPrevStep}
                        updateFormData={updateFormData}
                        servicesData={formData.services}
                        formData={formData}
                        locations={locations}
                        events={events}
                        isReschedule={!!rescheduleContext}
                    />
                )}

                {currentStep === 3 &&
                    (isEvent ? (
                        <EventTimeDate
                            addons={addons}
                            sessionService={sessionService}
                            servicesData={formData.services}
                            nextStep={goToNextStep}
                            prevStep={goToPrevStep}
                            updateFormData={updateFormData}
                            events={events}
                            formData={formData}
                        />
                    ) : (
                        <TimeDate
                            addons={addons}
                            sessionService={sessionService}
                            servicesData={formData.services}
                            nextStep={goToNextStep}
                            prevStep={goToPrevStep}
                            updateFormData={updateFormData}
                            formData={formData}
                        />
                    ))}

                {currentStep === 4 && (
                    <InvoiceDetails
                        services={services}
                        sessionService={sessionService}
                        nextStep={goToNextStep}
                        prevStep={goToPrevStep}
                        formData={formData}
                        isReschedule={!!rescheduleContext}
                    />
                )}
            </div>
            <Footer />
        </CartProvider>
    );
}
