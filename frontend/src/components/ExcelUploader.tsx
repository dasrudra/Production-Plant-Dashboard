type ExcelUploaderProps = {
  selectedFileName?: string;
  isLoading: boolean;
  onFileSelect: (file: File) => void;
};

export function ExcelUploader({
  selectedFileName,
  isLoading,
  onFileSelect,
}: ExcelUploaderProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onFileSelect(file);
  }

  return (
    <div className="upload-card">
      <div>
        <h2>Upload Production Activity Plan</h2>
        <p>
          Upload the Excel workbook. The system will read only the Plan-KPP sheet
          and ignore Sheet1.
        </p>
      </div>

      <label className="upload-button">
        {isLoading ? "Analyzing..." : "Choose Excel File"}
        <input
          type="file"
          accept=".xlsx,.xlsm"
          onChange={handleChange}
          disabled={isLoading}
        />
      </label>

      {selectedFileName ? (
        <div className="selected-file">Selected file: {selectedFileName}</div>
      ) : (
        <div className="selected-file muted">No file uploaded yet.</div>
      )}
    </div>
  );
}
