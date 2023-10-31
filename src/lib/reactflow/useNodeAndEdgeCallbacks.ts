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
  type Node,
  useReactFlow,
  applyEdgeChanges,
  type EdgeChange,
} from "reactflow";
import { uuid } from "uuidv4";
import useCustomNodeFunctions from "./useCustomNodeFunctions";

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
  setShouldSyncChartState: Dispatch<SetStateAction<boolean>>,
  setMenu: (value: SetStateAction<MenuState | null>) => void,
  reactFlowWrapper: RefObject<HTMLInputElement>,
  flowRef: RefObject<HTMLDivElement>,
) => {
  const reactFlowInstance = useReactFlow();
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      const targetKeys = ["resizing", "dragging"];
      for (const key of targetKeys) {
        const targetChange = changes.find((change) => key in change);
        if (targetChange && key === "resizing") {
          setShouldSyncChartState(!(targetChange as NodeDimensionChange)[key]);
        } else if (targetChange && key === "dragging") {
          setShouldSyncChartState(!(targetChange as NodePositionChange)[key]);
        }
      }
    },
    [setNodes, setShouldSyncChartState],
  );

  const onNodesDelete = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      setShouldSyncChartState(true);
    },
    [setNodes, setShouldSyncChartState],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((nds) => applyEdgeChanges(changes, nds));
      setShouldSyncChartState(true);
    },
    [setEdges, setShouldSyncChartState],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      setShouldSyncChartState(true);
    },
    [setEdges, setShouldSyncChartState],
  );

  const { onUpdateNodeText } = useCustomNodeFunctions(
    setNodes,
    setShouldSyncChartState,
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
      if (type === "editableNode" || type === "testNode") {
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

      setNodes((nds) => nds.concat(newNode));
      setShouldSyncChartState(true);
    },
    [
      onUpdateNodeText,
      reactFlowInstance,
      reactFlowWrapper,
      setNodes,
      setShouldSyncChartState,
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
