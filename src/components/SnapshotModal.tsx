import { Fragment, useState, type Dispatch, type SetStateAction } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { api } from "~/@/utils/api";
import { useRouter } from "next/router";
import { socket } from "../lib/socket/socket";
import { JsonObject } from "@prisma/client/runtime/library";

interface SnapshotModalProps {
    snapshotModal: boolean;
    setSnapshotModal: Dispatch<SetStateAction<boolean>>;
    chartId: string;
    refetch: () => void;
}

export default function SnapshotModal({
    snapshotModal,
    setSnapshotModal,
    chartId,
    refetch,

}: SnapshotModalProps) {
    const router = useRouter();
    const { mutate: createSnapshot } = api.flowchart.createSnapshot.useMutation()
    const data = api.flowchart.getSnapshots.useQuery({ id: chartId })



    return (
        <Transition.Root show={snapshotModal} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={setSnapshotModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                                <div>
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">

                                    </div>
                                    <div className="mt-3 text-center sm:mt-5">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-base font-semibold leading-6 text-gray-900"
                                        >
                                            Flowchart snapshots
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            {data?.data?.map((snapshot) => (
                                                <div className="flex justify-between">
                                                    <div className="text-sm text-gray-500">
                                                        {snapshot.createdAt.toString()}
                                                        
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6">
                                    <button
                                        type="button"
                                        className="w-1/2 justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        onClick={() => {createSnapshot({ id: chartId });refetch()}}
                                    >
                                        Create Snapshot
                                    </button>

                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
