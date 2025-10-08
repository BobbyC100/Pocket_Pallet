"""Wine and related models."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum

from app.db.session import Base


class BottleSize(str, Enum):
    """Standard bottle sizes."""
    HALF = "375ml"
    STANDARD = "750ml"
    MAGNUM = "1500ml"
    CUSTOM = "custom"


class Wine(Base):
    """Canonical wine record."""
    __tablename__ = "wines"
    
    id = Column(Integer, primary_key=True, index=True)
    producer_id = Column(Integer, ForeignKey("producers.id"), nullable=False)
    cuvee = Column(String(255))  # Label/cuvée name
    vintage = Column(Integer, index=True)  # Year
    is_nv = Column(Boolean, default=False)  # Non-vintage
    
    # Location
    country_id = Column(Integer, ForeignKey("countries.id"))
    region_id = Column(Integer, ForeignKey("regions.id"))
    subregion = Column(String(255))  # Free-text sub-region
    
    # Grapes
    grape_ids = Column(ARRAY(Integer))  # Array of grape IDs
    grape_percentages = Column(JSON)  # Optional: {"grape_id": percentage}
    
    # Technical
    abv = Column(Float)  # Alcohol by volume
    bottle_size = Column(String(20), default=BottleSize.STANDARD.value)
    
    # Classification
    wine_type = Column(String(50))  # red, white, rosé, sparkling, fortified
    style = Column(String(100))  # e.g., "Bordeaux Blend", "Chardonnay"
    
    # Metadata
    notes = Column(Text)
    is_active = Column(Boolean, default=True)  # Soft delete
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_seen_at = Column(DateTime(timezone=True))  # Last import/update
    
    # Search
    search_vector = Column(String(500))  # Normalized search text
    
    # Relationships
    producer = relationship("Producer", back_populates="wines")
    markets = relationship("Market", back_populates="wine")
    versions = relationship("WineVersion", back_populates="wine", order_by="desc(WineVersion.created_at)")
    lineage_records = relationship("Lineage", back_populates="wine", foreign_keys="Lineage.wine_id")


class WineVersion(Base):
    """Version history for wines."""
    __tablename__ = "wine_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    wine_id = Column(Integer, ForeignKey("wines.id"), nullable=False, index=True)
    data_json = Column(JSON, nullable=False)  # Snapshot of wine data
    author_id = Column(Integer, ForeignKey("users.id"))
    reason = Column(Text)  # Why this version was created
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    wine = relationship("Wine", back_populates="versions")
    author = relationship("User")


class DraftVersion(Base):
    """Draft changes before publishing."""
    __tablename__ = "draft_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False)  # wine, producer, etc.
    entity_id = Column(Integer)  # NULL for new entities
    data_json = Column(JSON, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lock_expires_at = Column(DateTime(timezone=True))  # Edit lock
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    author = relationship("User")

