import Head from "next/head";
import Link from "next/link";

import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import FlowChartProvider from "../components/FlowChartProvider";

import { api } from "~/@/utils/api";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  const [wsConnected, setWsConnected] = useState(socket.connected);
  // const [updatedChart, setUpdatedChart] = useState({});

  useEffect(() => {
    function onConnect() {
      setWsConnected(true);
      console.log("connected to websocket");
    }

    function onDisconnect() {
      setWsConnected(false);
    }

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
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-screen w-screen">
        <FlowChartProvider wsConnected={wsConnected} />
      </div>
    </>
  );
}