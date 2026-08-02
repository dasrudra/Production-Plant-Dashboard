export function MonthComparisonPage() {
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
        <h2>Upcoming Features</h2>

        <div className="module-scope-grid">
          <div className="module-scope-item">
            <span>✓</span>
            <strong>Compare Two Months</strong>
          </div>

          <div className="module-scope-item">
            <span>✓</span>
            <strong>KPI Difference</strong>
          </div>

          <div className="module-scope-item">
            <span>✓</span>
            <strong>Machine Comparison</strong>
          </div>

          <div className="module-scope-item">
            <span>✓</span>
            <strong>Capacity Trend</strong>
          </div>

          <div className="module-scope-item">
            <span>✓</span>
            <strong>Status Changes</strong>
          </div>

          <div className="module-scope-item">
            <span>✓</span>
            <strong>Executive Summary</strong>
          </div>
        </div>
      </section>

      <section className="module-note-card">
        <strong>Coming Next</strong>

        <p>
          In the next step, users will be able to select two saved monthly
          dashboards and instantly compare every KPI, utilization chart, machine
          category and production capacity.
        </p>
      </section>
    </div>
  );
}
