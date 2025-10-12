from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class WineBase(BaseModel):
    name: str
    price_usd: Optional[float] = None
    url: Optional[str] = None
    region: Optional[str] = None
    grapes: Optional[str] = None
    vintage: Optional[str] = None
    notes: Optional[str] = None


class WineCreate(WineBase):
    pass


class WineResponse(WineBase):
    id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ImportResponse(BaseModel):
    ok: bool
    rows: int
    message: str

