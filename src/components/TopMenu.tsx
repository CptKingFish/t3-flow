import { Fragment, useCallback, useState, useEffect } from 'react'
import { Disclosure } from '@headlessui/react'
import ReactFlow, {
  type Node,
  Controls,
  Background,
  MiniMap,
  Panel,
  type NodeChange,
  type Edge,
  type OnNodesDelete,
  type OnEdgesChange,
  type ReactFlowInstance,
  useOnSelectionChange,
  useNodes,
} from "reactflow";



function TopMenu() {
  const nodes = useNodes();
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [posX, setPosX] = useState<number>(0);
  const [posY, setPosY] = useState<number>(0);

  useEffect(() => {
    const selectedNodes = nodes.filter((node) => node.selected === true);
  
    if (selectedNodes.length === 1) {
      const selectedNode = selectedNodes[0];
      setWidth(selectedNode?.width || 0);
      setHeight(selectedNode?.height || 0);
      setPosX(selectedNode?.position.x || 0);
      setPosY(selectedNode?.position.y || 0);
    } else if (selectedNodes.length > 1) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
  
      selectedNodes.forEach((node) => {
        const x = node.position.x;
        const y = node.position.y;
  
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
  
      const middleX = (minX + maxX) / 2;
      const middleY = (minY + maxY) / 2;
  
      setWidth(0);
      setHeight(0);
      setPosX(middleX);
      setPosY(middleY);
    }
  }, [nodes]);
  

  return (
    <Disclosure as="nav" className="bg-white shadow">
      Width = {width} Height = {height}
      <br />
      X = {posX} Y = {posY}
    </Disclosure>
  )

}

export default TopMenu;