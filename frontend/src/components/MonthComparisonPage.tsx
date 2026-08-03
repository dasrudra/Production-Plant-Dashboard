import { useEffect, useState } from "react";

import {
  getReportUploads,
  getReportUploadDetail,
} from "../services/reportsApi";
import type { ReportUploadSummary, ReportUploadDetail } from "../types/reports";
function numberDifference(current: number, previous: number) {
  return current - previous;
}

function percentDifference(current: number, previous: number) {
  if (previous === 0) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}

export function MonthComparisonPage() {
  const [reports, setReports] = useState<ReportUploadSummary[]>([]);
  const [leftMonthId, setLeftMonthId] = useState<number | "">("");
  const [rightMonthId, setRightMonthId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [leftDashboard, setLeftDashboard] = useState<ReportUploadDetail | null>(
    null,
  );

  const [rightDashboard, setRightDashboard] =
    useState<ReportUploadDetail | null>(null);

  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);

      try {
        const result = await getReportUploads();

        setReports(result.uploads);

        if (result.uploads.length >= 1) {
          setLeftMonthId(result.uploads[0].id);
        }

        if (result.uploads.length >= 2) {
          setRightMonthId(result.uploads[1].id);
        }
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  async function handleCompare() {
    if (leftMonthId === "" || rightMonthId === "") {
      return;
    }

    setCompareLoading(true);

    try {
      const leftResult = await getReportUploadDetail(leftMonthId);

      const rightResult = await getReportUploadDetail(rightMonthId);

      setLeftDashboard(leftResult.upload);

      setRightDashboard(rightResult.upload);
    } finally {
      setCompareLoading(false);
    }
  }

  return (
    <div className="module-placeholder">
      <section className="module-placeholder-header">
        <p className="eyebrow">Advanced Analytics</p>

        <h1>Month Comparison</h1>

        <p>
          Compare production performance between two different monthly
          dashboards to identify changes in production target, machine
          utilization, capacity, and operational efficiency.
        </p>
      </section>

      <section className="module-scope-card">
        <h2>Select Dashboards</h2>

        <div className="comparison-selector-grid">
          <div className="comparison-selector">
            <label>First Month</label>

            <select
              value={leftMonthId}
              onChange={(event) => setLeftMonthId(Number(event.target.value))}
            >
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.month} — {report.fileName}
                </option>
              ))}
            </select>
          </div>

          <div className="comparison-selector">
            <label>Second Month</label>

            <select
              value={rightMonthId}
              onChange={(event) => setRightMonthId(Number(event.target.value))}
            >
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.month} — {report.fileName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="comparison-button-row">
          <button
            className="compare-dashboard-button"
            onClick={handleCompare}
            disabled={
              loading ||
              compareLoading ||
              leftMonthId === "" ||
              rightMonthId === ""
            }
          >
            {compareLoading ? "Loading..." : "Compare Dashboards"}
          </button>
        </div>

        {leftDashboard && rightDashboard && (
          <>
            <div className="comparison-summary-card">
              <h2>KPI Comparison</h2>

              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>{leftDashboard.summary.month}</th>
                    <th>{rightDashboard.summary.month}</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Monthly Target</td>
                    <td>
                      {leftDashboard.summary.monthlyTarget.toLocaleString()}
                    </td>
                    <td>
                      {rightDashboard.summary.monthlyTarget.toLocaleString()}
                    </td>
                  </tr>

                  <tr>
                    <td>Monthly Capacity</td>
                    <td>
                      {leftDashboard.summary.monthlyCapacity.toLocaleString()}
                    </td>
                    <td>
                      {rightDashboard.summary.monthlyCapacity.toLocaleString()}
                    </td>
                  </tr>

                  <tr>
                    <td>Capacity Utilization</td>
                    <td>
                      {leftDashboard.summary.capacityUtilization.toFixed(2)}%
                    </td>
                    <td>
                      {rightDashboard.summary.capacityUtilization.toFixed(2)}%
                    </td>
                  </tr>

                  <tr>
                    <td>Machine Count</td>
                    <td>{leftDashboard.summary.machineCount}</td>
                    <td>{rightDashboard.summary.machineCount}</td>
                  </tr>

                  <tr>
                    <td>Active Labor</td>
                    <td>{leftDashboard.summary.activeLabor}</td>
                    <td>{rightDashboard.summary.activeLabor}</td>
                  </tr>

                  <tr>
                    <td>Active Machine</td>
                    <td>{leftDashboard.summary.activeMachine}</td>
                    <td>{rightDashboard.summary.activeMachine}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="comparison-difference-card">
              <h2>Performance Difference</h2>

              <div className="comparison-difference-grid">
                <div className="difference-item">
                  <span>Monthly Target</span>

                  <strong>
                    {numberDifference(
                      leftDashboard.summary.monthlyTarget,
                      rightDashboard.summary.monthlyTarget,
                    ).toLocaleString()}
                  </strong>

                  <p>
                    {percentDifference(
                      leftDashboard.summary.monthlyTarget,
                      rightDashboard.summary.monthlyTarget,
                    ).toFixed(2)}
                    %
                  </p>
                </div>

                <div className="difference-item">
                  <span>Capacity Utilization</span>

                  <strong>
                    {numberDifference(
                      leftDashboard.summary.capacityUtilization,
                      rightDashboard.summary.capacityUtilization,
                    ).toFixed(2)}
                    %
                  </strong>

                  <p>Difference in utilization</p>
                </div>

                <div className="difference-item">
                  <span>Active Machine</span>

                  <strong>
                    {numberDifference(
                      leftDashboard.summary.activeMachine,
                      rightDashboard.summary.activeMachine,
                    )}
                  </strong>

                  <p>Machine change</p>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
