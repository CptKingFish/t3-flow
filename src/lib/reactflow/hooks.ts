import { useEffect } from "react";

const useKeyboardShortcuts = (undo: () => void, selectAll: () => void) => {
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
