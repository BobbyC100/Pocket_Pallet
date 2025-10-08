"""User schemas."""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from enum import Enum


class Role(str, Enum):
    """User roles."""
    VIEWER = "viewer"
    EDITOR = "editor"
    IMPORTER = "importer"
    ADMIN = "admin"


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: Optional[str] = None
    role: Role = Role.VIEWER
    is_active: bool = True


class UserCreate(UserBase):
    """Schema for creating users."""
    password: str


class UserUpdate(BaseModel):
    """Schema for updating users."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[Role] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class User(UserBase):
    """Full user schema."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data."""
    user_id: Optional[int] = None

