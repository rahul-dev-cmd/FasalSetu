"""
FasalSetu Application Configuration
==================================
Loads environment variables and application settings using pydantic-settings.
"""

from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "FasalSetu"
    ENVIRONMENT: str = "production"
    
    # Default database connection string for Docker Compose PostgreSQL
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/fasalsetu_db"
    
    # Server network settings
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    
    # CORS settings - allow all origins for dev/frontend integration
    CORS_ORIGINS: Union[List[str], str] = ["*"]

    # Groq API configuration for Feature 3 (Farmer Q&A Assistant), 3B (Voice), and 5 (Crop Diagnosis)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    GROQ_WHISPER_MODEL: str = "whisper-large-v3-turbo"
    GROQ_VISION_MODEL: str = "qwen/qwen3.6-27b"

    # JWT Authentication configuration for Feature 9
    # No working default is provided - the application enforces a non-placeholder secret at startup
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_DAYS: int = 7

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["*"]

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()

KNOWN_INSECURE_JWT_SECRETS = {
    "",
    "your_jwt_secret_key_here",
    "fasalsetu-dev-insecure-jwt-secret-key-change-in-prod",
    "secret",
    "changeme",
    "default",
    "none"
}


def validate_jwt_secret(secret: str) -> None:
    """
    Startup check ensuring JWT_SECRET_KEY is configured and not a known placeholder string.
    Raises RuntimeError to refuse booting with a public, guessable secret.
    """
    cleaned = (secret or "").strip()
    if not cleaned or cleaned.lower() in KNOWN_INSECURE_JWT_SECRETS or len(cleaned) < 16:
        raise RuntimeError(
            "FATAL: JWT_SECRET_KEY is unset, too short (< 16 chars), or set to an insecure placeholder string. "
            "The application refuses to boot with an insecure secret. "
            "Please configure a strong, random JWT_SECRET_KEY in your .env file."
        )
