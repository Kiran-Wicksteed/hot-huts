import React, { useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const ApproveUserForm = ({ user }) => {
    const { data, setData, patch, processing, errors } = useForm({
        is_approved: user.is_approved ? 0 : 1,
    });

    useEffect(() => {
        setData("is_approved", user.is_approved ? 0 : 1);
    }, [user.is_approved]);

    const handleApprove = (e) => {
        e.preventDefault();

        patch(route("users.approve", { user: user.id }), {
            data,
            onSuccess: () => {
                router.reload();
            },
        });
    };

    return (
        <form onSubmit={handleApprove} className="-ml-px flex w-0 flex-1">
            <button
                type="submit"
                disabled={processing}
                className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
            >
                {user.is_approved ? (
                    <span className="inline-flex">
                        {" "}
                        <XCircleIcon className="h-5 w-5 mr-2 text-red-400" />
                        Revoke Access
                    </span>
                ) : (
                    <span className="inline-flex">
                        {" "}
                        <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400" />
                        Approve User
                    </span>
                )}
            </button>
            {errors.is_approved && <div>{errors.is_approved}</div>}
        </form>
    );
};

export default ApproveUserForm;
