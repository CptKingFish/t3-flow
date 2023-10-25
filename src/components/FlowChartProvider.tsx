import { ReactFlowProvider } from "reactflow";
import FlowChart from "./FlowChart";

function FlowChartProvider({
  wsConnected,
  chartId,
}: {
  wsConnected: boolean;
  chartId: string;
}) {
  return (
    <ReactFlowProvider>
      <FlowChart wsConnected={wsConnected} chartId={chartId} />
    </ReactFlowProvider>
  );
}

export default FlowChartProvider;
