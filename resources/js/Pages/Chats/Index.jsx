import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React from "react";
import CreateChat from "./Partials/CreateChat";
import CreateReply from "./Partials/CreateReply";
import ChatMessage from "./Partials/ChatMessage";
import { Head } from "@inertiajs/react";

export default function Index({ chats, organization }) {
    console.log(chats);
    return (
        <AuthenticatedLayout>
            <Head title="Chatroom" />
            <div className=" ">
                <div className="mx-auto ml-[10%] sm:px-6 lg:px-8">
                    <div className="flex gap-10">
                        <h1>
                            <span className="font-medium">
                                {organization.orgName}&apos;s{" "}
                            </span>
                            Chatroom
                        </h1>
                        <CreateChat organization={organization} />
                    </div>
                    <ul className="space-y-10 mt-10">
                        {chats.length > 0 ? (
                            chats.map((chat) => {
                                return (
                                    <div>
                                        <ChatMessage
                                            key={chat.id}
                                            chat={chat}
                                            organization={organization}
                                        />
                                        {chat.replies &&
                                            chat.replies.length > 0 && (
                                                <ul className="ml-12 mt-4 space-y-4">
                                                    {chat.replies.map(
                                                        (reply) => (
                                                            <ChatMessage
                                                                key={reply.id}
                                                                chat={reply}
                                                                organization={
                                                                    organization
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                    </div>
                                );
                            })
                        ) : (
                            <p>No chats to display</p>
                        )}
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
