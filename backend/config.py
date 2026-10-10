"""
Backend configuration using pydantic-settings
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "AI-Powered Intelligent Recruitment Assistance System"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True

    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/recruitment_db")
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 20
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    USE_LOCAL_FALLBACK_IF_MODEL_UNAVAILABLE: bool = True

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
