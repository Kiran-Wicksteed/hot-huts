import React from "react";
import {
    PhotoIcon,
    UserCircleIcon,
    SquaresPlusIcon,
} from "@heroicons/react/24/solid";
import InputError from "@/Components/InputError";
import { useState } from "react";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";

const ProfileImageUpload = ({ data, setData, errors }) => {
    const [imagePreview, setImagePreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setData("file", file);
        }
    };

    return (
        <div className=" w-full h-auto">
            <h3 className="mb-6">Add a new image to the gallery</h3>
            <div className="flex justify-center w-full ">
                <InputLabel htmlFor="file" value="Image to upload" />
            </div>
            <div className="mt-2 flex items-center justify-center w-full  gap-x-3">
                {imagePreview ? (
                    <img
                        src={imagePreview}
                        alt="Profile Preview"
                        className="h-auto w-20  object-cover"
                    />
                ) : (
                    <SquaresPlusIcon
                        aria-hidden="true"
                        className="h-12 w-12 text-gray-300"
                    />
                )}
                <input
                    type="file"
                    id="file"
                    name="file"
                    onChange={handleFileChange}
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 max-w-60"
                />
            </div>
        </div>
    );
};

export default ProfileImageUpload;
