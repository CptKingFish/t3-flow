import { type Dispatch, type SetStateAction, useCallback } from "react";
import { type Node } from "reactflow";

export default function useCustomNodeFunctions(
  setNodes: Dispatch<SetStateAction<Node[]>>,
  setShouldSyncChartState: Dispatch<SetStateAction<boolean>>,
) {
  const onUpdateNodeText = useCallback(
    (nodeId: string, text: string) => {
      setNodes((nds) =>
        nds.map((nd: Node) => {
          if (nd.id === nodeId) {
            return { ...nd, data: { ...nd.data, label: text } as Node };
          }
          return nd;
        }),
      );
      setShouldSyncChartState(true);
    },
    [setNodes, setShouldSyncChartState],
  );

  return {
    onUpdateNodeText,
  };
}
