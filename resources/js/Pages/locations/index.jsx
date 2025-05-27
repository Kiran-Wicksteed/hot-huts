import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import styles from "../../../styles";

export default function LocationsPage() {
    return (
        <AuthenticatedLayout>
            <div className="mx-auto ml-[256px]  ">
                <div className="relative lg:col-span-full  overflow-hidden pt-6 pb-12">
                    <div className="col-span-full flex justify-end mb-6">
                        <div className="bg-white shadow-md  border text-hh-orange border-hh-orange hover:bg-hh-orange hover:text-white p-2 px-8 rounded transition-all cursor-pointer">
                            <p
                                className={`${styles.paragraph} whitespace-nowrap`}
                            >
                                Add a new location
                            </p>
                        </div>
                    </div>
                    <div className="col-span-full  mb-6">
                        <div>
                            {" "}
                            <h4
                                className={`${styles.h3} !mb-0 font-medium text-black `}
                            >
                                Location List
                            </h4>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 p-6 gap-x-4">
                        <div className="col-span-1">
                            <p className={`${styles.paragraph} text-black`}>
                                #No
                            </p>
                        </div>
                        <div className="col-span-2 ">
                            <p className={`${styles.paragraph} text-black`}>
                                Name
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Number
                            </p>
                        </div>
                        <div className="col-span-3">
                            <p className={`${styles.paragraph} text-black`}>
                                Location
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className={`${styles.paragraph} text-black`}>
                                Day
                            </p>
                        </div>
                    </div>
                    <div className="col-span-full space-y-4">
                        <div className="col-span-full bg-white shadow grid grid-cols-12  gap-x-4 items-center border border-hh-gray rounded p-6">
                            <div className="col-span-1">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] `}
                                >
                                    01
                                </p>
                            </div>
                            <div className="col-span-2 ">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                >
                                    St James Tidal Pool
                                </p>
                            </div>
                            <div className="col-span-2 ">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                >
                                    0825684405
                                </p>
                            </div>
                            <div className="col-span-3">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                >
                                    Main Road St James
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] !text-sm`}
                                >
                                    Wednesday
                                </p>
                            </div>

                            <div className="col-span-2 flex gap-x-4 w-full justify-end">
                                <p
                                    className={`${styles.paragraph} text-black hover:text-hh-orange transition-all !text-sm cursor-pointer`}
                                >
                                    Edit
                                </p>
                                <p
                                    className={`${styles.paragraph} text-black hover:text-hh-orange transition-all !text-sm cursor-pointer`}
                                >
                                    Delete
                                </p>
                            </div>
                        </div>

                        <div className="col-span-full flex justify-end gap-x-2">
                            <div className="bg-white rounded-full w-10 h-10 flex justify-center items-center shadow">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] `}
                                >
                                    01
                                </p>
                            </div>
                            <div className="bg-white rounded-full w-10 h-10 flex justify-center items-center shadow">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] `}
                                >
                                    02
                                </p>
                            </div>
                            <div className="bg-hh-orange rounded-full w-10 h-10 flex justify-center items-center shadow">
                                <p
                                    className={`${styles.paragraph} !text-white `}
                                >
                                    03
                                </p>
                            </div>
                            <div className="bg-white rounded-full w-10 h-10 flex justify-center items-center shadow">
                                <p
                                    className={`${styles.paragraph} !text-[#999999] `}
                                >
                                    04
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
