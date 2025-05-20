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

import GalleryImageUpload from "@/Components/GalleryImageUpload";

const UploadImage = () => {
    const [open, setOpen] = useState(false);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            file: null,
            caption: "",
        });

    const submit = (e) => {
        e.preventDefault();
        post(route("family.gallery.store"), {
            onSuccess: () => {
                setOpen(false); // Close the modal on success
                reset(); // Reset the form
            },
            onError: (errors) => {
                console.log(errors);
            },
        });
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
                Add to gallery <PlusIcon className="h-4 w-4 ml-2" />
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
                            <form
                                onSubmit={submit}
                                encType="multipart/form-data"
                            >
                                <div className=" flex flex-col items-center justify-center mt-4 ">
                                    <GalleryImageUpload
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                    <InputError
                                        message={errors.photo}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4 flex flex-col items-center">
                                    <InputLabel
                                        htmlFor="caption"
                                        value="Image Caption"
                                    />

                                    <TextInput
                                        id="caption"
                                        className="mt-1 block w-full max-w-md"
                                        value={data.caption}
                                        onChange={(e) =>
                                            setData("caption", e.target.value)
                                        }
                                        required
                                        isFocused
                                        autoComplete="caption"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.caption}
                                    />
                                </div>

                                <div className="flex items-center justify-center gap-4 my-4 w-full">
                                    <PrimaryButton disabled={processing}>
                                        Upload Image
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

export default UploadImage;
