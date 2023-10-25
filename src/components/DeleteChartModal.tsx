import { Fragment, useState, type Dispatch, type SetStateAction } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline'
import { api } from "~/@/utils/api";
import { useRouter } from "next/router";

interface DeleteChartModalProps {
    deleteModal: boolean;
    setDeleteModal: Dispatch<SetStateAction<boolean>>;
    chartId: string;
    refetch: () => void;
}

export default function DeleteChartModal({ deleteModal, setDeleteModal,chartId,refetch }: DeleteChartModalProps) {
    const router = useRouter();
    const { mutateAsync: deleteChart } = api.flowchart.deleteChart.useMutation();

    const handleDeleteChart = async ()=> {
        try {
            const result = await deleteChart({
                id: chartId,
            });

            const url = window.location.pathname.split("/")[2];
            if (chartId === url) {
                void router.push(`/`);
            }else{
                refetch();
                setDeleteModal(false);
            }

        }catch(err){
            console.error(err);
        }
    }

    return (
        <Transition.Root show={deleteModal} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={setDeleteModal}>
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
                                        <TrashIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-5">
                                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                            Confirm Deletion of Flowchart?
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Your flowchart will be deleted permanently. This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6">
                                    <button
                                        type="button"
                                        className="w-1/2 justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        onClick={() => setDeleteModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button

                                        type="button"
                                        className="w-1/2 justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                        onClick={() => handleDeleteChart()}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}