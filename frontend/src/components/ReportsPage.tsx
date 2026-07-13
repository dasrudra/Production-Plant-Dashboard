import { useEffect, useMemo, useState } from "react";

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

function formatSavedDate(value: string): string {
  if (!value) {
    return "N/A";
  }

  const [datePart, timePart = ""] = value.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  const formattedDate = new Date(year, month - 1, day).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );

  const formattedTime = timePart ? timePart.slice(0, 5) : "";

  return formattedTime ? `${formattedDate}, ${formattedTime}` : formattedDate;
}

export function ReportsPage({ onOpenDashboard }: ReportsPageProps) {
  const [uploads, setUploads] = useState<ReportUploadSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const latestUpload = uploads[0] ?? null;

  const filteredUploads = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return uploads;
    }

    return uploads.filter((upload) => {
      return (
        upload.fileName.toLowerCase().includes(query) ||
        upload.month.toLowerCase().includes(query) ||
        upload.workingSection.toLowerCase().includes(query) ||
        upload.division.toLowerCase().includes(query)
      );
    });
  }, [uploads, searchTerm]);

  return (
    <section className="reports-page">
      <header className="reports-hero">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Saved Dashboard Reports</h1>
          <p>
            Review previous Excel uploads and reopen any saved production
            dashboard directly from the database.
          </p>
        </div>

        <div className="reports-hero-count">
          <span>Total Saved Reports</span>
          <strong>{uploads.length}</strong>
        </div>
      </header>

      <section className="reports-summary-grid">
        <article className="reports-summary-card">
          <span>Total Uploads</span>
          <strong>{uploads.length}</strong>
          <p>Database records available</p>
        </article>

        <article className="reports-summary-card">
          <span>Latest Month</span>
          <strong>{latestUpload?.month || "N/A"}</strong>
          <p>Most recently saved plan</p>
        </article>

        <article className="reports-summary-card">
          <span>Latest Utilization</span>
          <strong>
            {latestUpload
              ? formatPercent(latestUpload.capacityUtilization)
              : "N/A"}
          </strong>
          <p>Latest capacity performance</p>
        </article>

        <article className="reports-summary-card">
          <span>Latest Upload</span>
          <strong className="reports-date-value">
            {latestUpload ? formatSavedDate(latestUpload.createdAt) : "N/A"}
          </strong>
          <p>Database record time</p>
        </article>
      </section>

      <section className="reports-toolbar-card">
        <div className="reports-search-control">
          <span>Search Reports</span>

          <input
            type="search"
            placeholder="Search file, month, section, or division..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search saved reports"
          />
        </div>

        <div className="reports-toolbar-actions">
          <span>
            Showing <strong>{filteredUploads.length}</strong> of{" "}
            <strong>{uploads.length}</strong>
          </span>

          <button type="button" onClick={loadReports} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh Reports"}
          </button>
        </div>
      </section>

      {errorMessage ? (
        <div className="error-box">
          <strong>Reports loading failed:</strong> {errorMessage}
        </div>
      ) : null}

      <section className="table-card report-table-card">
        <div className="section-title-row table-title-row">
          <div>
            <h2>Upload History</h2>
            <p>Saved production dashboard records from SQLite</p>
          </div>

          <div className="reports-database-badge">
            <span>Database</span>
            <strong>SQLite</strong>
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state">Loading saved dashboard records...</div>
        ) : uploads.length === 0 ? (
          <div className="empty-state">
            No saved reports found. Upload an Excel file from the Dashboard page
            first.
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="empty-state">No saved reports match your search.</div>
        ) : (
          <div className="table-wrapper reports-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Record</th>
                  <th>File</th>
                  <th>Month</th>
                  <th>Section</th>
                  <th>Target</th>
                  <th>Capacity</th>
                  <th>Utilization</th>
                  <th>Machines</th>
                  <th>Uploaded At</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUploads.map((upload) => {
                  const isLatest = upload.id === latestUpload?.id;

                  return (
                    <tr key={upload.id}>
                      <td>
                        <div className="report-record-cell">
                          <strong>#{upload.id}</strong>

                          {isLatest ? (
                            <span className="latest-report-badge">Latest</span>
                          ) : null}
                        </div>
                      </td>

                      <td>
                        <div className="report-file-cell">
                          <span className="report-file-icon">XLSX</span>

                          <div>
                            <strong>{upload.fileName}</strong>
                            <span>{upload.sourceSheet}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="report-month-chip">
                          {upload.month}
                        </span>
                      </td>

                      <td>{upload.workingSection}</td>

                      <td>{formatNumber(upload.monthlyTarget)}</td>

                      <td>{formatNumber(upload.monthlyCapacity)}</td>

                      <td>
                        <span className="report-utilization-chip">
                          {formatPercent(upload.capacityUtilization)}
                        </span>
                      </td>

                      <td>{formatNumber(upload.machineCount)}</td>

                      <td className="report-date-cell">
                        {formatSavedDate(upload.createdAt)}
                      </td>

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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
