"""Import job and mapping models."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum

from app.db.session import Base


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


class ImportJob(Base):
    """Bulk import job."""
    __tablename__ = "import_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    mapping_id = Column(Integer, ForeignKey("import_mappings.id"))
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # File info
    filename = Column(String(500), nullable=False)
    file_format = Column(SQLEnum(FileFormat), nullable=False)
    file_size_bytes = Column(BigInteger)
    storage_path = Column(String(1000))
    checksum = Column(String(64))  # SHA256
    
    # Processing
    status = Column(SQLEnum(ImportStatus), default=ImportStatus.PENDING, nullable=False, index=True)
    total_rows = Column(Integer)
    processed_rows = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    review_count = Column(Integer, default=0)
    
    # Validation
    validation_errors = Column(JSON)  # Sample of validation errors
    validation_warnings = Column(JSON)
    
    # Results
    stats = Column(JSON)  # Detailed statistics
    error_message = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    source = relationship("Source")
    mapping = relationship("ImportMapping")
    creator = relationship("User")
    lineage_records = relationship("Lineage", back_populates="import_job")
    merge_candidates = relationship("MergeCandidate", back_populates="import_job")


class ImportMapping(Base):
    """Column mapping for imports."""
    __tablename__ = "import_mappings"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    source_id = Column(Integer, ForeignKey("sources.id"))
    file_format = Column(SQLEnum(FileFormat))
    schema_version = Column(String(50))
    
    # Mapping configuration
    column_mapping = Column(JSON, nullable=False)  # {"source_col": "target_field"}
    transformations = Column(JSON)  # Optional field transformations
    defaults = Column(JSON)  # Default values for missing fields
    
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    source = relationship("Source")
    creator = relationship("User")

