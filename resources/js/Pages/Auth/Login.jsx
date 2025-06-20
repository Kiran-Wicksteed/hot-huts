import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import styles from "../../../styles";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="col-span-1 relative">
                <img
                    src="/storage/images/login-image.png"
                    alt="Picturee of beach"
                    className="h-full w-full absolute top-0 object-cover"
                />
                <div className="relative pt-28 px-12">
                    <img
                        src="/storage/images/logo-footer.png"
                        alt="Picturee of beach"
                        className="h-24 w-auto"
                    />
                    <h1
                        className={`${styles.h2} font-semibold !text-hh-orange `}
                    >
                        Welcome Back to Your Seaside Sanctuary.
                    </h1>
                </div>
            </div>
            <div className="col-span-2">
                {" "}
                <div className="flex flex-col h-full justify-between p-14">
                    <div className="flex justify-end">
                        <p className={`${styles.paragraph}  !text-[#2C2C2C]`}>
                            New user?{" "}
                            <Link
                                href="/register"
                                className="font-medium underline"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                    <div className="flex justify-center flex-col items-center">
                        <h1
                            className={`${styles.h3} !mb-0 font-medium !text-[#2C2C2C]`}
                        >
                            Login
                        </h1>
                        <div className=" w-full overflow-hidden bg-white px-6 py-4 sm:max-w-md  ">
                            <form onSubmit={submit}>
                                <div>
                                    <InputLabel htmlFor="email" value="Email" />

                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                    />

                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4">
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
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />

                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4 block">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData(
                                                    "remember",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <span
                                            className={`ms-2 text-sm !text-[#2C2C2C] ${styles.paragraph}`}
                                        >
                                            Remember me
                                        </span>
                                    </label>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    {canResetPassword && (
                                        <Link
                                            href={route("password.request")}
                                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            Forgot your password?
                                        </Link>
                                    )}

                                    <PrimaryButton
                                        className="ms-4"
                                        disabled={processing}
                                    >
                                        Login
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <p
                            className={`${styles.paragraph} !text-xs !text-[#2C2C2C]`}
                        >
                            Protected by reCAPTCHA and subject to the{" "}
                            <Link href="#" className="text-hh-orange !text-xs">
                                Privacy Policy
                            </Link>{" "}
                            and{" "}
                            <Link href="#" className="text-hh-orange  !text-xs">
                                Terms of Service
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
