from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import initialize_database
from app.routers import excel, reports

app = FastAPI(
    title="KPP Plant Dashboard API",
    description="Backend API for KPP Plant Dashboard Excel upload, database storage, and reports.",
    version="1.0.0",
)

# Update the allowed origins to include your network IP
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://10.206.15.144:5173",  # Add your network IP
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    initialize_database()


@app.get("/")
def root():
    return {
        "message": "KPP Plant Dashboard Backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "KPP Plant Dashboard Backend"
    }


app.include_router(excel.router, prefix="/api/excel", tags=["Excel"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])