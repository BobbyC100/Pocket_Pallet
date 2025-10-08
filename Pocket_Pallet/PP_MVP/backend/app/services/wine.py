"""Wine service."""
from typing import Optional, List, Dict
from datetime import datetime
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.wine import Wine, WineVersion
from app.models.producer import Producer
from app.models.audit_log import AuditLog
from app.schemas.wine import WineCreate, WineUpdate
from app.utils.matching import WineMatcher, MatchResult
from app.validators.normalizers import normalize_text


async def get_wine(db: AsyncSession, wine_id: int) -> Optional[Wine]:
    """Get wine by ID with relationships."""
    result = await db.execute(
        select(Wine)
        .options(joinedload(Wine.producer))
        .where(Wine.id == wine_id)
    )
    return result.scalar_one_or_none()


async def search_wines(
    db: AsyncSession,
    query: str,
    limit: int = 50,
    offset: int = 0
) -> List[Wine]:
    """Search wines by producer, cuvée, vintage."""
    normalized_query = normalize_text(query)
    search_pattern = f"%{normalized_query}%"
    
    result = await db.execute(
        select(Wine)
        .join(Producer)
        .where(
            or_(
                Wine.search_vector.ilike(search_pattern),
                Producer.normalized_name.ilike(search_pattern)
            )
        )
        .options(joinedload(Wine.producer))
        .limit(limit)
        .offset(offset)
    )
    
    return result.scalars().all()


async def create_wine(
    db: AsyncSession,
    wine_data: WineCreate,
    author_id: int,
    reason: str = "Initial creation"
) -> Wine:
    """Create new wine with version history."""
    # Create wine
    wine = Wine(**wine_data.model_dump())
    wine.last_seen_at = datetime.utcnow()
    
    # Build search vector
    producer_result = await db.execute(
        select(Producer).where(Producer.id == wine_data.producer_id)
    )
    producer = producer_result.scalar_one()
    wine.search_vector = _build_search_vector(wine, producer)
    
    db.add(wine)
    await db.flush()
    await db.refresh(wine)
    
    # Create version record
    version = WineVersion(
        wine_id=wine.id,
        data_json=wine_data.model_dump(),
        author_id=author_id,
        reason=reason
    )
    db.add(version)
    
    # Audit log
    await _log_audit(db, author_id, "create", "wine", wine.id, {"data": wine_data.model_dump()})
    
    await db.flush()
    
    return wine


async def update_wine(
    db: AsyncSession,
    wine: Wine,
    wine_data: WineUpdate,
    author_id: int,
    reason: str = "Update"
) -> Wine:
    """Update wine with version history."""
    # Store old data for diff
    old_data = {
        "producer_id": wine.producer_id,
        "cuvee": wine.cuvee,
        "vintage": wine.vintage,
        "is_nv": wine.is_nv,
        "abv": wine.abv,
        # ... other fields
    }
    
    # Update wine
    update_data = wine_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(wine, field, value)
    
    wine.updated_at = datetime.utcnow()
    
    # Update search vector if needed
    if "producer_id" in update_data or "cuvee" in update_data:
        producer_result = await db.execute(
            select(Producer).where(Producer.id == wine.producer_id)
        )
        producer = producer_result.scalar_one()
        wine.search_vector = _build_search_vector(wine, producer)
    
    await db.flush()
    await db.refresh(wine)
    
    # Create version record
    version = WineVersion(
        wine_id=wine.id,
        data_json=update_data,
        author_id=author_id,
        reason=reason
    )
    db.add(version)
    
    # Audit log with diff
    diff = {"old": old_data, "new": update_data}
    await _log_audit(db, author_id, "update", "wine", wine.id, diff)
    
    await db.flush()
    
    return wine


async def get_wine_versions(
    db: AsyncSession,
    wine_id: int,
    limit: int = 50
) -> List[WineVersion]:
    """Get version history for wine."""
    result = await db.execute(
        select(WineVersion)
        .where(WineVersion.wine_id == wine_id)
        .order_by(WineVersion.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


async def rollback_to_version(
    db: AsyncSession,
    wine: Wine,
    version_id: int,
    author_id: int
) -> Wine:
    """Rollback wine to a specific version."""
    # Get the version
    result = await db.execute(
        select(WineVersion).where(WineVersion.id == version_id)
    )
    version = result.scalar_one()
    
    # Apply version data to wine
    for field, value in version.data_json.items():
        if hasattr(wine, field):
            setattr(wine, field, value)
    
    wine.updated_at = datetime.utcnow()
    
    await db.flush()
    await db.refresh(wine)
    
    # Create new version for rollback
    new_version = WineVersion(
        wine_id=wine.id,
        data_json=version.data_json,
        author_id=author_id,
        reason=f"Rollback to version {version_id}"
    )
    db.add(new_version)
    
    await _log_audit(
        db, author_id, "rollback", "wine", wine.id,
        {"target_version_id": version_id}
    )
    
    await db.flush()
    
    return wine


async def preview_merge(
    db: AsyncSession,
    candidate_data: Dict
) -> Dict:
    """Preview merge results for candidate wine data."""
    matcher = WineMatcher()
    matches = await matcher.find_matches(db, candidate_data, top_n=1)
    
    if matches and matches[0].score >= matcher.review_threshold:
        match = matches[0]
        target_wine = await get_wine(db, match.wine_id)
        
        return {
            "is_new": False,
            "target_wine_id": match.wine_id,
            "match_score": match.score,
            "conflicts": match.conflicts,
            "merged_data": _merge_wine_data(candidate_data, target_wine),
            "match_details": match.match_details
        }
    else:
        return {
            "is_new": True,
            "target_wine_id": None,
            "match_score": None,
            "conflicts": [],
            "merged_data": candidate_data,
            "match_details": {}
        }


def _build_search_vector(wine: Wine, producer: Producer) -> str:
    """Build searchable text for wine."""
    parts = [
        producer.name,
        producer.normalized_name,
        wine.cuvee or "",
        str(wine.vintage) if wine.vintage else "NV"
    ]
    return " ".join(parts).lower()


def _merge_wine_data(candidate: Dict, target: Optional[Wine]) -> Dict:
    """Merge candidate data with existing wine data."""
    if not target:
        return candidate
    
    # Simple merge strategy: prefer non-null values from candidate
    merged = {
        "producer_id": candidate.get("producer_id") or target.producer_id,
        "cuvee": candidate.get("cuvee") or target.cuvee,
        "vintage": candidate.get("vintage") or target.vintage,
        "is_nv": candidate.get("is_nv", target.is_nv),
        "abv": candidate.get("abv") or target.abv,
        # ... other fields
    }
    
    return merged


async def _log_audit(
    db: AsyncSession,
    actor_id: int,
    action: str,
    entity_type: str,
    entity_id: int,
    diff: Dict
):
    """Log action to audit trail."""
    log = AuditLog(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        diff_json=diff
    )
    db.add(log)

