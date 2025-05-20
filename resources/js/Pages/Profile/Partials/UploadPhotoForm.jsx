import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { Link, useForm, usePage } from "@inertiajs/react";
import ProfileImageUpload from "@/Components/ProfileImageUpload";

export default function UploadPhotoForm() {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            photo: null,
        });

    const submit = (e) => {
        e.preventDefault();
        console.log(data);

        post(route("profile.photo.upload"), {
            onSuccess: () => console.log("Profile updated successfully"),
            onError: (errors) => console.log(errors),
        });
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Upload a Profile Photo
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Your photo should be an square image that represents you or
                    your organization.
                </p>
            </header>

            <form onSubmit={submit} encType="multipart/form-data">
                <div className=" flex flex-col items-start justify-center mt-4">
                    <ProfileImageUpload
                        data={data}
                        setData={setData}
                        errors={errors}
                    />
                    <InputError message={errors.photo} className="mt-2" />
                </div>

                <div className="flex items-center gap-4 mt-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
