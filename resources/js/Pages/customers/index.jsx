import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import styles from "../../../styles";
import { usePage } from "@inertiajs/react";

export default function CustomerPage() {
    const { customers } = usePage().props;

    const truncateEmail = (email, maxLength) => {
        if (email.length > maxLength) {
            return email.substring(0, maxLength - 3) + "...";
        }
        return email;
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px]">
                <div className="relative lg:col-span-full overflow-hidden pt-6 pb-12">
                    <div className="col-span-full mb-6">
                        <h4
                            className={`${styles.h3} !mb-0 font-medium text-black`}
                        >
                            Customer List
                        </h4>
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-12 p-6 gap-x-4">
                        <div className="col-span-1">
                            <p className={styles.paragraph}>#No</p>
                        </div>
                        <div className="col-span-2 -ml-6">
                            <p className={styles.paragraph}>Full Name</p>
                        </div>
                        <div className="col-span-3">
                            <p className={styles.paragraph}>Email Address</p>
                        </div>
                        <div className="col-span-1 -ml-6">
                            <p className={styles.paragraph}>Number</p>
                        </div>
                        <div className="col-span-1">
                            <p className={styles.paragraph}>Role</p>
                        </div>
                        <div className="col-span-2 ml-8">
                            <p className={styles.paragraph}>Recent Booking</p>
                        </div>
                        <div className="col-span-2">
                            <p className={styles.paragraph}>Total Bookings</p>
                        </div>
                    </div>

                    {/* Table rows */}
                    <div className="col-span-full space-y-4">
                        {customers.map((customer, index) => (
                            <div
                                key={customer.id}
                                className="col-span-full bg-white shadow grid grid-cols-12 gap-x-4 items-center border border-hh-gray rounded p-6"
                            >
                                <div className="col-span-1">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999]`}
                                    >
                                        {String(index + 1).padStart(2, "0")}
                                    </p>
                                </div>
                                <div className="col-span-2 flex gap-x-2 items-center -ml-6">
                                    <div className="bg-[#999999] rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                                        <p
                                            className={`${styles.paragraph} !text-white !text-sm`}
                                        >
                                            {customer.initials}
                                        </p>
                                    </div>
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {customer.name}
                                    </p>
                                </div>
                                <div className="col-span-3">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {truncateEmail(customer.email, 24)}
                                    </p>
                                </div>
                                <div className="col-span-1 -ml-6">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {customer.contact_number}
                                    </p>
                                </div>
                                <div className="col-span-1">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {customer.role}
                                    </p>
                                </div>
                                <div className="col-span-2 ml-8">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {customer.recent_appointment}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p
                                        className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                    >
                                        {customer.total_appointments}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
