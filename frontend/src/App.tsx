import { useEffect, useRef, useState } from "react";
import { DashboardEmptyState } from "./components/DashboardEmptyState";

import { DashboardInsight } from "./components/DashboardInsight";
import { ExcelUploader } from "./components/ExcelUploader";
import { KpiCard } from "./components/KpiCard";
import { MachinePlanTable } from "./components/MachinePlanTable";
import { ReportsPage } from "./components/ReportsPage";
import { StatusDistributionChart } from "./components/StatusDistributionChart";
import { TargetCapacityChart } from "./components/TargetCapacityChart";
import { UploadSuccessBanner } from "./components/UploadSuccessBanner";
import { UtilizationChart } from "./components/UtilizationChart";
import { analyzeExcelFile, replaceExcelFile } from "./services/excelApi";
import { getLatestReportUploadDetail } from "./services/reportsApi";
import type { ExcelAnalyzeResponse } from "./types/dashboard";
import { formatNumber, formatPercent } from "./utils/formatters";
import { ConfirmationModal } from "./components/ConfirmationModal";

import "./App.css";

const STORAGE_KEY_DASHBOARD_DATA = "kpp-dashboard-latest-data";
const STORAGE_KEY_FILE_NAME = "kpp-dashboard-latest-file-name";
const SESSION_KEY_SKIP_AUTO_LOAD = "kpp-dashboard-skip-auto-load";

type PageKey = "dashboard" | "reports";

const NAV_ITEMS: { key: PageKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "reports", label: "Reports" },
];

