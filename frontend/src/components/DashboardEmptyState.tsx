export function DashboardEmptyState() {
  return (
    <section className="empty-dashboard">
      <div className="empty-dashboard-icon">📄</div>

      <h2>No Dashboard Loaded</h2>

      <p>
        Upload a monthly Activity Plan Excel file to generate production KPIs,
        capacity charts, machine analysis and reports.
      </p>

      <div className="empty-dashboard-features">
        <span>✓ KPI Dashboard</span>
        <span>✓ Capacity Charts</span>
        <span>✓ Machine Analysis</span>
        <span>✓ Reports History</span>
      </div>

      <div className="empty-dashboard-format">
        Supported:
        <strong> Plan-KPP (.xlsx / .xlsm)</strong>
      </div>
    </section>
  );
}
