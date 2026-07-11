from fastapi import APIRouter, HTTPException

from app.services.dashboard_storage import (
    get_dashboard_upload_detail,
    get_dashboard_uploads,
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
