import { getNamedMiddlewareRegex } from "next/dist/shared/lib/router/utils/route-regex";
import { useEffect, useState } from "react";
import { Handle, NodeResizer, Position, useNodes, type Node } from "reactflow";

// const handleStyle = { left: 10 };

function TestNode({
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

    const styles = { fill: "#aaa", strokeWidth: selected ? 2 : 0, stroke: '#fff' };

    const onTextChange = (newText: string) => {
        data.onUpdateNodeText(id, newText);
    };

    let nodes = useNodes()

    useEffect(() => {
        let node = nodes.find(n => n.id === id)
        if (node) {
            setWidth(node.width || 100)
            setHeight(node.height || 60)
            console.log("heh?")
        }
    }, [nodes])

    // const size = useStore((s) => {
    //   const node = s.nodeInternals.get(id);

    //   return {
    //     width: node.width,
    //     height: node.height,
    //   };
    // });

    // console.log(size);

    return (
        <div className=" h-full rounded">
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
            <svg className="absolute top-0 left-0" width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
                <path d={`M0,${height / 2} L${width / 2},0 L${width},${height / 2} L${width / 2},${height} z`} {...styles} />
            </svg>

            <div
                className="min-w-[100px] min-h-[30px] w-full h-full absolute justify-center items-center flex top-0 left-0"
                onDoubleClick={() => {
                    setIsEditing(true);
                }}
            >
                {isEditing ? (
                    <>
                        <svg className="absolute top-0 left-0 z-0" width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
                            <path d={`M0,${height / 2} L${width / 2},0 L${width},${height / 2} L${width / 2},${height} z`} {...styles} />
                        </svg>
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
            {/* <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={handleStyle}
        isConnectable={isConnectable}
      /> */}
            <Handle
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
            />
        </div>
    );
}

export default TestNode;