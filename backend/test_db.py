import sqlite3

connection = sqlite3.connect("data/kpp_dashboard.db")

rows = connection.execute("""
SELECT sql
FROM sqlite_master
WHERE type='table'
AND name='machine_plan_rows'
""").fetchall()

for row in rows:
    print(row[0])