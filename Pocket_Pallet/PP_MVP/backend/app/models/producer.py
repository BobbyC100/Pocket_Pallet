"""Producer model."""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Producer(Base):
    """Wine producer/winery."""
    __tablename__ = "producers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    normalized_name = Column(String(255), nullable=False, index=True)
    country = Column(String(100))
    region = Column(String(255))
    website = Column(String(500))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    wines = relationship("Wine", back_populates="producer")

