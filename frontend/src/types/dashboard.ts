export type MachinePlanRow = {
  rowNumber: number;
  machineType: string;
  labourWorkingDay: number;
  machineWorkingDay: number;
  activeLabor: number;
  labourShiftHour: number;
  activeMachine: number;
  machineShiftHour: number;
  monthlyTarget: number;
  monthlyCapacity: number;
  achievement: number;
  achievementDecimal: number;
  labourOperationHourPerDay: number;
  machineOperationHourPerDay: number;
  labourPlanMinutesPerMonth: number;
  machinePlanMinutesPerMonth: number;
  status: string;
};

export type DashboardSummary = {
  reportTitle: string;
  activityTitle: string;
  month: string;
  division: string;
  workingSection: string;
  monthlyTarget: number;
  monthlyCapacity: number;
  activeLabor: number;
  activeMachine: number;
  labourPlanMinutes: number;
  machinePlanMinutes: number;
  capacityUtilization: number;
  machineCount: number;
  statusCounts: Record<string, number>;
};

export type ExcelAnalyzeResponse = {
  success: boolean;
  message: string;
  fileName: string;
  workbookSheets: string[];
  sourceSheet: string;
  activeSheets: string[];
  excludedSheets: string[];
  referenceSheets: string[];
  summary: DashboardSummary;
  machineRows: MachinePlanRow[];
};
