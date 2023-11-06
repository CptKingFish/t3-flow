import { Fragment, useState, type Dispatch, type SetStateAction, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { api } from "~/@/utils/api";
import { useRouter } from "next/router";
import { socket } from "../lib/socket/socket";
import { JsonObject } from "@prisma/client/runtime/library";
import { toPng } from "html-to-image";
import { useReactFlow, getRectOfNodes, getTransformForBounds } from "reactflow";
import { utils } from "prettier/doc";
import { Prisma } from "@prisma/client";

interface SnapshotModalProps {
    snapshotModal: boolean;
    setSnapshotModal: Dispatch<SetStateAction<boolean>>;
    chartId: string;

}

interface Snapshot {
    id: string;
    state: Prisma.JsonValue;
    createdAt: Date;
    flowchartId: string;
    imageUrl: string | null;
}

export default function SnapshotModal({
    snapshotModal,
    setSnapshotModal,
    chartId,


}: SnapshotModalProps) {
    const router = useRouter();

    const { mutateAsync: createSnapshot } = api.flowchart.createSnapshot.useMutation()
    const { mutateAsync: deleteSnapshot } = api.flowchart.deleteSnapshot.useMutation()
    const { mutateAsync: restoreSnapshot } = api.flowchart.restoreSnapshot.useMutation()

    const { data: data, refetch: refetch } = api.flowchart.getSnapshots.useQuery({ id: chartId, })
    const utils = api.useUtils()

    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

    useEffect(() => {
        if (data) {
            setSnapshots(data)
        }
    }, [data])


    const { getNodes } = useReactFlow();

    const imageWidth = 1024;
    const imageHeight = 768;
    const onClick = async () => {

        // we calculate a transform for the nodes so that all nodes are visible
        // we then overwrite the transform of the `.react-flow__viewport` element
        // with the style option of the html-to-image library
        const nodesBounds = getRectOfNodes(getNodes());
        const transform = getTransformForBounds(
            nodesBounds,
            imageWidth,
            imageHeight,
            0.5,
            2,
        );

        const dataUrl = await toPng(document.querySelector<HTMLElement>(".react-flow__viewport")!, {
            backgroundColor: "#FAF9F6",
            width: imageWidth,
            height: imageHeight,
            style: {
                width: imageWidth.toString(),
                height: imageHeight.toString(),
                transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
            },
        })
        await createSnapshot({ id: chartId, image: dataUrl })
        refetch()

    }

    const deleteSnapshotHandler = async (id: string) => {
        try{
            await deleteSnapshot({ id: id })
        }catch(e){
            return
        }
        
        refetch()

    }

    const restoreSnapshotHandler = async (id: string) => {
        await restoreSnapshot({ id: id })
        utils.flowchart.getChart.refetch()
    }




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
                                            {snapshots?.map((snapshot) => (
                                                <div className="flex justify-between">
                                                    <div className="text-sm text-gray-500">
                                                        {snapshot.createdAt.toString()}

                                                    </div>
                                                    {/* Image using snapshot url */}
                                                    <div className="text-sm text-gray-500">
                                                        <img src={snapshot.imageUrl || ""} />
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
                                                            onClick={() => { restoreSnapshotHandler(snapshot.id) }} >
                                                            Restore
                                                        </button>
                                                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 border border-red-700 rounded"
                                                            onClick={() => deleteSnapshotHandler(snapshot.id)}>
                                                            Delete
                                                        </button>
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
                                        onClick={onClick}
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
