"""
SQLAlchemy model for Merchants (wine bars, shops, bistros).

Merchants represent real-world venues with rich data (address, hours, images, etc.)
Separate from scraper Sources (which are technical scraping configs).
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON, Boolean
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID as PG_UUID
from sqlalchemy.sql import func
from app.db.base import Base


class Merchant(Base):
    """Real-world wine venue with rich metadata."""
    __tablename__ = "merchants"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
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
    last_synced_at = Column(DateTime, nullable=True)
    
    # Google Places sync
    google_place_id = Column(String(255), nullable=True, index=True)  # Google Place ID
    google_meta = Column(JSONB, nullable=True)  # Raw Place Details API response
    google_last_synced = Column(DateTime, nullable=True)  # Last successful sync
    google_sync_status = Column(String(50), nullable=True, default='never_synced')  # success, failed, pending, never_synced
    
    # Editorial Notes (manual, curated content)
    editor_note = Column(Text, nullable=True)  # 1-3 sentence editorial note
    editor_name = Column(Text, nullable=True)  # Name of editor/contributor
    editor_title = Column(Text, nullable=True)  # e.g., "Local Guide", "Editor"
    editor_updated_at = Column(DateTime, nullable=True)  # Last note update
    editor_updated_by = Column(PG_UUID(as_uuid=True), nullable=True)  # User ID who updated
    editor_is_published = Column(Boolean, server_default='true', nullable=False)  # Visibility flag
    
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

