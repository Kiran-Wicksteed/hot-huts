import { useState } from "react";
import styles from "../../../styles";

const schedule = {
    Monday: {
        AM: [
            { name: "Dalebrook tidal Pool", time: "6-11AM" },
            { name: "Dalebrook tidal Pool", time: "6-11AM" },
        ],
        PM: [
            { name: "Dalebrook tidal Pool", time: "4-8PM" },
            { name: "Dalebrook tidal Pool", time: "4-8PM" },
        ],
    },
    Tuesday: {
        AM: [
            { name: "Dalebrook tidal Pool", time: "6-11AM" },
            { name: "Dalebrook tidal Pool", time: "6-11AM" },
        ],
        PM: [
            { name: "Dalebrook tidal Pool", time: "4-8PM" },
            { name: "Dalebrook tidal Pool", time: "4-8PM" },
        ],
    },
    Wednesday: {
        AM: [
            { name: "Dalebrook tidal Pool", time: "6-11AM" },
            { name: "Dalebrook tidal Pool", time: "6-11AM" },
        ],
        PM: [
            { name: "Dalebrook tidal Pool", time: "4-8PM" },
            { name: "Dalebrook tidal Pool", time: "4-8PM" },
        ],
    },
    Thursday: {
        AM: [
            { name: "Dalebrook tidal Pool", time: "6-11AM" },
            { name: "Dalebrook tidal Pool", time: "6-11AM" },
        ],
        PM: [
            { name: "Dalebrook tidal Pool", time: "4-8PM" },
            { name: "Dalebrook tidal Pool", time: "4-8PM" },
        ],
    },
    Friday: {
        AM: [
            { name: "Dalebrook tidal Pool", time: "6-11AM" },
            { name: "Dalebrook tidal Pool", time: "6-11AM" },
        ],
        PM: [
            { name: "Dalebrook tidal Pool", time: "4-8PM" },
            { name: "Dalebrook tidal Pool", time: "4-8PM" },
        ],
    },
    // Add more days as needed...
};

export default function Locations({ nextStep, updateFormData }) {
    const [selected, setSelected] = useState(null);

    const handleSelect = (day, period, index) => {
        setSelected({ day, period, index });
        updateFormData({
            location: {
                day,
                period,
                ...selectedSlot,
            },
        });

        // Move to next step
        nextStep();
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
                                            selected?.day === day &&
                                            selected?.period === period &&
                                            selected?.index === index;
                                        return (
                                            <div
                                                key={index}
                                                onClick={() =>
                                                    handleSelect(
                                                        day,
                                                        period,
                                                        index
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
                {selected && (
                    <div className="pl-12">
                        <button
                            onClick={() => {
                                const selectedSlot =
                                    schedule[selected.day][selected.period][
                                        selected.index
                                    ];
                                updateFormData({
                                    location: {
                                        day: selected.day,
                                        period: selected.period,
                                        ...selectedSlot,
                                    },
                                });
                                nextStep();
                            }}
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
