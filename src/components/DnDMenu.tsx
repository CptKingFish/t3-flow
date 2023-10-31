import InputNode from "reactflow";
import Diamond from "./nodes/Shapes";

function DnDMenu() {
  const styles = { fill: "#aaa", strokeWidth: 2, stroke: '#fff' };
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
          onDragStart={(event) => onDragStart(event, "testNode")}
          draggable
        >
          <div className="w-full h-full relative">
            <svg className="absolute -z-10" width="132" height="88" viewBox={`0 0 ${132} ${88}`}>
              <path d={`M0,${88 / 2} L${132 / 2},0 L${132},${88 / 2} L${132 / 2},${88} z`}  {...styles} />
            </svg>
            <div className="absolute z-10 items-center justify-center top-8 left-4">Decision node</div>
          </div>

        </div>
      </div>
    </aside>
  );
}

export default DnDMenu;
