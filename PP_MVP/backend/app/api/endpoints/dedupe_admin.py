"""
Admin API endpoints for wine deduplication.

These endpoints are admin-only for managing duplicate wines.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.api.endpoints.scraper import require_admin
from app.models.wine import Wine
from app.models.scraper import ScrapedWine
from app.services.dedupe import (
    normalize_and_block,
    find_duplicate_candidates,
    cluster_duplicates,
    select_master_wine,
    merge_duplicates,
    normalize_text,
    create_blocking_key
)
from app.services.wine_parser import parse_wine_name


router = APIRouter()


# ===== Schemas =====

class DuplicateCandidate(BaseModel):
    """Duplicate wine pair."""
    wine1_id: int
    wine2_id: int
    similarity_score: float
    wine1_name: str
    wine2_name: str
    block: str


class DuplicateCandidatesResponse(BaseModel):
    """Response for duplicate candidates."""
    total: int
    candidates: List[DuplicateCandidate]


class MergeRequest(BaseModel):
    """Request to merge duplicates."""
    wine_ids: List[int]
    master_id: Optional[int] = None  # If None, auto-select master


class MergeResponse(BaseModel):
    """Response after merging duplicates."""
    master_id: int
    merged_count: int
    merged_ids: List[int]


class ParseWineRequest(BaseModel):
    """Request to parse a wine name."""
    raw_name: str


class ParseWineResponse(BaseModel):
    """Parsed wine data."""
    vintage: Optional[int] = None
    producer: Optional[str] = None
    cuvee: Optional[str] = None
    region: Optional[str] = None
    appellation: Optional[str] = None
    bottle_size_ml: Optional[int] = None
    style: Optional[str] = None


# ===== Endpoints =====

@router.post("/normalize", status_code=status.HTTP_202_ACCEPTED)
def normalize_wines(
    table: str = Query("wines", regex="^(wines|scraped_wines)$"),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    """
    Normalize all wines and create blocking keys (admin only).
    
    This should be run once after adding dedupe columns.
    Run as background task for large datasets.
    """
    model_class = Wine if table == "wines" else ScrapedWine
    
    # For MVP, run synchronously
    # In production, use Celery/background task
    normalize_and_block(db, model_class, batch_size=500)
    
    return {
        "message": f"Normalized {table} successfully",
        "table": table
    }


@router.post("/candidates", response_model=DuplicateCandidatesResponse)
def find_duplicates(
    table: str = Query("wines", regex="^(wines|scraped_wines)$"),
    threshold: float = Query(87.5, ge=0, le=100),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    """
    Find duplicate wine candidates (admin only).
    
    Returns pairs of wines that are likely duplicates.
    """
    model_class = Wine if table == "wines" else ScrapedWine
    
    # Get all blocking keys
    blocks = db.query(model_class.dedupe_block).filter(
        model_class.is_active == True,
        model_class.dedupe_block.isnot(None)
    ).distinct().limit(50).all()  # Limit blocks for performance
    
    all_candidates = []
    
    for (block_key,) in blocks:
        # Get wines in this block
        wines = db.query(model_class).filter(
            model_class.dedupe_block == block_key,
            model_class.is_active == True
        ).all()
        
        if len(wines) < 2:
            continue
        
        # Convert to dicts
        wine_dicts = []
        for wine in wines:
            wine_dicts.append({
                "id": wine.id,
                "norm_producer": wine.norm_producer,
                "norm_cuvee": wine.norm_cuvee,
                "vintage": wine.vintage,
                "producer": wine.producer,
                "cuvee": wine.cuvee or getattr(wine, 'name', None)
            })
        
        # Find candidates
        block_candidates = find_duplicate_candidates(wine_dicts, threshold)
        
        # Convert to response format
        for wine1_id, wine2_id, score in block_candidates:
            if len(all_candidates) >= limit:
                break
            
            wine1 = next(w for w in wines if w.id == wine1_id)
            wine2 = next(w for w in wines if w.id == wine2_id)
            
            wine1_name = f"{wine1.producer or 'Unknown'} - {wine1.cuvee or getattr(wine1, 'name', 'N/A')} ({wine1.vintage or 'NV'})"
            wine2_name = f"{wine2.producer or 'Unknown'} - {wine2.cuvee or getattr(wine2, 'name', 'N/A')} ({wine2.vintage or 'NV'})"
            
            all_candidates.append(DuplicateCandidate(
                wine1_id=wine1_id,
                wine2_id=wine2_id,
                similarity_score=round(score, 2),
                wine1_name=wine1_name,
                wine2_name=wine2_name,
                block=block_key
            ))
        
        if len(all_candidates) >= limit:
            break
    
    return DuplicateCandidatesResponse(
        total=len(all_candidates),
        candidates=all_candidates
    )


@router.post("/merge", response_model=MergeResponse)
def merge_duplicate_wines(
    payload: MergeRequest,
    table: str = Query("wines", regex="^(wines|scraped_wines)$"),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    """
    Merge duplicate wines (admin only).
    
    Marks duplicates as inactive and points them to master wine.
    """
    if len(payload.wine_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Need at least 2 wines to merge"
        )
    
    model_class = Wine if table == "wines" else ScrapedWine
    
    # Verify all wines exist
    wines = db.query(model_class).filter(
        model_class.id.in_(payload.wine_ids)
    ).all()
    
    if len(wines) != len(payload.wine_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more wines not found"
        )
    
    # Select or verify master
    if payload.master_id:
        if payload.master_id not in payload.wine_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Master ID must be in wine_ids list"
            )
        master_id = payload.master_id
    else:
        master_id = select_master_wine(payload.wine_ids, db, model_class)
    
    # Merge
    merged_count = merge_duplicates(payload.wine_ids, master_id, db, model_class)
    
    merged_ids = [wid for wid in payload.wine_ids if wid != master_id]
    
    return MergeResponse(
        master_id=master_id,
        merged_count=merged_count,
        merged_ids=merged_ids
    )


@router.post("/parse-wine", response_model=ParseWineResponse)
async def parse_wine(
    payload: ParseWineRequest,
    current_user=Depends(require_admin),
):
    """
    Parse a wine name using AI (admin only).
    
    Useful for testing the parser or manually parsing wines.
    """
    result = await parse_wine_name(payload.raw_name)
    
    return ParseWineResponse(**result)


@router.get("/stats")
def get_dedupe_stats(
    table: str = Query("wines", regex="^(wines|scraped_wines)$"),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    """
    Get deduplication statistics (admin only).
    
    Returns counts of active vs. duplicate wines.
    """
    model_class = Wine if table == "wines" else ScrapedWine
    
    total = db.query(model_class).count()
    active = db.query(model_class).filter(model_class.is_active == True).count()
    duplicates = db.query(model_class).filter(model_class.is_active == False).count()
    
    # Count wines with normalization
    normalized = db.query(model_class).filter(
        model_class.norm_producer.isnot(None)
    ).count()
    
    return {
        "table": table,
        "total_wines": total,
        "active_wines": active,
        "duplicate_wines": duplicates,
        "normalized_wines": normalized,
        "normalization_percentage": round((normalized / total * 100) if total > 0 else 0, 2)
    }

