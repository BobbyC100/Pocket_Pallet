#!/usr/bin/env python3
"""
Simple test of Google Places enrichment on 10 random merchants.
Bypasses full app imports to avoid version conflicts.
"""

import os
import sys
import random
import googlemaps
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Setup
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://pocket_pallet_db_user:FQqMPpwMCMdD0Z8c3M5xDTJWJfzZHh4m@dpg-d3kiol3ipnbc73fts3rg-a.oregon-postgres.render.com/pocket_pallet_db')
GOOGLE_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY', 'AIzaSyAtiukMv5v-2ZCSQrJoIeUHwenudIvuNBE')

# Create DB connection
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Google client
gmaps = googlemaps.Client(key=GOOGLE_API_KEY)


def map_place_to_google_meta(result):
    """Map Place Details result to google_meta format."""
    permanently_closed = (
        result.get("business_status") == "CLOSED_PERMANENTLY" or
        bool(result.get("permanently_closed"))
    )
    
    photos = [
        {
            "photo_reference": p.get("photo_reference"),
            "width": p.get("width"),
            "height": p.get("height"),
        }
        for p in (result.get("photos") or [])
    ]
    
    return {
        "place_id": result.get("place_id"),
        "formatted_address": result.get("formatted_address"),
        "opening_hours": result.get("opening_hours"),
        "photos": photos,
        "types": result.get("types", []),
        "price_level": result.get("price_level"),
        "business_status": result.get("business_status"),
        "website": result.get("website"),
        "formatted_phone_number": result.get("formatted_phone_number"),
        "international_phone_number": result.get("international_phone_number"),
        "current_popularity": result.get("current_popularity"),
        "live_wait_time": result.get("live_wait_time"),
        "permanently_closed": permanently_closed,
        "rating": result.get("rating"),
        "user_ratings_total": result.get("user_ratings_total"),
        "url": result.get("url"),
    }


def test_10_merchants():
    """Test enrichment on 10 random merchants."""
    db = SessionLocal()
    
    try:
        # Get merchants with Place IDs
        query = text("SELECT id, name, google_place_id, source_url FROM merchants WHERE google_place_id IS NOT NULL LIMIT 500")
        result = db.execute(query)
        merchants = [{'id': r[0], 'name': r[1], 'place_id': r[2], 'url': r[3]} for r in result]
        
        # Random sample
        sample = random.sample(merchants, min(10, len(merchants)))
        
        print(f"\n{'='*80}")
        print(f"🧪 TESTING GOOGLE PLACES ENRICHMENT ON {len(sample)} RANDOM MERCHANTS")
        print(f"{'='*80}\n")
        
        results = []
        
        for idx, merchant in enumerate(sample, 1):
            print(f"\n{'─'*80}")
            print(f"[{idx}/{len(sample)}] {merchant['name']}")
            print(f"{'─'*80}")
            print(f"  🆔 Place ID: {merchant['place_id']}")
            
            try:
                # Fetch details
                place_data = gmaps.place(
                    place_id=merchant['place_id'],
                    fields=[
                        'place_id', 'name', 'formatted_address', 'formatted_phone_number',
                        'international_phone_number', 'website', 'business_status',
                        'opening_hours', 'price_level', 'rating', 'user_ratings_total',
                        'types', 'geometry', 'photos', 'url', 'permanently_closed'
                    ]
                )
                
                if place_data['status'] != 'OK':
                    print(f"  ❌ API Error: {place_data['status']}")
                    results.append({'success': False, 'merchant': merchant['name']})
                    continue
                
                # Map to google_meta
                google_meta = map_place_to_google_meta(place_data['result'])
                
                # Count populated fields
                expected_fields = [
                    'place_id', 'formatted_address', 'opening_hours', 'photos',
                    'types', 'price_level', 'business_status', 'website',
                    'formatted_phone_number', 'international_phone_number',
                    'permanently_closed', 'rating', 'user_ratings_total', 'url'
                ]
                
                fields_populated = sum(1 for f in expected_fields 
                                     if google_meta.get(f) not in [None, [], {}])
                completeness = (fields_populated / len(expected_fields)) * 100
                
                results.append({
                    'success': True,
                    'merchant': merchant['name'],
                    'completeness': completeness,
                    'fields_populated': fields_populated,
                    'has_photos': bool(google_meta.get('photos')),
                    'has_hours': bool(google_meta.get('opening_hours')),
                    'has_phone': bool(google_meta.get('formatted_phone_number')),
                    'has_website': bool(google_meta.get('website')),
                })
                
                print(f"\n  ✅ SUCCESS")
                print(f"  📊 Completeness: {completeness:.1f}%")
                print(f"  📋 Fields: {fields_populated}/{len(expected_fields)}")
                
                if google_meta.get('formatted_address'):
                    print(f"  📮 {google_meta['formatted_address']}")
                if google_meta.get('formatted_phone_number'):
                    print(f"  📞 {google_meta['formatted_phone_number']}")
                if google_meta.get('website'):
                    print(f"  🌐 {google_meta['website'][:50]}...")
                if google_meta.get('photos'):
                    print(f"  📸 {len(google_meta['photos'])} photos")
                if google_meta.get('rating'):
                    print(f"  ⭐ {google_meta['rating']}/5 ({google_meta.get('user_ratings_total', 0)} reviews)")
                
            except Exception as e:
                print(f"  ❌ ERROR: {e}")
                results.append({'success': False, 'merchant': merchant['name'], 'error': str(e)})
        
        # Summary
        successful = [r for r in results if r.get('success')]
        print(f"\n\n{'='*80}")
        print(f"📊 SUMMARY")
        print(f"{'='*80}")
        print(f"✅ Success: {len(successful)}/{len(results)} ({len(successful)/len(results)*100:.1f}%)")
        
        if successful:
            avg_completeness = sum(r['completeness'] for r in successful) / len(successful)
            avg_fields = sum(r['fields_populated'] for r in successful) / len(successful)
            has_photos = sum(1 for r in successful if r['has_photos'])
            has_hours = sum(1 for r in successful if r['has_hours'])
            has_phone = sum(1 for r in successful if r['has_phone'])
            has_website = sum(1 for r in successful if r['has_website'])
            
            print(f"📈 Avg Completeness: {avg_completeness:.1f}%")
            print(f"📋 Avg Fields: {avg_fields:.1f}/14")
            print(f"\n🔍 Coverage:")
            print(f"  📸 Photos: {has_photos}/{len(successful)} ({has_photos/len(successful)*100:.0f}%)")
            print(f"  ⏰ Hours: {has_hours}/{len(successful)} ({has_hours/len(successful)*100:.0f}%)")
            print(f"  📞 Phone: {has_phone}/{len(successful)} ({has_phone/len(successful)*100:.0f}%)")
            print(f"  🌐 Website: {has_website}/{len(successful)} ({has_website/len(successful)*100:.0f}%)")
        
        print(f"{'='*80}\n")
        
    finally:
        db.close()


if __name__ == "__main__":
    test_10_merchants()

