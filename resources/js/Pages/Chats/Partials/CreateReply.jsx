import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";

const CreateReply = ({ organization, chat, open, setOpen }) => {
    const { data, setData, post, processing, errors } = useForm({
        message: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(
            route("organizations.chats.replies.store", {
                organization: organization.id,
                chat: chat.id,
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
    };

    return (
        <>
            {open && (
                <div className="ml-12 align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="message"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Reply to this post
                            </label>
                            <textarea
                                id="message"
                                value={data.message}
                                onChange={(e) =>
                                    setData("message", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                            {errors.message && (
                                <div className="text-red-500 text-sm mt-2">
                                    {errors.message}
                                </div>
                            )}
                        </div>
                        <div className="mt-4">
                            <PrimaryButton type="submit" disabled={processing}>
                                Submit
                            </PrimaryButton>
                            <button
                                onClick={() => {
                                    setOpen(false);
                                }}
                                className="text-sm ml-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default CreateReply;
