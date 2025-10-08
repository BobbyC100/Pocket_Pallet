"""Wine schemas."""
from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, Field, validator


class WineBase(BaseModel):
    """Base wine schema."""
    producer_id: int
    cuvee: Optional[str] = None
    vintage: Optional[int] = Field(None, ge=1900, le=2100)
    is_nv: bool = False
    country_id: Optional[int] = None
    region_id: Optional[int] = None
    subregion: Optional[str] = None
    grape_ids: Optional[List[int]] = []
    grape_percentages: Optional[Dict[str, float]] = None
    abv: Optional[float] = Field(None, ge=5.0, le=18.0)
    bottle_size: Optional[str] = "750ml"
    wine_type: Optional[str] = None
    style: Optional[str] = None
    notes: Optional[str] = None
    
    @validator('vintage')
    def validate_vintage(cls, v, values):
        """Validate vintage is set or is_nv is true."""
        if v is None and not values.get('is_nv'):
            raise ValueError('Must specify vintage or mark as non-vintage')
        if v is not None and values.get('is_nv'):
            raise ValueError('Cannot have both vintage and non-vintage flag')
        return v


class WineCreate(WineBase):
    """Schema for creating wines."""
    pass


class WineUpdate(BaseModel):
    """Schema for updating wines."""
    producer_id: Optional[int] = None
    cuvee: Optional[str] = None
    vintage: Optional[int] = Field(None, ge=1900, le=2100)
    is_nv: Optional[bool] = None
    country_id: Optional[int] = None
    region_id: Optional[int] = None
    subregion: Optional[str] = None
    grape_ids: Optional[List[int]] = None
    grape_percentages: Optional[Dict[str, float]] = None
    abv: Optional[float] = Field(None, ge=5.0, le=18.0)
    bottle_size: Optional[str] = None
    wine_type: Optional[str] = None
    style: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class Wine(WineBase):
    """Full wine schema."""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_seen_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class WineWithRelations(Wine):
    """Wine with related data."""
    producer_name: Optional[str] = None
    country_name: Optional[str] = None
    region_name: Optional[str] = None
    grape_names: Optional[List[str]] = []


class DraftCreate(BaseModel):
    """Schema for creating drafts."""
    entity_type: str
    entity_id: Optional[int] = None
    data_json: Dict


class DraftUpdate(BaseModel):
    """Schema for updating drafts."""
    data_json: Dict


class Draft(DraftCreate):
    """Full draft schema."""
    id: int
    author_id: int
    lock_expires_at: Optional[datetime] = None
    updated_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


class PublishDraftRequest(BaseModel):
    """Request to publish a draft."""
    reason: Optional[str] = None


class MergePreview(BaseModel):
    """Preview of merge results."""
    is_new: bool
    target_wine_id: Optional[int] = None
    match_score: Optional[float] = None
    conflicts: Optional[List[str]] = []
    merged_data: Dict

