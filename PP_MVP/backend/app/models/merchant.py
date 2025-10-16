"""
SQLAlchemy model for Merchants (wine bars, shops, bistros).

Merchants represent real-world venues with rich data (address, hours, images, etc.)
Separate from scraper Sources (which are technical scraping configs).
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from app.db.base import Base


class Merchant(Base):
    """Real-world wine venue with rich metadata."""
    __tablename__ = "merchants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    type = Column(String(50), nullable=True, index=True)  # wine_shop, bistro, bar
    
    # Location
    address = Column(Text, nullable=True)
    geo = Column(JSON, nullable=True)  # {lat: float, lng: float}
    country_code = Column(String(2), nullable=True, index=True)
    
    # Content
    tags = Column(ARRAY(String), nullable=True)
    about = Column(Text, nullable=True)
    hours = Column(JSON, nullable=True)  # {mon: "9-5", tue: "9-5", ...}
    contact = Column(JSON, nullable=True)  # {phone, website, instagram, email}
    
    # Media
    hero_image = Column(String(500), nullable=True)
    gallery_images = Column(ARRAY(String), nullable=True)
    
    # Import tracking
    source_url = Column(String(500), nullable=True)  # Google Maps URL
    last_synced = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())

    def __repr__(self):
        return f"<Merchant(id={self.id}, name={self.name}, type={self.type})>"
    
    @property
    def latitude(self):
        """Helper to get latitude from geo JSON."""
        return self.geo.get('lat') if self.geo else None
    
    @property
    def longitude(self):
        """Helper to get longitude from geo JSON."""
        return self.geo.get('lng') if self.geo else None

