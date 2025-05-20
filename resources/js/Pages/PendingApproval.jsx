import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Link, usePage } from "@inertiajs/react";
import styles from "../../styles";

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    console.log(user);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Home
                </h2>
            }
        >
            <Head title="Dashboard Home" />

            <div className="mx-auto ml-[15%] 2xl:ml-[10%] sm:px-6 lg:px-8">
                <div className="mx-auto ">
                    <h2
                        className={`text-2xl xl:text-3xl font-normal text-center text-black mb-6`}
                    >
                        Account Pending Approval
                    </h2>
                    <p className="max-w-xl mx-auto mb-4 text-center">
                        Hi {user.name}, your account is pending approval. You
                        will be notified once your account is approved.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
