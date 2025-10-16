"""
Pydantic schemas for Merchant model.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class MerchantBase(BaseModel):
    """Base merchant schema."""
    name: str
    slug: str
    type: Optional[str] = None  # wine_shop, bistro, bar
    address: Optional[str] = None
    geo: Optional[Dict[str, float]] = None  # {lat: float, lng: float}
    country_code: Optional[str] = None
    tags: Optional[List[str]] = None
    about: Optional[str] = None
    hours: Optional[Dict[str, str]] = None
    contact: Optional[Dict[str, str]] = None
    hero_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    source_url: Optional[str] = None
    google_place_id: Optional[str] = None
    google_sync_status: Optional[str] = None


class MerchantCreate(MerchantBase):
    """Schema for creating a merchant."""
    pass


class MerchantUpdate(BaseModel):
    """Schema for updating a merchant (all fields optional)."""
    name: Optional[str] = None
    slug: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    geo: Optional[Dict[str, float]] = None
    country_code: Optional[str] = None
    tags: Optional[List[str]] = None
    about: Optional[str] = None
    hours: Optional[Dict[str, str]] = None
    contact: Optional[Dict[str, str]] = None
    hero_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    source_url: Optional[str] = None
    google_place_id: Optional[str] = None
    google_sync_status: Optional[str] = None


class MerchantResponse(MerchantBase):
    """Schema for merchant responses."""
    id: str
    last_synced_at: Optional[datetime] = None
    google_meta: Optional[Dict[str, Any]] = None
    google_last_synced: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MerchantImportItem(BaseModel):
    """Schema for importing merchants from Google Maps JSON."""
    name: str
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    country_code: Optional[str] = None
    source_url: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=lambda: ["Imported from Google Maps"])


class MerchantImportRequest(BaseModel):
    """Schema for bulk import request."""
    merchants: List[MerchantImportItem]
    overwrite_existing: bool = False


class MerchantImportResponse(BaseModel):
    """Schema for import result."""
    created: int
    updated: int
    skipped: int
    errors: List[str] = []


class GoogleSyncResponse(BaseModel):
    """Schema for Google Place sync result."""
    status: str  # success, failed, pending
    merchant_id: str
    google_place_id: Optional[str] = None
    sync_timestamp: Optional[datetime] = None
    fields_updated: Optional[List[str]] = None
    error: Optional[str] = None
    google_meta: Optional[Dict[str, Any]] = None

