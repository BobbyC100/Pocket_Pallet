"""Import job schemas."""
from typing import Optional, Dict, List
from datetime import datetime
from pydantic import BaseModel
from enum import Enum


class ImportStatus(str, Enum):
    """Import job status."""
    PENDING = "pending"
    UPLOADING = "uploading"
    VALIDATING = "validating"
    PROCESSING = "processing"
    REVIEWING = "reviewing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class FileFormat(str, Enum):
    """Supported file formats."""
    CSV = "csv"
    PARQUET = "parquet"
    JSONL = "jsonl"
    XLSX = "xlsx"


class ImportJobCreate(BaseModel):
    """Schema for creating import jobs."""
    source_id: int
    mapping_id: Optional[int] = None
    filename: str
    file_format: FileFormat


class ImportJobUpdate(BaseModel):
    """Schema for updating import jobs."""
    status: Optional[ImportStatus] = None
    total_rows: Optional[int] = None
    processed_rows: Optional[int] = None
    success_count: Optional[int] = None
    error_count: Optional[int] = None
    review_count: Optional[int] = None
    validation_errors: Optional[Dict] = None
    validation_warnings: Optional[Dict] = None
    stats: Optional[Dict] = None
    error_message: Optional[str] = None


class ImportJob(ImportJobCreate):
    """Full import job schema."""
    id: int
    created_by: int
    file_size_bytes: Optional[int] = None
    storage_path: Optional[str] = None
    checksum: Optional[str] = None
    status: ImportStatus
    total_rows: Optional[int] = None
    processed_rows: Optional[int] = None
    success_count: Optional[int] = None
    error_count: Optional[int] = None
    review_count: Optional[int] = None
    validation_errors: Optional[Dict] = None
    validation_warnings: Optional[Dict] = None
    stats: Optional[Dict] = None
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ImportMappingCreate(BaseModel):
    """Schema for creating import mappings."""
    name: str
    source_id: Optional[int] = None
    file_format: Optional[FileFormat] = None
    schema_version: Optional[str] = None
    column_mapping: Dict[str, str]
    transformations: Optional[Dict] = None
    defaults: Optional[Dict] = None


class ImportMapping(ImportMappingCreate):
    """Full import mapping schema."""
    id: int
    is_active: bool
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ValidationResult(BaseModel):
    """Validation result for sample data."""
    valid_count: int
    error_count: int
    warning_count: int
    errors: List[Dict]
    warnings: List[Dict]
    sample_records: List[Dict]

