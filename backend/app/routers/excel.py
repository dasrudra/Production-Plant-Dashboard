from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.dashboard_storage import (
    delete_dashboard_upload,
    get_dashboard_upload_by_month,
    save_dashboard_upload,
)
from app.services.excel_parser import analyze_capacity_plan_excel

router = APIRouter()

# excel.py location:
# backend/app/routers/excel.py
#
# parents[0] = backend/app/routers
# parents[1] = backend/app
# parents[2] = backend
#
# Resolved from __file__ so the folder is the same no matter which
# directory uvicorn was started from. Must match reports.py.
BACKEND_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".xlsx", ".xlsm"}


def discard_saved_file(saved_file_path: Path) -> None:
    """
    Delete an uploaded file that will not be recorded in the database.

    Called whenever a request returns early, so the uploads folder never
    accumulates files that no dashboard row points at.
    """
    try:
        saved_file_path.unlink(missing_ok=True)
    except OSError:
        # A file we cannot delete is not worth failing the request over.
        pass


@router.post("/analyze")
async def analyze_excel(file: UploadFile = File(...)):
    """
    Upload, analyze, and save KPP Production Activity Plan Excel file.
    """
    original_filename = file.filename or "uploaded_file.xlsx"
    file_extension = Path(original_filename).suffix.lower()

    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload an Excel file: .xlsx or .xlsm",
        )

    saved_file_name = f"{uuid4().hex}_{original_filename}"
    saved_file_path = UPLOAD_DIR / saved_file_name

    try:
        file_content = await file.read()

        with open(saved_file_path, "wb") as saved_file:
            saved_file.write(file_content)

        result = analyze_capacity_plan_excel(saved_file_path)

        if not result.get("success"):
            discard_saved_file(saved_file_path)
            return result

        result["fileName"] = original_filename
        result["savedFileName"] = saved_file_name

        existing_dashboard = get_dashboard_upload_by_month(
            result["summary"]["month"]
        )

        if existing_dashboard is not None:
            discard_saved_file(saved_file_path)

            return {
                "success": False,
                "duplicate": True,
                "message": (
                    f"A dashboard for {result['summary']['month']} already exists."),
                "existingUploadId": existing_dashboard["id"],
                "month": result["summary"]["month"],
            }

        upload_id = save_dashboard_upload(
            original_file_name=original_filename,
            saved_file_name=saved_file_name,
            dashboard_result=result,
        )

        result["uploadId"] = upload_id
        result["message"] = "Excel file analyzed and saved successfully."

        return result

    except Exception as error:
        discard_saved_file(saved_file_path)

        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze Excel file: {str(error)}",
        )

@router.post("/replace")
async def replace_excel(
    file: UploadFile = File(...)
):
    original_filename = file.filename or "uploaded_file.xlsx"

    file_extension = Path(original_filename).suffix.lower()

    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload an Excel file: .xlsx or .xlsm",
       )

    saved_file_name = f"{uuid4().hex}_{original_filename}"
    saved_file_path = UPLOAD_DIR / saved_file_name

    try:
        file_content = await file.read()
        with open(saved_file_path, "wb") as saved_file:
            saved_file.write(file_content)

        result = analyze_capacity_plan_excel(saved_file_path)

        if not result.get("success"):
            discard_saved_file(saved_file_path)
            return result

        result["fileName"] = original_filename
        result["savedFileName"] = saved_file_name

        existing_dashboard = get_dashboard_upload_by_month(
            result["summary"]["month"]
        )

        if existing_dashboard is not None:
            delete_dashboard_upload(existing_dashboard["id"])

        upload_id = save_dashboard_upload(
            original_file_name=original_filename,
            saved_file_name=saved_file_name,
            dashboard_result=result,
        )

        result["uploadId"] = upload_id
        result["message"] = "Dashboard replaced successfully."
        return result

    except Exception as error:
        discard_saved_file(saved_file_path)

        raise HTTPException(
            status_code=500,
            detail=f"Failed to replace dashboard: {str(error)}",
        )