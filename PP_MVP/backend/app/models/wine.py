from sqlalchemy import Column, String, Float, Text, Integer, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from app.db.base import Base


class Wine(Base):
    __tablename__ = "wines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False, index=True)
    price_usd = Column(Float, nullable=True)
    url = Column(String, nullable=True)
    region = Column(String, nullable=True, index=True)
    grapes = Column(String, nullable=True)
    vintage = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    producer = Column(String, nullable=True, index=True)
    
    # User ownership and management
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String, nullable=True)  # "Tried", "Want to Try", "Cellar", None
    rating = Column(Integer, nullable=True)  # 1-5 stars
    
    # Normalization and deduplication
    norm_producer = Column(Text, nullable=True, index=True)  # Normalized producer name
    norm_cuvee = Column(Text, nullable=True)  # Normalized cuvee/wine name
    dedupe_block = Column(Text, nullable=True, index=True)  # Blocking key for dedupe
    is_active = Column(Boolean, default=True, nullable=False, index=True)  # False if duplicate
    duplicate_of = Column(Integer, ForeignKey("wines.id", ondelete="SET NULL"), nullable=True, index=True)  # Points to master wine if duplicate
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

