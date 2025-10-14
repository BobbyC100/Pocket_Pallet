"""
SQLAlchemy models for wine scraper system.

Tables:
- sources: Wine retailer/distributor websites
- scraped_wines: Master wine catalog (separate from user's personal wines)
- products: Specific product listings from sources
- product_snapshots: Price/availability history
- product_images: Product images
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Source(Base):
    """Wine retailer/distributor website source."""
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    base_url = Column(String, nullable=False, unique=True)
    product_link_selector = Column(String, nullable=True)
    pagination_next_selector = Column(String, nullable=True)
    use_playwright = Column(Boolean, default=False)
    enabled = Column(Boolean, default=True)
    last_run_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    products = relationship("Product", back_populates="source", cascade="all, delete-orphan")


class ScrapedWine(Base):
    """Master wine catalog from scraper (separate from user's personal wines table)."""
    __tablename__ = "scraped_wines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    producer = Column(String, index=True)
    cuvee = Column(String, index=True)
    vintage = Column(String, index=True)
    country = Column(String, index=True)
    region = Column(String, index=True)
    appellation = Column(String, index=True)
    style = Column(String, index=True)  # e.g., "Red", "White", "Sparkling"
    grapes = Column(String)  # Comma-separated or JSON
    volume_ml = Column(Integer)  # e.g., 750, 1500
    block_key = Column(String, index=True)  # For deduplication/matching (deprecated - use dedupe_block)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Normalization and deduplication
    norm_producer = Column(Text, nullable=True, index=True)  # Normalized producer name
    norm_cuvee = Column(Text, nullable=True)  # Normalized cuvee/wine name
    dedupe_block = Column(Text, nullable=True, index=True)  # Blocking key for dedupe
    is_active = Column(Boolean, default=True, nullable=False, index=True)  # False if duplicate
    duplicate_of = Column(Integer, ForeignKey("scraped_wines.id", ondelete="SET NULL"), nullable=True, index=True)  # Points to master wine if duplicate

    # Relationships
    products = relationship("Product", back_populates="wine")

    def __repr__(self):
        return f"<ScrapedWine(id={self.id}, producer={self.producer}, cuvee={self.cuvee}, vintage={self.vintage})>"


class Product(Base):
    """Specific product listing from a source (many products can point to one wine)."""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    wine_id = Column(Integer, ForeignKey("scraped_wines.id", ondelete="SET NULL"), nullable=True)
    source_id = Column(Integer, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)
    product_url = Column(String, nullable=False, unique=True)
    external_sku = Column(String)
    title_raw = Column(String)
    data_raw = Column(JSON)  # Full scraped data for debugging
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    wine = relationship("ScrapedWine", back_populates="products")
    source = relationship("Source", back_populates="products")
    snapshots = relationship("ProductSnapshot", back_populates="product", cascade="all, delete-orphan")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")


class ProductSnapshot(Base):
    """Price and availability snapshot for a product at a specific time."""
    __tablename__ = "product_snapshots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    fetched_at = Column(DateTime, server_default=func.now(), index=True)
    price_cents = Column(Integer)  # Store as cents to avoid float issues
    currency = Column(String, default="USD")
    in_stock = Column(Boolean)
    title_raw = Column(String)
    availability_raw = Column(String)
    normalized = Column(JSON)  # Normalized/parsed fields

    # Relationships
    product = relationship("Product", back_populates="snapshots")


class ProductImage(Base):
    """Product image metadata."""
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    src_url = Column(String)
    stored_url = Column(String)  # S3/CDN URL if stored
    sha1 = Column(String, index=True)  # For deduplication
    width = Column(Integer)
    height = Column(Integer)

    # Relationships
    product = relationship("Product", back_populates="images")

