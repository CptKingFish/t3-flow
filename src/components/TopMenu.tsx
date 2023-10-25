import { Fragment, useCallback, useState } from 'react'
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
  } from "reactflow";



function TopMenu() {
    
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    useOnSelectionChange({
        onChange: ({ nodes, edges }: { nodes: Node[], edges: Edge[] }):void => {
          if (nodes.length === 1) {
            setWidth(nodes[0]?.width || 0);
            setHeight(nodes[0]?.height || 0);

          }else{
            setWidth(0);
            setHeight(0);
          }
        },
      })
    const onNodesChange = useCallback((changes: NodeChange[]) => {
        console.log("onNodesChange", changes);
      
    }, []);

      
    return (
        <Disclosure as="nav" className="bg-white shadow">
            Width = {width} Height = {height}
        
        </Disclosure>
    )

}

export default TopMenu;