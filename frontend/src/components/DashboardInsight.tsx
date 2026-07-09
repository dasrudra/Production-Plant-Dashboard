import type { DashboardSummary } from "../types/dashboard";
import { formatPercent } from "../utils/formatters";

type DashboardInsightProps = {
  summary?: DashboardSummary;
};

export function DashboardInsight({ summary }: DashboardInsightProps) {
  if (!summary) {
    return null;
  }

  const lowCount = summary.statusCounts?.Low ?? 0;
  const normalCount = summary.statusCounts?.Normal ?? 0;
  const goodCount = summary.statusCounts?.Good ?? 0;
  const excellentCount = summary.statusCounts?.Excellent ?? 0;

  const attentionText =
    lowCount > 0
      ? `${lowCount} machine group${lowCount > 1 ? "s are" : " is"} in Low status and ${lowCount > 1 ? "need" : "needs"} management attention.`
      : "No machine group is currently in Low status.";

  return (
    <section className="dashboard-insight-card">
      <div>
        <p className="insight-eyebrow">Management Insight</p>
        <h2>
          Capacity utilization is {formatPercent(summary.capacityUtilization)}
        </h2>
        <p>
          {attentionText} Current status distribution: {excellentCount}{" "}
          Excellent, {goodCount} Good, {normalCount} Normal, and {lowCount} Low.
        </p>
      </div>

      <div className="insight-score">
        <span>Overall Utilization</span>
        <strong>{formatPercent(summary.capacityUtilization)}</strong>
      </div>
    </section>
  );
}
