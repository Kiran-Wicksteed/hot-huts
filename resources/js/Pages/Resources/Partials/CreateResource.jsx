import React from "react";
import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { PlusIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";

const CreateChat = ({ organization }) => {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, recentlySuccessful } =
        useForm({
            title: "",
            description: "",
            file: null,
            is_family: 0,
        });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("file", file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(
            route("organizations.resources.store", {
                organization: organization.id,
            }),
            {
                onSuccess: () => {
                    setOpen(false); // Close the modal on success
                    reset(); // Reset the form
                },
                onError: (errors) => {
                    console.log(errors);
                },
            }
        );
        // setOpen(false);
    };

    return (
        <>
            <PrimaryButton
                onClick={() => {
                    setOpen(true);
                }}
                className="ms-4"
                disabled={processing}
            >
                Upload resource <ArrowUpTrayIcon className="h-4 w-4 ml-2" />
            </PrimaryButton>
            <Dialog open={open} onClose={setOpen} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-100/95 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                />

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                        >
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <h3 className="mb-4">Upload a resource</h3>

                                    <div className="mt-4 flex flex-col items-center">
                                        <InputLabel
                                            htmlFor="title"
                                            value="Resource Title"
                                        />

                                        <TextInput
                                            id="title"
                                            className="mt-1 block w-full max-w-md rounded-md "
                                            value={data.title}
                                            onChange={(e) =>
                                                setData("title", e.target.value)
                                            }
                                            required
                                            isFocused
                                            autoComplete="title"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.title}
                                        />
                                    </div>
                                    <div className="mt-4 flex flex-col items-center">
                                        <InputLabel
                                            htmlFor="description"
                                            value="Resource Description"
                                        />

                                        <TextInput
                                            id="description"
                                            className="mt-1 block w-full max-w-md rounded-md "
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            required
                                            isFocused
                                            autoComplete="description"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.description}
                                        />
                                    </div>
                                    <div className="mt-4 flex flex-col items-center">
                                        <InputLabel
                                            htmlFor="file"
                                            value="Resource File"
                                        />

                                        <input
                                            type="file"
                                            id="file"
                                            className="mt-1 block w-full max-w-md rounded-md "
                                            onChange={handleFileChange}
                                            required
                                            isFocused
                                            autoComplete="file"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.file}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                    <PrimaryButton disabled={processing}>
                                        {processing && (
                                            <svg
                                                className="animate-spin h-5 w-5 mr-3 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                        )}
                                        {processing ? "Uploading" : "Upload"}
                                    </PrimaryButton>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-gray-600">
                                            Uploaded.
                                        </p>
                                    </Transition>
                                </div>
                            </form>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default CreateChat;
