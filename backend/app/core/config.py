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
