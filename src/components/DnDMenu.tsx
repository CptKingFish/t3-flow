import InputNode from "reactflow";


function DnDMenu() {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="mt-12">
      <div className="description">
        You can drag these nodes to the pane on the right.
      </div>
      <div
        className=""
        onDragStart={(event) => onDragStart(event, "input")}
        draggable
      >
        Input Node
      </div>
      <div
        className=""
        onDragStart={(event) => onDragStart(event, "default")}
        draggable
      >
        Default Node
      </div>
      <div
        className=""
        onDragStart={(event) => onDragStart(event, "output")}
        draggable
      >
        Output Node
      </div>
      <div
        className=""
        onDragStart={(event) => onDragStart(event, "editableNode")}
        draggable
      >
        Editable Node
      </div>
      <div
        className=""
        onDragStart={(event) => onDragStart(event, "testNode")}
        draggable
      >
        Test Node
      </div>
    </aside>
  );
}

export default DnDMenu;
