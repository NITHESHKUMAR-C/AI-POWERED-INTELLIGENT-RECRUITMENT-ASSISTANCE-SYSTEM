"""
Database connection, engine initialization and session management.
Supports PostgreSQL with seamless SQLite fallback for zero-configuration local development.
"""

import os
import logging
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("recruitment_db")
logging.basicConfig(level=logging.INFO)

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Enable foreign key constraints for SQLite connections."""
    try:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
    except Exception:
        pass


DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/recruitment_db")
SQLITE_FALLBACK_URL = "sqlite:///./recruitment.db"

Base = declarative_base()

def get_engine():
    """Create database engine with fallback from PostgreSQL to SQLite if needed."""
    engine = None
    target_url = DATABASE_URL

    # Try connecting to configured primary database
    try:
        connect_args = {}
        if target_url.startswith("sqlite"):
            connect_args = {"check_same_thread": False}
        
        test_engine = create_engine(target_url, connect_args=connect_args)
        # Test connection
        with test_engine.connect() as conn:
            pass
        logger.info(f"Connected to primary database: {target_url.split('@')[-1] if '@' in target_url else target_url}")
        engine = test_engine
    except Exception as e:
        logger.warning(f"Could not connect to primary database ({DATABASE_URL}): {e}")
        logger.info(f"Falling back to local SQLite database: {SQLITE_FALLBACK_URL}")
        connect_args = {"check_same_thread": False}
        engine = create_engine(SQLITE_FALLBACK_URL, connect_args=connect_args)

    return engine

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """FastAPI dependency for yielding database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize all database tables with clean fresh schema."""
    import models.db_models  # Ensure models are registered
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized successfully (clean fresh state).")
