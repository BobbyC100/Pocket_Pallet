"""
Tasting Note Schemas

Pydantic models for tasting note validation and serialization.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TastingNoteBase(BaseModel):
    """Base schema for tasting notes"""
    wine_id: int

    # Appearance
    appearance_clarity: Optional[str] = None
    appearance_color: Optional[str] = None
    appearance_intensity: Optional[str] = None

    # Aroma
    aroma_primary: Optional[str] = None
    aroma_secondary: Optional[str] = None
    aroma_tertiary: Optional[str] = None

    # Palate (1-5 scales)
    palate_sweetness: Optional[int] = Field(default=None, ge=1, le=5)
    palate_acidity: Optional[int] = Field(default=None, ge=1, le=5)
    palate_tannin: Optional[int] = Field(default=None, ge=1, le=5)
    palate_body: Optional[int] = Field(default=None, ge=1, le=5)
    palate_alcohol: Optional[int] = Field(default=None, ge=1, le=5)

    # Freeform
    flavor_characteristics: Optional[str] = None
    finish_length: Optional[int] = Field(default=None, ge=1, le=5)


class TastingNoteCreate(TastingNoteBase):
    """Schema for creating a tasting note"""
    pass


class TastingNoteResponse(TastingNoteBase):
    """Schema for tasting note response"""
    id: int
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

