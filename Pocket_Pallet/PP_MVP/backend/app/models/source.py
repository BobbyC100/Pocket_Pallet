"""Data source model."""
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean
from sqlalchemy.sql import func

from app.db.session import Base


class Source(Base):
    """Data source (vendor, importer, manual entry)."""
    __tablename__ = "sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    source_type = Column(String(50), nullable=False)  # vendor, importer, manual, api
    priority = Column(Integer, default=50)  # Higher = higher priority for conflicts
    is_active = Column(Boolean, default=True)
    
    # Contact/config
    contact_email = Column(String(255))
    contact_name = Column(String(255))
    api_endpoint = Column(String(500))
    notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

