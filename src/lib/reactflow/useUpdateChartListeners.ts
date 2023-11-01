import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
} from "react";
import { type Node, type Edge, useReactFlow } from "reactflow";
import { socket } from "../socket/socket";
import { api } from "~/@/utils/api";
import useCustomNodeFunctions from "./useCustomNodeFunctions";

export default function useUpdateChartListeners(
  chartId: string,
  nodes: Node[],
  edges: Edge[],
  shouldSyncChartState: boolean,
  wsConnected: boolean,
  elements: { nodes: Node[]; edges: Edge[] } | undefined,
  setElements: (elements: { nodes: Node[]; edges: Edge[] }) => void,
  setNodes: (value: SetStateAction<Node[]>) => void,
  setEdges: (value: SetStateAction<Edge[]>) => void,
  setShouldSyncChartState: Dispatch<SetStateAction<boolean>>,
  chartFetched: boolean,
) {
  const { getViewport } = useReactFlow();
  const {
    mutate: updateChart,
    isLoading: isUpdatingChart,
    isError: isUpdateChartError,
    isSuccess: isUpdateChartSuccess,
  } = api.flowchart.updateChart.useMutation();

  const { onUpdateNodeText } = useCustomNodeFunctions(
    setNodes,
    setShouldSyncChartState,
  );

  const triggerUpdate = useCallback(
    (n: Node[] = nodes, e: Edge[] = edges) => {
      setElements({ nodes: n, edges: e });
    },
    [edges, nodes, setElements],
  );

  useEffect(() => {
    if (!shouldSyncChartState) return;
    triggerUpdate(nodes, edges);
    if (chartFetched) {
      updateChart({
        id: chartId,
        state: { nodes, edges, viewport: getViewport() },
      });
    }
    socket.timeout(5000).emit("chart-updated", { nodes, edges });
    setShouldSyncChartState(false);
  }, [
    nodes,
    edges,
    shouldSyncChartState,
    triggerUpdate,
    setShouldSyncChartState,
    updateChart,
    chartId,
    getViewport,
    chartFetched,
  ]);

  useEffect(() => {
    if (!elements) return;
    setNodes(elements.nodes);
    setEdges(elements.edges);
    setShouldSyncChartState(true);
  }, [elements, setEdges, setNodes, setShouldSyncChartState]);

  useEffect(() => {
    if (!wsConnected) return;

    function onChartUpdated({
      nodes: updatedNodes,
      edges: updatedEdges,
    }: {
      nodes: Node[];
      edges: Edge[];
    }) {
      const nodesWithTextUpdate = updatedNodes.map((node) => {
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
      setEdges(updatedEdges);
    }

    socket.on("chart-updated", onChartUpdated);

    return () => {
      socket.off("chart-updated", onChartUpdated);
    };
  }, [wsConnected, onUpdateNodeText, setNodes, setEdges]);
}
