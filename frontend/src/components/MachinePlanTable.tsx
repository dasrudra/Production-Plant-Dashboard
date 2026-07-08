import type { MachinePlanRow } from "../types/dashboard";
import { formatNumber, formatPercent } from "../utils/formatters";

type MachinePlanTableProps = {
  rows: MachinePlanRow[];
};

export function MachinePlanTable({ rows }: MachinePlanTableProps) {
  if (rows.length === 0) {
    return (
      <div className="empty-state">
        No machine data found. Please upload the capacity plan Excel file.
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="section-title-row">
        <div>
          <h2>Machine-wise Activity Plan</h2>
          <p>Source sheet: Plan-KPP</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Machine Type</th>
              <th>Target</th>
              <th>Capacity</th>
              <th>Utilization</th>
              <th>Active Labour</th>
              <th>Active Machine</th>
              <th>Labour Plan Min</th>
              <th>Machine Plan Min</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={`${row.rowNumber}-${row.machineType}`}>
                <td className="strong">{row.machineType}</td>
                <td>{formatNumber(row.monthlyTarget)}</td>
                <td>{formatNumber(row.monthlyCapacity)}</td>
                <td>{formatPercent(row.achievement)}</td>
                <td>{formatNumber(row.activeLabor)}</td>
                <td>{formatNumber(row.activeMachine)}</td>
                <td>{formatNumber(row.labourPlanMinutesPerMonth)}</td>
                <td>{formatNumber(row.machinePlanMinutesPerMonth)}</td>
                <td>
                  <span className={`status-pill status-${row.status.toLowerCase()}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
