import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import UploadImage from "./Partials/UploadImage";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { Transition } from "@headlessui/react";
import { useEffect, useState } from "react";

export default function Test({ galleryImages }) {
    const [open, setOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        console.log("Selected Image is", selectedImage);
    }, [selectedImage]);

    const openModal = (image) => {
        setSelectedImage(image);
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        setSelectedImage(null);
    };

    const asset = (path) => {
        return `/storage/${path}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Family Gallery" />

            <div className=" ">
                <div className="mx-auto ml-[10%] sm:px-6 lg:px-8">
                    <div className="flex gap-10">
                        <h1>
                            <span className="font-medium">Family:</span> Gallery
                        </h1>
                        <UploadImage />
                    </div>
                    <div className="my-10 ">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                            {galleryImages.map((image) => (
                                <a
                                    key={image.id}
                                    href="#"
                                    onClick={() => openModal(image)}
                                    className="group"
                                >
                                    <img
                                        alt={image.caption}
                                        src={asset(image.file)}
                                        className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-[7/8]"
                                    />
                                    <div className="flex justify-between items-start">
                                        <small>{image.caption}</small>
                                        <small>{image.user.name}</small>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
                <Dialog open={open} onClose={setOpen} className="relative z-10">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-100/95 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                    />

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <DialogPanel
                                transition
                                className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                            >
                                {selectedImage && (
                                    <img
                                        alt={selectedImage.caption}
                                        src={asset(selectedImage.file)}
                                        className=" w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 "
                                    />
                                )}
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
