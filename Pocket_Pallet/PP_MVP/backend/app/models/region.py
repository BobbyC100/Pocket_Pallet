"""Region and country models."""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Country(Base):
    """Wine-producing country."""
    __tablename__ = "countries"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    iso_code = Column(String(3), unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    regions = relationship("Region", back_populates="country")


class Region(Base):
    """Wine region/appellation."""
    __tablename__ = "regions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    normalized_name = Column(String(255), nullable=False, index=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    parent_region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    level = Column(Integer, default=0)  # 0=top-level, 1=sub-region, etc.
    is_pending = Column(Boolean, default=False)  # Needs admin review
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    country = relationship("Country", back_populates="regions")
    parent_region = relationship("Region", remote_side=[id], foreign_keys=[parent_region_id])
    sub_regions = relationship("Region", back_populates="parent_region", foreign_keys=[parent_region_id])

