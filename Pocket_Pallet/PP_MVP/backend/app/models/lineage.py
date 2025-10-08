"""Data lineage model."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Lineage(Base):
    """Data lineage tracking."""
    __tablename__ = "lineage"
    
    id = Column(Integer, primary_key=True, index=True)
    wine_id = Column(Integer, ForeignKey("wines.id"), nullable=False, index=True)
    import_job_id = Column(Integer, ForeignKey("import_jobs.id"), index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    
    # Original data
    source_row_number = Column(Integer)
    source_identifier = Column(String(255))  # Original SKU/ID from source
    original_data = Column(JSON)  # Snapshot of source data
    
    # Match info
    match_score = Column(Float)
    match_method = Column(String(50))  # exact, fuzzy, manual
    matched_by = Column(Integer, ForeignKey("users.id"))  # For manual matches
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    wine = relationship("Wine", back_populates="lineage_records")
    import_job = relationship("ImportJob", back_populates="lineage_records")
    source = relationship("Source")
    matcher = relationship("User")

