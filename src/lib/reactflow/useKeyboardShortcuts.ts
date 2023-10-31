import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
} from "react";
import { type Node } from "reactflow";

const useKeyboardShortcuts = (
  undo: () => void,
  setNodes: Dispatch<SetStateAction<Node[]>>,
) => {
  const selectAll = useCallback(() => {
    //loop through nodes array and add a selected:true property to each node
    setNodes((nds) =>
      nds.map((nd) => {
        return { ...nd, selected: true };
      }),
    );
  }, [setNodes]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === "z") {
        undo();
      } else if (event.ctrlKey && event.key === "a") {
        event.preventDefault();
        selectAll();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectAll, undo]);
};

export default useKeyboardShortcuts;
