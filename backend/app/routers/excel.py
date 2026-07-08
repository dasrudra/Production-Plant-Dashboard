from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.excel_parser import analyze_capacity_plan_excel

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".xlsx", ".xlsm"}


@router.post("/analyze")
async def analyze_excel(file: UploadFile = File(...)):
    """
    Upload and analyze KPP Production Activity Plan Excel file.
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

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze Excel file: {str(error)}",
        )
