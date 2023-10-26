import { useEffect, useState, useRef } from "react";
import {
  Handle,
  NodeResizer,
  Position,
  useOnSelectionChange,
  useNodes,
  useReactFlow,
  type ResizeParamsWithDirection,
  type ResizeDragEvent,
  type Edge,
  type Node,
} from "reactflow";


// const handleStyle = { left: 10 };

function TextUpdaterNode({
  id,
  data,
  selected,
  isConnectable,
}: {
  id: string;
  data: {
    label: string;
    onUpdateNodeText: (nodeId: string, text: string) => void;
  };
  selected: boolean;
  isConnectable: boolean;
}) {
  const nodes = useNodes()
  const flow = useReactFlow()
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);



  const onTextChange = (newText: string) => {
    data.onUpdateNodeText(id, newText);
  };

  function handleResize(event: ResizeDragEvent, resize: ResizeParamsWithDirection) {
    let directionX = resize.direction[0] || 0
    let directionY = resize.direction[1] || 0
    //get width and height of selected node using nodes and selected id
    flow.setNodes((nds) =>
      nds.map((node) => {
        if (node.id as string === selectedId) {
          let width = node?.width || 0
          let height = node?.height || 0
          if (directionX > 0) {
            width += 10
          } else if (directionX < 0) {
            width -= 10
          }

          if (directionY > 0) {
            height += 10
          } else if (directionY < 0) {
            height -= 10
          }
          node.width = width
          node.height = height
          node.style = {
            height: width,
            width: height
          }
        }
        return node;
      })
    );

  }



  useEffect(() => {
    console.log(nodes[0])
  }, [nodes])

  useOnSelectionChange({
    onChange: ({ nodes, edges }: { nodes: Node[], edges: Edge[] }): void => {
      if (nodes.length === 1) {
        setSelectedId(nodes[0]?.id || null)
      }

    },
  })

  // const size = useStore((s) => {
  //   const node = s.nodeInternals.get(id);

  //   return {
  //     width: node.width,
  //     height: node.height,
  //   };
  // });

  // console.log(size);

  return (

    <div className="border bg-white border-black h-full rounded p-3">


      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div
        className="min-w-[100px] min-h-[30px] w-full h-full"
        onDoubleClick={() => {
          setIsEditing(true);
        }}
      >

        {isEditing ? (
          <textarea
            value={data.label}
            onChange={(e) => onTextChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="w-full h-full resize-none overflow-hidden nodrag"
            autoFocus
          />
        ) : (
          <h4 className="break-words">{data.label}</h4>
        )}
      </div>
      {/* <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={handleStyle}
        isConnectable={isConnectable}
      /> */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default TextUpdaterNode;
