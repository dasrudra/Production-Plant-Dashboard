import type { ExcelUploaderProps } from "../types";

export function ExcelUploader({
  selectedFileName,
  isLoading,
  hasDashboardData = false,
  onFileSelect,
  onClearDashboard,
}: ExcelUploaderProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onFileSelect(file);
  }

  return (
    <div className="hero-upload-panel">
      <div className="hero-button-row">
        <label className="upload-button hero-upload-button">
          {isLoading ? "Analyzing..." : "Choose Excel File"}
          <input
            type="file"
            accept=".xlsx,.xlsm"
            onChange={handleChange}
            disabled={isLoading}
          />
        </label>

        {hasDashboardData && onClearDashboard ? (
          <button
            type="button"
            className="hero-clear-button"
            onClick={onClearDashboard}
          >
            Clear Dashboard
          </button>
        ) : null}
      </div>

      {selectedFileName ? (
        <div className="selected-file hero-selected-file">
          Selected file: {selectedFileName}
        </div>
      ) : (
        <div className="selected-file hero-selected-file muted">
          No file selected yet.
        </div>
      )}
    </div>
  );
}
