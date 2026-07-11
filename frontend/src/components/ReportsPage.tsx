import { useEffect, useState } from "react";

import { getReportUploads } from "../services/reportsApi";
import type { ReportUploadSummary } from "../types/reports";
import { formatNumber, formatPercent } from "../utils/formatters";

export function ReportsPage() {
  const [uploads, setUploads] = useState<ReportUploadSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadReports() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getReportUploads();
      setUploads(result.uploads);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load saved dashboard reports.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <section className="reports-page">
      <div className="module-placeholder-header">
        <p className="eyebrow">Reports</p>
        <h1>Saved Dashboard Reports</h1>
        <p>
          View Excel uploads saved in the database. Each record represents a
          summarized production capacity dashboard generated from the Plan-KPP sheet.
        </p>
      </div>

      <div className="reports-actions-card">
        <div>
          <strong>Upload History</strong>
          <span>{uploads.length} saved dashboard record(s)</span>
        </div>

        <button type="button" onClick={loadReports} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh Reports"}
        </button>
      </div>

      {errorMessage ? (
        <div className="error-box">
          <strong>Reports loading failed:</strong> {errorMessage}
        </div>
      ) : null}

      <div className="table-card">
        <div className="section-title-row table-title-row">
          <div>
            <h2>Saved Upload Records</h2>
            <p>Source: SQLite database</p>
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state">Loading saved dashboard records...</div>
        ) : uploads.length === 0 ? (
          <div className="empty-state">
            No saved reports found. Upload an Excel file from the Dashboard page first.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>File Name</th>
                  <th>Month</th>
                  <th>Section</th>
                  <th>Target</th>
                  <th>Capacity</th>
                  <th>Utilization</th>
                  <th>Active Labour</th>
                  <th>Active Machine</th>
                  <th>Machine Count</th>
                  <th>Uploaded At</th>
                </tr>
              </thead>

              <tbody>
                {uploads.map((upload) => (
                  <tr key={upload.id}>
                    <td className="strong">#{upload.id}</td>
                    <td>{upload.fileName}</td>
                    <td>{upload.month}</td>
                    <td>{upload.workingSection}</td>
                    <td>{formatNumber(upload.monthlyTarget)}</td>
                    <td>{formatNumber(upload.monthlyCapacity)}</td>
                    <td>{formatPercent(upload.capacityUtilization)}</td>
                    <td>{formatNumber(upload.activeLabor)}</td>
                    <td>{formatNumber(upload.activeMachine)}</td>
                    <td>{formatNumber(upload.machineCount)}</td>
                    <td>{upload.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
