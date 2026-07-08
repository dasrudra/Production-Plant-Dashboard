import type { ExcelAnalyzeResponse } from "../types/dashboard";

type WorkbookInfoProps = {
  data: ExcelAnalyzeResponse | null;
};

export function WorkbookInfo({ data }: WorkbookInfoProps) {
  if (!data) {
    return (
      <div className="info-card">
        <h2>Workbook Rule</h2>
        <p>
          The dashboard will use Plan-KPP as the active sheet. Sheet1 will be
          excluded.
        </p>
      </div>
    );
  }

  return (
    <div className="info-card">
      <h2>Workbook Processing Rule</h2>

      <div className="sheet-grid">
        <div>
          <span className="sheet-label">Active Sheet</span>
          <strong>{data.activeSheets.join(", ") || "N/A"}</strong>
        </div>

        <div>
          <span className="sheet-label">Excluded Sheet</span>
          <strong>{data.excludedSheets.join(", ") || "None"}</strong>
        </div>

        <div>
          <span className="sheet-label">Reference Sheet</span>
          <strong>{data.referenceSheets.join(", ") || "None"}</strong>
        </div>
      </div>
    </div>
  );
}
