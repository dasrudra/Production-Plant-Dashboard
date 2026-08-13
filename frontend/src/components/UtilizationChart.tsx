import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

const BAR_COLOR_NORMAL = "#f97316";
const BAR_COLOR_OVER_CAPACITY = "#7c3aed";

export function UtilizationChart({ rows }: UtilizationChartProps) {
  if (rows.length === 0) {
    return (
      <div className="chart-card">
        <h2>Machine Utilization</h2>
        <div className="empty-state">Upload Excel file to view chart.</div>
      </div>
    );
  }

  // The Y domain is a hint, not a clamp: Recharts grows the axis when data
  // exceeds it. Compute a max that always clears the data and lands on a
  // round multiple of 50, so ticks stay readable at any utilization.
  const maxAchievement = rows.reduce(
    (highest, row) => Math.max(highest, row.achievement),
    0,
  );

  const axisMax = Math.ceil(Math.max(120, maxAchievement) / 50) * 50;

  const axisTicks = Array.from(
    { length: axisMax / 50 + 1 },
    (_, index) => index * 50,
  );

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
              unit="%"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--chart-axis)" }}
              domain={[0, axisMax]}
              ticks={axisTicks}
            />
            <Tooltip
              formatter={(value) => `${formatDecimal(Number(value), 2)}%`}
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
            <ReferenceLine
              y={80}
              stroke="#16a34a"
              strokeDasharray="6 6"
              label={{
                value: "Good 80%",
                position: "insideTopLeft",
                fill: "#166534",
                fontSize: 12,
              }}
            />
            <ReferenceLine
              y={100}
              stroke="#7c3aed"
              strokeDasharray="4 4"
              label={{
                value: "Capacity 100%",
                position: "insideTopRight",
                fill: "#5b21b6",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="achievement"
              name="Utilization %"
              radius={[8, 8, 0, 0]}
            >
              {rows.map((row) => (
                <Cell
                  key={`${row.rowNumber}-${row.machineType}`}
                  fill={
                    row.status === "Over Capacity"
                      ? BAR_COLOR_OVER_CAPACITY
                      : BAR_COLOR_NORMAL
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
