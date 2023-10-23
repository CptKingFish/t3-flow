import { useState } from "react";
import { Handle, NodeResizer, Position } from "reactflow";

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
  const [isEditing, setIsEditing] = useState(false);

  const onTextChange = (newText: string) => {
    data.onUpdateNodeText(id, newText);
  };

  // const size = useStore((s) => {
  //   const node = s.nodeInternals.get(id);

  //   return {
  //     width: node.width,
  //     height: node.height,
  //   };
  // });

  // console.log(size);

  return (
    <div className="border border-black h-full rounded p-3">
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
