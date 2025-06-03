import { useState } from "react";
import styles from "../../../styles";

const schedule = {
    Monday: {
        AM: [
            { name: "Dalebrook Tidal Pool", time: "6-11AM" },
            { name: "St James Tidal Pool", time: "6-11AM" },
        ],
        PM: [
            { name: "Dalebrook Tidal Pool", time: "5-8PM" },
            { name: "St James Tidal Pool", time: "5-8PM" },
        ],
    },
    Tuesday: {
        AM: [
            { name: "Dalebrook Tidal Pool", time: "6-11AM" },
            { name: "St James Tidal Pool", time: "6-11AM" },
        ],
        PM: [
            { name: "Dalebrook Tidal Pool", time: "5-8PM" },
            { name: "St James Tidal Pool", time: "5-8PM" },
        ],
    },
    Wednesday: {
        AM: [
            { name: "Dalebrook Tidal Pool", time: "6-11AM" },
            { name: "St James Tidal Pool", time: "6-11AM" },
        ],
        PM: [
            { name: "Dalebrook Tidal Pool", time: "5-8PM" },
            { name: "St James Tidal Pool", time: "5-8PM" },
        ],
    },
    Thursday: {
        AM: [
            { name: "Dalebrook Tidal Pool", time: "6-11AM" },
            { name: "St James Tidal Pool", time: "6-11AM" },
        ],
        PM: [
            { name: "Dalebrook Tidal Pool", time: "5-8PM" },
            { name: "St James Tidal Pool", time: "5-8PM" },
        ],
    },
    Friday: {
        AM: [
            { name: "Dalebrook Tidal Pool", time: "6-11AM" },
            { name: "St James Tidal Pool", time: "6-11AM" },
        ],
        PM: [
            { name: "Dalebrook Tidal Pool", time: "5-8PM" },
            { name: "St James Tidal Pool", time: "5-8PM" },
        ],
    },
    // Add more days as needed...
};

export default function Locations({ nextStep, updateFormData }) {
    const [selectedSlot, setSelectedSlot] = useState(null);

    const handleSelect = (day, period, slot) => {
        setSelectedSlot({ day, period, ...slot });
    };

    const handleNext = () => {
        if (selectedSlot) {
            updateFormData({
                location: {
                    day: selectedSlot.day,
                    name: selectedSlot.name,
                    period: selectedSlot.period,
                    time: selectedSlot.time,
                },
            });
            nextStep();
        }
    };

    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <h1 className={`${styles.h3} !text-2xl !text-black font-normal`}>
                Escape to relaxation: Book your sauna experience today
            </h1>
            <p
                className={`${styles.paragraph} !text-xl !text-black font-normal pb-12`}
            >
                Plunge into the ocean, then step straight into the warmth of our
                wood-fired beachfront sauna. Whether you’re looking to
                invigorate your morning, reset after a surf, or simply soak in
                the scenery, our Hot Huts offer a unique way to connect with
                nature while nourishing your body and mind.
            </p>
            <div className="grid grid-cols-5 pl-12 relative gap-x-6">
                <div className="absolute bottom-24 left-0">
                    <div className="space-y-36">
                        <p
                            className={`${styles.paragraph} !text-xl !text-black font-normal `}
                        >
                            AM
                        </p>
                        <p
                            className={`${styles.paragraph} !text-xl !text-black font-normal `}
                        >
                            PM
                        </p>
                    </div>
                </div>
                <div className="col-span-full mb-10">
                    <div className="flex gap-x-4 items-center">
                        <img
                            alt="Hot Huts"
                            src="/storage/images/hot-huts-logo.png"
                            className="h-28 -ml-5"
                        />
                        <p className={`text-hh-orange font-medium text-6xl`}>
                            SAUNA SCHEDULE
                        </p>
                    </div>
                </div>
                {Object.entries(schedule).map(([day, periods]) => (
                    <div key={day} className="space-y-10">
                        <div className="bg-hh-orange rounded-2xl shadow py-3 px-6">
                            <p className="text-white text-2xl uppercase text-center">
                                {day}
                            </p>
                        </div>
                        <div className="border border-hh-orange rounded-2xl divide-y divide-hh-orange">
                            {["AM", "PM"].map((period) => (
                                <div
                                    key={period}
                                    className="px-2 py-4 gap-y-4 h-48 flex flex-col justify-center"
                                >
                                    {periods[period]?.map((slot, index) => {
                                        const isSelected =
                                            selectedSlot?.day === day &&
                                            selectedSlot?.period === period &&
                                            selectedSlot?.name === slot.name &&
                                            selectedSlot?.time === slot.time;
                                        return (
                                            <div
                                                key={index}
                                                onClick={() =>
                                                    handleSelect(
                                                        day,
                                                        period,
                                                        slot
                                                    )
                                                }
                                                className={`border border-hh-orange rounded-2xl p-1.5 transition-all cursor-pointer hover:bg-hh-orange/10 ${
                                                    isSelected
                                                        ? "bg-hh-orange/10"
                                                        : ""
                                                }`}
                                            >
                                                <p className="text-hh-orange font-medium uppercase text-center leading-snug text-sm">
                                                    {slot.name}
                                                    <span className="block">
                                                        {slot.time}
                                                    </span>
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-20 mt-8">
                {selectedSlot && (
                    <div className="pl-12">
                        <button
                            onClick={handleNext}
                            className={`bg-hh-orange text-white py-2 px-6 rounded hover:bg-hh-orange/80 transition ${styles.paragraph}`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
