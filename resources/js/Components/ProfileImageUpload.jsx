import React from "react";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import { useState } from "react";

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
            setData("photo", file);
        }
    };

    return (
        <div className="col-span-full">
            <InputLabel htmlFor="photo" value="Profile Photo" />
            <div className="mt-2 flex items-center gap-x-3">
                {imagePreview ? (
                    <img
                        src={imagePreview}
                        alt="Profile Preview"
                        className="h-12 w-12 rounded-full object-cover"
                    />
                ) : (
                    <UserCircleIcon
                        aria-hidden="true"
                        className="h-12 w-12 text-gray-300"
                    />
                )}
                <input
                    type="file"
                    id="photo"
                    name="photo"
                    onChange={handleFileChange}
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 "
                />
            </div>
        </div>
    );
};

export default ProfileImageUpload;
