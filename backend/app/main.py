import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.db import initialize_database
from app.routers import excel, reports

# main.py location:
# backend/app/main.py
#
# parents[0] = backend/app
# parents[1] = backend
#
# Resolved from __file__ for the same reason as UPLOAD_DIR: the .env file
# must be found no matter which directory uvicorn was started from.
BACKEND_DIR = Path(__file__).resolve().parents[1]

# BACKEND_DIR.parent is the project root, so this is:
#   <project root>/frontend/dist
# It exists only after `npm run build` has been run.
FRONTEND_DIST = BACKEND_DIR.parent / "frontend" / "dist"

load_dotenv(BACKEND_DIR / ".env")

DEFAULT_ALLOWED_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"


def get_allowed_origins() -> list[str]:
    """
    Browser origins permitted to call this API.

    Read from the KPP_ALLOWED_ORIGINS environment variable as a comma
    separated list, so the plant's LAN address can change without a code
    change. Falls back to the local development origins.
    """
    raw_origins = os.getenv("KPP_ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS)

    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan.

    Everything before `yield` runs once at startup, before the server
    accepts requests. Everything after `yield` runs at shutdown.
    Replaces the deprecated @app.on_event("startup") hook.
    """
    initialize_database()

    yield

    # No shutdown work yet. Close connection pools or background
    # tasks here when they are added.


app = FastAPI(
    title="KPP Plant Dashboard API",
    description="Backend API for KPP Plant Dashboard Excel upload, database storage, and reports.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "KPP Plant Dashboard Backend"
    }


app.include_router(excel.router, prefix="/api/excel", tags=["Excel"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])


# Serve the built React app. This MUST come after the API routers:
# routes are matched in registration order, and a mount at "/" would
# otherwise swallow every /api request.
#
# The directory check keeps the backend usable before the first build,
# which is how you will run it while developing against the Vite server.
if FRONTEND_DIST.is_dir():
    app.mount(
        "/",
        StaticFiles(directory=FRONTEND_DIST, html=True),
        name="frontend",
    )