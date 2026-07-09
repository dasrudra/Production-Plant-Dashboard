import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { DashboardSummary } from "../types/dashboard";

type StatusDistributionChartProps = {
  summary?: DashboardSummary;
};

const STATUS_COLORS: Record<string, string> = {
  Low: "#ef4444",
  Normal: "#f59e0b",
  Good: "#22c55e",
  Excellent: "#0ea5e9",
};

export function StatusDistributionChart({
  summary,
}: StatusDistributionChartProps) {
  if (!summary) {
    return (
      <div className="chart-card status-chart-card">
        <h2>Status Distribution</h2>
        <div className="empty-state">Upload Excel file to view status chart.</div>
      </div>
    );
  }

  const data = ["Low", "Normal", "Good", "Excellent"].map((status) => ({
    name: status,
    value: summary.statusCounts?.[status] ?? 0,
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-card status-chart-card">
      <div className="section-title-row">
        <div>
          <h2>Status Distribution</h2>
          <p>Machine category count by utilization status.</p>
        </div>

        <div className="chart-total-badge">
          <span>Total Machines</span>
          <strong>{total}</strong>
        </div>
      </div>

      <div className="status-chart-layout">
        <div className="chart-box pie-chart-box">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={115}
                paddingAngle={3}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] || "#64748b"}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} machine group(s)`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="status-breakdown-list">
          {data.map((item) => (
            <div key={item.name} className="status-breakdown-item">
              <span
                className="status-dot"
                style={{ backgroundColor: STATUS_COLORS[item.name] }}
              />
              <div>
                <strong>{item.name}</strong>
                <p>{item.value} machine group(s)</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
