import { useState, useCallback, useRef, useMemo } from "react";
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

interface MenuState {
  id: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

function FlowChart({ wsConnected }: { wsConnected: boolean }) {
  const nodeTypes = useMemo(
    () => ({
      editableNode: EditableNode,
    }),
    [],
  );

  const reactFlowWrapper = useRef<HTMLInputElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
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
    nodes,
    edges,
    updateState,
    wsConnected,
    elements,
    setElements,
    setNodes,
    setEdges,
    setUpdateState,
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
