import type { ReportUploadsResponse } from "../types/reports";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function getReportUploads(): Promise<ReportUploadsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/reports/uploads`);

  if (!response.ok) {
    throw new Error(`Failed to load report uploads. Server returned ${response.status}.`);
  }

  return response.json();
}
