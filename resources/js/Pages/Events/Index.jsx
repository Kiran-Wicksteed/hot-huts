import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import CreateEvent from "./Partials/CreateEvent";
import { Link } from "@inertiajs/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { Head } from "@inertiajs/react";

export default function Index({ events, organization }) {
    return (
        <AuthenticatedLayout>
            <Head title="Events" />
            <div className=" ">
                <div className="mx-auto ml-[10%] sm:px-6 lg:px-8 ">
                    <div className="flex gap-10 mb-6 ">
                        <h1>
                            <span className="font-medium">
                                {organization.orgName}&apos;s{" "}
                            </span>
                            Events
                        </h1>
                        <CreateEvent organization={organization} />
                    </div>
                    <div className="bg-white ">
                        <FullCalendar
                            plugins={[timeGridPlugin]}
                            initialView="timeGridWeek"
                            allDaySlot={false}
                            slotMinTime="9:00:00"
                            slotMaxTime="17:00:00"
                            weekends={true}
                            events={events}
                            expandRows={true}
                            eventContent={renderEventContent}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function renderEventContent(eventInfo) {
    console.log(eventInfo);
    return (
        <>
            <div className="flex justify-between">
                <b className="text-xs">{eventInfo.timeText}</b>
                <Link
                    href={route(
                        "events.destroy",
                        eventInfo.event.extendedProps.id
                    )}
                    as="button"
                    method="delete"
                    className=" "
                >
                    <span className="">
                        <TrashIcon className="w-3 h-3" />
                    </span>
                </Link>
            </div>

            <div className="">
                <i>{eventInfo.event.title}</i>
            </div>
        </>
    );
}
