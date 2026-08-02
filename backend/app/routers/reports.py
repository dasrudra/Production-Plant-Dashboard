from pathlib import Path
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse

from app.services.dashboard_storage import (
    delete_dashboard_upload,
    get_dashboard_upload_detail,
    get_dashboard_uploads,
    get_latest_dashboard_upload_detail,
    get_saved_excel_file,
)

router = APIRouter()


@router.get("/uploads")
def list_uploads():
    """
    Return saved dashboard upload history.
    """
    return {
        "success": True,
        "uploads": get_dashboard_uploads(),
    }

@router.get("/latest")
def get_latest_dashboard():
    """
    Return the latest uploaded dashboard.
    """
    latest = get_latest_dashboard_upload_detail()

    if latest is None:
        raise HTTPException(
            status_code=404,
            detail="No dashboard uploads were found.",
        )

    return {
        "success": True,
        "upload": latest,
    }

@router.get("/uploads/{upload_id}")
def get_upload_detail(upload_id: int):
    """
    Return one saved dashboard upload with machine rows.
    """
    upload_detail = get_dashboard_upload_detail(upload_id)

    if upload_detail is None:
        raise HTTPException(
            status_code=404,
            detail="Dashboard upload record was not found.",
        )

    return {
        "success": True,
        "upload": upload_detail,
    }

@router.get("/uploads/{upload_id}/download")
def download_original_excel(upload_id: int):
    """
    Download the original uploaded Excel file.
    """

    upload = get_saved_excel_file(upload_id)

    if upload is None:
        raise HTTPException(
            status_code=404,
            detail="Dashboard upload was not found.",
        )

    uploads_dir = Path(__file__).resolve().parents[2] / "uploads"

    file_path = uploads_dir / upload["savedFileName"]

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Excel file no longer exists on the server.",
        )

    return FileResponse(
        path=file_path,
        filename=upload["originalFileName"],
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

@router.delete("/uploads/{upload_id}")
def delete_upload(upload_id: int):
    """
    Delete one saved dashboard report.
    """

    upload = get_dashboard_upload_detail(upload_id)

    if upload is None:
        raise HTTPException(
            status_code=404,
            detail="Dashboard upload was not found.",
        )

    delete_dashboard_upload(upload_id)

    return {
        "success": True,
        "message": "Dashboard deleted successfully.",
    }