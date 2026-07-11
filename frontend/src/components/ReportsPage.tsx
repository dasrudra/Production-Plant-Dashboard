import { useEffect, useState } from "react";

import {
  getReportUploadDetail,
  getReportUploads,
} from "../services/reportsApi";
import type { ExcelAnalyzeResponse } from "../types/dashboard";
import type { ReportUploadSummary } from "../types/reports";
import { formatNumber, formatPercent } from "../utils/formatters";

type ReportsPageProps = {
  onOpenDashboard: (data: ExcelAnalyzeResponse) => void;
};

export function ReportsPage({ onOpenDashboard }: ReportsPageProps) {
  const [uploads, setUploads] = useState<ReportUploadSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openingUploadId, setOpeningUploadId] = useState<number | null>(null);
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

  async function handleOpenDashboard(uploadId: number) {
    setOpeningUploadId(uploadId);
    setErrorMessage("");

    try {
      const result = await getReportUploadDetail(uploadId);
      const upload = result.upload;

      const dashboardData: ExcelAnalyzeResponse = {
        success: true,
        message: "Saved dashboard loaded from database.",
        fileName: upload.fileName,
        workbookSheets: [upload.sourceSheet],
        sourceSheet: upload.sourceSheet,
        activeSheets: [upload.sourceSheet],
        excludedSheets: [],
        referenceSheets: [],
        summary: upload.summary,
        machineRows: upload.machineRows,
      };

      onOpenDashboard(dashboardData);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to open saved dashboard.";

      setErrorMessage(message);
    } finally {
      setOpeningUploadId(null);
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
          View Excel uploads saved in the database. Open any saved record to load
          the dashboard again with its saved KPI, chart, and machine-wise data.
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
                  <th>Machine Count</th>
                  <th>Uploaded At</th>
                  <th>Action</th>
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
                    <td>{formatNumber(upload.machineCount)}</td>
                    <td>{upload.createdAt}</td>
                    <td>
                      <button
                        type="button"
                        className="open-report-button"
                        onClick={() => handleOpenDashboard(upload.id)}
                        disabled={openingUploadId === upload.id}
                      >
                        {openingUploadId === upload.id
                          ? "Opening..."
                          : "Open Dashboard"}
                      </button>
                    </td>
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
