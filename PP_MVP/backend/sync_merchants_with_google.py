#!/usr/bin/env python3
"""
Sync all merchants with Google Places API to enrich their data.

This script will:
1. Find all merchants with google_place_id
2. Fetch their complete details from Google Places API
3. Update merchant profiles with:
   - Opening hours
   - Phone number
   - Website
   - Photos (gallery + hero image)
   - Rating and reviews count
   - Business status
   - Formatted address
   - Price level
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

os.environ.setdefault('DATABASE_URL', 'postgresql://pocket_pallet_db_user:FQqMPpwMCMdD0Z8c3M5xDTJWJfzZHh4m@dpg-d3kiol3ipnbc73fts3rg-a.oregon-postgres.render.com/pocket_pallet_db')
os.environ.setdefault('GOOGLE_PLACES_API_KEY', 'AIzaSyAtiukMv5v-2ZCSQrJoIeUHwenudIvuNBE')

from app.db.session import SessionLocal
from app.models.merchant import Merchant
from app.services.google_places import GooglePlacesService
import time


def sync_all_merchants(limit: int = None, force_resync: bool = False):
    """
    Sync all merchants that have a Google Place ID.
    
    Args:
        limit: Max number of merchants to sync (None = all)
        force_resync: If True, re-sync even if already synced
    """
    db = SessionLocal()
    google_service = GooglePlacesService()
    
    try:
        # Find merchants with Place IDs
        query = db.query(Merchant).filter(Merchant.google_place_id.isnot(None))
        
        # Filter by sync status if not forcing resync
        if not force_resync:
            query = query.filter(
                (Merchant.google_sync_status == 'never_synced') |
                (Merchant.google_sync_status == 'failed') |
                (Merchant.google_sync_status.is_(None))
            )
        
        if limit:
            merchants = query.limit(limit).all()
        else:
            merchants = query.all()
        
        total = len(merchants)
        print(f"\n🔄 Starting Google Places sync for {total} merchants...\n")
        
        success_count = 0
        failed_count = 0
        no_change_count = 0
        
        for idx, merchant in enumerate(merchants, 1):
            print(f"[{idx}/{total}] Syncing: {merchant.name}")
            print(f"  Place ID: {merchant.google_place_id}")
            
            try:
                status, google_meta, error, updated_fields = google_service.sync_merchant(
                    db=db,
                    merchant_id=str(merchant.id),
                    place_id=merchant.google_place_id,
                    force_overwrite=force_resync
                )
                
                if status == 'success':
                    success_count += 1
                    print(f"  ✅ Success! Updated {len(updated_fields)} fields: {', '.join(updated_fields)}")
                elif status == 'no_changes':
                    no_change_count += 1
                    print(f"  ℹ️  No changes needed")
                else:
                    failed_count += 1
                    print(f"  ❌ Failed: {error}")
                
                # Rate limiting: Google allows 50 QPS, we'll do 2 per second to be safe
                time.sleep(0.5)
                
                # Checkpoint every 10
                if idx % 10 == 0:
                    print(f"\n📊 Progress: {idx}/{total} ({success_count} success, {failed_count} failed)\n")
                
            except Exception as e:
                failed_count += 1
                print(f"  ❌ Error: {e}")
                continue
        
        print("\n" + "="*70)
        print("📊 SYNC COMPLETE!")
        print("="*70)
        print(f"✅ Successful syncs: {success_count}")
        print(f"ℹ️  No changes: {no_change_count}")
        print(f"❌ Failed syncs: {failed_count}")
        print(f"📈 Total processed: {total}")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


def preview_sync(limit: int = 5):
    """Show what would be synced without actually doing it."""
    db = SessionLocal()
    
    try:
        merchants = db.query(Merchant).filter(
            Merchant.google_place_id.isnot(None),
            (Merchant.google_sync_status == 'never_synced') |
            (Merchant.google_sync_status.is_(None))
        ).limit(limit).all()
        
        print(f"\n📋 Preview: Would sync {len(merchants)} merchants\n")
        print("="*70)
        
        for merchant in merchants:
            print(f"Name: {merchant.name}")
            print(f"  Place ID: {merchant.google_place_id}")
            print(f"  Current status: {merchant.google_sync_status or 'never_synced'}")
            print(f"  Has address: {'Yes' if merchant.address else 'No'}")
            print(f"  Has contact: {'Yes' if merchant.contact else 'No'}")
            print(f"  Has hours: {'Yes' if merchant.hours else 'No'}")
            print(f"  Has photos: {'Yes' if merchant.gallery_images else 'No'}")
            print("-"*70)
        
    finally:
        db.close()


def show_stats():
    """Show current sync statistics."""
    db = SessionLocal()
    
    try:
        total_merchants = db.query(Merchant).count()
        with_place_id = db.query(Merchant).filter(Merchant.google_place_id.isnot(None)).count()
        synced = db.query(Merchant).filter(Merchant.google_sync_status == 'success').count()
        never_synced = db.query(Merchant).filter(
            (Merchant.google_sync_status == 'never_synced') |
            (Merchant.google_sync_status.is_(None))
        ).count()
        failed = db.query(Merchant).filter(Merchant.google_sync_status == 'failed').count()
        
        print("\n📊 Google Places Sync Statistics")
        print("="*70)
        print(f"Total merchants: {total_merchants}")
        print(f"With Place ID: {with_place_id} ({with_place_id/total_merchants*100:.1f}%)")
        print(f"Successfully synced: {synced} ({synced/total_merchants*100:.1f}%)")
        print(f"Never synced: {never_synced}")
        print(f"Failed syncs: {failed}")
        print("="*70 + "\n")
        
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Sync merchants with Google Places API")
    parser.add_argument(
        'action',
        choices=['preview', 'sync', 'stats'],
        help='Action to perform'
    )
    parser.add_argument(
        '--limit',
        type=int,
        help='Limit number of merchants to sync'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force re-sync even if already synced'
    )
    
    args = parser.parse_args()
    
    if args.action == 'preview':
        preview_sync(limit=args.limit or 5)
    elif args.action == 'stats':
        show_stats()
    elif args.action == 'sync':
        sync_all_merchants(limit=args.limit, force_resync=args.force)

