"""
Main FastAPI Application Entrypoint
AI-Powered Intelligent Recruitment Assistance System
"""

import os
import sys
from pathlib import Path

# Ensure root directory is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from database.connection import init_db
from backend.routers import (
    jobs_router,
    resumes_router,
    candidates_router,
    analysis_router,
    stats_router
)

app = FastAPI(
    title=settings.APP_NAME,
    description="Production-grade Recruiter AI Assistant for Resume Parsing, Semantic Job Matching, Explainable Candidate Ranking, and Upskilling Guidance.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Mount uploaded resume directory for static access if needed
upload_dir = root_dir / "uploads"
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

# Include Routers directly (matching exact requested paths POST /jobs, POST /resumes/upload, POST /analyze, etc.)
app.include_router(jobs_router)
app.include_router(resumes_router)
app.include_router(candidates_router)
app.include_router(analysis_router)
app.include_router(stats_router)

# Also include with /api/v1 prefix for standard API versioning
app.include_router(jobs_router, prefix=settings.API_V1_PREFIX)
app.include_router(resumes_router, prefix=settings.API_V1_PREFIX)
app.include_router(candidates_router, prefix=settings.API_V1_PREFIX)
app.include_router(analysis_router, prefix=settings.API_V1_PREFIX)
app.include_router(stats_router, prefix=settings.API_V1_PREFIX)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "environment": settings.APP_ENV
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to AI-Powered Intelligent Recruitment Assistance System API",
        "documentation": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