function App() {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [dashboardData, setDashboardData] =
    useState<ExcelAnalyzeResponse | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showReplaceModal, setShowReplaceModal] = useState(false);

  const [duplicateUpload, setDuplicateUpload] =
    useState<ExcelAnalyzeResponse | null>(null);
  const isMountedRef = useRef(true);
  const latestUploadIdRef = useRef<number | null>(null);

  async function loadLatestDashboard() {
    const shouldSkipAutoLoad =
      sessionStorage.getItem(SESSION_KEY_SKIP_AUTO_LOAD) === "true";

    if (shouldSkipAutoLoad) {
      return;
    }

    try {
      const latestResult = await getLatestReportUploadDetail();

      if (!latestResult || !isMountedRef.current) {
        return;
      }

      const upload = latestResult.upload;
      if (latestUploadIdRef.current === upload.id) {
        return;
      }

      const latestDashboardData: ExcelAnalyzeResponse = {
        success: true,
        message: "Latest saved dashboard loaded from database.",
        fileName: upload.fileName,
        workbookSheets: [upload.sourceSheet],
        sourceSheet: upload.sourceSheet,
        activeSheets: [upload.sourceSheet],
        excludedSheets: [],
        referenceSheets: [],
        summary: upload.summary,
        machineRows: upload.machineRows,
      };

      setDashboardData(latestDashboardData);
      setSelectedFileName(upload.fileName);
      latestUploadIdRef.current = upload.id;

      localStorage.setItem(
        STORAGE_KEY_DASHBOARD_DATA,
        JSON.stringify(latestDashboardData),
      );
      localStorage.setItem(STORAGE_KEY_FILE_NAME, upload.fileName);
    } catch (error) {
      console.error("Latest saved dashboard could not be restored:", error);
    }
  }

  useEffect(() => {
    isMountedRef.current = true;

    void loadLatestDashboard();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadLatestDashboard();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  async function handleFileSelect(file: File) {
    setSelectedFileName(file.name);
    setIsLoading(true);
    setErrorMessage("");

    sessionStorage.removeItem(SESSION_KEY_SKIP_AUTO_LOAD);

    try {
      const result = await analyzeExcelFile(file);

      if (!result.success) {
        if (result.duplicate) {
          setDuplicateUpload(result);
          setShowReplaceModal(true);
          return;
        }

        setErrorMessage(result.message || "Excel file could not be analyzed.");
        setDashboardData(null);

        localStorage.removeItem(STORAGE_KEY_DASHBOARD_DATA);
        localStorage.removeItem(STORAGE_KEY_FILE_NAME);

        return;
      }

      await loadLatestDashboard();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading the Excel file.";

      setErrorMessage(message);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReplaceCancel() {
    setShowReplaceModal(false);
    setDuplicateUpload(null);
  }

  async function handleReplaceConfirm() {
    if (!duplicateUpload) {
      return;
    }

    setShowReplaceModal(false);
    setIsLoading(true);
    setErrorMessage("");

    try {
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement | null;

      const file = input?.files?.[0];

      if (!file) {
        throw new Error("Please select the Excel file again.");
      }

      const result = await replaceExcelFile(file);

      if (!result.success) {
        throw new Error(result.message);
      }

      await loadLatestDashboard();

      setDuplicateUpload(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to replace dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleClearDashboard() {
    setDashboardData(null);
    setSelectedFileName("");
    setErrorMessage("");

    localStorage.removeItem(STORAGE_KEY_DASHBOARD_DATA);
    localStorage.removeItem(STORAGE_KEY_FILE_NAME);

    sessionStorage.setItem(SESSION_KEY_SKIP_AUTO_LOAD, "true");
  }

  const summary = dashboardData?.summary;
  const rows = dashboardData?.machineRows ?? [];

  function renderDashboardPage() {
    return (
      <>
        <header className="page-header dashboard-hero">
          <div className="hero-left-content">
            <p className="eyebrow">KPP Division</p>

            <h1>Production Capacity Dashboard</h1>

            <p>Operational Intelligence for Monthly Production Planning.</p>

            <p className="hero-description">
              Upload the monthly Activity Plan Excel workbook to generate
              executive production KPIs, machine capacity insights, and
              historical performance reports.
            </p>

            <ExcelUploader
              selectedFileName={selectedFileName}
              isLoading={isLoading}
              hasDashboardData={Boolean(dashboardData)}
              onFileSelect={handleFileSelect}
              onClearDashboard={handleClearDashboard}
            />

            {errorMessage ? (
              <div className="error-box hero-error-box">
                <strong>Upload failed:</strong> {errorMessage}
              </div>
            ) : null}

            <UploadSuccessBanner data={dashboardData} />
          </div>

          <div className="header-meta">
            <div className="meta-item">
              <span>Plan Month</span>
              <strong>{summary?.month || "Not uploaded"}</strong>
            </div>

            <div className="meta-divider" />

            <div className="meta-item">
              <span>Working Section</span>
              <strong>{summary?.workingSection || "Not uploaded"}</strong>
            </div>
          </div>
        </header>

        {dashboardData ? ( // Only render dashboard content if data is present
          <>
            <section className="kpi-grid">
              <KpiCard
                title="Monthly Target"
                value={formatNumber(summary?.monthlyTarget)}
                subtitle="Total planned production"
              />

              <KpiCard
                title="Monthly Capacity"
                value={formatNumber(summary?.monthlyCapacity)}
                subtitle="Available production capacity"
              />

              <KpiCard
                title="Capacity Utilization"
                value={formatPercent(summary?.capacityUtilization)}
                subtitle="Target divided by capacity"
              />

              <KpiCard
                title="Active Labour"
                value={formatNumber(summary?.activeLabor)}
                subtitle="Total active labour"
              />

              <KpiCard
                title="Active Machine"
                value={formatNumber(summary?.activeMachine)}
                subtitle="Total active machine"
              />

              <KpiCard
                title="Machine Count"
                value={formatNumber(summary?.machineCount)}
                subtitle="Machine categories found"
              />
            </section>

            <DashboardInsight summary={summary} />

            <section className="charts-grid">
              <TargetCapacityChart rows={rows} />

              <UtilizationChart rows={rows} />

              <StatusDistributionChart summary={summary} />
            </section>

            <MachinePlanTable rows={rows} />
          </>
        ) : (
          <DashboardEmptyState />
        )}
      </>
    );
  }

  function handleOpenSavedDashboard(data: ExcelAnalyzeResponse) {
    setDashboardData(data);
    setSelectedFileName(data.fileName);
    setErrorMessage("");
    setActivePage("dashboard");

    sessionStorage.removeItem(SESSION_KEY_SKIP_AUTO_LOAD);

    localStorage.setItem(STORAGE_KEY_DASHBOARD_DATA, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEY_FILE_NAME, data.fileName);
  }

  function renderReportsPage() {
    return <ReportsPage onOpenDashboard={handleOpenSavedDashboard} />;
  }

  function renderActivePage() {
    if (activePage === "dashboard") {
      return renderDashboardPage();
    }

    return renderReportsPage();
  }

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand-block">
            <div className="brand-mark">KPP</div>

            <div>
              <h1>Plant Dashboard</h1>
              <p>Excel Summary Dashboard</p>
            </div>
          </div>

          <nav className="side-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={activePage === item.key ? "active" : ""}
                onClick={() => setActivePage(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="main-content">{renderActivePage()}</main>
      </div>

      <ConfirmationModal
        open={showReplaceModal}
        title="Replace Existing Dashboard?"
        message={
          duplicateUpload?.message ??
          "A dashboard for this month already exists."
        }
        confirmText="Replace Dashboard"
        cancelText="Keep Existing"
        confirmButtonClass="warning"
        onConfirm={handleReplaceConfirm}
        onCancel={handleReplaceCancel}
      />
    </>
  );
}

export default App;
