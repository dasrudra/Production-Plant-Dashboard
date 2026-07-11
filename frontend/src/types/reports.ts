import type { DashboardSummary, MachinePlanRow } from "./dashboard";

export type ReportUploadSummary = {
  id: number;
  fileName: string;
  sourceSheet: string;
  month: string;
  division: string;
  workingSection: string;
  monthlyTarget: number;
  monthlyCapacity: number;
  capacityUtilization: number;
  activeLabor: number;
  activeMachine: number;
  machineCount: number;
  statusCounts: Record<string, number>;
  createdAt: string;
};

export type ReportUploadDetail = {
  id: number;
  fileName: string;
  sourceSheet: string;
  summary: DashboardSummary;
  machineRows: MachinePlanRow[];
  createdAt: string;
};

export type ReportUploadsResponse = {
  success: boolean;
  uploads: ReportUploadSummary[];
};

export type ReportUploadDetailResponse = {
  success: boolean;
  upload: ReportUploadDetail;
};
