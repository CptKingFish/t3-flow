import InputNode from "reactflow";
import Shape from "./nodes/Shapes";

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
        You can drag these nodes
        <br/> to the pane on the right.
      </div>
      <div className="grid">
        <div
          className="row"
          onDragStart={(event) => onDragStart(event, "input")}
          draggable
        >
          Input Node
        </div>
        <div
          className="row"
          onDragStart={(event) => onDragStart(event, "default")}
          draggable
        >
          Default Node
        </div>
        <div
          className="row"
          onDragStart={(event) => onDragStart(event, "output")}
          draggable
        >
          Output Node
        </div>
        <div
          className="row"
          onDragStart={(event) => onDragStart(event, "editableNode")}
          draggable
        >
          Editable Node
        </div>
        <div
          className="row"
          onDragStart={(event) => onDragStart(event, "decisionNode")}
          draggable
        >
          <div className="w-full h-full relative">
            <Shape type="diamond" className = "absolute -z-10" width={132} height={88} override={true}/>
            <div className="absolute z-10 items-center justify-center top-8 left-4">Decision node</div>
          </div>

        </div>
      </div>
    </aside>
  );
}

export default DnDMenu;
