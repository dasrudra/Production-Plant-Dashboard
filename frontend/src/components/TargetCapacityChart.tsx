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
import { formatNumber } from "../utils/formatters";

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
        <ResponsiveContainer width="100%" height={330}>
          <BarChart
            data={rows}
            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
            barGap={8}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--chart-grid)"
            />
            <XAxis
              dataKey="machineType"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--chart-axis)" }}
            />
            <YAxis
              tickFormatter={(value) => formatNumber(Number(value))}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--chart-axis)" }}
              width={80}
            />
            <Tooltip
              formatter={(value) => formatNumber(Number(value))}
              cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
              contentStyle={{
                background: "var(--chart-tooltip-bg)",
                border: "1px solid var(--chart-tooltip-border)",
                borderRadius: "12px",
                color: "var(--chart-tooltip-text)",
              }}
              labelStyle={{
                fontWeight: 800,
                color: "var(--chart-tooltip-text)",
              }}
              itemStyle={{ color: "var(--chart-tooltip-text)" }}
            />
            <Legend wrapperStyle={{ color: "var(--chart-axis)" }} />
            <Bar
              dataKey="monthlyTarget"
              name="Monthly Target"
              fill="#2563eb"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="monthlyCapacity"
              name="Monthly Capacity"
              fill="#16a34a"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
