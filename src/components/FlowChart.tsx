import { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Node,
  Controls,
  Background,
  applyNodeChanges,
  addEdge,
  MiniMap,
  useReactFlow,
  Panel,
  Edge,
  OnNodesChange,
  OnNodesDelete,
  OnEdgesChange,
  OnConnect,
  NodeChange,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import EditableNode from "./EditableNode";
import DnDMenu from "./DnDMenu";
import { socket } from "../utils/socket";

const nodeTypes = { editableNode: EditableNode };

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
let id = 0;
const getId = () => `dndnode_${id++}`;

function FlowChart({ wsConnected }: { wsConnected: boolean }) {
  const reactFlowWrapper = useRef<HTMLInputElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [updateState, setUpdateState] = useState(false);

  useEffect(() => {
    if (!updateState) return;
    socket.timeout(5000).emit(
      "chart-updated",
      {
        nodes,
        edges,
      },
      () => {
        // setIsLoading(false);
      },
    );

    setUpdateState(false);
  }, [nodes, edges, updateState]);

  console.log(nodes);

  const onUpdateNodeText = useCallback((nodeId: string, text: string) => {
    setUpdateState(true);
    setNodes((nds) =>
      nds.map((nd) => {
        if (nd.id === nodeId) {
          return { ...nd, data: { ...nd.data, label: text } };
        }
        return nd;
      }),
    );

    // updateChart();
  }, []);

  useEffect(() => {
    if (!wsConnected) return;

    function onChartUpdated({
      nodes,
      edges,
    }: {
      nodes: Node[];
      edges: Edge[];
    }) {
      // add onUpdateNodeText to editable nodes
      nodes = nodes.map((nd) => {
        if (nd.type === "editableNode") {
          return {
            ...nd,
            data: {
              ...nd.data,
              onUpdateNodeText: onUpdateNodeText,
            },
          };
        }
        return nd;
      });

      setNodes(nodes);
      setEdges(edges);
    }

    socket.on("chart-updated", onChartUpdated);

    return () => {
      socket.off("chart-updated", onChartUpdated);
    };
  }, [onUpdateNodeText, wsConnected]);

  const onDragOver = useCallback(
    (event: {
      preventDefault: () => void;
      dataTransfer: { dropEffect: string };
    }) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    [],
  );

  const onDrop = useCallback(
    (event: {
      preventDefault: () => void;
      dataTransfer: { getData: (arg0: string) => never };
      clientX: number;
      clientY: number;
    }) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      // fix typescript error for line 138 and 146

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      let newNode: {
        id: string;
        type: string;
        position: { x: number; y: number };
        className?: string;
        data: {
          label: string;
          onUpdateNodeText?: (nodeId: string, text: string) => void;
        };
      };
      if (type === "editableNode") {
        newNode = {
          id: getId(),
          type,
          position,
          className: "w-[200px] h-[100px]",
          data: {
            label: `${type} node`,
            onUpdateNodeText: onUpdateNodeText,
          },
        };
      } else {
        newNode = {
          id: getId(),
          type,
          position,
          data: { label: `${type} node` },
        };
      }

      setUpdateState(true);
      setNodes((nds) => nds.concat(newNode));

      // updateChart();
    },
    [onUpdateNodeText, reactFlowInstance],
  );

  const flowKey = "example-flow";
  const { setViewport } = useReactFlow();

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      if (!localStorage.getItem(flowKey)) return;
      const flow = JSON.parse(localStorage.getItem(flowKey) || "");

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    // if dimensions are changed, don't update and wait for onResizeStop

    setUpdateState(true);

    console.log("onNodesChange\n", changes);
    console.log(changes[0].resizing);

    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onNodesDelete: OnNodesDelete = useCallback((changes) => {
    setUpdateState(true);
    setNodes((nds) => applyNodeChanges(changes as NodeChange[], nds));
  }, []);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setUpdateState(true);
    setNodes((nds) => applyNodeChanges(changes as NodeChange[], nds));
  }, []);

  const onConnect: OnConnect = useCallback((params) => {
    setUpdateState(true);
    setEdges((eds) => addEdge(params, eds));
  }, []);

  return (
    <>
      <div className="h-screen w-screen" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          onNodesDelete={onNodesDelete}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance}
          onDrop={onDrop as unknown as React.DragEventHandler<HTMLDivElement>}
          onDragOver={onDragOver}
          fitView
        >
          <MiniMap />
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <Panel position="top-right">
        <button className="pr-3" onClick={onSave}>
          save
        </button>
        <button onClick={onRestore}>restore</button>
      </Panel>
      <Panel position="top-left">
        <DnDMenu />
      </Panel>
    </>
  );
}

export default FlowChart;
