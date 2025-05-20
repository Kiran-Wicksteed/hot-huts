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
                        Welcome back, {user.name}.
                    </h2>
                    <p className="max-w-xl mx-auto mb-4 text-center">
                        Welcome to your central hub for all things DANCOR
                        Foundation and its portfolio of companies.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-12 lg:grid-cols-9 lg:grid-rows-1">
                        <div className="relative lg:col-span-5 overflow-hidden h-80  ring-2 ring-white rounded-md   rounded-tl-3xl glass-card">
                            <a
                                href={route("newsletters.index")}
                                className="relative  h-full flex flex-col justify-end overflow-hidden"
                            >
                                <img
                                    alt="Picture of design motif"
                                    src="/storage/photos/dashboard-motif-1.png"
                                    className="h-48 w-48 object-cover absolute -top-16 right-10"
                                />
                                <div className="p-6">
                                    <h4 className=" font-semibold">
                                        DANCOR FOUNDATION:{" "}
                                        <span className="font-normal">
                                            Newsletter
                                        </span>
                                    </h4>
                                    <small className="">
                                        Stay informed with the latest updates
                                        and initiatives shaping our community
                                        impact.
                                    </small>
                                </div>
                            </a>
                        </div>
                        <div className="relative lg:col-span-4 overflow-hidden h-80 ring-2 ring-white rounded-md rounded-tr-3xl glass-card">
                            <a
                                href={route("foundation.companies")}
                                className="relative  h-full flex flex-col justify-end overflow-hidden"
                            >
                                <img
                                    alt="Picture of design motif"
                                    src="/storage/photos/dashboard-motif-2.png"
                                    className="h-32 w-full object-contain object-right absolute top-4 right-0"
                                />
                                <div className="p-6">
                                    <h4 className=" ">Organization Profiles</h4>

                                    <small className="">
                                        Explore detailed insights into the
                                        mission and operations of each
                                        organisation.
                                    </small>
                                </div>
                            </a>
                        </div>
                        <div className="relative lg:col-span-3 overflow-hidden h-80 ring-2 ring-white rounded-md glass-card rounded-bl-3xl">
                            <a
                                href={route("organizations.policies.index", {
                                    organization: user.organization.id,
                                })}
                                className="relative  h-full flex flex-col justify-end overflow-hidden"
                            >
                                <img
                                    alt="Picture of design motif"
                                    src="/storage/photos/dashboard-motif-3.png"
                                    className="h-28 object-right-top w-full object-contain absolute top-6 right-0"
                                />
                                <div className="p-6">
                                    <h4 className=" font-semibold">
                                        {user.organization.orgName}:{" "}
                                        <span className="font-normal">
                                            Policies & Procedures
                                        </span>
                                    </h4>

                                    <small className="">
                                        Access streamlined guides and protocols
                                        to support consistent operations.
                                    </small>
                                </div>
                            </a>
                        </div>
                        <div className="relative lg:col-span-3 overflow-hidden h-80 ring-2 ring-white rounded-md glass-card ">
                            <a
                                href={route("organizations.resources.index", {
                                    organization: user.organization.id,
                                })}
                                className="relative  h-full flex flex-col justify-end overflow-hidden"
                            >
                                <img
                                    alt="Picture of design motif"
                                    src="/storage/photos/dashboard-motif-4-new.png"
                                    className="h-56 w-full object-cover object-bottom absolute top-0 right-0 border-none"
                                />
                                <div className="p-6">
                                    <h4 className="font-semibold">
                                        {user.organization.orgName}:{" "}
                                        <span className="font-normal">
                                            Resources
                                        </span>
                                    </h4>

                                    <small className="">
                                        Discover tools, documents, and support
                                        materials to enhance your workflow.
                                    </small>
                                </div>
                            </a>
                        </div>
                        <div className="relative lg:col-span-3 overflow-hidden h-80  ring-2 ring-white rounded-md glass-card rounded-br-3xl">
                            <a
                                href={route("organizations.events.index", {
                                    organization: user.organization.id,
                                })}
                                className="relative  h-full flex flex-col justify-end overflow-hidden"
                            >
                                <img
                                    alt="Picture of design motif"
                                    src="/storage/photos/dashboard-motif-5.png"
                                    className="h-56 w-full object-contain object-right absolute -top-4 right-0"
                                />
                                <div className="p-6">
                                    <h4 className=" font-semibold">
                                        {user.organization.orgName}:{" "}
                                        <span className="font-normal">
                                            Events
                                        </span>
                                    </h4>
                                    <small className=" ">
                                        Stay up-to-date with upcoming
                                        gatherings, launches, and key
                                        milestones.
                                    </small>
                                </div>
                            </a>
                        </div>
                    </div>
                    {/* <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-1">
                        <div className="relative lg:col-span-3 overflow-hidden">
                            <div className="absolute inset-px rounded-lg bg-white" />
                            <div className="relative flex h-full flex-col overflow-hidden">
                                <img
                                    alt=""
                                    src="https://tailwindui.com/plus/img/component-images/bento-01-performance.png"
                                    className="h-40 object-cover object-left"
                                />
                                <div className="p-6pt-4">
                                    <h3 className="text-sm/4 font-semibold text-indigo-600">
                                        Performance
                                    </h3>
                                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                                        Lightning-fast builds
                                    </p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit. In gravida justo et
                                        nulla efficitur, maximus egestas sem
                                        pellentesque.
                                    </p>
                                </div>
                            </div>
                            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5" />
                        </div>
                        <div className="relative lg:col-span-3">
                            <div className="absolute inset-px rounded-lg bg-white lg:rounded-tr-[2rem]" />
                            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-tr-[calc(2rem+1px)]">
                                <img
                                    alt=""
                                    src="https://tailwindui.com/plus/img/component-images/bento-01-releases.png"
                                    className="h-40 object-cover object-left lg:object-right"
                                />
                                <div className="p-6pt-4">
                                    <h3 className="text-sm/4 font-semibold text-indigo-600">
                                        Releases
                                    </h3>
                                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                                        Push to deploy
                                    </p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600">
                                        Curabitur auctor, ex quis auctor
                                        venenatis, eros arcu rhoncus massa,
                                        laoreet dapibus ex elit vitae odio.
                                    </p>
                                </div>
                            </div>
                            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-tr-[2rem]" />
                        </div>
                        <div className="relative lg:col-span-2">
                            <div className="absolute inset-px rounded-lg bg-white lg:rounded-bl-[2rem]" />
                            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-bl-[calc(2rem+1px)]">
                                <img
                                    alt=""
                                    src="https://tailwindui.com/plus/img/component-images/bento-01-speed.png"
                                    className="h-80 object-cover object-left"
                                />
                                <div className="p-6pt-4">
                                    <h3 className="text-sm/4 font-semibold text-indigo-600">
                                        Speed
                                    </h3>
                                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                                        Built for power users
                                    </p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600">
                                        Sed congue eros non finibus molestie.
                                        Vestibulum euismod augue.
                                    </p>
                                </div>
                            </div>
                            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-bl-[2rem]" />
                        </div>
                        <div className="relative lg:col-span-2">
                            <div className="absolute inset-px rounded-lg bg-white" />
                            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                                <img
                                    alt=""
                                    src="https://tailwindui.com/plus/img/component-images/bento-01-integrations.png"
                                    className="h-80 object-cover"
                                />
                                <div className="p-6pt-4">
                                    <h3 className="text-sm/4 font-semibold text-indigo-600">
                                        Integrations
                                    </h3>
                                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                                        Connect your favorite tools
                                    </p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600">
                                        Maecenas at augue sed elit dictum
                                        vulputate, in nisi aliquam maximus arcu.
                                    </p>
                                </div>
                            </div>
                            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5" />
                        </div>
                        <div className="relative lg:col-span-2">
                            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]" />
                            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-br-[calc(2rem+1px)]">
                                <img
                                    alt=""
                                    src="https://tailwindui.com/plus/img/component-images/bento-01-network.png"
                                    className="h-80 object-cover"
                                />
                                <div className="p-6pt-4">
                                    <h3 className="text-sm/4 font-semibold text-indigo-600">
                                        Network
                                    </h3>
                                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                                        Globally distributed CDN
                                    </p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600">
                                        Aenean vulputate justo commodo auctor
                                        vehicula in malesuada semper.
                                    </p>
                                </div>
                            </div>
                            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]" />
                        </div>
                    </div> */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
