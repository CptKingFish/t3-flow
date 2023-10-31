import { ReactFlowProvider } from "reactflow";
import FlowChart from "./FlowChart";

export default function FlowChartWrapper({
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
