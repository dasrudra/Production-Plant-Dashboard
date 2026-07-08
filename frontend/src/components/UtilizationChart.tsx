import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MachinePlanRow } from "../types/dashboard";

type UtilizationChartProps = {
  rows: MachinePlanRow[];
};

export function UtilizationChart({ rows }: UtilizationChartProps) {
  if (rows.length === 0) {
    return (
      <div className="chart-card">
        <h2>Machine Utilization</h2>
        <div className="empty-state">Upload Excel file to view chart.</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h2>Machine Utilization</h2>
      <p>Utilization is calculated as Monthly Target / Monthly Capacity.</p>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="machineType" />
            <YAxis unit="%" />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="achievement" name="Utilization %" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
