"""Attachment model."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Attachment(Base):
    """File attachments (images, PDFs, etc.)."""
    __tablename__ = "attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)  # wine, producer, etc.
    entity_id = Column(Integer, nullable=False, index=True)
    
    # File info
    filename = Column(String(500), nullable=False)
    mime_type = Column(String(100))
    size_bytes = Column(BigInteger)
    storage_url = Column(String(1000), nullable=False)
    checksum = Column(String(64))  # SHA256
    
    # Metadata
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(String(500))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    uploader = relationship("User")

