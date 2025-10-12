from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    PROJECT_NAME: str = "Pocket Pallet"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    DATABASE_URL_SYNC: str = ""
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Frontend URL (for password reset links, etc.)
    FRONTEND_URL: str = "http://localhost:3000"
    
    # CORS
    CORS_ORIGINS: Union[List[str], str] = "http://localhost:3000"
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            if "," in v:
                return [origin.strip() for origin in v.split(",")]
            return [v]
        return v
    
    # Redis & Celery (optional)
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # AWS S3 (optional)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = ""
    
    # Azure Document Intelligence (OCR)
    AZURE_DOC_INTEL_ENDPOINT: str = ""
    AZURE_DOC_INTEL_KEY: str = ""
    AZURE_DOC_INTEL_MODEL: str = "prebuilt-layout"
    OCR_MIN_CONFIDENCE: float = 0.70
    OCR_GROUPING_MODE: str = "simple"  # "simple" or "smarter"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

