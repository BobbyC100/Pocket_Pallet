"""Market data model."""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum

from app.db.session import Base


class Availability(str, Enum):
    """Product availability status."""
    IN_STOCK = "in_stock"
    BTG = "btg"  # By the glass
    ALLOCATED = "allocated"
    SOLD_OUT = "sold_out"


class Market(Base):
    """Market data for wines (pricing, availability)."""
    __tablename__ = "markets"
    
    id = Column(Integer, primary_key=True, index=True)
    wine_id = Column(Integer, ForeignKey("wines.id"), nullable=False, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    
    # Product info
    sku = Column(String(100), index=True)
    list_price = Column(Float)
    currency = Column(String(3), default="USD")  # ISO-4217
    availability = Column(SQLEnum(Availability))
    
    # Ratings
    rating = Column(Float)  # e.g., 95.5
    rating_count = Column(Integer)  # Number of ratings
    rating_source = Column(String(100))  # e.g., "Wine Spectator", "Vivino"
    
    # Metadata
    url = Column(String(1000))
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_seen_at = Column(DateTime(timezone=True))
    
    # Relationships
    wine = relationship("Wine", back_populates="markets")
    source = relationship("Source")

