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
    DetectSelectorsRequest,
    DetectSelectorsResponse,
)
from app.services.scraper_service import WineScraperService
from app.services.selector_detector import SelectorDetectorService


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


# ===== AI Selector Detection =====

@router.post("/detect-selectors", response_model=DetectSelectorsResponse)
async def detect_selectors(
    payload: DetectSelectorsRequest,
    current_user: User = Depends(require_admin),
):
    """Use AI to detect CSS selectors for a wine retailer page (admin only)."""
    try:
        detector = SelectorDetectorService()
        result = await detector.detect_selectors(payload.url)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to detect selectors: {str(e)}"
        )


@router.post("/test-selectors")
async def test_selectors(
    payload: dict,
    current_user: User = Depends(require_admin),
):
    """Test CSS selectors on a page without running a full scrape (admin only)."""
    try:
        import httpx
        from bs4 import BeautifulSoup
        
        url = payload.get("url")
        product_selector = payload.get("product_link_selector", "")
        pagination_selector = payload.get("pagination_next_selector", "")
        
        # Fetch page
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            html = response.text
        
        # Parse with BeautifulSoup
        soup = BeautifulSoup(html, 'html.parser')
        
        # Test product selector
        product_count = 0
        product_examples = []
        if product_selector:
            products = soup.select(product_selector)
            product_count = len(products)
            product_examples = [
                {
                    "href": p.get('href', ''),
                    "text": p.get_text().strip()[:100]
                }
                for p in products[:3]  # First 3 examples
            ]
        
        # Test pagination selector
        pagination_found = False
        pagination_href = None
        if pagination_selector:
            next_link = soup.select_one(pagination_selector)
            if next_link:
                pagination_found = True
                pagination_href = next_link.get('href', '')
        
        return {
            "success": True,
            "url": url,
            "product_selector": product_selector,
            "products_found": product_count,
            "product_examples": product_examples,
            "pagination_selector": pagination_selector,
            "pagination_found": pagination_found,
            "pagination_href": pagination_href,
            "message": f"Found {product_count} products" + (" and pagination" if pagination_found else "")
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to test selectors. Check URL and selectors."
        }


# ===== AI Wine Parsing =====

@router.post("/parse-products")
async def parse_products(
    background_tasks: BackgroundTasks,
    source_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Trigger AI parsing of scraped products into structured wine entries (admin only).
    
    Runs as a background task. Processes products that don't have associated wines yet.
    """
    from app.services.wine_parser import parse_wine_name
    
    # Create a parsing job in the background
    job_id = str(uuid.uuid4())
    job_data = {
        "job_id": job_id,
        "status": "started",
        "products_processed": 0,
        "wines_created": 0,
        "errors": [],
        "started_at": datetime.utcnow(),
        "completed_at": None,
    }
    _active_jobs[f"parse_{job_id}"] = job_data
    
    async def run_parsing():
        """Background task to parse products into wines."""
        try:
            # Query products that don't have associated scraped wines yet
            query = db.query(Product).filter(
                Product.wine_id.is_(None),  # No wine associated yet
                Product.title_raw.isnot(None),
                Product.title_raw != '',
                # Filter out junk collection pages
                Product.title_raw != 'Collection:Wine',
                Product.title_raw != 'Wine',
                Product.title_raw != 'Sparkling',
                Product.title_raw != 'Champagne',
                Product.title_raw != 'Pink',
                Product.title_raw != 'Orange',
                Product.title_raw != 'White',
                Product.title_raw != 'Red',
                Product.title_raw != 'Unicorn Wines',
                Product.title_raw != 'Staff Favorites',
                Product.title_raw != 'Merch + Lifestyle',
                Product.title_raw != 'Gifts'
            )
            
            if source_id:
                query = query.filter(Product.source_id == source_id)
            
            # Get products with valid wine titles
            products = query.all()
            
            job_data["status"] = "running"
            processed = 0
            created = 0
            
            for product in products:
                try:
                    # Get latest snapshot for pricing info
                    snapshot = db.query(ProductSnapshot).filter(
                        ProductSnapshot.product_id == product.id
                    ).order_by(ProductSnapshot.fetched_at.desc()).first()
                    
                    # Parse wine name with AI
                    parsed = await parse_wine_name(product.title_raw)
                    
                    # Create ScrapedWine entry
                    wine = ScrapedWine(
                        producer=parsed.get("producer"),
                        cuvee=parsed.get("cuvee") or parsed.get("producer"),  # Fallback to producer if no cuvee
                        vintage=str(parsed.get("vintage")) if parsed.get("vintage") else "NV",
                        region=parsed.get("region"),
                        appellation=parsed.get("appellation"),
                        volume_ml=parsed.get("bottle_size_ml", 750),
                        style=parsed.get("style"),
                        created_at=datetime.utcnow()
                    )
                    
                    db.add(wine)
                    db.flush()
                    
                    # Link product to wine
                    product.wine_id = wine.id
                    
                    created += 1
                    processed += 1
                    
                    # Commit every 10 wines to avoid losing progress
                    if created % 10 == 0:
                        db.commit()
                        
                except Exception as e:
                    job_data["errors"].append(f"Product {product.id}: {str(e)}")
                    processed += 1
                    continue
            
            # Final commit
            db.commit()
            
            job_data["status"] = "completed"
            job_data["products_processed"] = processed
            job_data["wines_created"] = created
            job_data["completed_at"] = datetime.utcnow()
            
        except Exception as e:
            job_data["status"] = "failed"
            job_data["error"] = str(e)
            job_data["completed_at"] = datetime.utcnow()
            db.rollback()
    
    # Start background task
    background_tasks.add_task(run_parsing)
    
    return {
        "job_id": job_id,
        "status": "started",
        "message": "Wine parsing started in background"
    }


@router.get("/parser-status")
def get_parser_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Get wine parser statistics (admin only).
    
    Returns counts and last parse time.
    """
    # Count total products and wines
    total_products = db.query(Product).count()
    total_wines = db.query(ScrapedWine).count()
    
    # Get last wine created timestamp
    last_wine = db.query(ScrapedWine).order_by(ScrapedWine.created_at.desc()).first()
    last_parse_at = last_wine.created_at if last_wine else None
    
    # Count unparsed products (products WITHOUT wine_id and WITH valid titles)
    unparsed_count = db.query(Product).filter(
        Product.wine_id.is_(None),  # No associated wine yet
        Product.title_raw.isnot(None),
        Product.title_raw != '',
        Product.title_raw != 'Collection:Wine',  # Filter out junk collection pages
        Product.title_raw != 'Wine',
        Product.title_raw != 'Sparkling',
        Product.title_raw != 'Champagne'
    ).count()
    
    return {
        "total_products": total_products,
        "total_wines": total_wines,
        "unparsed_products": unparsed_count,
        "last_parse_at": last_parse_at,
        "ready_to_parse": unparsed_count > 0
    }

