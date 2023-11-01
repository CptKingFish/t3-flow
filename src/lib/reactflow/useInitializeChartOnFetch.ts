import {
  type JsonObject,
  type JsonValue,
} from "@prisma/client/runtime/library";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import {
  type Edge,
  type Viewport,
  type Node,
  type SetViewport,
} from "reactflow";
import useCustomNodeFunctions from "./useCustomNodeFunctions";

export default function useInitializeChartOnFetch(
  chartFetched: boolean,
  chartData:
    | {
        title: string;
        id: string;
        state: JsonValue;
        createdAt: Date;
        updatedAt: Date;
      }
    | null
    | undefined,
  setChartTitle: Dispatch<SetStateAction<string>>,
  setNodes: Dispatch<SetStateAction<Node[]>>,
  setEdges: Dispatch<SetStateAction<Edge[]>>,
  setViewport: SetViewport,
  setShouldSyncChartState: Dispatch<SetStateAction<boolean>>,
) {
  const { onUpdateNodeText } = useCustomNodeFunctions(
    setNodes,
    setShouldSyncChartState,
  );

  useEffect(() => {
    if (chartFetched) {
      const chart = (chartData?.state ?? {}) as JsonObject;
      const nodeTypes = ["editableNode", "decisionNode","dataNode"]

      if (chart?.nodes) {
        const nodes = chart?.nodes as unknown as Node[];
        const nodesWithTextUpdate = nodes.map((node) => {
          if (nodeTypes.includes(node.type as string)) {
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
  }, [
    chartData,
    chartFetched,
    setViewport,
    onUpdateNodeText,
    setNodes,
    setEdges,
    setChartTitle,
  ]);
}
