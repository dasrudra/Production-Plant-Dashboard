import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MachinePlanRow } from "../types/dashboard";
import { formatDecimal } from "../utils/formatters";

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
        <ResponsiveContainer width="100%" height={330}>
          <BarChart
            data={rows}
            margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="machineType"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              unit="%"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              domain={[0, 120]}
            />
            <Tooltip
              formatter={(value) => `${formatDecimal(Number(value), 2)}%`}
              labelStyle={{ fontWeight: 800 }}
            />
            <ReferenceLine
              y={80}
              stroke="#16a34a"
              strokeDasharray="6 6"
              label={{
                value: "Good level 80%",
                position: "insideTopRight",
                fill: "#166534",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="achievement"
              name="Utilization %"
              fill="#f97316"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
