"""Draft service for managing draft versions."""
from typing import Optional, Dict
from datetime import datetime, timedelta
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.wine import DraftVersion
from app.schemas.wine import DraftCreate, DraftUpdate


async def get_draft(
    db: AsyncSession,
    entity_type: str,
    entity_id: Optional[int],
    author_id: int
) -> Optional[DraftVersion]:
    """Get active draft for entity."""
    query = select(DraftVersion).where(
        and_(
            DraftVersion.entity_type == entity_type,
            DraftVersion.author_id == author_id
        )
    )
    
    if entity_id is not None:
        query = query.where(DraftVersion.entity_id == entity_id)
    else:
        query = query.where(DraftVersion.entity_id.is_(None))
    
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def create_or_update_draft(
    db: AsyncSession,
    entity_type: str,
    entity_id: Optional[int],
    author_id: int,
    data_json: Dict,
    lock_duration_minutes: int = 30
) -> DraftVersion:
    """Create or update draft (autosave)."""
    draft = await get_draft(db, entity_type, entity_id, author_id)
    
    if draft:
        # Update existing draft
        draft.data_json = data_json
        draft.updated_at = datetime.utcnow()
        draft.lock_expires_at = datetime.utcnow() + timedelta(minutes=lock_duration_minutes)
    else:
        # Create new draft
        draft = DraftVersion(
            entity_type=entity_type,
            entity_id=entity_id,
            author_id=author_id,
            data_json=data_json,
            lock_expires_at=datetime.utcnow() + timedelta(minutes=lock_duration_minutes)
        )
        db.add(draft)
    
    await db.flush()
    await db.refresh(draft)
    
    return draft


async def delete_draft(db: AsyncSession, draft_id: int) -> bool:
    """Delete draft after publish."""
    result = await db.execute(
        select(DraftVersion).where(DraftVersion.id == draft_id)
    )
    draft = result.scalar_one_or_none()
    
    if draft:
        await db.delete(draft)
        await db.flush()
        return True
    
    return False


async def check_lock(
    db: AsyncSession,
    entity_type: str,
    entity_id: int
) -> Optional[Dict]:
    """Check if entity is locked by another user."""
    result = await db.execute(
        select(DraftVersion).where(
            and_(
                DraftVersion.entity_type == entity_type,
                DraftVersion.entity_id == entity_id,
                DraftVersion.lock_expires_at > datetime.utcnow()
            )
        )
    )
    
    draft = result.scalar_one_or_none()
    
    if draft:
        return {
            "locked": True,
            "author_id": draft.author_id,
            "lock_expires_at": draft.lock_expires_at
        }
    
    return None

