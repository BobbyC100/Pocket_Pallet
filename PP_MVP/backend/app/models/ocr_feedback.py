"""
OCR Feedback Model

Stores user feedback on OCR-parsed wine entries to enable
learning over time and improve parsing accuracy.
"""
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class OcrFeedback(Base):
    """
    OCR Feedback table for learning over time.
    
    Tracks user actions (accept, edit, reject) on OCR-parsed entries
    to build a dataset for adaptive parsing improvements.
    """
    __tablename__ = "ocr_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Original OCR data
    raw_text = Column(Text, nullable=False)  # Raw text from Azure OCR
    confidence = Column(Float, nullable=True)  # Azure confidence score
    
    # Parsed data (what we extracted)
    parsed_name = Column(String, nullable=True)
    parsed_producer = Column(String, nullable=True)
    parsed_region = Column(String, nullable=True)
    parsed_vintage = Column(String, nullable=True)
    parsed_price = Column(String, nullable=True)
    
    # User feedback
    action = Column(String, nullable=False)  # 'accept', 'edit', 'reject'
    
    # Corrected data (if action = 'edit')
    corrected_name = Column(String, nullable=True)
    corrected_producer = Column(String, nullable=True)
    corrected_region = Column(String, nullable=True)
    corrected_vintage = Column(String, nullable=True)
    corrected_price = Column(String, nullable=True)
    
    # Metadata
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="ocr_feedbacks")

