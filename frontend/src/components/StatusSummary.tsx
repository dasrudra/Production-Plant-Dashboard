import type { DashboardSummary } from "../types/dashboard";

type StatusSummaryProps = {
  summary?: DashboardSummary;
};

export function StatusSummary({ summary }: StatusSummaryProps) {
  const lowCount = summary?.statusCounts?.Low ?? 0;
  const normalCount = summary?.statusCounts?.Normal ?? 0;
  const goodCount = summary?.statusCounts?.Good ?? 0;
  const excellentCount = summary?.statusCounts?.Excellent ?? 0;

  return (
    <section className="status-summary-grid">
      <div className="status-summary-card low-summary">
        <span>Low Machines</span>
        <strong>{lowCount}</strong>
        <p>Needs management attention</p>
      </div>

      <div className="status-summary-card normal-summary">
        <span>Normal Machines</span>
        <strong>{normalCount}</strong>
        <p>Acceptable operating range</p>
      </div>

      <div className="status-summary-card good-summary">
        <span>Good Machines</span>
        <strong>{goodCount}</strong>
        <p>Healthy utilization level</p>
      </div>

      <div className="status-summary-card excellent-summary">
        <span>Excellent Machines</span>
        <strong>{excellentCount}</strong>
        <p>High utilization performance</p>
      </div>
    </section>
  );
}
