"""
OCR Feedback Schemas

Pydantic models for OCR feedback requests and responses.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class OcrFeedbackBase(BaseModel):
    """Base schema for OCR feedback"""
    raw_text: str
    confidence: Optional[float] = None
    parsed_name: Optional[str] = None
    parsed_producer: Optional[str] = None
    parsed_region: Optional[str] = None
    parsed_vintage: Optional[str] = None
    parsed_price: Optional[str] = None
    action: str  # 'accept', 'edit', 'reject'


class OcrFeedbackCreate(OcrFeedbackBase):
    """Schema for creating OCR feedback"""
    corrected_name: Optional[str] = None
    corrected_producer: Optional[str] = None
    corrected_region: Optional[str] = None
    corrected_vintage: Optional[str] = None
    corrected_price: Optional[str] = None


class OcrFeedbackResponse(OcrFeedbackBase):
    """Schema for OCR feedback response"""
    id: int
    user_id: int
    created_at: datetime
    corrected_name: Optional[str] = None
    corrected_producer: Optional[str] = None
    corrected_region: Optional[str] = None
    corrected_vintage: Optional[str] = None
    corrected_price: Optional[str] = None
    
    class Config:
        from_attributes = True


class OcrReviewItem(BaseModel):
    """Schema for an OCR item pending review"""
    raw_text: str
    confidence: float
    parsed_name: Optional[str] = None
    parsed_producer: Optional[str] = None
    parsed_region: Optional[str] = None
    parsed_vintage: Optional[str] = None
    parsed_price: Optional[str] = None

