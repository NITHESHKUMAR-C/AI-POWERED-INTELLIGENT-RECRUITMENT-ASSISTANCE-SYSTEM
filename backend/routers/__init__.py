"""Routers package initialization"""
from .jobs import router as jobs_router
from .resumes import router as resumes_router
from .candidates import router as candidates_router
from .analysis import router as analysis_router
from .stats import router as stats_router

__all__ = ["jobs_router", "resumes_router", "candidates_router", "analysis_router", "stats_router"]
