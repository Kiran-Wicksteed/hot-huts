import React from "react";
import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
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
            message: "",
        });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(
            route("organizations.chats.store", {
                organization: organization.id,
            })
        );
        setOpen(false);
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
                New post <PlusIcon className="h-4 w-4 ml-2" />
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
                                    <h3 className="mb-4">
                                        Share a message with the team
                                    </h3>

                                    <textarea
                                        value={data.message}
                                        id="message"
                                        placeholder="What's on your mind?"
                                        className="block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                                        onChange={(e) =>
                                            setData("message", e.target.value)
                                        }
                                    ></textarea>
                                    <InputError
                                        message={errors.message}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                    <PrimaryButton disabled={processing}>
                                        Post
                                    </PrimaryButton>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-gray-600">
                                            Saved.
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
