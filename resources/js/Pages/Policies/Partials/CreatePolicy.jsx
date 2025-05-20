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
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
    ClassicEditor,
    Bold,
    Essentials,
    Italic,
    Link,
    Heading,
    Mention,
    Paragraph,
    Undo,
    List,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

const CreatePolicy = ({ organization }) => {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, recentlySuccessful } =
        useForm({
            title: "",
            description: "",
            content: null,
        });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(
            route("organizations.policies.store", {
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
                New policy or procedure <PlusIcon className="h-4 w-4 ml-2" />
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
                            className="relative transform  bg-white overflow-hidden rounded-lg  px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                        >
                            <form onSubmit={handleSubmit} className="">
                                <div>
                                    <h3 className="mb-4">
                                        Create a new policy
                                    </h3>

                                    <div className="mt-4 ">
                                        <InputLabel
                                            htmlFor="title"
                                            value="Policy Title"
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

                                    <div className="mt-4 ">
                                        <InputLabel
                                            htmlFor="description"
                                            value="Policy Description"
                                        />

                                        <TextInput
                                            id="title"
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

                                    <div className="mt-4 ">
                                        <InputLabel
                                            htmlFor="content"
                                            value="Policy Content"
                                        />
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={data.content}
                                            onChange={(event, editor) => {
                                                const content =
                                                    editor.getData();
                                                setData("content", content);
                                            }}
                                            config={{
                                                toolbar: {
                                                    items: [
                                                        "undo",
                                                        "redo",
                                                        "|",
                                                        "bold",
                                                        "italic",
                                                        "link",
                                                        "Heading",
                                                        "bulletedList",
                                                        "numberedList",
                                                    ],
                                                },
                                                plugins: [
                                                    Bold,
                                                    Essentials,
                                                    Italic,
                                                    Mention,
                                                    Paragraph,
                                                    Link,
                                                    List,
                                                    Undo,
                                                    Heading,
                                                ],
                                                initialData: "",
                                            }}
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.content}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                    <PrimaryButton disabled={processing}>
                                        Create Policy
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

export default CreatePolicy;
