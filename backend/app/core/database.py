"""
FasalSetu Database Session & Engine Configuration
================================================
Configures SQLAlchemy engine, session maker, base model, and DB dependency.
"""

from typing import Generator
import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger("fasalsetu_db")

# BASE_DIR lands on the backend/ folder: backend/app/core/database.py -> backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Build absolute directory-independent DATABASE_URL for SQLite to prevent working directory split
database_url = settings.DATABASE_URL
connect_args = {}

if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    # Keep in-memory database as-is (e.g. during test suites)
    if database_url != "sqlite:///:memory:":
        prefix = "sqlite:///"
        if database_url.startswith(prefix):
            rel_path = database_url[len(prefix):]
            if rel_path.startswith("./") or rel_path.startswith(".\\"):
                rel_path = rel_path[2:]
            if not os.path.isabs(rel_path):
                abs_file_path = os.path.join(BASE_DIR, rel_path).replace("\\", "/")
                database_url = f"sqlite:///{abs_file_path}"

logger.info(f"Database connection URL: {database_url}")

engine = create_engine(
    database_url,
    pool_pre_ping=True,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for obtaining a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initializes all database tables registered in SQLAlchemy models."""
    import app.models  # Ensure all models (CropRecommendationLog, Market, MarketPrice) register
    logger.info("Creating database tables if not present...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified.")
