"""
FasalSetu Backend Application Entrypoint
=======================================
FastAPI application configured with CORS, lifespan events (DB initialization & ML model loading),
error handlers, and API routing.
"""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db
from app.ml.predictor import predictor
from app.api import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("fasalsetu")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager:
    - Runs database table creation.
    - Loads pre-trained ML model once into memory.
    """
    logger.info("Initializing FasalSetu backend services...")
    
    # 1. Initialize database schema
    try:
        init_db()
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.warning(f"Database initialization deferred or skipped: {e}")

    # 2. Seed market prices on first startup if empty
    try:
        from app.core.database import SessionLocal
        from app.db.seed_market_prices import seed_market_prices
        with SessionLocal() as db_session:
            seed_market_prices(db_session)
    except Exception as e:
        logger.warning(f"Market prices seeding deferred or skipped: {e}")

    # 3. Load ML model into memory
    try:
        predictor.load()
        logger.info("Crop recommendation model loaded into memory successfully.")
    except Exception as e:
        logger.error(f"Failed to load crop recommendation model: {e}")

    yield

    logger.info("FasalSetu backend shutting down.")


app = FastAPI(
    title="FasalSetu API",
    description=(
        "AI-powered agricultural decision platform for Indian farmers. "
        "Provides ML-driven crop recommendations, soil-climate suitability analysis, and agronomic guidance."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats validation errors into clear, specific messages naming the field and reason."""
    formatted_errors = []
    for err in exc.errors():
        field_parts = [str(part) for part in err.get("loc", []) if part != "body"]
        field_name = " -> ".join(field_parts) if field_parts else "payload"
        msg = err.get("msg", "Invalid value")
        if msg.startswith("Value error, "):
            msg = msg[len("Value error, "):]
        formatted_errors.append({
            "field": field_name,
            "message": msg
        })

    logger.warning(f"Validation error on {request.url.path}: {formatted_errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "detail": "Input validation failed",
            "errors": formatted_errors
        }
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Safely catches unhandled exceptions and returns a human-readable 500 error without stack traces."""
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "An internal server error occurred. Please try again later."}
    )


# Mount feature API routes
app.include_router(api_router)


@app.get("/", include_in_schema=False)
def root_redirect():
    """Root redirect to interactive API documentation."""
    return {"message": "Welcome to FasalSetu API. Visit /docs for interactive documentation."}
