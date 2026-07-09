import type { ExcelAnalyzeResponse } from "../types/dashboard";

type UploadSuccessBannerProps = {
  data: ExcelAnalyzeResponse | null;
};

export function UploadSuccessBanner({ data }: UploadSuccessBannerProps) {
  if (!data) {
    return null;
  }

  return (
    <section className="upload-success-banner">
      <div className="success-icon">✓</div>

      <div className="success-content">
        <h2>Excel analyzed successfully</h2>
        <p>
          The dashboard has been generated from the active source sheet{" "}
          <strong>{data.sourceSheet}</strong>.
        </p>
      </div>

      <div className="success-meta-grid">
        <div>
          <span>Plan Month</span>
          <strong>{data.summary.month || "N/A"}</strong>
        </div>

        <div>
          <span>Working Section</span>
          <strong>{data.summary.workingSection || "N/A"}</strong>
        </div>

        <div>
          <span>Machine Count</span>
          <strong>{data.summary.machineCount}</strong>
        </div>
      </div>
    </section>
  );
}
