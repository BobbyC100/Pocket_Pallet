"""
API endpoints for merchant management.

Public endpoints for browsing merchants, admin endpoints for CRUD operations.
"""

from typing import List, Dict, Any
import uuid
import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.merchant import Merchant
from app.models.user import User
from app.schemas.merchant import (
    MerchantCreate,
    MerchantUpdate,
    MerchantResponse,
    MerchantImportRequest,
    MerchantImportResponse,
    GoogleSyncResponse,
)
from app.services.google_places import GooglePlacesService
from app.core.config import settings


router = APIRouter()


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


def is_admin(user: User) -> bool:
    """Check if user is admin. For MVP, all logged-in users are admins."""
    return True  # MVP: all users are admins


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin access."""
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ===== Public Endpoints =====

@router.get("/", response_model=List[MerchantResponse])
def list_merchants(
    skip: int = 0,
    limit: int = 100,
    country: str = None,
    type: str = None,
    db: Session = Depends(get_db),
):
    """List all merchants (public)."""
    query = db.query(Merchant)
    
    if country:
        query = query.filter(Merchant.country_code == country.upper())
    if type:
        query = query.filter(Merchant.type == type)
    
    merchants = query.order_by(Merchant.name).offset(skip).limit(limit).all()
    return merchants


@router.get("/{merchant_id}", response_model=MerchantResponse)
def get_merchant(
    merchant_id: str,
    db: Session = Depends(get_db),
):
    """Get a specific merchant by ID or slug (public)."""
    # Try by slug first (most common case)
    merchant = db.query(Merchant).filter(Merchant.slug == merchant_id).first()
    
    # Try by UUID if not found and merchant_id looks like a UUID
    if not merchant:
        try:
            merchant_uuid = uuid.UUID(merchant_id)
            merchant = db.query(Merchant).filter(Merchant.id == merchant_uuid).first()
        except ValueError:
            # Not a valid UUID, skip
            pass
    
    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant not found"
        )
    
    return merchant


# ===== Admin Endpoints =====

@router.post("/", response_model=MerchantResponse, status_code=status.HTTP_201_CREATED)
def create_merchant(
    payload: MerchantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new merchant (admin only)."""
    # Check if slug already exists
    existing = db.query(Merchant).filter(Merchant.slug == payload.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Merchant with slug '{payload.slug}' already exists"
        )
    
    merchant = Merchant(
        id=str(uuid.uuid4()),
        **payload.model_dump()
    )
    
    db.add(merchant)
    db.commit()
    db.refresh(merchant)
    return merchant


@router.patch("/{merchant_id}", response_model=MerchantResponse)
def update_merchant(
    merchant_id: str,
    payload: MerchantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update a merchant (admin only)."""
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant not found"
        )
    
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(merchant, field, value)
    
    db.commit()
    db.refresh(merchant)
    return merchant


@router.delete("/{merchant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_merchant(
    merchant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete a merchant (admin only)."""
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant not found"
        )
    
    db.delete(merchant)
    db.commit()
    return None


@router.post("/import", response_model=MerchantImportResponse)
def import_merchants(
    payload: MerchantImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Bulk import merchants from Google Maps data (admin only).
    
    Accepts a list of merchants with basic info (name, address, coordinates).
    """
    stats = {
        'created': 0,
        'updated': 0,
        'skipped': 0,
        'errors': []
    }
    
    for item in payload.merchants:
        try:
            slug = slugify(item.name)
            
            # Check if merchant exists
            existing = db.query(Merchant).filter(
                (Merchant.slug == slug) | (Merchant.name == item.name)
            ).first()
            
            if existing:
                if payload.overwrite_existing:
                    # Update existing
                    existing.address = item.address or existing.address
                    if item.lat and item.lng:
                        existing.geo = {'lat': item.lat, 'lng': item.lng}
                    existing.country_code = item.country_code or existing.country_code
                    existing.source_url = item.source_url or existing.source_url
                    if item.tags:
                        existing.tags = list(set((existing.tags or []) + item.tags))
                    existing.last_synced = datetime.utcnow()
                    
                    stats['updated'] += 1
                else:
                    stats['skipped'] += 1
                    continue
            else:
                # Create new
                merchant = Merchant(
                    id=str(uuid.uuid4()),
                    name=item.name,
                    slug=slug,
                    address=item.address,
                    geo={'lat': item.lat, 'lng': item.lng} if item.lat and item.lng else None,
                    country_code=item.country_code,
                    tags=item.tags,
                    source_url=item.source_url,
                    last_synced=datetime.utcnow()
                )
                
                db.add(merchant)
                stats['created'] += 1
        
        except Exception as e:
            stats['errors'].append(f"Error processing {item.name}: {str(e)}")
    
    db.commit()
    
    return MerchantImportResponse(**stats)


@router.post("/{merchant_id}/google-sync", response_model=GoogleSyncResponse)
def sync_merchant_with_google(
    merchant_id: str,
    place_id: str,
    force_overwrite: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Sync a merchant with Google Places data (admin only).
    
    This endpoint enriches merchant data by fetching details from Google Places API.
    By default, it only fills in empty fields. Use force_overwrite=true to replace existing data.
    
    Args:
        merchant_id: Merchant ID or slug
        place_id: Google Place ID (e.g., "ChIJ8T1Z9XuxwoARah7YaygWXpA")
        force_overwrite: If true, overwrites existing data (default: false)
    
    Returns:
        Sync status, updated fields list, and enriched data
    """
    # Check if Google API is configured
    if not settings.GOOGLE_PLACES_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Places API key not configured. Set GOOGLE_PLACES_API_KEY in environment."
        )
    
    # Find merchant by ID or slug
    merchant = db.query(Merchant).filter(
        (Merchant.id == merchant_id) | (Merchant.slug == merchant_id)
    ).first()
    
    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant not found"
        )
    
    # Initialize Google Places service
    try:
        google_service = GooglePlacesService(api_key=settings.GOOGLE_PLACES_API_KEY)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    
    # Perform sync
    sync_status, google_meta, error, updated_fields = google_service.sync_merchant(
        db=db,
        merchant_id=merchant.id,
        place_id=place_id,
        force_overwrite=force_overwrite
    )
    
    if sync_status == 'failed':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google sync failed: {error}"
        )
    
    return GoogleSyncResponse(
        status=sync_status,
        merchant_id=merchant.id,
        google_place_id=place_id,
        sync_timestamp=datetime.utcnow(),
        fields_updated=updated_fields,
        error=error,
        google_meta=google_meta
    )


@router.get("/{merchant_id}/google-sync-status", response_model=Dict[str, Any])
def get_google_sync_status(
    merchant_id: str,
    db: Session = Depends(get_db),
):
    """
    Get Google sync status for a merchant (public).
    
    Returns sync metadata including last sync time and status.
    """
    merchant = db.query(Merchant).filter(
        (Merchant.id == merchant_id) | (Merchant.slug == merchant_id)
    ).first()
    
    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant not found"
        )
    
    return {
        'merchant_id': merchant.id,
        'google_place_id': merchant.google_place_id,
        'google_sync_status': merchant.google_sync_status or 'never_synced',
        'google_last_synced': merchant.google_last_synced,
        'has_google_data': merchant.google_meta is not None
    }

