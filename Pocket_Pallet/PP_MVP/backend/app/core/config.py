"""Application configuration."""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl


class Settings(BaseSettings):
    """Application settings."""
    
    # Database
    DATABASE_URL: str
    DATABASE_URL_SYNC: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis & Celery
    REDIS_URL: str
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str
    
    # Storage
    STORAGE_TYPE: str = "local"
    STORAGE_PATH: str = "./storage"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = ""
    
    # Application
    PROJECT_NAME: str = "Pocket Pallet Admin Console"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Import Settings
    MAX_UPLOAD_SIZE_MB: int = 5000
    CHUNK_SIZE_MB: int = 100
    VALIDATION_SAMPLE_SIZE: int = 1000
    AUTO_MERGE_THRESHOLD: float = 0.90
    REVIEW_THRESHOLD: float = 0.75
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

