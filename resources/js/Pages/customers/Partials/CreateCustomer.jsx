// resources/js/Pages/Customers/CreateCustomer.jsx
import { Dialog } from "@headlessui/react";
import { useForm } from "@inertiajs/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function CreateCustomer({ onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        contact_number: "",
        password: "",
        password_confirmation: "",
        photo: null,

        // Indemnity (Step 2)
        indemnity_agreed: false,
        indemnity_name: "",
        indemnity_version: "2025-09-05",
    });

    const [step, setStep] = useState(1);
    const [stepError, setStepError] = useState("");
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoError, setPhotoError] = useState("");
    const errorRef = useRef(null);

    const fullName = useMemo(() => (data.name || "").trim(), [data.name]);

    // ---------- step <-> errors wiring ----------
    const STEP1_KEYS = [
        "name",
        "email",
        "contact_number",
        "photo",
        "password",
        "password_confirmation",
    ];
    const STEP2_KEYS = [
        "indemnity_agreed",
        "indemnity_name",
        "indemnity_version",
    ];
    const hasAny = (obj, keys) => keys.some((k) => Boolean(obj?.[k]));

    useEffect(() => {
        if (!errors || Object.keys(errors).length === 0) return;
        if (hasAny(errors, STEP1_KEYS)) setStep(1);
        else if (hasAny(errors, STEP2_KEYS)) setStep(2);
    }, [errors]);

    useEffect(() => {
        if (Object.keys(errors || {}).length && errorRef.current) {
            errorRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [errors, step]);

    // Prefill typed signature when entering Step 2 (if empty)
    useEffect(() => {
        if (step === 2 && !data.indemnity_name?.trim() && fullName) {
            setData("indemnity_name", fullName);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, fullName]);

    // Clean up object URLs
    useEffect(() => {
        return () => {
            if (photoPreview) URL.revokeObjectURL(photoPreview);
        };
    }, [photoPreview]);

    // ---------- Photo handlers ----------
    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setData("photo", null);
            setPhotoPreview(null);
            setPhotoError("");
            return;
        }
        const allowed = ["image/jpeg", "image/png", "image/gif"];
        if (!allowed.includes(file.type)) {
            setPhotoError("Please select a JPG, PNG, or GIF image.");
            e.target.value = "";
            setData("photo", null);
            setPhotoPreview(null);
            return;
        }
        if (file.size > 3 * 1024 * 1024) {
            setPhotoError("The photo may not be greater than 3 MB.");
            e.target.value = "";
            setData("photo", null);
            setPhotoPreview(null);
            return;
        }
        setPhotoError("");
        setData("photo", file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const clearPhoto = () => {
        setData("photo", null);
        setPhotoPreview(null);
        setPhotoError("");
    };

    // ---------- Step switching ----------
    const goToStep2 = () => {
        // basic client checks for step 1
        const required = [
            ["name", data.name],
            ["email", data.email],
            ["contact_number", data.contact_number],
        ];
        const missing = required.find(([, v]) => !String(v || "").trim());
        if (missing) {
            setStepError(
                "Please complete name, email and contact number before continuing."
            );
            return;
        }

        // Optional password rule: if either is filled, both must be filled and match
        const hasEitherPassword =
            !!data.password || !!data.password_confirmation;
        if (hasEitherPassword) {
            if (!data.password || !data.password_confirmation) {
                setStepError("Please fill both password fields.");
                return;
            }
            if (data.password !== data.password_confirmation) {
                setStepError("Passwords do not match.");
                return;
            }
        }

        setStepError("");
        setStep(2);
    };

    const backToStep1 = () => setStep(1);

    // ---------- Submit ----------
    const canSubmit =
        data.indemnity_agreed &&
        data.indemnity_name.trim() === fullName &&
        !processing;

    const submit = (e) => {
        e.preventDefault();
        if (step !== 2) {
            goToStep2();
            return;
        }
        if (!canSubmit) return;

        post(route("customers.store"), {
            forceFormData: true,
            preserveScroll: true,
            onError: (errs) => {
                if (hasAny(errs, STEP1_KEYS)) setStep(1);
                else if (hasAny(errs, STEP2_KEYS)) setStep(2);
            },
            onSuccess: () => {
                reset();
                onClose?.();
            },
        });
    };

    return (
        <Dialog open onClose={onClose} className="relative z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

            {/* Scroll container */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-height-full items-end sm:items-center justify-center p-0 sm:p-4 min-h-full">
                    <Dialog.Panel className="w-screen h-[100dvh] sm:w-full sm:h-auto sm:max-w-md sm:max-h-[85dvh] bg-white shadow-lg rounded-none sm:rounded-xl overflow-y-auto">
                        {/* Sticky header */}
                        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b">
                            <div className="px-4 py-3 sm:px-6">
                                <Dialog.Title className="text-lg font-semibold">
                                    Add Customer
                                </Dialog.Title>
                                {/* Stepper */}
                                <div className="mt-2 flex items-center gap-3 text-sm">
                                    <span
                                        className={`rounded-full w-6 h-6 flex items-center justify-center ${
                                            step >= 1
                                                ? "bg-hh-orange text-white"
                                                : "bg-gray-200 text-gray-600"
                                        }`}
                                    >
                                        1
                                    </span>
                                    <span
                                        className={`${
                                            step === 1
                                                ? "text-hh-orange font-medium"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        Details
                                    </span>
                                    <div className="w-10 h-px bg-gray-300" />
                                    <span
                                        className={`rounded-full w-6 h-6 flex items-center justify-center ${
                                            step >= 2
                                                ? "bg-hh-orange text-white"
                                                : "bg-gray-200 text-gray-600"
                                        }`}
                                    >
                                        2
                                    </span>
                                    <span
                                        className={`${
                                            step === 2
                                                ? "text-hh-orange font-medium"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        Indemnity
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form
                            onSubmit={submit}
                            encType="multipart/form-data"
                            className="px-4 py-4 sm:px-6 sm:py-6 space-y-3"
                        >
                            {/* Global/step error banner */}
                            {(stepError ||
                                (step === 1 && hasAny(errors, STEP1_KEYS)) ||
                                (step === 2 && hasAny(errors, STEP2_KEYS))) && (
                                <div
                                    ref={errorRef}
                                    className="text-sm text-red-600"
                                >
                                    {stepError ||
                                        "Please fix the highlighted fields below."}
                                </div>
                            )}

                            {/* ---------- STEP 1: Details ---------- */}
                            {step === 1 && (
                                <>
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Full name
                                        </label>
                                        <input
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            placeholder="Jane Doe"
                                            className="w-full border p-2 rounded"
                                        />
                                        {errors.name && (
                                            <p className="text-red-600 text-sm">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                            placeholder="jane@example.com"
                                            className="w-full border p-2 rounded"
                                        />
                                        {errors.email && (
                                            <p className="text-red-600 text-sm">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Contact number */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Contact number
                                        </label>
                                        <input
                                            value={data.contact_number}
                                            onChange={(e) =>
                                                setData(
                                                    "contact_number",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="+27 82 123 4567"
                                            className="w-full border p-2 rounded"
                                        />
                                        {errors.contact_number && (
                                            <p className="text-red-600 text-sm">
                                                {errors.contact_number}
                                            </p>
                                        )}
                                    </div>

                                    {/* Photo (optional) with preview */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Profile photo (optional)
                                        </label>
                                        <div className="flex items-center gap-4">
                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="Selected profile preview"
                                                    className="h-14 w-14 rounded-full object-cover ring-1 ring-gray-200"
                                                />
                                            ) : (
                                                <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">
                                                    No Photo
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/gif,.jpg,.jpeg,.png,.gif"
                                                    onChange={handlePhotoChange}
                                                    className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    JPG, PNG or GIF. Max
                                                    3&nbsp;MB.
                                                </p>
                                                {data.photo && (
                                                    <button
                                                        type="button"
                                                        onClick={clearPhoto}
                                                        className="mt-1 self-start text-xs underline text-gray-600"
                                                    >
                                                        Remove photo
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-red-600 text-sm">
                                            {photoError || errors.photo}
                                        </p>
                                    </div>

                                    {/* Password (optional; if filled, confirm must match) */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border p-2 rounded"
                                        />
                                        {errors.password && (
                                            <p className="text-red-600 text-sm">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Confirm password
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    "password_confirmation",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border p-2 rounded"
                                        />
                                    </div>
                                </>
                            )}

                            {/* ---------- STEP 2: Indemnity ---------- */}
                            {step === 2 && (
                                <>
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">
                                            Indemnity & Risk Notice
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Please review the notice below and
                                            confirm to proceed.
                                        </p>

                                        {/* Replace this with your full terms content */}
                                        <div className="mt-3 h-40 overflow-y-auto rounded border border-gray-200 p-3 text-sm leading-6 text-gray-700 space-y-2">
                                            <p>
                                                <strong>
                                                    Key Risks (summary):
                                                </strong>
                                            </p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>
                                                    Use of sauna and related
                                                    facilities is at your own
                                                    risk.
                                                </li>
                                                <li>
                                                    Heat exposure may be unsafe
                                                    for certain medical
                                                    conditions.
                                                </li>
                                                <li>
                                                    You confirm you are
                                                    medically fit to
                                                    participate.
                                                </li>
                                                <li>
                                                    You waive and indemnify
                                                    HotHuts for ordinary
                                                    negligence to the extent
                                                    permitted by law.
                                                </li>
                                            </ul>
                                            <p className="mt-2">
                                                <strong>Full Terms:</strong> By
                                                continuing, you acknowledge you
                                                have read and accept the full
                                                Indemnity &amp; Risk Terms.
                                            </p>
                                        </div>

                                        {/* Inline sentence with checkbox + name input */}
                                        <div className="mt-4">
                                            <div className="flex items-start gap-3">
                                                <input
                                                    id="indemnity_agreed"
                                                    type="checkbox"
                                                    className="mt-1 h-4 w-4"
                                                    checked={
                                                        data.indemnity_agreed
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "indemnity_agreed",
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="indemnity_agreed"
                                                    className="text-sm text-gray-800"
                                                >
                                                    I{" "}
                                                    <span className="inline-block align-baseline">
                                                        <input
                                                            id="indemnity_name"
                                                            name="indemnity_name"
                                                            value={
                                                                data.indemnity_name
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "indemnity_name",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder={
                                                                fullName ||
                                                                "Full name"
                                                            }
                                                            className="
                                                                inline-block
                                                                w-[16ch] md:w-[22ch]
                                                                px-1 py-0
                                                                border-0 border-b border-gray-300 rounded-none
                                                                focus:border-b-gray-500 focus:ring-0
                                                                text-sm
                                                            "
                                                        />
                                                    </span>{" "}
                                                    have read and accept the
                                                    Indemnity &amp; Risk Terms.
                                                </label>
                                            </div>

                                            {/* helper + backend errors */}
                                            {data.indemnity_name.trim() !==
                                                fullName && (
                                                <div className="mt-2 text-xs text-red-600">
                                                    Please type the name exactly
                                                    as entered above:{" "}
                                                    <strong>
                                                        {fullName ||
                                                            "Full name"}
                                                    </strong>
                                                </div>
                                            )}
                                            {(errors.indemnity_name ||
                                                errors.indemnity_agreed) && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {errors.indemnity_name ||
                                                        errors.indemnity_agreed}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Sticky footer actions */}
                            <div className="sticky bottom-0 -mx-4 sm:-mx-6 border-t bg-white/95 backdrop-blur px-4 sm:px-6 pt-4 pb-4 flex justify-end gap-2">
                                {step === 1 ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={goToStep2}
                                            className="py-2 px-4 bg-hh-orange text-white rounded disabled:bg-gray-400"
                                            disabled={processing}
                                        >
                                            Continue
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={backToStep1}
                                            className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                            disabled={processing}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!canSubmit}
                                            className="py-2 px-4 bg-hh-orange text-white rounded disabled:bg-gray-400"
                                        >
                                            {processing
                                                ? "Saving..."
                                                : "Create"}
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </Dialog.Panel>
                </div>
            </div>
        </Dialog>
    );
}
