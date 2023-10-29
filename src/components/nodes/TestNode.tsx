import React, { useEffect, useState, useRef } from 'react';
import { Handle, NodeProps, Position, useReactFlow, useUpdateNodeInternals } from 'reactflow';
import {
  makeMoveable,
  DraggableProps,
  ResizableProps,
  RotatableProps,
  Rotatable,
  Draggable,
  Resizable,
  OnResize,
  OnRotate,
} from 'react-moveable';

const Moveable = makeMoveable<DraggableProps & ResizableProps & RotatableProps>([Draggable, Resizable, Rotatable]);

export default function ResizeRotateNode({
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
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const resizeRef = useRef<HTMLDivElement | null>(null);
  const { setNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const [rotation, setRotation] = useState(0);
  const [resizable, setResizable] = useState(true);
  const [rotatable, setRotatable] = useState(true);

  useEffect(() => {
    nodeRef.current = document.querySelector(`.react-flow__node[data-id="${id}"]`);
  }, [id]);

  const onResize = (evt: OnResize) => {
    if (!nodeRef.current) {
      return;
    }
    let minWidth = 150
    let minHeight = 100

    evt.width = Math.max(evt.width, minWidth)
    evt.height = Math.max(evt.height, minHeight)

    evt.delta[0] && (nodeRef.current.style.width = `${evt.width}px`);
    evt.delta[1] && (nodeRef.current.style.height = `${evt.height}px`);
    if (evt.width != minWidth || evt.height != minHeight) {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            node.position = {
              x: evt.direction[0] === -1 ? node.position.x - (evt.delta[0] ? evt.delta[0] : 0) : node.position.x,
              y: evt.direction[1] === -1 ? node.position.y - (evt.delta[1] ? evt.delta[1] : 0) : node.position.y,
            };
            console.log(node)
          }
          return node;
        })
      );
    }
  };

  const onRotate = (evt: OnRotate) => {
    setRotation(evt.rotation);
    updateNodeInternals(id);
  };

  return (
    <>
      <Moveable
        className="nodrag"
        resizable={selected && resizable}
        rotatable={selected && rotatable}
        hideDefaultLines={!selected}
        target={resizeRef}
        onResize={onResize}
        onRotate={onRotate}
        origin={true}
        keepRatio={false}
        throttleResize={10}

      />
      <div
        ref={resizeRef}
        style={{
          width: '100%',
          height: '100%',
          background: '#ddd',
          borderRadius: 15,
          border: '1px solid #ff0072',
          backgroundColor: '#ffcce3',
          padding: 20,
          transform: `rotate(${rotation}deg)`,
        }}
      >

        <Handle style={{ opacity: 1 }} position={Position.Bottom} type="source" />
        <Handle style={{ opacity: 1 }} position={Position.Top} type="target" />
      </div>
    </>
  );
}
