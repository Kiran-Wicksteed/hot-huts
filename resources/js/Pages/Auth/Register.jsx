import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import ProfileImageUpload from "@/Components/ProfileImageUpload";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import styles from "../../../styles";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        surname: "",
        email: "",
        password: "",
        password_confirmation: "",
        photo: "",
        organization_id: "",
        title: "",
        contact_number: "",
    });

    const [organizations, setOrganizations] = useState([]);

    const submit = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="col-span-1 relative">
                <img
                    src="/storage/images/login-bg.png"
                    alt="Picturee of beach"
                    className="h-full w-full absolute top-0 object-cover"
                />
                <div className="relative pt-28 px-12">
                    <img
                        src="/storage/images/logo.png"
                        alt="Picturee of beach"
                        className="h-24 w-auto"
                    />
                    <h1
                        className={`${styles.h2} font-semibold !text-hh-orange mt-10`}
                    >
                        Start Your Sauna Experience Today.
                    </h1>
                </div>
            </div>
            <div className="col-span-2">
                {" "}
                <div className="flex flex-col h-full justify-between p-14">
                    <div className="flex justify-end">
                        <p className={`${styles.paragraph}  !text-[#2C2C2C]`}>
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium underline"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                    <div className="flex justify-center flex-col items-center">
                        <h1
                            className={`${styles.h3} !mb-0 font-medium !text-[#2C2C2C]`}
                        >
                            Sign Up
                        </h1>
                        <div className=" w-full overflow-hidden bg-white px-6 py-4 sm:max-w-md  ">
                            <form
                                onSubmit={submit}
                                encType="multipart/form-data"
                                className="grid grid-cols-2 gap-x-4"
                            >
                                <div className="mt-4">
                                    <InputLabel htmlFor="name" value="Name" />

                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        autoComplete="name"
                                        placeholder="First name"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        required
                                    />

                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="mt-4">
                                    <InputLabel
                                        htmlFor="surname"
                                        value="Surname"
                                    />

                                    <TextInput
                                        id="surname"
                                        name="surname"
                                        value={data.surname}
                                        className="mt-1 block w-full"
                                        autoComplete="surname"
                                        placeholder="Last name"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData("surname", e.target.value)
                                        }
                                        required
                                    />

                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="email" value="Email" />

                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        autoComplete="username"
                                        placeholder="Email address"
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        required
                                    />

                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4">
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
                                        autoComplete="contact_number"
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

                                <div className="mt-4 col-span-2">
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
                                            setData("password", e.target.value)
                                        }
                                        required
                                    />

                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4 col-span-2">
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Confirm Password"
                                    />

                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
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
                                        message={errors.password_confirmation}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4  col-span-2">
                                    <PrimaryButton
                                        className="w-full flex justify-center"
                                        disabled={processing}
                                    >
                                        Sign up
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
