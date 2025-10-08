"""Producer card service."""
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.producer_min import ProducerMin
from app.schemas.producer_card import ProducerCardCreate, ProducerCardUpdate


async def get_producer(db: AsyncSession, producer_id: int) -> Optional[ProducerMin]:
    """Get producer by ID."""
    result = await db.execute(
        select(ProducerMin).where(ProducerMin.id == producer_id)
    )
    return result.scalar_one_or_none()


async def list_producers(
    db: AsyncSession,
    limit: int = 100,
    offset: int = 0,
    class_filter: Optional[str] = None
) -> List[ProducerMin]:
    """List producers with optional filtering."""
    query = select(ProducerMin)
    
    if class_filter:
        query = query.where(ProducerMin.class_ == class_filter)
    
    query = query.limit(limit).offset(offset).order_by(ProducerMin.name)
    
    result = await db.execute(query)
    return list(result.scalars().all())


async def search_producers(
    db: AsyncSession,
    search: str,
    limit: int = 50
) -> List[ProducerMin]:
    """Search producers by name."""
    result = await db.execute(
        select(ProducerMin)
        .where(ProducerMin.name.ilike(f'%{search}%'))
        .limit(limit)
        .order_by(ProducerMin.name)
    )
    return list(result.scalars().all())


async def create_producer(
    db: AsyncSession,
    producer_data: ProducerCardCreate
) -> ProducerMin:
    """Create a new producer."""
    producer = ProducerMin(
        name=producer_data.name,
        class_=producer_data.class_,
        flags=producer_data.flags,
        summary=producer_data.summary
    )
    
    db.add(producer)
    await db.flush()
    await db.refresh(producer)
    
    return producer


async def update_producer(
    db: AsyncSession,
    producer: ProducerMin,
    producer_data: ProducerCardUpdate
) -> ProducerMin:
    """Update producer."""
    update_data = producer_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == 'class_':
            setattr(producer, 'class_', value)
        else:
            setattr(producer, field, value)
    
    await db.flush()
    await db.refresh(producer)
    
    return producer


async def delete_producer(db: AsyncSession, producer_id: int) -> bool:
    """Delete producer."""
    result = await db.execute(
        select(ProducerMin).where(ProducerMin.id == producer_id)
    )
    producer = result.scalar_one_or_none()
    
    if producer:
        await db.delete(producer)
        await db.flush()
        return True
    
    return False

