import { useContext, useEffect, useState } from "react";
import { Handle, NodeResizer, Position } from "reactflow";
import { useEditContext } from "~/@/pages/_app";

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

  const { edit, setEdit } = useEditContext();

  useEffect(() => {
    if (isEditing) {
      setEdit(true)
    } else {
      setEdit(false)
    }
  }, [isEditing])

  return (
    <div className="h-full rounded border border-black p-3">
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
        className="h-full min-h-[30px] w-full min-w-[100px]"
        onDoubleClick={() => {
          setIsEditing(true);
        }}
      >
        {isEditing ? (
          <textarea
            value={data.label}
            onChange={(e) => onTextChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="nodrag h-full w-full resize-none overflow-hidden"
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
