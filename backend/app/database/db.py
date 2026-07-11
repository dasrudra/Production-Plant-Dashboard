from __future__ import annotations

import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "kpp_dashboard.db"


def get_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(exist_ok=True)

    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row

    return connection


def initialize_database() -> None:
    DATA_DIR.mkdir(exist_ok=True)

    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS dashboard_uploads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                original_file_name TEXT NOT NULL,
                saved_file_name TEXT NOT NULL,
                source_sheet TEXT NOT NULL,
                report_title TEXT,
                activity_title TEXT,
                plan_month TEXT,
                division TEXT,
                working_section TEXT,
                monthly_target REAL NOT NULL DEFAULT 0,
                monthly_capacity REAL NOT NULL DEFAULT 0,
                capacity_utilization REAL NOT NULL DEFAULT 0,
                active_labor REAL NOT NULL DEFAULT 0,
                active_machine REAL NOT NULL DEFAULT 0,
                labour_plan_minutes REAL NOT NULL DEFAULT 0,
                machine_plan_minutes REAL NOT NULL DEFAULT 0,
                machine_count INTEGER NOT NULL DEFAULT 0,
                status_counts_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS machine_plan_rows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                upload_id INTEGER NOT NULL,
                row_number INTEGER,
                machine_type TEXT NOT NULL,
                labour_working_day REAL NOT NULL DEFAULT 0,
                machine_working_day REAL NOT NULL DEFAULT 0,
                active_labor REAL NOT NULL DEFAULT 0,
                labour_shift_hour REAL NOT NULL DEFAULT 0,
                active_machine REAL NOT NULL DEFAULT 0,
                machine_shift_hour REAL NOT NULL DEFAULT 0,
                monthly_target REAL NOT NULL DEFAULT 0,
                monthly_capacity REAL NOT NULL DEFAULT 0,
                achievement REAL NOT NULL DEFAULT 0,
                achievement_decimal REAL NOT NULL DEFAULT 0,
                labour_operation_hour_per_day REAL NOT NULL DEFAULT 0,
                machine_operation_hour_per_day REAL NOT NULL DEFAULT 0,
                labour_plan_minutes_per_month REAL NOT NULL DEFAULT 0,
                machine_plan_minutes_per_month REAL NOT NULL DEFAULT 0,
                status TEXT NOT NULL,
                FOREIGN KEY (upload_id) REFERENCES dashboard_uploads(id)
            )
            """
        )

        connection.commit()
