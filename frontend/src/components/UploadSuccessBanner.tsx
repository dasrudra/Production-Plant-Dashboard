import type { ExcelAnalyzeResponse } from "../types/dashboard";

export function UploadSuccessBanner({ data }: { data: ExcelAnalyzeResponse | null }) {
  if (!data) {
    return null;
  }

  return (
    <div className="hero-success-line">
      <span className="hero-success-icon">✓</span>
      <strong>Excel analyzed successfully</strong>
    </div>
  );
}
