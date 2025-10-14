#!/usr/bin/env python3
"""
Test script for wine scraper functionality.

Usage:
  python test_scraper.py
  
This script will:
1. Create a test source
2. Run a small scrape (1 page)
3. Display results
4. Clean up test data
"""

import asyncio
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.scraper import Source, ScrapedWine, Product, ProductSnapshot
from app.services.scraper_service import WineScraperService
from app.core.config import settings


def create_test_session():
    """Create database session."""
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


async def test_scraper():
    """Test the scraper end-to-end."""
    db = create_test_session()
    
    print("=" * 60)
    print("🍷 WINE SCRAPER TEST")
    print("=" * 60)
    
    # 1. Create test source
    print("\n1️⃣  Creating test source...")
    source = Source(
        name="Test - Wine.com Red Wines",
        base_url="https://www.wine.com/list/wine/7155",
        product_link_selector="a.prodItemInfo_link",
        pagination_next_selector="a.pageLink_next",
        use_playwright=False,
        enabled=True
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    print(f"   ✅ Created source: {source.name} (ID: {source.id})")
    
    # 2. Run scraper
    print(f"\n2️⃣  Running scraper (max 1 page)...")
    scraper = WineScraperService(db)
    
    try:
        stats = await scraper.scrape_source(source.id, max_pages=1)
        
        print(f"\n   📊 Scrape Results:")
        print(f"   • Products found: {stats['products_found']}")
        print(f"   • Wines created: {stats['wines_created']}")
        print(f"   • Snapshots created: {stats['snapshots_created']}")
        
        if stats.get('errors'):
            print(f"\n   ⚠️  Errors ({len(stats['errors'])}):")
            for error in stats['errors'][:5]:
                print(f"      - {error}")
    
    except Exception as e:
        print(f"   ❌ Scraper failed: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # 3. Display results
    print(f"\n3️⃣  Fetching results from database...")
    
    products = db.query(Product).filter(Product.source_id == source.id).limit(5).all()
    print(f"\n   📦 Products ({len(products)} shown):")
    for p in products:
        print(f"      • {p.title_raw or 'Untitled'}")
        print(f"        URL: {p.product_url[:60]}...")
        
        # Show latest snapshot
        snapshot = db.query(ProductSnapshot).filter(
            ProductSnapshot.product_id == p.id
        ).order_by(ProductSnapshot.fetched_at.desc()).first()
        
        if snapshot:
            price = f"${snapshot.price_cents / 100:.2f}" if snapshot.price_cents else "N/A"
            stock = "✅ In Stock" if snapshot.in_stock else "❌ Out of Stock"
            print(f"        Price: {price} | {stock}")
    
    wines = db.query(ScrapedWine).limit(5).all()
    if wines:
        print(f"\n   🍷 Scraped Wines ({len(wines)} shown):")
        for w in wines:
            print(f"      • {w.producer or 'Unknown'} - {w.cuvee or 'N/A'}")
            if w.vintage:
                print(f"        Vintage: {w.vintage}")
    
    # 4. Cleanup prompt
    print(f"\n4️⃣  Cleanup:")
    cleanup = input("\n   Delete test data? (y/N): ").strip().lower()
    
    if cleanup == 'y':
        # Delete in correct order (FK constraints)
        db.query(ProductSnapshot).filter(
            ProductSnapshot.product_id.in_([p.id for p in products])
        ).delete(synchronize_session=False)
        
        db.query(Product).filter(Product.source_id == source.id).delete()
        db.query(Source).filter(Source.id == source.id).delete()
        
        # Only delete wines if they have no other products
        for wine in wines:
            remaining_products = db.query(Product).filter(Product.wine_id == wine.id).count()
            if remaining_products == 0:
                db.delete(wine)
        
        db.commit()
        print("   ✅ Test data deleted")
    else:
        print(f"   ℹ️  Test data kept. Source ID: {source.id}")
        print(f"      View in API: GET /api/v1/scraper/sources/{source.id}")
    
    print("\n" + "=" * 60)
    print("✅ TEST COMPLETE")
    print("=" * 60)
    
    db.close()


def main():
    """Main entry point."""
    print("\nStarting scraper test...\n")
    
    try:
        asyncio.run(test_scraper())
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()

