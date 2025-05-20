import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React from "react";

export default function Show({ newsletter }) {
    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[12%] p-10  glass">
                <div className="mt-10">
                    <h1>{newsletter.title}</h1>
                    <h3 className="my-10">{newsletter.description}</h3>
                    <div
                        className="mt-4 policy-content"
                        dangerouslySetInnerHTML={{ __html: newsletter.content }}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
