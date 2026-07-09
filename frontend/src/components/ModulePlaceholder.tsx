type ModulePlaceholderProps = {
  title: string;
  subtitle: string;
  items: string[];
};

export function ModulePlaceholder({
  title,
  subtitle,
  items,
}: ModulePlaceholderProps) {
  return (
    <section className="module-placeholder">
      <div className="module-placeholder-header">
        <p className="eyebrow">Upcoming Module</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="module-scope-card">
        <h2>Planned Features</h2>

        <div className="module-scope-grid">
          {items.map((item) => (
            <div key={item} className="module-scope-item">
              <span>✓</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="module-note-card">
        <strong>Development note</strong>
        <p>
          This module is prepared as a page section. We will connect real Excel
          upload, backend API, charts, and tables module by module after the main
          Production Capacity Dashboard is stable.
        </p>
      </div>
    </section>
  );
}
