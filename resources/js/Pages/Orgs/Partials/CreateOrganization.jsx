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

import OrgImageUpload from "@/Components/OrgImageUpload";

const CreateOrganization = () => {
    const [open, setOpen] = useState(false);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            orgName: "",
            photo: null,
            description: "",
            category: "",
            website: "",
        });

    const submit = (e) => {
        e.preventDefault();
        post(route("admin.organizations.store"), {
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
                Create Organization <PlusIcon className="h-4 w-4 ml-2" />
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
                                    <OrgImageUpload
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
                                        htmlFor="orgName"
                                        value="Organization Name"
                                    />

                                    <TextInput
                                        id="orgName"
                                        className="mt-1 block w-full max-w-md"
                                        value={data.orgName}
                                        onChange={(e) =>
                                            setData("orgName", e.target.value)
                                        }
                                        required
                                        isFocused
                                        autoComplete="organization"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.orgName}
                                    />
                                </div>
                                <div className="mt-4 flex flex-col items-center">
                                    <InputLabel
                                        htmlFor="orgName"
                                        value="Organization Website"
                                    />

                                    <TextInput
                                        id="website"
                                        className="mt-1 block w-full max-w-md"
                                        value={data.website}
                                        onChange={(e) =>
                                            setData("website", e.target.value)
                                        }
                                        required
                                        isFocused
                                        autoComplete="website"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.website}
                                    />
                                </div>
                                <div className="mt-4 flex flex-col items-center">
                                    <InputLabel
                                        htmlFor="description"
                                        value="Organization Description"
                                    />

                                    <textarea
                                        value={data.description}
                                        id="description"
                                        placeholder="A short description of the organization"
                                        className="mt-1 max-w-md block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                    ></textarea>
                                    <InputError
                                        message={errors.description}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4 flex flex-col items-center">
                                    <InputLabel
                                        htmlFor="category"
                                        value="Organization Category"
                                    />

                                    <select
                                        id="category"
                                        name="category"
                                        value={data.category}
                                        className="mt-1 block w-full max-w-md"
                                        onChange={(e) =>
                                            setData("category", e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select an category
                                        </option>
                                        <option value="Real Estate">
                                            Real Estate
                                        </option>
                                        <option value="Education">
                                            Education
                                        </option>
                                        <option value="Family Foundation">
                                            Family Foundation
                                        </option>
                                        <option value="Sustainable Water Solutions">
                                            Sustainable Water Solutions
                                        </option>
                                        <option value="Venture Capital">
                                            Venture Capital
                                        </option>
                                    </select>
                                    <InputError
                                        message={errors.description}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="flex items-center justify-center gap-4 my-4 w-full">
                                    <PrimaryButton disabled={processing}>
                                        Create Organization
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

export default CreateOrganization;
