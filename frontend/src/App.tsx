import { useEffect, useState } from "react";

import { DashboardInsight } from "./components/DashboardInsight";
import { ExcelUploader } from "./components/ExcelUploader";
import { KpiCard } from "./components/KpiCard";
import { MachinePlanTable } from "./components/MachinePlanTable";
import { StatusDistributionChart } from "./components/StatusDistributionChart";
import { StatusSummary } from "./components/StatusSummary";
import { TargetCapacityChart } from "./components/TargetCapacityChart";
import { UploadSuccessBanner } from "./components/UploadSuccessBanner";
import { UtilizationChart } from "./components/UtilizationChart";
import { analyzeExcelFile } from "./services/excelApi";
import type { ExcelAnalyzeResponse } from "./types/dashboard";
import { formatNumber, formatPercent } from "./utils/formatters";

import "./App.css";

const STORAGE_KEY_DASHBOARD_DATA = "kpp-dashboard-latest-data";
const STORAGE_KEY_FILE_NAME = "kpp-dashboard-latest-file-name";

type PageKey = "dashboard" | "reports";

const NAV_ITEMS: { key: PageKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "reports", label: "Reports" },
];

function App() {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [dashboardData, setDashboardData] = useState<ExcelAnalyzeResponse | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const savedDashboardData = localStorage.getItem(STORAGE_KEY_DASHBOARD_DATA);
    const savedFileName = localStorage.getItem(STORAGE_KEY_FILE_NAME);

    if (savedDashboardData) {
      try {
        const parsedData = JSON.parse(savedDashboardData) as ExcelAnalyzeResponse;
        setDashboardData(parsedData);
      } catch {
        localStorage.removeItem(STORAGE_KEY_DASHBOARD_DATA);
      }
    }

    if (savedFileName) {
      setSelectedFileName(savedFileName);
    }
  }, []);

  async function handleFileSelect(file: File) {
    setSelectedFileName(file.name);
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await analyzeExcelFile(file);

      if (!result.success) {
        setErrorMessage(result.message || "Excel file could not be analyzed.");
        setDashboardData(null);
        localStorage.removeItem(STORAGE_KEY_DASHBOARD_DATA);
        localStorage.removeItem(STORAGE_KEY_FILE_NAME);
        return;
      }

      setDashboardData(result);
      localStorage.setItem(STORAGE_KEY_DASHBOARD_DATA, JSON.stringify(result));
      localStorage.setItem(STORAGE_KEY_FILE_NAME, file.name);
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

  function handleClearDashboard() {
    setDashboardData(null);
    setSelectedFileName("");
    setErrorMessage("");

    localStorage.removeItem(STORAGE_KEY_DASHBOARD_DATA);
    localStorage.removeItem(STORAGE_KEY_FILE_NAME);
  }

  const summary = dashboardData?.summary;
  const rows = dashboardData?.machineRows ?? [];

  function renderDashboardPage() {
    return (
      <>
        <header className="page-header">
          <div>
            <p className="eyebrow">KPP Division</p>
            <h1>Production Capacity Dashboard</h1>
            <p>
              Upload the monthly activity plan Excel file to generate a summarized
              production capacity dashboard.
            </p>
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

        <ExcelUploader
          selectedFileName={selectedFileName}
          isLoading={isLoading}
          onFileSelect={handleFileSelect}
        />

        {dashboardData ? (
          <div className="dashboard-actions">
            <div>
              <strong>Latest dashboard data is saved in this browser.</strong>
              <span>Database recording will be added in the next phase.</span>
            </div>

            <button type="button" onClick={handleClearDashboard}>
              Clear Dashboard
            </button>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="error-box">
            <strong>Upload failed:</strong> {errorMessage}
          </div>
        ) : null}

        <UploadSuccessBanner data={dashboardData} />

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

        <StatusSummary summary={summary} />

        <DashboardInsight summary={summary} />

        <section className="charts-grid">
          <TargetCapacityChart rows={rows} />
          <UtilizationChart rows={rows} />
          <StatusDistributionChart summary={summary} />
        </section>

        <MachinePlanTable rows={rows} />
      </>
    );
  }

  function renderReportsPage() {
    return (
      <section className="reports-page">
        <div className="module-placeholder-header">
          <p className="eyebrow">Reports</p>
          <h1>Saved Dashboard Reports</h1>
          <p>
            This page will show uploaded dashboard records after we connect the
            database. Users will be able to view previous uploads and month-wise
            dashboard summaries.
          </p>
        </div>

        <div className="module-scope-card">
          <h2>Reports page will include</h2>

          <div className="module-scope-grid">
            <div className="module-scope-item">
              <span>✓</span>
              <strong>Upload history</strong>
            </div>

            <div className="module-scope-item">
              <span>✓</span>
              <strong>Month-wise dashboard records</strong>
            </div>

            <div className="module-scope-item">
              <span>✓</span>
              <strong>View saved machine-wise data</strong>
            </div>

            <div className="module-scope-item">
              <span>✓</span>
              <strong>Compare uploaded months</strong>
            </div>

            <div className="module-scope-item">
              <span>✓</span>
              <strong>Export report summary</strong>
            </div>
          </div>
        </div>

        <div className="module-note-card">
          <strong>Next development phase</strong>
          <p>
            We will add SQLite database support in the backend first. Then this
            Reports page will read saved dashboard uploads from the database.
          </p>
        </div>
      </section>
    );
  }

  function renderActivePage() {
    if (activePage === "dashboard") {
      return renderDashboardPage();
    }

    return renderReportsPage();
  }

  return (
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
  );
}

export default App;
