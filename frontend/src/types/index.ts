import type { ChangeEvent } from "react";

export interface ExcelUploaderProps {
  selectedFileName: string;
  isLoading: boolean;
  hasDashboardData?: boolean;
  onFileSelect: (file: File) => void;
  onClearDashboard?: () => void;
}

export type FileInputChangeEvent = ChangeEvent<HTMLInputElement>;
