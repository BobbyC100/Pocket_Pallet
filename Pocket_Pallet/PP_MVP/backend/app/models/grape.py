"""Grape variety model."""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ARRAY
from sqlalchemy.sql import func

from app.db.session import Base


class Grape(Base):
    """Grape variety/varietal."""
    __tablename__ = "grapes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    normalized_name = Column(String(100), nullable=False, index=True)
    aliases = Column(ARRAY(String), default=[])  # Common alternate names
    color = Column(String(20))  # red, white, rosé
    is_pending = Column(Boolean, default=False)  # Needs admin review
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

