"""
Pytest Test Configuration & Fixtures
===================================
Completely isolated test suite: overrides get_db with an in-memory SQLite database.
Tests NEVER touch PostgreSQL or Docker database services.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.database import Base, get_db
import app.models  # Ensure all model tables are registered
from app.main import app
from app.ml.predictor import predictor
from app.db.seed_market_prices import seed_market_prices

# Ensure JWT_SECRET_KEY is valid for isolated test runs
if not settings.JWT_SECRET_KEY or len(settings.JWT_SECRET_KEY) < 16:
    settings.JWT_SECRET_KEY = "test-secret-key-for-pytest-execution-only-12345"

# Dedicated in-memory SQLite engine using StaticPool for thread-safe test isolation
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all tables in isolated in-memory SQLite database and seed test market data."""
    Base.metadata.create_all(bind=test_engine)
    # Ensure predictor model is loaded into memory
    if not predictor.is_loaded():
        predictor.load()
    # Seed market prices into the test SQLite instance
    with TestingSessionLocal() as session:
        seed_market_prices(session)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    """Provides a clean transactional database session bound to the isolated SQLite instance."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    """Provides a TestClient with get_db overridden to use the in-memory SQLite instance."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
