import { ReactFlowProvider } from "reactflow";
import FlowChart from "./FlowChart";

function FlowChartProvider({ wsConnected }: { wsConnected: boolean }) {
  return (
    <ReactFlowProvider>
      <FlowChart wsConnected={wsConnected} />
    </ReactFlowProvider>
  );
}

export default FlowChartProvider;
