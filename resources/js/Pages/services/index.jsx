import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import styles from "../../../styles";
import { router } from "@inertiajs/react";
import { useState } from "react";
import CreateService from "./Partials/CreateService";
import CreateRetailItem from "./Partials/CreateRetailItem";
import CreateMembershipService from "./Partials/CreateMembershipService";

export default function ServicesPage({ services, retailItems, membershipServices = [] }) {
    const [editingService, setEditingService] = useState(null);
    const [editingRetail, setEditingRetail] = useState(null);
    const [editingMembership, setEditingMembership] = useState(null);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [retailOpen, setRetailOpen] = useState(false);
    const [membershipOpen, setMembershipOpen] = useState(false);

    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px]">
                <div className="relative lg:col-span-full overflow-hidden pt-6 pb-12 space-y-6">
                    <section className="shadow border border-hh-gray rounded-md bg-white">
                        <button
                            type="button"
                            onClick={() => setServicesOpen((prev) => !prev)}
                            className="w-full flex justify-between items-center p-6"
                        >
                            <div>
                                <h4 className={`${styles.h3} !mb-0 font-medium text-black text-left`}>
                                    On-site Services
                                </h4>
                                <p className={`${styles.paragraph} text-hh-gray mt-1 text-left`}>
                                    These services can be attached to bookings by the team.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-hh-gray">
                                    {services.length} item{services.length === 1 ? "" : "s"}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-hh-orange transition-transform ${servicesOpen ? "rotate-180" : "rotate-0"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        <div
                            className={`border-t border-hh-gray/60 transition-all duration-300 ease-in-out ${servicesOpen
                                ? "max-h-[2000px] opacity-100"
                                : "max-h-0 opacity-0 overflow-hidden"}
                        `}
                        >
                            <div className="flex justify-end p-6 pt-4">
                                <button
                                    onClick={() => setEditingService({})}
                                    className="bg-white shadow-md border text-hh-orange border-hh-orange hover:bg-hh-orange hover:text-white p-2 px-8 rounded transition-all cursor-pointer"
                                >
                                    <p className={`${styles.paragraph} whitespace-nowrap`}>
                                        Add a new service
                                    </p>
                                </button>
                            </div>

                            <div className="grid grid-cols-12 p-6 gap-x-4">
                                <div className="col-span-1">
                                    <p className={`${styles.paragraph} text-black`}>ID</p>
                                </div>
                                <div className="col-span-2">
                                    <p className={`${styles.paragraph} text-black`}>Code</p>
                                </div>
                                <div className="col-span-3">
                                    <p className={`${styles.paragraph} text-black`}>Name</p>
                                </div>
                                <div className="col-span-2">
                                    <p className={`${styles.paragraph} text-black`}>Category</p>
                                </div>
                                <div className="col-span-2">
                                    <p className={`${styles.paragraph} text-black`}>Price</p>
                                </div>
                                <div className="col-span-1">
                                    <p className={`${styles.paragraph} text-black`}>Active</p>
                                </div>
                                <div className="col-span-1 text-right">
                                    <p className={`${styles.paragraph} text-black`}>Actions</p>
                                </div>
                            </div>

                            <div className="col-span-full space-y-4 pb-6">
                                {services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="col-span-full bg-white shadow grid grid-cols-12 gap-x-4 items-center border border-hh-gray rounded-md p-6"
                                    >
                                        <div className="col-span-1">
                                            <p className={`${styles.paragraph} !text-[#999999]`}>
                                                {service.id}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className={`${styles.paragraph} !text-[#999999] !text-sm`}>
                                                {service.code}
                                            </p>
                                        </div>
                                        <div className="col-span-3">
                                            <p className={`${styles.paragraph} !text-[#999999] !text-sm`}>
                                                {service.name}
                                            </p>
                                            {service.description && (
                                                <p className={`${styles.paragraph} text-hh-gray text-xs mt-1`}>
                                                    {service.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            <p className={`${styles.paragraph} !text-[#999999] !text-sm`}>
                                                R{service.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="col-span-1">
                                            <p className={`${styles.paragraph} !text-[#999999] !text-sm`}>
                                                {service.active ? "Yes" : "No"}
                                            </p>
                                        </div>
                                        <div className="col-span-1 flex gap-x-3 justify-end items-center">
                                            <button
                                                onClick={() => setEditingService(service)}
                                                className={`${styles.paragraph} text-black hover:text-hh-orange transition-all !text-sm`}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Delete this service?")) {
                                                        router.delete(route("services.destroy", service.id));
                                                    }
                                                }}
                                                className={`${styles.paragraph} text-black hover:text-red-500 transition-all !text-sm`}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {services.length === 0 && (
                                    <div className="border border-dashed border-hh-gray rounded-md p-6 text-center">
                                        <p className={`${styles.paragraph} text-hh-gray`}>
                                            No services configured yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="shadow border border-hh-gray rounded-md bg-white">
                        <button
                            type="button"
                            onClick={() => setMembershipOpen((prev) => !prev)}
                            className="w-full flex justify-between items-center p-6"
                        >
                            <div>
                                <h4 className={`${styles.h3} !mb-0 font-medium text-black text-left`}>
                                    Membership services
                                </h4>
                                <p className={`${styles.paragraph} text-hh-gray mt-1 text-left`}>
                                    Configure the plans members can purchase online and in-store.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-hh-gray">
                                    {membershipServices.length} item{membershipServices.length === 1 ? "" : "s"}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-hh-orange transition-transform ${membershipOpen ? "rotate-180" : "rotate-0"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        <div
                            className={`border-t border-hh-gray/60 transition-all duration-300 ease-in-out ${membershipOpen
                                ? "max-h-[2000px] opacity-100"
                                : "max-h-0 opacity-0 overflow-hidden"}
                        `}
                        >
                            <div className="flex justify-end p-6 pt-4">
                                <button
                                    onClick={() => setEditingMembership({})}
                                    className="bg-white shadow-md border text-hh-orange border-hh-orange hover:bg-hh-orange hover:text-white p-2 px-8 rounded transition-all cursor-pointer"
                                >
                                    <p className={`${styles.paragraph} whitespace-nowrap`}>
                                        Add membership option
                                    </p>
                                </button>
                            </div>

                            <div className="grid grid-cols-12 p-6 gap-x-4">
                                <div className="col-span-1">
                                    <p className={`${styles.paragraph} text-black`}>ID</p>
                                </div>
                                <div className="col-span-2">
                                    <p className={`${styles.paragraph} text-black`}>Code</p>
                                </div>
                                <div className="col-span-4">
                                    <p className={`${styles.paragraph} text-black`}>Name</p>
                                </div>
                                <div className="col-span-3">
                                    <p className={`${styles.paragraph} text-black`}>Price</p>
                                </div>
                                <div className="col-span-1">
                                    <p className={`${styles.paragraph} text-black`}>Active</p>
                                </div>
                                <div className="col-span-1 text-right">
                                    <p className={`${styles.paragraph} text-black`}>Actions</p>
                                </div>
                            </div>

                            <div className="col-span-full space-y-4 pb-6">
                                {membershipServices.map((service) => (
                                    <div
                                        key={service.id}
                                        className="grid grid-cols-12 gap-x-4 px-6 py-4 border-b last:border-b-0"
                                    >
                                        <div className="col-span-1">
                                            <p className={`${styles.paragraph} text-black`}>{service.id}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className={`${styles.paragraph} text-black`}>{service.code}</p>
                                        </div>
                                        <div className="col-span-4">
                                            <p className={`${styles.paragraph} text-black font-medium`}>{service.name}</p>
                                            {service.description && (
                                                <p className={`${styles.paragraph} text-sm text-hh-gray mt-1 truncate`}>
                                                    {service.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-span-3">
                                            <p className={`${styles.paragraph} text-black`}>R{Number(service.price).toFixed(2)}</p>
                                        </div>
                                        <div className="col-span-1">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${service.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                            >
                                                {service.is_active ? "Yes" : "No"}
                                            </span>
                                        </div>
                                        <div className="col-span-1 text-right flex flex-col gap-2 items-end">
                                            <button
                                                onClick={() => setEditingMembership(service)}
                                                className={`${styles.paragraph} text-hh-orange hover:text-hh-deep-orange transition-all !text-sm`}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Delete this membership service?")) {
                                                        router.delete(route("membership-services.destroy", service.id));
                                                    }
                                                }}
                                                className={`${styles.paragraph} text-black hover:text-red-500 transition-all !text-sm`}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {membershipServices.length === 0 && (
                                    <div className="border border-dashed border-hh-gray rounded-md p-6 text-center">
                                        <p className={`${styles.paragraph} text-hh-gray`}>
                                            No membership services configured yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="shadow border border-hh-gray rounded-md bg-white">
                        <button
                            type="button"
                            onClick={() => setRetailOpen((prev) => !prev)}
                            className="w-full flex justify-between items-center p-6"
                        >
                            <div>
                                <h4 className={`${styles.h3} !mb-0 font-medium text-black text-left`}>
                                    Off-site items
                                </h4>
                                <p className={`${styles.paragraph} text-hh-gray mt-1 text-left`}>
                                    These items can be sold to customers.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-hh-gray">
                                    {retailItems.length} item{retailItems.length === 1 ? "" : "s"}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-hh-orange transition-transform ${retailOpen ? "rotate-180" : "rotate-0"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        <div
                            className={`border-t border-hh-gray/60 transition-all duration-300 ease-in-out ${retailOpen
                                ? "max-h-[2000px] opacity-100"
                                : "max-h-0 opacity-0 overflow-hidden"}
                        `}
                        >
                            <div className="flex justify-end p-6 pt-4">
                                <button
                                    onClick={() => setEditingRetail({})}
                                    className="bg-white shadow-md border text-hh-orange border-hh-orange hover:bg-hh-orange hover:text-white p-2 px-8 rounded transition-all cursor-pointer"
                                >
                                    <p className={`${styles.paragraph} whitespace-nowrap`}>
                                        Add a new retail item
                                    </p>
                                </button>
                            </div>

                            <div className="grid grid-cols-12 p-6 gap-x-4">
                                <div className="col-span-1">
                                    <p className={`${styles.paragraph} text-black`}>ID</p>
                                </div>
                                <div className="col-span-2">
                                    <p className={`${styles.paragraph} text-black`}>Code</p>
                                </div>
                                <div className="col-span-3">
                                    <p className={`${styles.paragraph} text-black`}>Name</p>
                                </div>
                                <div className="col-span-2">
                                    <p className={`${styles.paragraph} text-black`}>Category</p>
                                </div>
                                <div className="col-span-2">
                                    <p className={`${styles.paragraph} text-black`}>Price</p>
                                </div>
                                <div className="col-span-1">
                                    <p className={`${styles.paragraph} text-black`}>Active</p>
                                </div>
                                <div className="col-span-1 text-right">
                                    <p className={`${styles.paragraph} text-black`}>Actions</p>
                                </div>
                            </div>

                            <div className="col-span-full space-y-4 pb-6">
                                {retailItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="col-span-full bg-white shadow grid grid-cols-12 gap-x-4 items-center border border-hh-gray rounded-md p-6"
                                    >
                                        <div className="col-span-1">
                                            <p className={`${styles.paragraph} !text-[#999999]`}>
                                                {item.id}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className={`${styles.paragraph} !text-[#999999] !text-sm`}>
                                                {item.code}
                                            </p>
                                        </div>
                                        <div className="col-span-3">
                                            <p className={`${styles.paragraph} !text-[#999999] !text-sm`}>
                                                {item.name}
                                            </p>
                                            {item.description && (
                                                <p className={`${styles.paragraph} text-hh-gray text-xs mt-1`}>
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            <p className={`${styles.paragraph} !text-[#999999] !text-sm`}>
                                                R{item.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="col-span-1">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                    item.is_active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-200 text-gray-600"
                                                }`}
                                            >
                                                {item.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex gap-x-3 justify-end items-center">
                                            <button
                                                onClick={() => setEditingRetail(item)}
                                                className={`${styles.paragraph} text-black hover:text-hh-orange transition-all !text-sm`}
                                            >
                                                Edit
                                            </button>
                                            {item.is_active ? (
                                                <button
                                                    onClick={() => {
                                                        if (confirm("Deactivate this add-on?")) {
                                                            router.delete(route("retail-items.destroy", item.id));
                                                        }
                                                    }}
                                                    className={`${styles.paragraph} text-red-500 hover:text-red-700 transition-all !text-sm`}
                                                >
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => router.post(route("retail-items.restore", item.id))}
                                                    className={`${styles.paragraph} text-green-600 hover:text-green-800 transition-all !text-sm`}
                                                >
                                                    Activate
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm("Permanently delete this add-on? This cannot be undone.")) {
                                                        router.delete(route("retail-items.force-destroy", item.id));
                                                    }
                                                }}
                                                className={`${styles.paragraph} text-red-500 hover:text-red-700 transition-all !text-sm`}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {retailItems.length === 0 && (
                                    <div className="border border-dashed border-hh-gray rounded-md p-6 text-center">
                                        <p className={`${styles.paragraph} text-hh-gray`}>
                                            No retail items configured yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
                {editingService !== null && (
                    <CreateService
                        item={editingService}
                        onClose={() => setEditingService(null)}
                    />
                )}
                {editingRetail !== null && (
                    <CreateRetailItem
                        item={editingRetail}
                        onClose={() => setEditingRetail(null)}
                    />
                )}
                {editingMembership !== null && (
                    <CreateMembershipService
                        item={editingMembership}
                        onClose={() => setEditingMembership(null)}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
