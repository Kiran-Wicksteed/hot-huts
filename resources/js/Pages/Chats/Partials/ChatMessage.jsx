import {
    UserCircleIcon,
    TrashIcon,
    PencilIcon,
    ArrowTurnDownLeftIcon,
} from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useState } from "react";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { useForm, usePage } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import CreateReply from "../Partials/CreateReply";

dayjs.extend(relativeTime);

export default function Chat({ chat, organization }) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage().props;

    const [editing, setEditing] = useState(false);

    const { data, setData, patch, clearErrors, reset, errors } = useForm({
        message: chat.message,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(
            route("chats.update", {
                chat: chat.id,
            })
        );
        setEditing(false);
    };

    const asset = (path) => {
        return `/storage/${path}`;
    };
    return (
        <>
            <div className="p-6 flex space-x-2 border glass rounded-md">
                {chat.user.photo != null ? (
                    <div className="mx-auto h-20 w-20 overflow-hidden shrink-0 rounded-full">
                        <img
                            alt=""
                            src={asset(chat.user.photo)}
                            className="object-cover top-0 left-0 w-full h-full"
                        />
                    </div>
                ) : (
                    <UserCircleIcon
                        aria-hidden="true"
                        className="h-32 w-32 text-gray-300"
                    />
                )}
                <div className="flex-1 pl-4 ">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex justify-between w-full">
                            <p className="text-gray-800 font-semibold text-sm">
                                {chat.user.name}
                            </p>
                            <span className="flex items-center">
                                <small className="ml-2 text-sm text-gray-600">
                                    {new Date(chat.created_at).toLocaleString()}
                                </small>
                                <div className="ml-3 h-2 w-2 rounded-full bg-slate-200"></div>
                                <small className="ml-2 text-sm text-gray-600">
                                    {dayjs(chat.created_at).fromNow()}
                                </small>
                            </span>
                        </div>
                    </div>
                    <div className="flex-1  ">
                        {editing ? (
                            <form onSubmit={submit}>
                                <textarea
                                    value={data.message}
                                    onChange={(e) =>
                                        setData("message", e.target.value)
                                    }
                                    className="mt-4 w-full text-gray-900 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                                ></textarea>
                                <InputError
                                    message={errors.message}
                                    className="mt-2"
                                />
                                <div className="space-x-2">
                                    <PrimaryButton className="mt-4">
                                        Save
                                    </PrimaryButton>
                                    <button
                                        className="mt-4"
                                        onClick={() => {
                                            setEditing(false);
                                            reset();
                                            clearErrors();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p className="mt-4 text-lg text-gray-900">
                                {chat.message}
                            </p>
                        )}
                        <div className="flex gap-4">
                            {chat.user.id === auth.user.id && (
                                <>
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="flex gap-1 items-center mt-4"
                                    >
                                        <PencilIcon className="w-3 h-3" />{" "}
                                        <p className="text-sm">
                                            {" "}
                                            {chat.parent_id != null
                                                ? "Edit reply"
                                                : "Edit post"}
                                        </p>{" "}
                                    </button>
                                    <Link
                                        href={route("chats.destroy", chat.id)}
                                        as="button"
                                        method="delete"
                                        className="flex gap-1 items-center mt-4 "
                                    >
                                        <span className="flex gap-1 items-center">
                                            <TrashIcon className="w-3 h-3" />
                                            <p className="text-sm">
                                                {chat.parent_id != null
                                                    ? "Delete reply"
                                                    : "Delete post"}
                                            </p>
                                        </span>
                                    </Link>
                                </>
                            )}
                            {chat.parent_id === null && (
                                <button
                                    onClick={() => setOpen(true)}
                                    className="flex gap-1 items-center mt-4"
                                >
                                    <ArrowTurnDownLeftIcon className="w-3 h-3" />{" "}
                                    <p className="text-sm">Reply</p>{" "}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <CreateReply
                chat={chat}
                organization={organization}
                open={open}
                setOpen={setOpen}
            />
        </>
    );
}
