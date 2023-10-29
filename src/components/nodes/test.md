```ts
import { useEffect, useState, useRef } from "react";
import {
  Handle,
  NodeResizer,
  Position,
  useOnSelectionChange,
  useNodes,
  useReactFlow,
  useStore,
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
  width,
  height,
  position,
}: {
  id: string;
  data: {
    label: string;
    onUpdateNodeText: (nodeId: string, text: string) => void;
  };
  selected: boolean;
  isConnectable: boolean;
  width: number;
  height: number;
  position?: { x: number; y: number };
}) {
  const nodes = useNodes()
  const flow = useReactFlow()
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const styles = { fill: "#668de3", strokeWidth: selected ? 2 : 0, stroke: '#fff' };

  const [widthNode, setWidthNode] = useState<number>(0);
  const [heightNode, setHeightNode] = useState<number>(0);


  const onTextChange = (newText: string) => {
    data.onUpdateNodeText(id, newText);
  };

  // function handleResize(event: ResizeDragEvent, resize: ResizeParamsWithDirection) {
  //   let directionX = resize.direction[0] || 0
  //   let directionY = resize.direction[1] || 0
  //   //get width and height of selected node using nodes and selected id
  //   flow.setNodes((nds) =>
  //     nds.map((node) => {
  //       if (node.id as string === selectedId) {
  //         let width = node?.width || 0
  //         let height = node?.height || 0
  //         if (directionX > 0) {
  //           width += 10
  //         } else if (directionX < 0) {
  //           width -= 10
  //         }

  //         if (directionY > 0) {
  //           height += 10
  //         } else if (directionY < 0) {
  //           height -= 10
  //         }
  //         node.width = width
  //         node.height = height
  //         node.style = {
  //           height: width,
  //           width: height
  //         }
  //       }
  //       return node;
  //     })
  //   );

  // }



  // useEffect(() => {
  //   console.log(nodes[0])
  // }, [nodes])

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
  //     width: node?.width,
  //     height: node?.height,
  //   };
  // });

  // console.log(size);

  return (
    <div className="border bg-white border-black h-full relative"> {/* Add 'relative' here */}
      <svg  style={{ 
        display: 'block', 
        overflow: 'visible', 
        position: 'absolute', 
        top: `${position?.y}px`, 
        left: `${position?.x}px`
      }}>
        <rect x={0} y={0} rx={20} width={width || 100} height={height || 30}  {...styles} />
      </svg>
  
      <div style={{
        position: 'absolute', 
        top: `${position?.y}px`, 
        left: `${position?.x}px`,
        minWidth: '100px',
        minHeight: '30px',
      }}>
        <NodeResizer
          color="#ff0071"
          isVisible={selected}
          minWidth={100}
          minHeight={30}
        />
      </div>
  
      <div style={{
        position: 'absolute', 
        top: `${position?.y || 0 - 10}px`, 
        left: `${position?.x || 0 + ((width || 100) / 2) - 5}px`,
      }}>
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
      </div>
  
      <div 
        style={{
          position: 'absolute', 
          top: `${position?.y}px`, 
          left: `${position?.x}px`,
          minWidth: '100px',
          minHeight: '30px',
        }}
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
  
      <div style={{
        position: 'absolute', 
        top: `${position?.y || 0 + (height || 30)}px`, 
        left: `${position?.x || 0 + ((width || 100) / 2) - 5}px`,
      }}>
        <Handle
          type="source"
          position={Position.Bottom}
          id="b"
          isConnectable={isConnectable}
        />
      </div>
    </div>
  );
}

export default TextUpdaterNode;

```
