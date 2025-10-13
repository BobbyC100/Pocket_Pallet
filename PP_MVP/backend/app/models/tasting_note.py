"""
Tasting Note Model

Structured wine tasting notes to build user palate profiles and enable
personalized recommendations based on taste preferences.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class TastingNote(Base):
    """
    Tasting Note table for structured wine evaluation.
    
    Uses standardized vocabulary and 1-5 scales to normalize
    tasting data for analytics and recommendation engines.
    """
    __tablename__ = "tasting_notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Relations
    wine_id = Column(Integer, ForeignKey("wines.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Temporarily disabled relationships to avoid circular imports
    # wine = relationship("Wine", back_populates="tasting_notes")
    # user = relationship("User", back_populates="tasting_notes")

    # Appearance
    appearance_clarity = Column(String, nullable=True)    # Clear | Hazy | Cloudy
    appearance_color = Column(String, nullable=True)      # e.g. Pale Straw | Ruby | Deep Amber
    appearance_intensity = Column(String, nullable=True)  # Pale | Medium | Deep

    # Aroma
    aroma_primary = Column(String, nullable=True)         # Fruit | Floral | Herbal | etc.
    aroma_secondary = Column(String, nullable=True)       # Yeast | Butter | Vanilla | Toast
    aroma_tertiary = Column(String, nullable=True)        # Earth | Leather | Mushroom | Dried Fruit

    # Palate (1–5 scales)
    palate_sweetness = Column(Integer, nullable=True)     # 1 bone-dry → 5 sweet
    palate_acidity = Column(Integer, nullable=True)
    palate_tannin = Column(Integer, nullable=True)
    palate_body = Column(Integer, nullable=True)
    palate_alcohol = Column(Integer, nullable=True)

    # Freeform
    flavor_characteristics = Column(Text, nullable=True)  # "black cherry, cedar"
    finish_length = Column(Integer, nullable=True)        # 1 short → 5 long

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

