import { getNamedMiddlewareRegex } from "next/dist/shared/lib/router/utils/route-regex";
import { useEffect, useState } from "react";
import { Handle, NodeResizer, Position, useNodes, type Node } from "reactflow";
import Shape from "./Shapes";

// const handleStyle = { left: 10 };

function DataNode({
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
    const [width, setWidth] = useState<number>(100);
    const [height, setHeight] = useState<number>(60);
    const onTextChange = (newText: string) => {
        data.onUpdateNodeText(id, newText);
    };

    let nodes = useNodes()

    useEffect(() => {
        let node = nodes.find(n => n.id === id)
        if (node) {
            setWidth(node.width || 150)
            setHeight(node.height || 100)
        }
    }, [nodes])

    return (
        <div className="h-full rounded">
            <NodeResizer
                color="#ff0071"
                isVisible={selected}
                minWidth={75}
                minHeight={50}
            />
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
            />
            <Shape type="parallelogram" className="absolute top-0 left-0 -z-10" width={width} height={height} />

            <div
                className="min-w-[100px] min-h-[30px] w-full h-full absolute justify-center items-center flex top-0 left-0"
                onDoubleClick={() => {
                    setIsEditing(true);
                }}
            >
                {isEditing ? (
                    <>
                        <Shape type="parallelogram" className="absolute top-0 left-0" width={width} height={height} />
                        <textarea
                            value={data.label}
                            onChange={(e) => onTextChange(e.target.value)}
                            onBlur={() => setIsEditing(false)}
                            className="w-full h-full resize-none overflow-hidden nodrag z-50 bg-transparent flex"
                            autoFocus
                        />
                    </>
                ) : (
                    <h4 className="break-words">{data.label}</h4>
                )}
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="a"
                isConnectable={isConnectable}
            />
            {/* <Handle
                type="source"
                position={Position.Left}
                id="b"
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="c"
                isConnectable={isConnectable}
            /> */}
        </div>
    );
}

export default DataNode;