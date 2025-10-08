"""Wine endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_active_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Role
from app.schemas.wine import (
    Wine, WineCreate, WineUpdate, WineWithRelations,
    Draft, DraftCreate, DraftUpdate, PublishDraftRequest,
    MergePreview
)
from app.services import wine as wine_service
from app.services import draft as draft_service

router = APIRouter()


@router.get("/search", response_model=List[WineWithRelations])
async def search_wines(
    q: str = Query(..., min_length=2),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search wines."""
    wines = await wine_service.search_wines(db, q, limit, offset)
    
    # Enhance with relations (simplified)
    results = []
    for wine in wines:
        wine_dict = {
            **wine.__dict__,
            "producer_name": wine.producer.name if wine.producer else None
        }
        results.append(wine_dict)
    
    return results


@router.get("/{wine_id}", response_model=Wine)
async def get_wine(
    wine_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get wine by ID."""
    wine = await wine_service.get_wine(db, wine_id)
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    return wine


@router.post("", response_model=Wine, status_code=status.HTTP_201_CREATED)
async def create_wine(
    wine_data: WineCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Create new wine (direct publish)."""
    wine = await wine_service.create_wine(db, wine_data, current_user.id)
    return wine


@router.put("/{wine_id}", response_model=Wine)
async def update_wine(
    wine_id: int,
    wine_data: WineUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Update wine (direct publish)."""
    wine = await wine_service.get_wine(db, wine_id)
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    
    updated_wine = await wine_service.update_wine(db, wine, wine_data, current_user.id)
    return updated_wine


@router.get("/{wine_id}/versions")
async def get_wine_versions(
    wine_id: int,
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get wine version history."""
    versions = await wine_service.get_wine_versions(db, wine_id, limit)
    return versions


@router.post("/{wine_id}/rollback/{version_id}", response_model=Wine)
async def rollback_wine(
    wine_id: int,
    version_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Rollback wine to specific version."""
    wine = await wine_service.get_wine(db, wine_id)
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    
    rolled_back = await wine_service.rollback_to_version(
        db, wine, version_id, current_user.id
    )
    return rolled_back


# Draft endpoints

@router.get("/drafts/wine/{wine_id}", response_model=Draft)
async def get_wine_draft(
    wine_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Get draft for existing wine."""
    draft = await draft_service.get_draft(db, "wine", wine_id, current_user.id)
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft


@router.post("/drafts/wine", response_model=Draft)
async def create_wine_draft(
    data_json: dict,
    wine_id: int = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Create or update wine draft (autosave)."""
    draft = await draft_service.create_or_update_draft(
        db, "wine", wine_id, current_user.id, data_json
    )
    return draft


@router.post("/drafts/{draft_id}/publish", response_model=Wine)
async def publish_draft(
    draft_id: int,
    publish_request: PublishDraftRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Publish draft to create/update wine."""
    from sqlalchemy import select
    from app.models.wine import DraftVersion
    
    result = await db.execute(
        select(DraftVersion).where(DraftVersion.id == draft_id)
    )
    draft = result.scalar_one_or_none()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    if draft.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your draft")
    
    # Create or update wine from draft
    if draft.entity_id:
        # Update existing wine
        wine = await wine_service.get_wine(db, draft.entity_id)
        if not wine:
            raise HTTPException(status_code=404, detail="Wine not found")
        
        wine_update = WineUpdate(**draft.data_json)
        wine = await wine_service.update_wine(
            db, wine, wine_update, current_user.id,
            reason=publish_request.reason or "Published from draft"
        )
    else:
        # Create new wine
        wine_create = WineCreate(**draft.data_json)
        wine = await wine_service.create_wine(
            db, wine_create, current_user.id,
            reason=publish_request.reason or "Published from draft"
        )
    
    # Delete draft
    await draft_service.delete_draft(db, draft_id)
    
    return wine


@router.post("/preview-merge", response_model=MergePreview)
async def preview_merge(
    candidate_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Preview merge results for candidate wine."""
    preview = await wine_service.preview_merge(db, candidate_data)
    return preview

