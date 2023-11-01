import { useState, useRef, useMemo } from "react";
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
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import EditableNode from "./nodes/EditableNode";
import DecisionNode from "./nodes/DecisionNode";
import DataNode from "./nodes/DataNode";
import ParallelogramNode from "./nodes/ParallelogramNode";
import TerminatorNode from "./nodes/TerminatorNode";

import DnDMenu from "./DnDMenu";
import DownloadButton from "./DownloadButton";
import ContextMenu from "./ContextMenu";

import useInitializeChartOnFetch from "../lib/reactflow/useInitializeChartOnFetch";
import useNodeAndEdgeCallbacks from "../lib/reactflow/useNodeAndEdgeCallbacks";
import useUpdateChartListeners from "../lib/reactflow/useUpdateChartListeners";
import useKeyboardShortcuts from "../lib/reactflow/useKeyboardShortcuts";

import { api } from "~/@/utils/api";

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
  const { setViewport } = useReactFlow();
  const [chartTitle, setChartTitle] = useState<string>("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [shouldSyncChartState, setShouldSyncChartState] = useState(false);
  const [menu, setMenu] = useState<MenuState | null>(null);

  const nodeTypes = useMemo(
    () => ({
      editableNode: EditableNode,
      decisionNode: DecisionNode,
      dataNode: DataNode,
      parallelogramNode: ParallelogramNode,
      terminatorNode: TerminatorNode,
    }),
    [],
  );

  const reactFlowWrapper = useRef<HTMLInputElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  const [elements, setElements, { undo, redo, reset }] = useUndoable({
    nodes: nodes,
    edges: edges,
  });

  const {
    data: chartData,
    error: chartError,
    isLoading: chartLoading,
    refetch: refetchChart,
    isFetched: chartFetched,
  } = api.flowchart.getChart.useQuery({
    id: chartId,
  });

  useInitializeChartOnFetch(
    chartFetched,
    chartData,
    setChartTitle,
    setNodes,
    setEdges,
    setViewport,
    setShouldSyncChartState,
  );

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
    setShouldSyncChartState,
    setMenu,
    reactFlowWrapper,
    flowRef,
  );

  useUpdateChartListeners(
    chartId,
    nodes,
    edges,
    shouldSyncChartState,
    wsConnected,
    elements,
    setElements,
    setNodes,
    setEdges,
    setShouldSyncChartState,
    chartFetched,
  );

  useKeyboardShortcuts(undo, setNodes);

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
          // onInit={setReactFlowInstance}
          onDrop={onDrop as unknown as React.DragEventHandler<HTMLDivElement>}
          onDragOver={onDragOver}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          fitView
        >
          <TopMenu />
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
