import type {
  ReportUploadDetailResponse,
  ReportUploadsResponse,
} from "../types/reports";

import { API_BASE_URL } from "./apiConfig";

export async function getReportUploads(): Promise<ReportUploadsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/reports/uploads`);

  if (!response.ok) {
    throw new Error(
      `Failed to load report uploads. Server returned ${response.status}.`,
    );
  }

  return response.json();
}

export async function getReportUploadDetail(
  uploadId: number,
): Promise<ReportUploadDetailResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/reports/uploads/${uploadId}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load report detail. Server returned ${response.status}.`,
    );
  }

  return response.json();
}

export async function getLatestReportUploadDetail(): Promise<ReportUploadDetailResponse | null> {
  const response = await fetch(`${API_BASE_URL}/api/reports/latest`);

  // The backend returns 404 when nothing has been uploaded yet. That is a
  // normal empty state, not a failure, so it maps to null.
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load the latest dashboard. Server returned ${response.status}.`,
    );
  }

  return response.json();
}

export function downloadOriginalExcel(uploadId: number): void {
  window.open(
    `${API_BASE_URL}/api/reports/uploads/${uploadId}/download`,
    "_blank",
  );
}

export async function deleteReportUpload(uploadId: number): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/reports/uploads/${uploadId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to delete report. Server returned ${response.status}.`,
    );
  }
}
