import { Head, Link } from "@inertiajs/react";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const handleImageError = () => {
        document
            .getElementById("screenshot-container")
            ?.classList.add("!hidden");
        document.getElementById("docs-card")?.classList.add("!row-span-1");
        document
            .getElementById("docs-card-content")
            ?.classList.add("!flex-row");
        document.getElementById("background")?.classList.add("!hidden");
    };

    const asset = (path) => {
        return `/storage/${path}`;
    };

    return (
        <>
            <Head title="Welcome" />
            <div className="bg-hh-orange ">
                <div className="relative flex min-h-screen flex-col  w-full justify-start">
                    <header className="px-20 py-10 flex justify-end">
                        <nav className=" ">
                            {auth.user ? (
                                <Link
                                    href={route("dashboard")}
                                    className="rounded-md px-3 py-2 text-white font-medium ring-1 ring-white transition  focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route("login")}
                                        className="rounded-md px-3 py-2 text-white font-medium ring-1 ring-white transition  focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route("register")}
                                        className="rounded-md px-3 py-2 text-white font-medium ring-1 ring-white transition  focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="mt-6 flex items-center justify-center  flex-1">
                        <img
                            className="w-36 h-36 -translate-y-20"
                            src="/storage/images/logo.png"
                        />
                    </main>
                </div>
            </div>
        </>
    );
}
