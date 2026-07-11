from __future__ import annotations

import json
from typing import Any

from app.database.db import get_connection


def save_dashboard_upload(
    *,
    original_file_name: str,
    saved_file_name: str,
    dashboard_result: dict[str, Any],
) -> int:
    """
    Save analyzed dashboard result into SQLite database.

    Returns:
        upload_id
    """
    summary = dashboard_result["summary"]
    machine_rows = dashboard_result["machineRows"]

    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO dashboard_uploads (
                original_file_name,
                saved_file_name,
                source_sheet,
                report_title,
                activity_title,
                plan_month,
                division,
                working_section,
                monthly_target,
                monthly_capacity,
                capacity_utilization,
                active_labor,
                active_machine,
                labour_plan_minutes,
                machine_plan_minutes,
                machine_count,
                status_counts_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                original_file_name,
                saved_file_name,
                dashboard_result.get("sourceSheet", "Plan-KPP"),
                summary.get("reportTitle", ""),
                summary.get("activityTitle", ""),
                summary.get("month", ""),
                summary.get("division", ""),
                summary.get("workingSection", ""),
                summary.get("monthlyTarget", 0),
                summary.get("monthlyCapacity", 0),
                summary.get("capacityUtilization", 0),
                summary.get("activeLabor", 0),
                summary.get("activeMachine", 0),
                summary.get("labourPlanMinutes", 0),
                summary.get("machinePlanMinutes", 0),
                summary.get("machineCount", 0),
                json.dumps(summary.get("statusCounts", {})),
            ),
        )

        upload_id = int(cursor.lastrowid)

        for row in machine_rows:
            connection.execute(
                """
                INSERT INTO machine_plan_rows (
                    upload_id,
                    row_number,
                    machine_type,
                    labour_working_day,
                    machine_working_day,
                    active_labor,
                    labour_shift_hour,
                    active_machine,
                    machine_shift_hour,
                    monthly_target,
                    monthly_capacity,
                    achievement,
                    achievement_decimal,
                    labour_operation_hour_per_day,
                    machine_operation_hour_per_day,
                    labour_plan_minutes_per_month,
                    machine_plan_minutes_per_month,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    upload_id,
                    row.get("rowNumber", 0),
                    row.get("machineType", ""),
                    row.get("labourWorkingDay", 0),
                    row.get("machineWorkingDay", 0),
                    row.get("activeLabor", 0),
                    row.get("labourShiftHour", 0),
                    row.get("activeMachine", 0),
                    row.get("machineShiftHour", 0),
                    row.get("monthlyTarget", 0),
                    row.get("monthlyCapacity", 0),
                    row.get("achievement", 0),
                    row.get("achievementDecimal", 0),
                    row.get("labourOperationHourPerDay", 0),
                    row.get("machineOperationHourPerDay", 0),
                    row.get("labourPlanMinutesPerMonth", 0),
                    row.get("machinePlanMinutesPerMonth", 0),
                    row.get("status", ""),
                ),
            )

        connection.commit()

    return upload_id


def get_dashboard_uploads() -> list[dict[str, Any]]:
    """
    Return upload history for Reports page.
    """
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                id,
                original_file_name,
                source_sheet,
                plan_month,
                division,
                working_section,
                monthly_target,
                monthly_capacity,
                capacity_utilization,
                active_labor,
                active_machine,
                machine_count,
                status_counts_json,
                created_at
            FROM dashboard_uploads
            ORDER BY id DESC
            """
        ).fetchall()

    result: list[dict[str, Any]] = []

    for row in rows:
        result.append(
            {
                "id": row["id"],
                "fileName": row["original_file_name"],
                "sourceSheet": row["source_sheet"],
                "month": row["plan_month"],
                "division": row["division"],
                "workingSection": row["working_section"],
                "monthlyTarget": row["monthly_target"],
                "monthlyCapacity": row["monthly_capacity"],
                "capacityUtilization": row["capacity_utilization"],
                "activeLabor": row["active_labor"],
                "activeMachine": row["active_machine"],
                "machineCount": row["machine_count"],
                "statusCounts": json.loads(row["status_counts_json"] or "{}"),
                "createdAt": row["created_at"],
            }
        )

    return result


def get_dashboard_upload_detail(upload_id: int) -> dict[str, Any] | None:
    """
    Return one saved dashboard upload with machine rows.
    """
    with get_connection() as connection:
        upload = connection.execute(
            """
            SELECT *
            FROM dashboard_uploads
            WHERE id = ?
            """,
            (upload_id,),
        ).fetchone()

        if upload is None:
            return None

        machine_rows = connection.execute(
            """
            SELECT *
            FROM machine_plan_rows
            WHERE upload_id = ?
            ORDER BY row_number ASC
            """,
            (upload_id,),
        ).fetchall()

    return {
        "id": upload["id"],
        "fileName": upload["original_file_name"],
        "sourceSheet": upload["source_sheet"],
        "summary": {
            "reportTitle": upload["report_title"],
            "activityTitle": upload["activity_title"],
            "month": upload["plan_month"],
            "division": upload["division"],
            "workingSection": upload["working_section"],
            "monthlyTarget": upload["monthly_target"],
            "monthlyCapacity": upload["monthly_capacity"],
            "capacityUtilization": upload["capacity_utilization"],
            "activeLabor": upload["active_labor"],
            "activeMachine": upload["active_machine"],
            "labourPlanMinutes": upload["labour_plan_minutes"],
            "machinePlanMinutes": upload["machine_plan_minutes"],
            "machineCount": upload["machine_count"],
            "statusCounts": json.loads(upload["status_counts_json"] or "{}"),
        },
        "machineRows": [
            {
                "rowNumber": row["row_number"],
                "machineType": row["machine_type"],
                "labourWorkingDay": row["labour_working_day"],
                "machineWorkingDay": row["machine_working_day"],
                "activeLabor": row["active_labor"],
                "labourShiftHour": row["labour_shift_hour"],
                "activeMachine": row["active_machine"],
                "machineShiftHour": row["machine_shift_hour"],
                "monthlyTarget": row["monthly_target"],
                "monthlyCapacity": row["monthly_capacity"],
                "achievement": row["achievement"],
                "achievementDecimal": row["achievement_decimal"],
                "labourOperationHourPerDay": row["labour_operation_hour_per_day"],
                "machineOperationHourPerDay": row["machine_operation_hour_per_day"],
                "labourPlanMinutesPerMonth": row["labour_plan_minutes_per_month"],
                "machinePlanMinutesPerMonth": row["machine_plan_minutes_per_month"],
                "status": row["status"],
            }
            for row in machine_rows
        ],
        "createdAt": upload["created_at"],
    }
