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
  const uploadsResponse = await getReportUploads();
  const latestUpload = uploadsResponse.uploads[0];

  if (!latestUpload) {
    return null;
  }

  return getReportUploadDetail(latestUpload.id);
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
