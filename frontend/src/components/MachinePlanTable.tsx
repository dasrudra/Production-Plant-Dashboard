import { useMemo, useState } from "react";

import type { MachinePlanRow } from "../types/dashboard";
import { formatNumber, formatPercent } from "../utils/formatters";

type MachinePlanTableProps = {
  rows: MachinePlanRow[];
};

const STATUS_OPTIONS = ["All", "Low", "Normal", "Good", "Excellent"];

export function MachinePlanTable({ rows }: MachinePlanTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        normalizedSearch === "" ||
        row.machineType.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || row.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  if (rows.length === 0) {
    return (
      <div className="empty-state">
        No machine data found. Please upload the capacity plan Excel file.
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="section-title-row table-title-row">
        <div>
          <h2>Machine-wise Activity Plan</h2>
          <p>Source sheet: Plan-KPP</p>
        </div>

        <div className="table-result-count">
          Showing <strong>{filteredRows.length}</strong> of{" "}
          <strong>{rows.length}</strong> machine rows
        </div>
      </div>

      <div className="table-toolbar">
        <div className="table-search-box">
          <span>Search</span>
          <input
            type="text"
            placeholder="Search machine type..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="table-filter-box">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <div className="empty-state">
          No machine rows match your current search or status filter.
        </div>
      ) : (
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
              {filteredRows.map((row) => (
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
      )}
    </div>
  );
}
