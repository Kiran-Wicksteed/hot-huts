import styles from "../../../styles";

export default function Hero() {
    return (
        <div
            className={`${styles.boxWidth} pt-10 px-4 2xl:px-28 md:px-10 lg:px-16 xl:px-20`}
        >
            <h1
                className={`${styles.h3} !text-2xl !text-black font-normal max-w-3xl`}
            >
                Cold dip, warm glow: dive into the Sea, Then unwind in a
                beachfront sauna at{" "}
                <span className="text-hh-orange">St James Tidal Pool.</span>
            </h1>
        </div>
    );
}
