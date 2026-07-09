import { useEffect, useState } from "react";

import { DashboardInsight } from "./components/DashboardInsight";
import { ExcelUploader } from "./components/ExcelUploader";
import { KpiCard } from "./components/KpiCard";
import { MachinePlanTable } from "./components/MachinePlanTable";
import { ModulePlaceholder } from "./components/ModulePlaceholder";
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

type PageKey = "dashboard" | "production" | "shipment" | "material" | "reports";

const NAV_ITEMS: { key: PageKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "production", label: "Production Plan" },
  { key: "shipment", label: "Shipment" },
  { key: "material", label: "Material" },
  { key: "reports", label: "Reports" },
];

const MODULE_CONTENT: Record<
  Exclude<PageKey, "dashboard">,
  { title: string; subtitle: string; items: string[] }
> = {
  production: {
    title: "Production Plan Module",
    subtitle:
      "This module will show monthly plan, daily production, production confirmation, downtime, and achievement analysis.",
    items: [
      "Daily production update",
      "Production confirmation summary",
      "Plan vs actual comparison",
      "Machine downtime tracking",
      "Section-wise production performance",
      "Excel upload for actual production",
    ],
  },
  shipment: {
    title: "Shipment Dashboard Module",
    subtitle:
      "This module will show shipment plan, shipped quantity, pending shipment, delivery status, and order movement.",
    items: [
      "Shipment plan overview",
      "Shipped vs pending quantity",
      "Buyer or order-wise shipment",
      "Delivery timeline tracking",
      "Pending shipment alert",
      "Excel upload for shipment data",
    ],
  },
  material: {
    title: "Material Dashboard Module",
    subtitle:
      "This module will show raw material stock, consumption, shortage, pending purchase, and material availability.",
    items: [
      "Raw material stock overview",
      "Material consumption summary",
      "Shortage and risk alert",
      "Pending PR/PO tracking",
      "Material availability by item",
      "Excel upload for material data",
    ],
  },
  reports: {
    title: "Reports Module",
    subtitle:
      "This module will generate management reports from uploaded dashboard data and future stored records.",
    items: [
      "Monthly performance report",
      "Capacity utilization report",
      "Machine status report",
      "Shipment performance report",
      "Material shortage report",
      "Exportable summary report",
    ],
  },
};

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

        {dashboardData ? (
          <div className="dashboard-actions">
            <div>
              <strong>Latest dashboard data is saved in this browser.</strong>
              <span>It will remain visible after page refresh.</span>
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

  function renderActivePage() {
    if (activePage === "dashboard") {
      return renderDashboardPage();
    }

    const moduleContent = MODULE_CONTENT[activePage];

    return (
      <ModulePlaceholder
        title={moduleContent.title}
        subtitle={moduleContent.subtitle}
        items={moduleContent.items}
      />
    );
  }

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
