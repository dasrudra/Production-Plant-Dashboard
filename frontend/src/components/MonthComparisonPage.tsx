import { useEffect, useState } from "react";

import { getReportUploads } from "../services/reportsApi";
import type { ReportUploadSummary } from "../types/reports";

export function MonthComparisonPage() {
  const [reports, setReports] = useState<ReportUploadSummary[]>([]);
  const [leftMonthId, setLeftMonthId] = useState<number | "">("");
  const [rightMonthId, setRightMonthId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

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
            disabled={loading || leftMonthId === "" || rightMonthId === ""}
          >
            Compare Dashboards
          </button>
        </div>
      </section>
    </div>
  );
}
