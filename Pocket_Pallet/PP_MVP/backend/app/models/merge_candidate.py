"""Merge candidate model for review queue."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float, Enum as SQLEnum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum

from app.db.session import Base


class MergeStatus(str, Enum):
    """Merge candidate review status."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    SKIPPED = "skipped"


class MergeCandidate(Base):
    """Fuzzy match candidates requiring human review."""
    __tablename__ = "merge_candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    import_job_id = Column(Integer, ForeignKey("import_jobs.id"), nullable=False, index=True)
    
    # Candidate data (new wine to potentially merge)
    candidate_json = Column(JSON, nullable=False)
    candidate_hash = Column(String(64), index=True)
    source_row_number = Column(Integer)
    
    # Target wine (existing wine in database)
    target_wine_id = Column(Integer, ForeignKey("wines.id"), index=True)
    
    # Match info
    match_score = Column(Float, nullable=False, index=True)
    match_details = Column(JSON)  # Breakdown of similarity
    
    # Review
    status = Column(SQLEnum(MergeStatus), default=MergeStatus.PENDING, nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    reviewed_at = Column(DateTime(timezone=True))
    note = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    import_job = relationship("ImportJob", back_populates="merge_candidates")
    target_wine = relationship("Wine")
    reviewer = relationship("User")

