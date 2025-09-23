import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../../styles";
import imageCompression from "browser-image-compression";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        surname: "",
        email: "",
        password: "",
        password_confirmation: "",
        photo: null, // file or null
        organization_id: "",
        title: "",
        contact_number: "",
        indemnity_agreed: false,
        indemnity_name: "",
        indemnity_version: "2025-09-05",
    });

    const [step, setStep] = useState(1);
    const [stepError, setStepError] = useState("");
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoError, setPhotoError] = useState("");
    const errorRef = useRef(null);

    const fullName = useMemo(() => {
        const n = (data.name || "").trim();
        const s = (data.surname || "").trim();
        return [n, s].filter(Boolean).join(" ");
    }, [data.name, data.surname]);

    // -------- step ↔ error sync --------
    const STEP1_KEYS = [
        "name",
        "surname",
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
                block: "start",
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

    // Revoke object URL when preview changes/unmounts
    useEffect(() => {
        return () => {
            if (photoPreview) URL.revokeObjectURL(photoPreview);
        };
    }, [photoPreview]);

    // ---- Photo handlers ----
    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setData("photo", null);
            setPhotoPreview(null);
            setPhotoError("");
            return;
        }

        // Accept common types + HEIC/HEIF for better UX. Backend is authoritative.
        const allowedMimes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/heic",
            "image/heif",
        ];
        if (!allowedMimes.includes(file.type)) {
            setPhotoError("Please select an image (JPG, PNG, GIF, or HEIC).");
            e.target.value = "";
            setData("photo", null);
            setPhotoPreview(null);
            return;
        }

        try {
            let working = file;

            // If HEIC/HEIF, try converting to JPEG client-side for speed/compat.
            if (/image\/hei[cf]/i.test(file.type)) {
                try {
                    const heic2any = (await import("heic2any")).default;
                    const blob = await heic2any({
                        blob: file,
                        toType: "image/jpeg",
                        quality: 0.9,
                    });
                    working = new File(
                        [blob],
                        file.name.replace(/\.\w+$/, ".jpg"),
                        {
                            type: "image/jpeg",
                        }
                    );
                } catch {
                    // If conversion fails, fall back to uploading original; backend will convert.
                }
            }

            // Pre-shrink to speed uploads (don’t rely on this for security; backend still validates)
            const compressed = await imageCompression(working, {
                maxWidthOrHeight: 1280, // big enough for an avatar; tiny upload size
                maxSizeMB: 2.5, // aim under 3 MB to pass your client guard
                useWebWorker: true,
                initialQuality: 0.9,
                // Keep type as-is after HEIC handling; backend will normalize to jpg/png.
            });

            // Client-side UX cap (soft). Backend enforces real limit.
            if (compressed.size > 3 * 1024 * 1024) {
                setPhotoError(
                    "The photo may not be greater than 3 MB after optimization."
                );
                e.target.value = "";
                setData("photo", null);
                setPhotoPreview(null);
                return;
            }

            setPhotoError("");
            setData("photo", compressed);
            // Revoke previous preview URL to avoid leaks
            if (photoPreview) URL.revokeObjectURL(photoPreview);
            setPhotoPreview(URL.createObjectURL(compressed));
        } catch (err) {
            console.error(err);
            setPhotoError(
                "Could not process that image. Please try a different one."
            );
            e.target.value = "";
            setData("photo", null);
            setPhotoPreview(null);
        }
    };

    const clearPhoto = () => {
        setData("photo", null);
        setPhotoPreview(null);
        setPhotoError("");
    };

    // ---- Step switching ----
    const goToStep2 = () => {
        // lightweight client checks for step 1
        const required = [
            ["name", data.name],
            ["surname", data.surname],
            ["email", data.email],
            ["password", data.password],
            ["password_confirmation", data.password_confirmation],
            ["contact_number", data.contact_number],
        ];
        const missing = required.find(([, v]) => !String(v || "").trim());
        if (missing) {
            setStepError(
                "Please complete all required fields before continuing."
            );
            return;
        }
        if (data.password !== data.password_confirmation) {
            setStepError("Passwords do not match.");
            return;
        }
        setStepError("");
        setStep(2);
    };

    const backToStep1 = () => setStep(1);

    // ---- Submit ----
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

        post(route("register"), {
            forceFormData: true,
            preserveScroll: true,
            onError: (errs) => {
                if (hasAny(errs, STEP1_KEYS)) setStep(1);
                else if (hasAny(errs, STEP2_KEYS)) setStep(2);
            },
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="col-span-1 relative">
                <img
                    src="/storage/images/login-bg.png"
                    alt="Picture of beach"
                    className="h-full w-full absolute top-0 object-cover"
                />
                <div className="relative pt-8 sm:pt-16 lg:pt-28 px-4 sm:px-8 lg:px-12">
                    <img
                        src="/storage/images/logo.png"
                        alt="Logo"
                        className="h-16 sm:h-20 lg:h-24 w-auto"
                    />
                    <h1
                        className={`${styles.h2} font-semibold !text-hh-orange mt-4 sm:mt-6 lg:mt-10 !text-lg sm:!text-xl lg:!text-2xl`}
                    >
                        Start Your Sauna Experience Today.
                    </h1>
                </div>
            </div>

            <div className="col-span-1 lg:col-span-2">
                <div className="flex flex-col h-full justify-between p-4 pt-12 sm:p-8 lg:p-14">
                    {/* top-right login link */}
                    <div className="flex justify-center lg:justify-end">
                        <p
                            className={`${styles.paragraph} !text-[#2C2C2C] text-center lg:text-right`}
                        >
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium underline"
                            >
                                Login
                            </Link>
                        </p>
                    </div>

                    {/* center card */}
                    <div className="flex justify-center flex-col items-center w-full flex-1">
                        <h1
                            className={`${styles.h3} !mb-4 font-medium !text-[#2C2C2C] text-center`}
                        >
                            Sign Up
                        </h1>

                        {/* stepper */}
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm mb-6">
                            <span
                                className={`rounded-full w-6 h-6 flex items-center justify-center text-xs ${
                                    step >= 1
                                        ? "bg-hh-orange text-white"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                1
                            </span>
                            <span
                                className={`text-xs sm:text-sm ${
                                    step === 1
                                        ? "text-hh-orange font-medium"
                                        : "text-gray-600"
                                }`}
                            >
                                Your Details
                            </span>
                            <div className="w-6 sm:w-10 h-px bg-gray-300" />
                            <span
                                className={`rounded-full w-6 h-6 flex items-center justify-center text-xs ${
                                    step >= 2
                                        ? "bg-hh-orange text-white"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                2
                            </span>
                            <span
                                className={`text-xs sm:text-sm ${
                                    step === 2
                                        ? "text-hh-orange font-medium"
                                        : "text-gray-600"
                                }`}
                            >
                                Indemnity
                            </span>
                        </div>

                        <div className="w-full overflow-hidden bg-white px-4 py-4 sm:px-6 sm:max-w-md lg:max-w-lg">
                            <form
                                onSubmit={submit}
                                encType="multipart/form-data"
                                className="grid grid-cols-1 sm:grid-cols-2 gap-x-4"
                            >
                                {/* ---------- STEP 1 ---------- */}
                                {step === 1 && (
                                    <>
                                        {(stepError ||
                                            hasAny(errors, STEP1_KEYS)) && (
                                            <div
                                                ref={errorRef}
                                                className="col-span-2 mb-2 text-sm text-red-600"
                                            >
                                                {stepError ||
                                                    "Please fix the highlighted fields below."}
                                            </div>
                                        )}

                                        <div className="mt-2 sm:col-span-1">
                                            <InputLabel
                                                htmlFor="name"
                                                value="Name"
                                            />
                                            <TextInput
                                                id="name"
                                                name="name"
                                                value={data.name}
                                                className="mt-1 block w-full"
                                                autoComplete="given-name"
                                                placeholder="First name"
                                                isFocused={true}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.name}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="mt-2 sm:col-span-1">
                                            <InputLabel
                                                htmlFor="surname"
                                                value="Surname"
                                            />
                                            <TextInput
                                                id="surname"
                                                name="surname"
                                                value={data.surname}
                                                className="mt-1 block w-full"
                                                autoComplete="family-name"
                                                placeholder="Last name"
                                                onChange={(e) =>
                                                    setData(
                                                        "surname",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.surname}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="mt-2 sm:col-span-1">
                                            <InputLabel
                                                htmlFor="email"
                                                value="Email"
                                            />
                                            <TextInput
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className="mt-1 block w-full"
                                                autoComplete="username"
                                                placeholder="Email address"
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.email}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="mt-2 sm:col-span-1">
                                            <InputLabel
                                                htmlFor="contact_number"
                                                value="Contact Number"
                                            />
                                            <TextInput
                                                id="contact_number"
                                                type="text"
                                                name="contact_number"
                                                value={data.contact_number}
                                                className="mt-1 block w-full"
                                                autoComplete="tel"
                                                placeholder="Contact number"
                                                onChange={(e) =>
                                                    setData(
                                                        "contact_number",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.contact_number}
                                                className="mt-2"
                                            />
                                        </div>

                                        {/* Profile Photo (optional) */}
                                        <div className="mt-2 col-span-1 sm:col-span-2">
                                            <InputLabel
                                                htmlFor="photo"
                                                value="Profile Photo (optional)"
                                            />
                                            <div className="mt-1 flex flex-col sm:flex-row items-center gap-4">
                                                {photoPreview ? (
                                                    <img
                                                        src={photoPreview}
                                                        alt="Selected profile preview"
                                                        className="h-16 w-16 rounded-full object-cover ring-1 ring-gray-200 mx-auto sm:mx-0"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 mx-auto sm:mx-0">
                                                        No Photo
                                                    </div>
                                                )}
                                                <div className="flex flex-col text-center sm:text-left">
                                                    <input
                                                        id="photo"
                                                        name="photo"
                                                        type="file"
                                                        accept="image/*"
                                                        capture="environment"
                                                        onChange={
                                                            handlePhotoChange
                                                        }
                                                        className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        JPG, PNG or GIF. Max
                                                        3&nbsp;MB after
                                                        optimization.
                                                    </p>
                                                    {data.photo && (
                                                        <button
                                                            type="button"
                                                            onClick={clearPhoto}
                                                            className="mt-1 self-center sm:self-start text-xs underline text-gray-600"
                                                        >
                                                            Remove photo
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <InputError
                                                message={
                                                    photoError || errors.photo
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="mt-2 col-span-1 sm:col-span-2">
                                            <InputLabel
                                                htmlFor="password"
                                                value="Password"
                                            />
                                            <TextInput
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={data.password}
                                                className="mt-1 block w-full"
                                                autoComplete="new-password"
                                                placeholder="Password"
                                                onChange={(e) =>
                                                    setData(
                                                        "password",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.password}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="mt-2 col-span-1 sm:col-span-2">
                                            <InputLabel
                                                htmlFor="password_confirmation"
                                                value="Confirm Password"
                                            />
                                            <TextInput
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                value={
                                                    data.password_confirmation
                                                }
                                                className="mt-1 block w-full"
                                                autoComplete="new-password"
                                                placeholder="Confirm password"
                                                onChange={(e) =>
                                                    setData(
                                                        "password_confirmation",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="mt-4 col-span-1 sm:col-span-2">
                                            <PrimaryButton
                                                type="button"
                                                onClick={goToStep2}
                                                className="w-full flex justify-center"
                                                disabled={processing}
                                            >
                                                Continue
                                            </PrimaryButton>
                                        </div>
                                    </>
                                )}

                                {/* ---------- STEP 2 ---------- */}
                                {step === 2 && (
                                    <>
                                        {hasAny(errors, STEP2_KEYS) && (
                                            <div
                                                ref={errorRef}
                                                className="col-span-2 mb-2 text-sm text-red-600"
                                            >
                                                Please fix the highlighted
                                                fields below.
                                            </div>
                                        )}

                                        <div className="col-span-1 sm:col-span-2">
                                            <h2
                                                className={`${styles.h5} font-medium text-[#2C2C2C]`}
                                            >
                                                Indemnity & Risk Notice
                                            </h2>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Please review the notice below
                                                and confirm to proceed.
                                            </p>

                                            <div className="mt-3 h-32 sm:h-40 overflow-y-auto rounded border border-gray-200 p-3 text-xs sm:text-sm leading-5 sm:leading-6 text-gray-700 space-y-2">
                                                <p>
                                                    <strong>
                                                        Key Risks (summary):
                                                    </strong>
                                                </p>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>
                                                        Use of sauna and related
                                                        facilities is at your
                                                        own risk.
                                                    </li>
                                                    <li>
                                                        Heat exposure may be
                                                        unsafe for certain
                                                        medical conditions.
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
                                                    <strong>Full Terms:</strong>{" "}
                                                    By continuing, you
                                                    acknowledge you have read
                                                    and accept the full
                                                    Indemnity &amp; Risk Terms.
                                                </p>
                                            </div>

                                            {/* Inline sentence with checkbox + name input */}
                                            <div className="mt-4">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        id="indemnity_agreed"
                                                        type="checkbox"
                                                        className="mt-1 h-4 w-4 shrink-0"
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
                                                        className="text-xs sm:text-sm text-gray-800 leading-relaxed"
                                                    >
                                                        I{" "}
                                                        <span className="inline-block align-baseline">
                                                            <TextInput
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
                                                                    "First Last"
                                                                }
                                                                className="
                                                                    inline-block
                                                                    w-[12ch] sm:w-[14ch] md:w-[20ch]
                                                                    px-1 py-0
                                                                    border-0 border-b border-gray-300 rounded-none
                                                                    focus:border-b-gray-500 focus:ring-0
                                                                    !text-xs sm:!text-sm
                                                                "
                                                            />
                                                        </span>{" "}
                                                        have read and accept the
                                                        Indemnity &amp; Risk
                                                        Terms.
                                                    </label>
                                                </div>

                                                {/* client-side helper + backend errors */}
                                                {data.indemnity_name.trim() !==
                                                    fullName && (
                                                    <div className="mt-2 text-xs text-red-600">
                                                        Please type your full
                                                        name exactly as entered:{" "}
                                                        <strong>
                                                            {fullName ||
                                                                "First Last"}
                                                        </strong>
                                                    </div>
                                                )}
                                                <InputError
                                                    message={
                                                        errors.indemnity_name ||
                                                        errors.indemnity_agreed
                                                    }
                                                    className="mt-2"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-6 col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-3">
                                            <button
                                                type="button"
                                                onClick={backToStep1}
                                                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                                                disabled={processing}
                                            >
                                                Back
                                            </button>

                                            <PrimaryButton
                                                type="submit"
                                                className="flex-1 flex justify-center py-3 sm:py-2"
                                                disabled={!canSubmit}
                                            >
                                                Sign up
                                            </PrimaryButton>
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* footer */}
                    <div className="flex justify-center">
                        <p
                            className={`${styles.paragraph} !text-xs !text-[#2C2C2C] text-center px-4`}
                        >
                            Protected by reCAPTCHA and subject to the{" "}
                            <Link href="#" className="text-hh-orange !text-xs">
                                Privacy Policy
                            </Link>{" "}
                            and{" "}
                            <Link href="#" className="text-hh-orange !text-xs">
                                Terms of Service
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
