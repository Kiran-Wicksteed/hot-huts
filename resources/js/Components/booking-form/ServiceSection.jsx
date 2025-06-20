import { MapPinIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import styles from "../../../styles";
import { useMemo } from "react";

export default function ServiceSection({
    nextStep,
    prevStep,
    updateFormData,
    servicesData, // {..., SAUNA_HONEY: 2, ADDON_REVIVE : 0, people: 1 }
    formData,
    addons, // [{id, code, name, price, ...}, ...]  category==='addon'
    sessionService, // pass the one row where category==='session'
    locations,
}) {
    const { location } = formData;
    const people = servicesData.people;

    const currentLocation = useMemo(() => {
        if (!location.id) return null; // wizard hasn’t chosen yet
        return locations.find((l) => l.id === location.id);
    }, [locations, location.id]);

    const thumbSrc = currentLocation
        ? `/storage/${currentLocation.image_path}` // path from DB
        : "/storage/images/colourful-huts.png";

    /** ----------------------------------------------------------------
     * Helpers
     *----------------------------------------------------------------*/

    /** Update any quantity (people or addon) */
    const updateQuantity = (code, value) =>
        updateFormData({
            services: { ...servicesData, [code]: Math.max(0, value) },
        });

    /** Total price = session*people + Σ(addonQty*addonPrice) */
    const total = useMemo(() => {
        let sum = +sessionService.price * people;

        addons.forEach((svc) => {
            const qty = servicesData[svc.code] ?? 0;
            sum += qty * svc.price;
        });

        return sum.toFixed(2);
    }, [servicesData, addons, people, sessionService.price]);

    /** ----------------------------------------------------------------
     * Render
     *----------------------------------------------------------------*/
    return (
        <div
            className={`${styles.boxWidth} pb-28 pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <h1
                className={`${styles.h3} !text-2xl !text-black font-normal max-w-3xl`}
            >
                Cold dip, warm glow: dive into the Sea,&nbsp;then unwind in a
                beachfront sauna at&nbsp;
                <span className="text-hh-orange">{location.name}.</span>
            </h1>

            <div className="border border-hh-orange bg-white rounded-md shadow grid grid-cols-3 overflow-hidden items-center mt-10">
                {/* thumbnail */}
                <div className="col-span-1 overflow-hidden h-full">
                    <img
                        src={thumbSrc}
                        alt={
                            currentLocation ? currentLocation.name : "Hot Huts"
                        }
                        className="w-full h-full object-cover object-center"
                    />
                </div>

                {/* right panel */}
                <div className="col-span-2 py-8 px-20 space-y-6">
                    {/* Badges */}
                    <div className="flex items-center gap-x-2">
                        <div className="bg-hh-orange py-1 px-4 shadow flex items-center gap-1 text-white rounded">
                            <MapPinIcon className="h-5 w-5" />
                            <p
                                className={`${styles.paragraph} uppercase !text-sm`}
                            >
                                {location.day}
                            </p>
                        </div>
                        <div className="bg-hh-orange py-1 px-4 shadow flex items-center gap-1 text-white rounded">
                            <p
                                className={`${styles.paragraph} uppercase !text-sm`}
                            >
                                {location.time}
                            </p>
                        </div>
                    </div>

                    <h3 className={`${styles.h2} text-black font-medium`}>
                        Single Sauna Session
                    </h3>

                    {/* ----------------- ADD-ONS LIST ----------------- */}
                    <div className="space-y-2">
                        {addons.map((svc) => {
                            const qty = servicesData[svc.code] ?? 0;

                            return (
                                <div
                                    key={svc.id}
                                    className="flex justify-between items-center border border-hh-orange px-2 py-1 rounded"
                                >
                                    {/* label */}
                                    <div className="flex items-center gap-x-2">
                                        <input
                                            type="checkbox"
                                            checked={qty > 0}
                                            onChange={(e) =>
                                                updateQuantity(
                                                    svc.code,
                                                    e.target.checked ? 1 : 0
                                                )
                                            }
                                            className="h-4 w-4 text-hh-orange border-hh-orange rounded"
                                        />
                                        <label
                                            className={`${styles.paragraph} font-medium text-black`}
                                        >
                                            {svc.name} / R{svc.price}
                                        </label>
                                    </div>

                                    {/* qty picker */}
                                    <div className="flex gap-x-1">
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    svc.code,
                                                    qty - 1
                                                )
                                            }
                                            aria-label="Decrease quantity"
                                        >
                                            <MinusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                        </button>
                                        <span
                                            className={`${styles.paragraph} font-medium text-black w-6 text-center`}
                                        >
                                            {qty}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    svc.code,
                                                    Math.min(8, qty + 1)
                                                )
                                            }
                                            aria-label="Increase quantity"
                                        >
                                            <PlusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* ----------------- PEOPLE COUNT ----------------- */}
                        <div className="flex justify-between items-end pr-2 pt-6">
                            <p
                                className={`${styles.h2} text-hh-orange font-medium`}
                            >
                                R{total}
                                <span
                                    className={`ml-1 text-hh-gray ${styles.paragraph}`}
                                >
                                    / total
                                </span>
                            </p>

                            <div className="flex items-center gap-x-4">
                                <p
                                    className={`text-hh-gray ${styles.paragraph}`}
                                >
                                    No of people (max 8)
                                </p>
                                <div className="flex gap-x-1">
                                    <button
                                        onClick={() =>
                                            updateQuantity("people", people - 1)
                                        }
                                        aria-label="Decrease people"
                                    >
                                        <MinusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                    </button>
                                    <span
                                        className={`${styles.paragraph} font-medium text-black w-6 text-center`}
                                    >
                                        {people}
                                    </span>
                                    <button
                                        onClick={() =>
                                            updateQuantity(
                                                "people",
                                                Math.min(8, people + 1)
                                            )
                                        }
                                        aria-label="Increase people"
                                    >
                                        <PlusIcon className="h-6 w-6 text-black bg-[#E2E2E2] rounded-lg p-0.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* nav buttons */}
                    <div className="flex items-center gap-x-2 justify-end mt-8">
                        <button
                            onClick={prevStep}
                            className="bg-white py-1 px-4 shadow text-hh-orange rounded border-hh-orange"
                        >
                            <p
                                className={`${styles.paragraph} uppercase !text-sm`}
                            >
                                Go back
                            </p>
                        </button>
                        <button
                            onClick={nextStep}
                            className="bg-hh-orange py-1 px-4 shadow text-white rounded"
                        >
                            <p
                                className={`${styles.paragraph} uppercase !text-sm`}
                            >
                                Continue
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
