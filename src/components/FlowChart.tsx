import { useState, useCallback, useEffect, useRef, useMemo, FC, ButtonHTMLAttributes, use } from "react";
import useUndoable from 'use-undoable';
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
import DownloadButton from "./DownloadButton";
import ContextMenu from "./ContextMenu";




const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
let id = 0;
const getId = () => `dndnode_${id++}`;

function FlowChart({ wsConnected }: { wsConnected: boolean }) {
  const nodeTypes = useMemo(
    () => ({
      editableNode: EditableNode,
    }),
    []
  );

  const reactFlowWrapper = useRef<HTMLInputElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [updateState, setUpdateState] = useState(false);
  const [elements, setElements, { undo, redo, reset }] = useUndoable({
    nodes: nodes,
    edges: edges,
  });

  interface MenuState {
    id: any;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  }

  const [menu, setMenu] = useState<MenuState | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  type NewType = MouseEvent;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === 'z') {
        undo();
      } else if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        selectAll();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    // Remove event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo]);

  const selectAll = useCallback(() => {
    //loop through nodes array and add a selected:true property to each node
    setNodes((nds) => nds.map((nd) => {
      return { ...nd, selected: true };
    }
    ));
  }
    , [])

  const onNodeContextMenu = useCallback(
    (
      event: React.MouseEvent<Element, NewType>,
      node: { id: any }
    ) => {
      event.preventDefault();
      const pane = ref.current?.getBoundingClientRect();

      if (!pane) return;

      let menuState: MenuState = {
        id: node.id,
      };

      if (event.clientY < pane.height - 200) {
        menuState.top = event.clientY;
      } else {
        menuState.bottom = pane.height - event.clientY;
      }

      if (event.clientX < pane.width - 200) {
        menuState.left = event.clientX;
      } else {
        menuState.right = pane.width - event.clientX;
      }

      setMenu(menuState);
    },
    [setMenu]
  );






  // Close the context menu if it's open whenever the window is clicked.
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);


  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { }

  const Button: FC<ButtonProps> = ({ children, ...props }) => (
    <button {...props} className='j-button app gray mh-0-5r'>
      {children}
    </button>
  );

  interface ButtonsProps {
    undo: () => void;
    redo: () => void;
    reset: () => void;
  }

  const Buttons: FC<ButtonsProps> = ({ undo, redo, reset }) => (
    <div className='fixed top-16 right-16 flex flex-row'>
      <Button onClick={() => undo()}>Undo</Button>
      <Button onClick={() => redo()}>Redo</Button>
      <Button onClick={() => reset()}>Reset</Button>
    </div>
  );

  const triggerUpdate = useCallback(
    (n: Node[] = nodes, e: Edge[] = edges) => {
      setElements({ nodes: n, edges: e });
    },
    [setElements]
  );

  useEffect(() => {
    if (!updateState) return;
    triggerUpdate(nodes, edges)
    socket.timeout(5000).emit(
      "chart-updated",
      {
        nodes,
        edges,
      },
      () => {
        // setIsLoading(false);
      }
    );

    setUpdateState(false);
  }, [nodes, edges, updateState]);



  const onUpdateNodeText = useCallback((nodeId: string, text: string) => {
    setUpdateState(true);
    setNodes((nds) =>
      nds.map((nd) => {
        if (nd.id === nodeId) {
          return { ...nd, data: { ...nd.data, label: text } };
        }
        return nd;
      })
    );

    // updateChart();
  }, []);

  useEffect(() => {
    console.log(elements);
    if (!elements) return;
    setNodes(elements.nodes);
    setEdges(elements.edges);
    setUpdateState(true);
  }, [elements]);

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
    []
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
    [onUpdateNodeText, reactFlowInstance]
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


    //Dont send update when these changes are being done
    const targetKeys: string[] = ['resizing', 'dragging'];
    for (const key of targetKeys) {
      const targetChange = changes.find(change => key in change);
      if (targetChange) {
        setUpdateState(!(targetChange as any)[key]);
        break;
      } else {

      }
    }
    //Dont track click events into undo/redo
    if (changes[0]?.type === 'position' && changes[0]?.position == null) {
      setUpdateState(false);
    }

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
      <div className="w-screen h-screen bg-white text-black" ref={reactFlowWrapper}>
        <ReactFlow
          ref={ref}
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
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          fitView
        >
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
        <Buttons undo={undo} redo={redo} reset={reset} />
        <DownloadButton />
      </Panel>
      <Panel position="top-left">
        <DnDMenu />
      </Panel>
    </>
  );
}

export default FlowChart;
