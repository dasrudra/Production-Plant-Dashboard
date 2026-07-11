import type { ExcelAnalyzeResponse } from "../types/dashboard";

type UploadSuccessBannerProps = {
  data: ExcelAnalyzeResponse | null;
};

export function UploadSuccessBanner({ data }: UploadSuccessBannerProps) {
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
