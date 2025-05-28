import styles from "../../../styles";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useEffect, useRef, useState } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";

const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
};

export default function SliderSection() {
    const [selectedTime, setSelectedTime] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const progressBarRef = useRef(null);

    useEffect(() => {
        const progressBar = progressBarRef.current;
        const numberOfLocations = locations.length;
        const percent = ((currentSlide + 1) / numberOfLocations) * 100;
        progressBar.style.width = `${percent}%`;
    }, [currentSlide]);

    const locations = [
        {
            name: "St James Tidal Pool",
            day: "Wednesday",
            image: "/storage/images/long-beach.png",
        },
        {
            name: "Simon's Town - Long Beach",
            day: "Wednesday",
            image: "/storage/images/long-beach.png",
        },
        {
            name: "Dalebrook Tidal Pool",
            day: "Wednesday",
            image: "/storage/images/long-beach.png",
        },
        {
            name: "Camps Bay Tidal Pool",
            day: "Wednesday",
            image: "/storage/images/long-beach.png",
        },
        {
            name: "Saunders Rock Beach",
            day: "Wednesday",
            image: "/storage/images/long-beach.png",
        },
        {
            name: "St James Tidal Pool",
            day: "Wednesday",
            image: "/storage/images/long-beach.png",
        },
    ];

    const sliderRef = useRef(null);

    const goToPrevSlide = () => {
        sliderRef.current.slickPrev();
    };

    const goToNextSlide = () => {
        sliderRef.current.slickNext();
    };

    return (
        <div
            className={`${styles.boxWidth} pt-16 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            {" "}
            <Slider
                afterChange={(index) => setCurrentSlide(index)}
                ref={sliderRef}
                {...settings}
            >
                {locations.map((item, index) => (
                    <div key={index}>
                        <div className=" max-w-[95%] mx-auto ">
                            <div
                                className={`relative border-2 rounded  overflow-hidden cursor-pointer ${
                                    selectedTime === item.name
                                        ? "border-hh-orange"
                                        : "border-hh-gray"
                                }`}
                                onClick={() => setSelectedTime(item.name)}
                            >
                                <img
                                    src={item.image}
                                    className="h-80 w-full  shadow object-cover"
                                    alt={`Picture of beach location for ${item.name}`}
                                />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white  w-[90%] p-4">
                                    <p
                                        className={`${styles.paragraph} !text-sm text-black !font-medium text-center`}
                                    >
                                        {item.name}
                                    </p>

                                    <div className="flex items-center gap-x-2 justify-center text-hh-orange">
                                        <MapPinIcon className="h-6 w-6" />
                                        <p
                                            className={`${styles.paragraph}  !font-noraml text-center`}
                                        >
                                            {item.day}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
            <div className="bg-hh-gray rounded-md w-full h-2 mt-10 mb-10 ">
                <div
                    className="progress rounded-md "
                    ref={progressBarRef}
                ></div>
            </div>
        </div>
    );
}
