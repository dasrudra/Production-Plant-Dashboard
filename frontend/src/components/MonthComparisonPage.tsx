import { useEffect, useState } from "react";

import {
  getReportUploads,
  getReportUploadDetail,
} from "../services/reportsApi";
import type { ReportUploadSummary, ReportUploadDetail } from "../types/reports";

const STORAGE_KEY_COMPARISON = "kpp-dashboard-comparison-selection";

type StoredSelection = {
  leftId: number;
  rightId: number;
};

function readStoredSelection(): StoredSelection | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPARISON);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredSelection;

    if (
      typeof parsed?.leftId === "number" &&
      typeof parsed?.rightId === "number"
    ) {
      return parsed;
    }
  } catch {
    // Blocked or corrupt storage: start with no saved comparison.
  }

  return null;
}

function numberDifference(current: number, previous: number) {
  return current - previous;
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

  async function runComparison(leftId: number, rightId: number) {
    setCompareLoading(true);

    try {
      const leftResult = await getReportUploadDetail(leftId);

      const rightResult = await getReportUploadDetail(rightId);

      setLeftDashboard(leftResult.upload);

      setRightDashboard(rightResult.upload);

      try {
        localStorage.setItem(
          STORAGE_KEY_COMPARISON,
          JSON.stringify({ leftId, rightId }),
        );
      } catch {
        // Not remembering the comparison is not worth an error.
      }
    } finally {
      setCompareLoading(false);
    }
  }

  useEffect(() => {
    async function loadReports() {
      setLoading(true);

      try {
        const result = await getReportUploads();

        setReports(result.uploads);

        const availableIds = new Set(result.uploads.map((report) => report.id));
        const stored = readStoredSelection();

        // Restore a saved comparison only if BOTH reports still exist.
        // Either one may have been deleted since it was last run, and
        // requesting a deleted id would 404.
        if (
          stored &&
          availableIds.has(stored.leftId) &&
          availableIds.has(stored.rightId)
        ) {
          setLeftMonthId(stored.leftId);
          setRightMonthId(stored.rightId);

          await runComparison(stored.leftId, stored.rightId);

          return;
        }

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

    await runComparison(leftMonthId, rightMonthId);
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
            <div className="comparison-summary-card">
              <h2>Machine-wise Comparison</h2>

              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Machine</th>
                    <th>{leftDashboard.summary.month}</th>
                    <th>{rightDashboard.summary.month}</th>
                    <th>Difference</th>
                  </tr>
                </thead>

                <tbody>
                  {leftDashboard.machineRows.map((leftRow) => {
                    const rightRow = rightDashboard.machineRows.find(
                      (machine) => machine.machineType === leftRow.machineType,
                    );

                    return (
                      <tr key={leftRow.machineType}>
                        <td>{leftRow.machineType}</td>

                        <td>{leftRow.achievement.toFixed(2)}%</td>

                        <td>{rightRow?.achievement.toFixed(2) ?? "-"}%</td>

                        <td>
                          {rightRow
                            ? numberDifference(
                                leftRow.achievement,
                                rightRow.achievement,
                              ).toFixed(2)
                            : "-"}
                          %
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
