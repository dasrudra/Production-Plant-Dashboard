from pathlib import Path

from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.services.dashboard_storage import (
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
