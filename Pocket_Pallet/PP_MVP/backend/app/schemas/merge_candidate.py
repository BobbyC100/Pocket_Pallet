"""Merge candidate schemas."""
from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel
from enum import Enum


class MergeStatus(str, Enum):
    """Merge candidate status."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    SKIPPED = "skipped"


class MergeCandidateBase(BaseModel):
    """Base merge candidate schema."""
    import_job_id: int
    candidate_json: Dict
    candidate_hash: str
    source_row_number: Optional[int] = None
    target_wine_id: Optional[int] = None
    match_score: float
    match_details: Optional[Dict] = None


class MergeCandidateCreate(MergeCandidateBase):
    """Schema for creating merge candidates."""
    pass


class MergeCandidateUpdate(BaseModel):
    """Schema for updating merge candidates."""
    status: MergeStatus
    note: Optional[str] = None


class MergeCandidate(MergeCandidateBase):
    """Full merge candidate schema."""
    id: int
    status: MergeStatus
    reviewer_id: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    note: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class MergeCandidateWithTarget(MergeCandidate):
    """Merge candidate with target wine details."""
    target_wine_data: Optional[Dict] = None


class ReviewQueueStats(BaseModel):
    """Statistics for review queue."""
    total_pending: int
    by_score_range: Dict[str, int]
    by_import: Dict[int, int]

