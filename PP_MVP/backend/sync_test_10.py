#!/usr/bin/env python3
"""
Sync 10 random merchants with Google Places API for testing enrichment.
Run this on Render after deploying the enriched frontend.
"""

import os
import sys
import random
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.services.google_places import GooglePlacesService

def main():
    print("🔍 Syncing 10 Random Merchants with Google Places API\n")
    print("=" * 60)
    
    # Create engine
    engine = create_engine(str(settings.DATABASE_URL))
    google_service = GooglePlacesService(settings.GOOGLE_MAPS_API_KEY)
    
    with Session(engine) as db:
        # Get 10 random merchants with google_place_id that haven't been synced yet
        query = text("""
            SELECT id, name, slug, google_place_id, google_sync_status
            FROM merchants
            WHERE google_place_id IS NOT NULL
            AND (google_sync_status IS NULL OR google_sync_status = 'pending')
            ORDER BY RANDOM()
            LIMIT 10
        """)
        
        result = db.execute(query)
        merchants = result.fetchall()
        
        if not merchants:
            print("❌ No merchants found to sync")
            print("\nTrying any merchants with google_place_id...")
            query = text("""
                SELECT id, name, slug, google_place_id, google_sync_status
                FROM merchants
                WHERE google_place_id IS NOT NULL
                ORDER BY RANDOM()
                LIMIT 10
            """)
            result = db.execute(query)
            merchants = result.fetchall()
        
        if not merchants:
            print("❌ No merchants with google_place_id found at all")
            return
        
        print(f"✅ Found {len(merchants)} merchants to sync\n")
        
        success_count = 0
        error_count = 0
        
        for i, merchant in enumerate(merchants, 1):
            merchant_id = str(merchant[0])
            name = merchant[1]
            slug = merchant[2]
            place_id = merchant[3]
            
            print(f"\n[{i}/10] Syncing: {name}")
            print(f"  Place ID: {place_id}")
            
            try:
                # Fetch from database
                merchant_query = text("SELECT * FROM merchants WHERE id = :id")
                db_merchant = db.execute(merchant_query, {"id": merchant_id}).fetchone()
                
                if not db_merchant:
                    print(f"  ❌ Merchant not found in DB")
                    error_count += 1
                    continue
                
                # Create a mock merchant object
                class MockMerchant:
                    def __init__(self, row):
                        self.id = row[0]
                        self.google_place_id = row[11]  # Adjust index as needed
                        self.google_meta = row[12] if len(row) > 12 else None
                        self.google_sync_status = row[13] if len(row) > 13 else None
                
                mock_merchant = MockMerchant(db_merchant)
                
                # Sync via Google Places API
                updated_merchant = google_service.sync_merchant(mock_merchant)
                
                # Update database
                update_query = text("""
                    UPDATE merchants
                    SET google_meta = :google_meta,
                        google_sync_status = :status,
                        last_synced_at = NOW()
                    WHERE id = :id
                """)
                
                db.execute(update_query, {
                    "id": merchant_id,
                    "google_meta": updated_merchant.google_meta,
                    "status": updated_merchant.google_sync_status
                })
                db.commit()
                
                print(f"  ✅ Synced successfully")
                print(f"  📸 Photos: {len(updated_merchant.google_meta.get('photos', [])) if updated_merchant.google_meta else 0}")
                print(f"  ⭐ Rating: {updated_merchant.google_meta.get('rating', 'N/A') if updated_merchant.google_meta else 'N/A'}")
                print(f"  🔗 View: https://pocket-pallet.vercel.app/merchants/{slug}")
                
                success_count += 1
                
            except Exception as e:
                print(f"  ❌ Error: {e}")
                error_count += 1
                db.rollback()
        
        print("\n" + "=" * 60)
        print(f"✅ Successfully synced: {success_count}/10")
        print(f"❌ Errors: {error_count}/10")
        print("\n📱 View merchants at: https://pocket-pallet.vercel.app/merchants")

if __name__ == "__main__":
    main()

