"""Producer card API endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_active_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Role
from app.schemas.producer_card import ProducerCard, ProducerCardCreate, ProducerCardUpdate
from app.services import producer_card as producer_service
from app.utils.producer_boost import producer_boost, producer_rationale_line

router = APIRouter()


@router.get("/search", response_model=List[ProducerCard])
async def search_producers(
    q: str = Query(..., min_length=1),
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search producers by name."""
    producers = await producer_service.search_producers(db, q, limit)
    return producers


@router.get("", response_model=List[ProducerCard])
async def list_producers(
    limit: int = Query(100, le=200),
    offset: int = Query(0, ge=0),
    class_filter: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all producers with optional filtering."""
    producers = await producer_service.list_producers(
        db, limit, offset, class_filter
    )
    return producers


@router.get("/{producer_id}", response_model=ProducerCard)
async def get_producer(
    producer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get producer by ID."""
    producer = await producer_service.get_producer(db, producer_id)
    if not producer:
        raise HTTPException(status_code=404, detail="Producer not found")
    return producer


@router.post("", response_model=ProducerCard, status_code=201)
async def create_producer(
    producer_data: ProducerCardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Create a new producer."""
    producer = await producer_service.create_producer(db, producer_data)
    return producer


@router.put("/{producer_id}", response_model=ProducerCard)
async def update_producer(
    producer_id: int,
    producer_data: ProducerCardUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.EDITOR))
):
    """Update a producer."""
    producer = await producer_service.get_producer(db, producer_id)
    if not producer:
        raise HTTPException(status_code=404, detail="Producer not found")
    
    updated = await producer_service.update_producer(db, producer, producer_data)
    return updated


@router.delete("/{producer_id}", status_code=204)
async def delete_producer(
    producer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.ADMIN))
):
    """Delete a producer."""
    success = await producer_service.delete_producer(db, producer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Producer not found")


@router.get("/{producer_id}/boost")
async def get_producer_boost(
    producer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get scoring boost for a producer."""
    producer = await producer_service.get_producer(db, producer_id)
    if not producer:
        raise HTTPException(status_code=404, detail="Producer not found")
    
    boost = producer_boost(producer.class_.value, producer.flags)
    rationale = producer_rationale_line(producer.name, producer.class_.value, producer.flags)
    
    return {
        "producer_id": producer.id,
        "boost": boost,
        "rationale_line": rationale,
        "breakdown": {
            "class": producer.class_.value,
            "flags": producer.flags
        }
    }

