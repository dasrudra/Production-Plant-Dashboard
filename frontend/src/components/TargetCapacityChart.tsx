import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MachinePlanRow } from "../types/dashboard";

type TargetCapacityChartProps = {
  rows: MachinePlanRow[];
};

export function TargetCapacityChart({ rows }: TargetCapacityChartProps) {
  if (rows.length === 0) {
    return (
      <div className="chart-card">
        <h2>Target vs Capacity</h2>
        <div className="empty-state">Upload Excel file to view chart.</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h2>Target vs Capacity</h2>
      <p>Machine-wise monthly target compared with available capacity.</p>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="machineType" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="monthlyTarget" name="Monthly Target" fill="#2563eb" />
            <Bar dataKey="monthlyCapacity" name="Monthly Capacity" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
