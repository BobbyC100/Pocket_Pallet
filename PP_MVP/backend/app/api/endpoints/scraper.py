"""
Admin endpoints for wine scraper management.

These endpoints are admin-only for managing scraper sources and running scrape jobs.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.scraper import Source, ScrapedWine, Product, ProductSnapshot
from app.models.user import User
from app.schemas.scraper import (
    SourceCreate,
    SourceUpdate,
    SourceResponse,
    ScrapedWineResponse,
    ProductResponse,
    ScrapeJobRequest,
    ScrapeJobResponse,
)
from app.services.scraper_service import WineScraperService


router = APIRouter()


# Simple admin check - you can make this more sophisticated
def is_admin(user: User) -> bool:
    """Check if user is admin. For MVP, all logged-in users are admins."""
    # TODO: Implement proper admin role system with User.is_admin field
    # For now, any authenticated user has admin access
    return True  # MVP: all users are admins


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin access."""
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ===== Source Management =====

@router.post("/sources", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
def create_source(
    payload: SourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new scraper source (admin only)."""
    # Check if source with this URL already exists
    existing = db.query(Source).filter(Source.base_url == payload.base_url).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Source with URL {payload.base_url} already exists"
        )

    source = Source(**payload.model_dump())
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


@router.get("/sources", response_model=List[SourceResponse])
def list_sources(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """List all scraper sources (admin only)."""
    sources = db.query(Source).offset(skip).limit(limit).all()
    return sources


@router.get("/sources/{source_id}", response_model=SourceResponse)
def get_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get a specific source (admin only)."""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )
    return source


@router.patch("/sources/{source_id}", response_model=SourceResponse)
def update_source(
    source_id: int,
    payload: SourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update a source (admin only)."""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(source, field, value)

    db.commit()
    db.refresh(source)
    return source


@router.delete("/sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete a source (admin only)."""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )

    db.delete(source)
    db.commit()
    return None


# ===== Scraper Jobs =====

# In-memory job tracking (for MVP - use Redis/DB for production)
_active_jobs = {}


async def run_scrape_job(job_id: str, source_id: int, max_pages: int, db: Session):
    """Background task to run scrape job."""
    job = _active_jobs[job_id]
    job["status"] = "running"

    try:
        scraper = WineScraperService(db)
        stats = await scraper.scrape_source(source_id, max_pages)

        job["status"] = "completed"
        job["products_found"] = stats.get("products_found", 0)
        job["wines_created"] = stats.get("wines_created", 0)
        job["snapshots_created"] = stats.get("snapshots_created", 0)
        job["completed_at"] = datetime.utcnow()

        if stats.get("errors"):
            job["error"] = "; ".join(stats["errors"][:5])  # First 5 errors

    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)
        job["completed_at"] = datetime.utcnow()


@router.post("/scrape", response_model=ScrapeJobResponse)
async def start_scrape_job(
    payload: ScrapeJobRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Start a scrape job for a source (admin only)."""
    # Verify source exists
    source = db.query(Source).filter(Source.id == payload.source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )

    if not source.enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source is disabled"
        )

    # Create job
    job_id = str(uuid.uuid4())
    job_data = {
        "job_id": job_id,
        "source_id": payload.source_id,
        "status": "started",
        "products_found": 0,
        "wines_created": 0,
        "snapshots_created": 0,
        "error": None,
        "started_at": datetime.utcnow(),
        "completed_at": None,
    }
    _active_jobs[job_id] = job_data

    # Start background task
    background_tasks.add_task(run_scrape_job, job_id, payload.source_id, payload.max_pages, db)

    return ScrapeJobResponse(**job_data)


@router.get("/jobs/{job_id}", response_model=ScrapeJobResponse)
def get_job_status(
    job_id: str,
    current_user: User = Depends(require_admin),
):
    """Get status of a scrape job (admin only)."""
    if job_id not in _active_jobs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    return ScrapeJobResponse(**_active_jobs[job_id])


# ===== Browse Scraped Data =====

@router.get("/wines", response_model=List[ScrapedWineResponse])
def list_scraped_wines(
    skip: int = 0,
    limit: int = 100,
    producer: str = None,
    region: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """List scraped wines (admin only)."""
    query = db.query(ScrapedWine)

    if producer:
        query = query.filter(ScrapedWine.producer.ilike(f"%{producer}%"))
    if region:
        query = query.filter(ScrapedWine.region.ilike(f"%{region}%"))

    wines = query.offset(skip).limit(limit).all()
    return wines


@router.get("/products", response_model=List[ProductResponse])
def list_products(
    skip: int = 0,
    limit: int = 100,
    source_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """List scraped products (admin only)."""
    query = db.query(Product)

    if source_id:
        query = query.filter(Product.source_id == source_id)

    products = query.offset(skip).limit(limit).all()
    return products

