"""Pydantic schemas for wine scraper system."""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, HttpUrl


# ===== Source Schemas =====
class SourceBase(BaseModel):
    name: str
    base_url: str
    product_link_selector: Optional[str] = None
    pagination_next_selector: Optional[str] = None
    use_playwright: bool = False
    enabled: bool = True


class SourceCreate(SourceBase):
    pass


class SourceUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    product_link_selector: Optional[str] = None
    pagination_next_selector: Optional[str] = None
    use_playwright: Optional[bool] = None
    enabled: Optional[bool] = None


class SourceResponse(SourceBase):
    id: int
    last_run_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== Scraped Wine Schemas =====
class ScrapedWineBase(BaseModel):
    producer: Optional[str] = None
    cuvee: Optional[str] = None
    vintage: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None
    appellation: Optional[str] = None
    style: Optional[str] = None
    grapes: Optional[str] = None
    volume_ml: Optional[int] = None
    block_key: Optional[str] = None


class ScrapedWineCreate(ScrapedWineBase):
    pass


class ScrapedWineResponse(ScrapedWineBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ===== Product Schemas =====
class ProductBase(BaseModel):
    product_url: str
    external_sku: Optional[str] = None
    title_raw: Optional[str] = None


class ProductCreate(ProductBase):
    source_id: int
    wine_id: Optional[int] = None
    data_raw: Optional[Dict[str, Any]] = None


class ProductResponse(ProductBase):
    id: int
    source_id: int
    wine_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== Product Snapshot Schemas =====
class ProductSnapshotBase(BaseModel):
    price_cents: Optional[int] = None
    currency: str = "USD"
    in_stock: Optional[bool] = None
    title_raw: Optional[str] = None
    availability_raw: Optional[str] = None


class ProductSnapshotCreate(ProductSnapshotBase):
    product_id: int
    normalized: Optional[Dict[str, Any]] = None


class ProductSnapshotResponse(ProductSnapshotBase):
    id: int
    product_id: int
    fetched_at: datetime

    model_config = {"from_attributes": True}


# ===== Product Image Schemas =====
class ProductImageBase(BaseModel):
    src_url: Optional[str] = None
    stored_url: Optional[str] = None
    sha1: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None


class ProductImageCreate(ProductImageBase):
    product_id: int


class ProductImageResponse(ProductImageBase):
    id: int
    product_id: int

    model_config = {"from_attributes": True}


# ===== Scraper Job Schemas =====
class ScrapeJobRequest(BaseModel):
    source_id: int
    max_pages: int = 5
    force: bool = False  # Force run even if recently run


class ScrapeJobResponse(BaseModel):
    job_id: str
    source_id: int
    status: str  # "started", "running", "completed", "failed"
    products_found: int = 0
    wines_created: int = 0
    snapshots_created: int = 0
    error: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

