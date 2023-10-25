import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import useUndoable from "use-undoable";
import TopMenu from "./TopMenu";
import ReactFlow, {
  type Node,
  Controls,
  Background,
  MiniMap,
  Panel,
  type Edge,
  type OnNodesDelete,
  type OnEdgesChange,
  type ReactFlowInstance,
  useReactFlow,
  type Viewport,
  useOnSelectionChange,
} from "reactflow";
import "reactflow/dist/style.css";
import EditableNode from "./EditableNode";
import DnDMenu from "./DnDMenu";
import DownloadButton from "./DownloadButton";
import ContextMenu from "./ContextMenu";

import useKeyboardShortcuts from "../lib/reactflow/hooks";
import useNodeAndEdgeCallbacks from "../lib/reactflow/callbacks";
import useUpdateChart from "../lib/reactflow/update";
import { api } from "~/@/utils/api";
import { useRouter } from "next/router";
import { type JsonObject } from "@prisma/client/runtime/library";

interface MenuState {
  id: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

interface FlowChartProps {
  wsConnected: boolean;
  chartId: string;
}

function FlowChart({ wsConnected, chartId }: FlowChartProps) {
  const router = useRouter();
  const [chartTitle, setChartTitle] = useState<string>("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { setViewport } = useReactFlow();

  const {
    data: chartData,
    error: chartError,
    isLoading: chartLoading,
    refetch: refetchChart,
    isFetched: chartFetched,
  } = api.flowchart.getChart.useQuery({
    id: chartId,
  });

  const onUpdateNodeText = useCallback((nodeId: string, text: string) => {
    setUpdateState(true);
    setNodes((nds) =>
      nds.map((nd: Node) => {
        if (nd.id === nodeId) {
          return { ...nd, data: { ...nd.data, label: text } as Node };
        }
        return nd;
      }),
    );

    // updateChart();
  }, []);

  useEffect(() => {
    if (chartFetched) {
      const chart = (chartData?.state ?? {}) as JsonObject;

      if (chart?.nodes) {
        const nodes = chart?.nodes as unknown as Node[];
        const nodesWithTextUpdate = nodes.map((node) => {
          if (node.type === "editableNode") {
            return {
              ...node,
              data: {
                ...(node.data as { label: string }),
                onUpdateNodeText: onUpdateNodeText,
              },
            };
          }
          return node;
        });

        setNodes(nodesWithTextUpdate);
      } else {
        setNodes([]);
      }

      if (chart?.edges) {
        setEdges(chart?.edges as unknown as Edge[]);
      } else {
        setEdges([]);
      }

      if (chart?.viewport) {
        setViewport(chart?.viewport as unknown as Viewport);
      }

      setChartTitle(chartData?.title ?? "");
    }
  }, [chartData, chartFetched, setViewport, chartId, chartLoading]);

  const nodeTypes = useMemo(
    () => ({
      editableNode: EditableNode,
    }),
    [],
  );

  const reactFlowWrapper = useRef<HTMLInputElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const [updateState, setUpdateState] = useState(false);
  const [elements, setElements, { undo, redo, reset }] = useUndoable({
    nodes: nodes,
    edges: edges,
  });

  const [menu, setMenu] = useState<MenuState | null>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  const selectAll = useCallback(() => {
    //loop through nodes array and add a selected:true property to each node
    setNodes((nds) =>
      nds.map((nd) => {
        return { ...nd, selected: true };
      }),
    );
  }, []);

  useKeyboardShortcuts(undo, selectAll);

  const {
    onNodesChange,
    onNodesDelete,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    onPaneClick,
    onNodeContextMenu,
    onSave,
    onRestore,
  } = useNodeAndEdgeCallbacks(
    setNodes,
    setEdges,
    setUpdateState,
    setMenu,
    reactFlowInstance,
    reactFlowWrapper,
    flowRef,
  );

  useUpdateChart(
    chartId,
    nodes,
    edges,
    updateState,
    wsConnected,
    elements,
    setElements,
    setNodes,
    setEdges,
    setUpdateState,
    chartFetched,
  );

  

  return (
    <>
      <div
        className="h-screen w-screen bg-white text-black"
        ref={reactFlowWrapper}
      >
        
        <ReactFlow
          ref={flowRef}
          nodes={nodes}
          onNodesChange={onNodesChange}
          onNodesDelete={onNodesDelete as OnNodesDelete}
          edges={edges}
          onEdgesChange={onEdgesChange as OnEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance}
          onDrop={onDrop as unknown as React.DragEventHandler<HTMLDivElement>}
          onDragOver={onDragOver}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          fitView
        >
          <TopMenu/>
          <MiniMap />
          {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <Panel position="top-center">
        <span className="font-semibold">{chartTitle}</span>
      </Panel>
      <Panel position="top-right">
        <button className="pr-3" onClick={onSave}>
          save
        </button>
        <button onClick={onRestore}>restore</button>
        <div className="fixed right-16 top-16 flex flex-row">
          <button onClick={() => undo()} className="j-button app gray mh-0-5r">
            Undo
          </button>
          <button onClick={() => redo()} className="j-button app gray mh-0-5r">
            Redo
          </button>
          <button onClick={() => reset()} className="j-button app gray mh-0-5r">
            Reset
          </button>
        </div>
        <DownloadButton />
      </Panel>
      <Panel position="top-left">
        <DnDMenu />
      </Panel>
    </>
  );
}

export default FlowChart;
