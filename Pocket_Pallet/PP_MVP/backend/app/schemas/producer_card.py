"""Producer card schemas for recommendations."""
from typing import Optional, List, Literal
from pydantic import BaseModel
from datetime import datetime


ProducerClassType = Literal['Grower-Producer', 'Independent', 'Cooperative', 'Negociant', 'Industrial']
FarmingFlagType = Literal['Organic', 'Biodynamic', 'Low-Intervention', 'Sustainable']


class ProducerCardBase(BaseModel):
    """Base producer card schema."""
    name: str
    class_: ProducerClassType = 'Independent'
    flags: List[FarmingFlagType] = []
    summary: Optional[str] = None
    
    class Config:
        fields = {'class_': 'class'}


class ProducerCardCreate(ProducerCardBase):
    """Schema for creating producer cards."""
    pass


class ProducerCardUpdate(BaseModel):
    """Schema for updating producer cards."""
    name: Optional[str] = None
    class_: Optional[ProducerClassType] = None
    flags: Optional[List[FarmingFlagType]] = None
    summary: Optional[str] = None
    
    class Config:
        fields = {'class_': 'class'}


class ProducerCard(ProducerCardBase):
    """Full producer card schema."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        fields = {'class_': 'class'}

