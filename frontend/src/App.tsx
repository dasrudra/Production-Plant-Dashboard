import { useState } from "react";

import { ExcelUploader } from "./components/ExcelUploader";
import { DashboardInsight } from "./components/DashboardInsight";
import { UploadSuccessBanner } from "./components/UploadSuccessBanner";
import { KpiCard } from "./components/KpiCard";
import { MachinePlanTable } from "./components/MachinePlanTable";
import { StatusSummary } from "./components/StatusSummary";
import { StatusDistributionChart } from "./components/StatusDistributionChart";
import { TargetCapacityChart } from "./components/TargetCapacityChart";
import { UtilizationChart } from "./components/UtilizationChart";
import { analyzeExcelFile } from "./services/excelApi";
import type { ExcelAnalyzeResponse } from "./types/dashboard";
import { formatNumber, formatPercent } from "./utils/formatters";

import "./App.css";

function App() {
  const [dashboardData, setDashboardData] =
    useState<ExcelAnalyzeResponse | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleFileSelect(file: File) {
    setSelectedFileName(file.name);
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await analyzeExcelFile(file);

      if (!result.success) {
        setErrorMessage(result.message || "Excel file could not be analyzed.");
        setDashboardData(null);
        return;
      }

      setDashboardData(result);
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

  const summary = dashboardData?.summary;
  const rows = dashboardData?.machineRows ?? [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">KPP</div>
          <div>
            <h1>Plant Dashboard</h1>
            <p>Production Activity Plan</p>
          </div>
        </div>

        <nav className="side-nav">
          <a className="active">Dashboard</a>
          <a>Production Plan</a>
          <a>Shipment</a>
          <a>Material</a>
          <a>Reports</a>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">KPP Division</p>
            <h1>Production Capacity Dashboard</h1>
            <p>
              Upload the monthly activity plan Excel file to generate the
              production capacity overview.
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
      </main>
    </div>
  );
}

export default App;
