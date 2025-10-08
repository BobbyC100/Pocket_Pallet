"""Review queue endpoints for fuzzy match resolution."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.security import get_current_active_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Role
from app.schemas.merge_candidate import (
    MergeCandidate, MergeCandidateUpdate, MergeCandidateWithTarget,
    MergeStatus, ReviewQueueStats
)
from app.models.merge_candidate import MergeCandidate as MergeCandidateModel

router = APIRouter()


@router.get("", response_model=List[MergeCandidateWithTarget])
async def list_merge_candidates(
    status: MergeStatus = Query(MergeStatus.PENDING),
    import_id: int = Query(None),
    min_score: float = Query(None, ge=0, le=1),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """List merge candidates for review."""
    query = select(MergeCandidateModel).where(
        MergeCandidateModel.status == status
    )
    
    if import_id:
        query = query.where(MergeCandidateModel.import_job_id == import_id)
    
    if min_score is not None:
        query = query.where(MergeCandidateModel.match_score >= min_score)
    
    query = query.order_by(
        MergeCandidateModel.match_score.desc()
    ).limit(limit).offset(offset)
    
    result = await db.execute(query)
    candidates = result.scalars().all()
    
    # Enhance with target wine data
    enhanced = []
    for candidate in candidates:
        candidate_dict = {
            **candidate.__dict__,
            "target_wine_data": None
        }
        
        if candidate.target_wine_id:
            from app.services.wine import get_wine
            target_wine = await get_wine(db, candidate.target_wine_id)
            if target_wine:
                candidate_dict["target_wine_data"] = {
                    "id": target_wine.id,
                    "producer": target_wine.producer.name if target_wine.producer else None,
                    "cuvee": target_wine.cuvee,
                    "vintage": target_wine.vintage,
                    "is_nv": target_wine.is_nv
                }
        
        enhanced.append(candidate_dict)
    
    return enhanced


@router.get("/{candidate_id}", response_model=MergeCandidateWithTarget)
async def get_merge_candidate(
    candidate_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Get merge candidate details."""
    result = await db.execute(
        select(MergeCandidateModel).where(MergeCandidateModel.id == candidate_id)
    )
    candidate = result.scalar_one_or_none()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Merge candidate not found")
    
    # Get target wine data
    target_wine_data = None
    if candidate.target_wine_id:
        from app.services.wine import get_wine
        target_wine = await get_wine(db, candidate.target_wine_id)
        if target_wine:
            target_wine_data = {
                "id": target_wine.id,
                "producer": target_wine.producer.name if target_wine.producer else None,
                "cuvee": target_wine.cuvee,
                "vintage": target_wine.vintage,
                "is_nv": target_wine.is_nv,
                "abv": target_wine.abv,
                "wine_type": target_wine.wine_type
            }
    
    return {
        **candidate.__dict__,
        "target_wine_data": target_wine_data
    }


@router.post("/{candidate_id}/accept")
async def accept_merge_candidate(
    candidate_id: int,
    note: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Accept merge candidate and merge into existing wine."""
    from datetime import datetime
    from app.services.wine import update_wine, get_wine
    from app.schemas.wine import WineUpdate
    
    result = await db.execute(
        select(MergeCandidateModel).where(MergeCandidateModel.id == candidate_id)
    )
    candidate = result.scalar_one_or_none()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Merge candidate not found")
    
    if candidate.status != MergeStatus.PENDING:
        raise HTTPException(status_code=400, detail="Candidate already reviewed")
    
    # Get target wine
    target_wine = await get_wine(db, candidate.target_wine_id)
    if not target_wine:
        raise HTTPException(status_code=404, detail="Target wine not found")
    
    # Merge data into existing wine
    # Use candidate data to update wine (simple merge)
    merge_data = candidate.candidate_json
    wine_update = WineUpdate(**{k: v for k, v in merge_data.items() if v is not None})
    
    await update_wine(
        db, target_wine, wine_update, current_user.id,
        reason=f"Merged from import (match score: {candidate.match_score:.2f})"
    )
    
    # Update candidate status
    candidate.status = MergeStatus.ACCEPTED
    candidate.reviewer_id = current_user.id
    candidate.reviewed_at = datetime.utcnow()
    candidate.note = note
    
    await db.flush()
    
    return {"message": "Merge accepted", "wine_id": target_wine.id}


@router.post("/{candidate_id}/reject")
async def reject_merge_candidate(
    candidate_id: int,
    create_new: bool = Query(True),
    note: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Reject merge candidate and optionally create as new wine."""
    from datetime import datetime
    from app.services.wine import create_wine
    from app.schemas.wine import WineCreate
    
    result = await db.execute(
        select(MergeCandidateModel).where(MergeCandidateModel.id == candidate_id)
    )
    candidate = result.scalar_one_or_none()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Merge candidate not found")
    
    if candidate.status != MergeStatus.PENDING:
        raise HTTPException(status_code=400, detail="Candidate already reviewed")
    
    new_wine_id = None
    
    if create_new:
        # Create new wine from candidate data
        wine_data = WineCreate(**candidate.candidate_json)
        new_wine = await create_wine(
            db, wine_data, current_user.id,
            reason="Created from rejected merge candidate"
        )
        new_wine_id = new_wine.id
    
    # Update candidate status
    candidate.status = MergeStatus.REJECTED
    candidate.reviewer_id = current_user.id
    candidate.reviewed_at = datetime.utcnow()
    candidate.note = note
    
    await db.flush()
    
    return {
        "message": "Merge rejected",
        "new_wine_id": new_wine_id
    }


@router.get("/stats/summary", response_model=ReviewQueueStats)
async def get_queue_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Get review queue statistics."""
    from sqlalchemy import func
    
    # Total pending
    result = await db.execute(
        select(func.count(MergeCandidateModel.id))
        .where(MergeCandidateModel.status == MergeStatus.PENDING)
    )
    total_pending = result.scalar()
    
    # By score range
    score_ranges = {
        "0.90-1.00": (0.90, 1.00),
        "0.80-0.89": (0.80, 0.89),
        "0.75-0.79": (0.75, 0.79),
    }
    
    by_score_range = {}
    for range_name, (min_score, max_score) in score_ranges.items():
        result = await db.execute(
            select(func.count(MergeCandidateModel.id))
            .where(
                and_(
                    MergeCandidateModel.status == MergeStatus.PENDING,
                    MergeCandidateModel.match_score >= min_score,
                    MergeCandidateModel.match_score <= max_score
                )
            )
        )
        by_score_range[range_name] = result.scalar()
    
    # By import job
    result = await db.execute(
        select(
            MergeCandidateModel.import_job_id,
            func.count(MergeCandidateModel.id)
        )
        .where(MergeCandidateModel.status == MergeStatus.PENDING)
        .group_by(MergeCandidateModel.import_job_id)
    )
    by_import = {str(import_id): count for import_id, count in result.all()}
    
    return {
        "total_pending": total_pending,
        "by_score_range": by_score_range,
        "by_import": by_import
    }

