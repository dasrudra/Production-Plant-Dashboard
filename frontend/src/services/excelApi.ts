import type { ExcelAnalyzeResponse } from "../types/dashboard";

import { API_BASE_URL } from "./apiConfig";

export async function analyzeExcelFile(
  file: File,
): Promise<ExcelAnalyzeResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/excel/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.detail ||
      `Failed to analyze Excel file. Server returned ${response.status}.`;

    throw new Error(message);
  }

  return response.json();
}

export async function replaceExcelFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/excel/replace`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail ?? "Failed to replace dashboard.");
  }

  return result;
}
