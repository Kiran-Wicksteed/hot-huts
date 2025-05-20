import React from "react";
import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const roundToNearestHalfHour = (date) => {
    const minutes = 30 * Math.round(date.getMinutes() / 30);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
};

const CreateEvent = ({ organization }) => {
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const { data, setData, post, processing, errors, recentlySuccessful } =
        useForm({
            title: "",
            start_time: roundToNearestHalfHour(new Date()),
            finish_time: roundToNearestHalfHour(new Date()),
        });

    const handleStartDateChange = (date) => {
        setStartDate(date);
        const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm");
        setData("start_time", formattedDate);
    };
    const handleEndDateChange = (date) => {
        setEndDate(date);
        const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm");
        setData("finish_time", formattedDate);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log(data);

        post(
            route("organizations.events.store", {
                organization: organization.id,
            }),
            {
                onSuccess: () => {
                    setOpen(false); // Close the modal on success
                    reset(); // Reset the form
                },
                onError: () => {
                    // Keep the modal open on error
                },
            }
        );
    };

    const filterTime = (time) => {
        const selectedDate = new Date(time);

        // Only allow times between 8:00 AM and 7:00 PM
        if (selectedDate.getHours() < 8 || selectedDate.getHours() > 19) {
            return false;
        }

        // Allow only 30-minute increments
        return (
            selectedDate.getMinutes() === 0 || selectedDate.getMinutes() === 30
        );
    };

    return (
        <>
            <PrimaryButton
                onClick={() => {
                    setOpen(true);
                }}
                className="ms-4"
                disabled={processing}
            >
                New event <PlusIcon className="h-4 w-4 ml-2" />
            </PrimaryButton>
            <Dialog open={open} onClose={setOpen} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-100/95 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                />

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                        >
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <h3 className="mb-4">
                                        Add a new event to the calendar
                                    </h3>

                                    <div className="mt-4 flex flex-col items-center">
                                        <InputLabel
                                            htmlFor="title"
                                            value="Event Title"
                                        />

                                        <TextInput
                                            id="title"
                                            className="mt-1 block w-full max-w-md rounded-md "
                                            value={data.title}
                                            onChange={(e) =>
                                                setData("title", e.target.value)
                                            }
                                            required
                                            isFocused
                                            autoComplete="title"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.title}
                                        />
                                    </div>

                                    <div className="mt-4 flex flex-col items-center">
                                        <InputLabel
                                            htmlFor="start_time"
                                            value="Event Start"
                                        />

                                        <DatePicker
                                            selected={startDate}
                                            onChange={handleStartDateChange}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={30}
                                            dateFormat="yyyy-MM-dd'T'HH:mm"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            required
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.start_time}
                                        />
                                    </div>
                                    <div className="mt-4 flex flex-col items-center w-full ">
                                        <InputLabel
                                            htmlFor="finish_time"
                                            value="Event End"
                                        />

                                        <DatePicker
                                            selected={endDate}
                                            onChange={handleEndDateChange}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={30}
                                            dateFormat="yyyy-MM-dd'T'HH:mm"
                                            className="mt-1  w-full  rounded-md border-gray-300 shadow-sm"
                                            required
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.finish_time}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-4 mt-4">
                                    <PrimaryButton disabled={processing}>
                                        Create Event
                                    </PrimaryButton>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-gray-600">
                                            Saved.
                                        </p>
                                    </Transition>
                                </div>
                            </form>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default CreateEvent;
