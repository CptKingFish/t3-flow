import { useState, Fragment, useEffect } from "react";

import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { api } from "~/@/utils/api";
import { useRouter } from "next/router";
import DeleteChartModal from "./DeleteChartModal";
import { socket } from "../lib/socket/socket";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ChartsMenu() {
  const router = useRouter();
  const [createChartFormOpen, setCreateChartFormOpen] = useState(false);
  const [chartName, setChartName] = useState("");
  const [currentChartId, setCurrentChartId] = useState("");
  const [openDeleteChartModal, setOpenDeleteChartModal] = useState(false);

  const {
    data: charts,
    error: chartsError,
    isLoading: chartsLoading,
    refetch: refetchCharts,
  } = api.flowchart.getCharts.useQuery();

  useEffect(() => {

    const url = window.location.pathname.split("/")[2];0
    if (url) {
      setCurrentChartId(url)
    }
  }, [charts])

  const { mutateAsync: createChart } = api.flowchart.createChart.useMutation();

  const onCreateChart = async () => {
    try {
      if (chartName.trim().length === 0) return;
      const result = await createChart({
        title: chartName,
      });
      console.log(result);

      await refetchCharts();
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="relative mt-6 flex-1 px-4 sm:px-6">
      <DeleteChartModal
        deleteModal={openDeleteChartModal}
        setDeleteModal={setOpenDeleteChartModal}
        chartId={currentChartId}
        refetch={refetchCharts}
      />
      <ul role="list" className="-mx-2 mb-5 mt-2 space-y-1">
        {charts
          ? charts.map((chart) => (
            <li key={chart.id}>
              <div
                onClick={() => {
                  socket.timeout(5000).emit("leave-room", currentChartId)
                  setCurrentChartId(chart.id);
                  void router.push(`/flowchart/${chart.id}`);

                  socket.timeout(5000).emit("join-room", chart.id)
                }}
                className={classNames(
                  chart.id === currentChartId
                    ? "bg-gray-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                  "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 hover:cursor-pointer",
                )}
              >
                <span
                  className={classNames(
                    chart.id === currentChartId
                      ? "border-indigo-600 text-indigo-600"
                      : "border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600",
                    "font-lg flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.90rem]",
                  )}
                >
                  {chart.title[0]}
                </span>
                <span className="truncate text-xl">{chart.title}</span>
                <button
                  className="opacity-1 absolute right-3 z-50 group-hover:opacity-100"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenDeleteChartModal(true);
                    setCurrentChartId(chart.id);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))
          : null}
      </ul>
      <>
        {createChartFormOpen ? (
          <>
            <div className="mb-2 rounded-md px-3 pb-1.5 pt-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
              <label
                htmlFor="name"
                className="text-md block font-medium text-gray-900"
              >
                Flowchart name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="sm:text-md block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:leading-6"
                placeholder="Walao eh"
                value={chartName}
                onChange={(e) => setChartName(e.target.value)}
              />
            </div>
            <span className="isolate flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={onCreateChart}
                className="w-1/2 items-center rounded-l-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-gray-300 hover:bg-indigo-500 focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setCreateChartFormOpen(false)}
                className="w-1/2 items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
              >
                Cancel
              </button>
            </span>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setCreateChartFormOpen(true)}
            className="inline-flex w-full items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Create new chart
          </button>
        )}
      </>
    </div>
  );
}
