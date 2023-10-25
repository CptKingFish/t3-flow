import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  type RefObject,
} from "react";
import {
  applyNodeChanges,
  addEdge,
  type NodeDimensionChange,
  type NodePositionChange,
  type NodeChange,
  type Edge,
  type Connection,
  type ReactFlowInstance,
  type Node,
  useReactFlow,
  applyEdgeChanges,
  type EdgeChange,
} from "reactflow";
import { uuid } from "uuidv4";

interface MenuState {
  id: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

const useNodeAndEdgeCallbacks = (
  setNodes: (value: SetStateAction<Node[]>) => void,
  setEdges: (value: SetStateAction<Edge[]>) => void,
  setUpdateState: Dispatch<SetStateAction<boolean>>,
  setMenu: (value: SetStateAction<MenuState | null>) => void,
  reactFlowInstance: ReactFlowInstance | null,
  reactFlowWrapper: RefObject<HTMLInputElement>,
  flowRef: RefObject<HTMLDivElement>,
) => {
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const targetKeys = ["resizing", "dragging"];
      for (const key of targetKeys) {
        const targetChange = changes.find((change) => key in change);
        if (targetChange && key === "resizing") {
          setUpdateState(!(targetChange as NodeDimensionChange)[key]);
          break;
        } else if (targetChange && key === "dragging") {
          setUpdateState(!(targetChange as NodePositionChange)[key]);
          break;
        }
      }

      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes, setUpdateState],
  );

  const onNodesDelete = useCallback(
    (changes: NodeChange[]) => {
      setUpdateState(true);
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes, setUpdateState],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setUpdateState(true);
      setEdges((nds) => applyEdgeChanges(changes, nds));
    },
    [setEdges, setUpdateState],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setUpdateState(true);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, setUpdateState],
  );

  const onUpdateNodeText = useCallback(
    (nodeId: string, text: string) => {
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
    },
    [setNodes, setUpdateState],
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
      const type: string = event.dataTransfer.getData("application/reactflow");

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
          id: `dndnode_${uuid()}`,
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
          id: `dndnode_${uuid()}`,
          type,
          position,
          data: { label: `${type} node` },
        };
      }

      setUpdateState(true);
      setNodes((nds) => nds.concat(newNode));

      // updateChart();
    },
    [
      onUpdateNodeText,
      reactFlowInstance,
      reactFlowWrapper,
      setNodes,
      setUpdateState,
    ],
  );

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

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, node: { id: string }) => {
      event.preventDefault();
      const pane = flowRef.current?.getBoundingClientRect();

      if (!pane) return;

      const menuState: MenuState = {
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
    [flowRef, setMenu],
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
    const restoreFlow = () => {
      if (!localStorage.getItem(flowKey)) return;
      const flow = JSON.parse(localStorage.getItem(flowKey) ?? "") as
        | {
            nodes: Node[];
            edges: Edge[];
            viewport: { x: number; y: number; zoom: number };
          }
        | "";

      if (flow !== "") {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setEdges, setNodes, setViewport]);

  return {
    onNodesChange,
    onNodesDelete,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    onPaneClick,
    onNodeContextMenu,
    onUpdateNodeText,
    onSave,
    onRestore,
  };
};

export default useNodeAndEdgeCallbacks;
