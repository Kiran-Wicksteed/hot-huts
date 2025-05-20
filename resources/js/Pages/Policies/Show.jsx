import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React from "react";

export default function Show({ organization, policy }) {
    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[15%] p-10  glass">
                <div className="flex gap-10">
                    <h1>
                        <span className="font-medium">
                            {organization.orgName}&apos;s{" "}
                        </span>
                        Policy: {policy.title}
                    </h1>
                </div>
                <div className="mt-10">
                    <h2 className="text-xl font-bold">{policy.title}</h2>
                    <p className="mt-4">{policy.description}</p>
                    <div
                        className="mt-4 policy-content"
                        dangerouslySetInnerHTML={{ __html: policy.content }}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
