import type { DashboardSummary } from "../types/dashboard";

import type { ReportUploadSummary } from "../types/reports";

type DashboardInsightProps = {
  summary?: DashboardSummary;
  reports?: ReportUploadSummary[];
};

export function DashboardInsight({
  summary,
  reports = [],
}: DashboardInsightProps) {
  if (!summary) {
    return null;
  }

  const sortedReports = [...reports].sort(
    (a, b) => b.capacityUtilization - a.capacityUtilization,
  );

  const bestMonth = sortedReports[0];

  const worstMonth = sortedReports[sortedReports.length - 1];

  const averageUtilization =
    reports.length > 0
      ? reports.reduce((sum, report) => sum + report.capacityUtilization, 0) /
        reports.length
      : summary.capacityUtilization;

  const latestReport = reports[0];

  const previousReport = reports[1];

  const capacityTrend =
    latestReport && previousReport
      ? latestReport.monthlyCapacity - previousReport.monthlyCapacity
      : 0;

  const targetTrend =
    latestReport && previousReport
      ? latestReport.monthlyTarget - previousReport.monthlyTarget
      : 0;

  return (
    <section className="dashboard-insight-card">
      <div>
        <p className="insight-eyebrow">Historical Performance</p>

        <h2>Production Performance Summary</h2>

        <p>
          Best Month:
          <strong> {bestMonth?.month ?? "-"}</strong>
          &nbsp; | &nbsp; Worst Month:
          <strong> {worstMonth?.month ?? "-"}</strong>
        </p>

        <p>
          Capacity Trend:
          <strong>
            {" "}
            {capacityTrend >= 0 ? "+" : ""}
            {capacityTrend.toLocaleString()}
          </strong>
          &nbsp; | &nbsp; Target Trend:
          <strong>
            {" "}
            {targetTrend >= 0 ? "+" : ""}
            {targetTrend.toLocaleString()}
          </strong>
        </p>
      </div>

      <div className="insight-score">
        <span>Average Utilization</span>

        <strong>{averageUtilization.toFixed(2)}%</strong>
      </div>
    </section>
  );
}
