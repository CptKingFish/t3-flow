import { useEffect, useState } from "react";
import { socket } from "../../lib/socket/socket";
import FlowChartProvider from "../../components/FlowChartWrapper";

import SidebarMenu from "../../components/SidebarMenu";
import { type GetServerSidePropsContext } from "next";
import { api } from "~/@/utils/api";

interface FlowChartEditorProps {
  chartId: string;
}

export default function FlowChartEditor({ chartId }: FlowChartEditorProps) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openDeleteChartModal, setOpenDeleteChartModal] = useState(false);
  const [wsConnected, setWsConnected] = useState(socket.connected);
  const [userNumber, setUserNumber] = useState(0);
  const {mutate:createSnapshot} = api.flowchart.createSnapshot.useMutation()

  useEffect(() => {
    function onConnect() {
      setWsConnected(true);
      console.log("connected to websocket");
      if (!chartId) return;
      socket.timeout(5000).emit("join-room", chartId)
      
    }

    function onDisconnect() {
      setWsConnected(false);
      if (!chartId) return;

      socket.timeout(5000).emit("leave-room", chartId)
    }

    socket.on("user-count",(count:number)=>{
      setUserNumber(count)
    })

    socket.on("connect", onConnect);
    
    socket.on("disconnect", onDisconnect);
    socket.onAny((event, ...args) => {
      console.log(event, args);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <>
      <SidebarMenu openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />

      <div className="static h-screen w-screen">
        <button
          type="button"
          onClick={() => setOpenSidebar(true)}
          className="absolute right-3 top-24 z-10 rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Charts
        </button>
        <FlowChartProvider wsConnected={wsConnected} chartId={chartId} />
      </div>
    </>
  );
}

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      chartId: context.query.chartId,
    },
  };
}
