import React from "react";
import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { EnvelopeIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";

const InviteTeam = ({ organization }) => {
    const [open, setOpen] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        recentlySuccessful,
    } = useForm({
        email: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("team.invite"), {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
            onError: (errors) => {
                console.error(errors); // Log errors to the console
                // Optionally, you can set error messages in the state to display them in the UI
            },
        });
    };

    return (
        <div>
            <button
                onClick={() => {
                    setOpen(true);
                }}
                className="px-4 mt-4  bg-d-blue-dark rounded-full w-fit flex items-center cursor-pointer"
            >
                <p className="text-white">Invite Team</p>
                <UserPlusIcon className="h-5 w-5 ml-2 text-white" />
            </button>
            <Dialog open={open} onClose={setOpen} className="relative z-50">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-100/95 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                />

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform  glass overflow-hidden rounded-lg  px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                        >
                            <div className="mx-auto max-w-lg">
                                <div>
                                    <div className="text-center">
                                        <svg
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                            className="mx-auto size-12 text-gray-900"
                                        >
                                            <path
                                                d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <h3 className="mt-2 mb-3">
                                            Invite the rest of the team
                                        </h3>
                                        <small className=" ">
                                            Invite your team members to
                                            collaborate by granting them access
                                            to the dashboard.
                                        </small>
                                    </div>
                                    <form
                                        onSubmit={handleSubmit}
                                        className="mt-6 flex"
                                    >
                                        <label
                                            htmlFor="email"
                                            className="sr-only"
                                        >
                                            Email address
                                        </label>
                                        <div className="w-full">
                                            <input
                                                value={data.email}
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter an email"
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 "
                                            />
                                            <InputError
                                                message={errors.email}
                                                className="mt-2"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="ml-4 h-fit flex items-center shrink-0 rounded-md bg-d-blue-dark px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-d-blue-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
                                        >
                                            Send invite
                                            <EnvelopeIcon className="size-5 ml-2" />{" "}
                                        </button>
                                    </form>
                                    {recentlySuccessful && (
                                        <div className="mt-4 text-green-600">
                                            <p>Invitation sent successfully!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default InviteTeam;
