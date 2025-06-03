import Menu from "@/Layouts/Menu";
import Footer from "@/Layouts/Footer";
import { useState } from "react";
import ServiceSection from "@/Components/booking-form/ServiceSection";
import TimeDate from "@/Components/booking-form/TimeDate";
import InvoiceDetails from "@/Components/booking-form/InvoiceDetails";
import Locations from "@/Components/booking-form/Locations";
import Confiirmed from "@/Components/booking-form/Confiirmed";

export default function Index() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        location: {
            day: "",
            name: "",
            period: "",
            time: "",
        },
        services: {
            honey: 0,
            revive: 0,
            people: 1,
        },
        date: "",
        time: "",
        payment: {},
    });
    const goToNextStep = () => {
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const goToPrevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const updateFormData = (newData) => {
        setFormData((prev) => ({ ...prev, ...newData }));
    };

    return (
        <>
            <Menu currentStep={currentStep} />
            <div>
                {currentStep === 1 && (
                    <Locations
                        nextStep={goToNextStep}
                        updateFormData={updateFormData}
                    />
                )}

                {currentStep === 2 && (
                    <ServiceSection
                        nextStep={goToNextStep}
                        prevStep={goToPrevStep}
                        updateFormData={updateFormData}
                        servicesData={formData.services}
                        formData={formData}
                    />
                )}

                {currentStep === 3 && (
                    <TimeDate
                        nextStep={goToNextStep}
                        prevStep={goToPrevStep}
                        updateFormData={updateFormData}
                        formData={formData}
                    />
                )}

                {currentStep === 4 && (
                    <InvoiceDetails
                        nextStep={goToNextStep}
                        prevStep={goToPrevStep}
                        formData={formData}
                    />
                )}
                {currentStep === 5 && (
                    <Confiirmed
                        nextStep={goToNextStep}
                        prevStep={goToPrevStep}
                        formData={formData}
                    />
                )}
            </div>
            <Footer />
        </>
    );
}
