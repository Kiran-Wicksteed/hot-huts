import styles from "../../../styles";
import { usePage } from "@inertiajs/react";

export default function Confiirmed() {
    const { auth } = usePage().props;
    const user = auth.user;

    const asset = (path) => {
        return `/storage/${path}`;
    };

    return (
        <div className={`max-w-2xl mx-auto py-32`}>
            <h1
                className={`${styles.h3} !mb-2 !text-2xl font-medium !text-hh-orange text-center`}
            >
                Thanks {user.name}, your booking is confirmed
            </h1>
            <p
                className={`${styles.paragraph} !text-3xl !text-black font-medium text-center`}
            >
                St James Tidal Pool at 9:20AM
            </p>

            <div className="space-y-2 mt-10">
                <div className="bg-white flex items-center justify-between py-2 px-6 shadow rounded border border-hh-gray">
                    <p className={`${styles.paragraph}  !text-[#2C2C2C] `}>
                        Single Sauna Session
                    </p>
                    <p className={`${styles.paragraph}  !text-[#2C2C2C] `}>5</p>
                </div>
                <div className="bg-white flex items-center justify-between py-2 px-6 shadow rounded border border-hh-gray">
                    <p className={`${styles.paragraph}  !text-[#2C2C2C] `}>
                        Hot Honey
                    </p>
                    <p className={`${styles.paragraph}  !text-[#2C2C2C] `}>2</p>
                </div>
                <div className="bg-white flex items-center justify-between py-2 px-6 shadow rounded border border-hh-gray">
                    <p className={`${styles.paragraph}  !text-[#2C2C2C] `}>
                        REVIVE + Water Combo
                    </p>
                    <p className={`${styles.paragraph}  !text-[#2C2C2C] `}>0</p>
                </div>
            </div>
        </div>
    );
}
