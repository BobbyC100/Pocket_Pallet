#!/usr/bin/env python3
"""
Test Google Places API enrichment on 10 random merchants.

This script:
1. Randomly samples 10 merchants with Place IDs
2. Fetches Google Places details for each
3. Validates the enrichment data quality
4. Tracks metrics: success rate, data completeness, field coverage
"""

import os
import sys
import random
from pathlib import Path
from typing import Dict, List

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

os.environ.setdefault('DATABASE_URL', 'postgresql://pocket_pallet_db_user:FQqMPpwMCMdD0Z8c3M5xDTJWJfzZHh4m@dpg-d3kiol3ipnbc73fts3rg-a.oregon-postgres.render.com/pocket_pallet_db')
os.environ.setdefault('GOOGLE_PLACES_API_KEY', 'AIzaSyAtiukMv5v-2ZCSQrJoIeUHwenudIvuNBE')

from app.db.session import SessionLocal
from app.models.merchant import Merchant
from app.services.google_places import GooglePlacesService


def test_10_random_merchants():
    """Test enrichment on 10 random merchants."""
    db = SessionLocal()
    google_service = GooglePlacesService()
    
    try:
        # Get all merchants with Place IDs
        merchants = db.query(Merchant).filter(
            Merchant.google_place_id.isnot(None)
        ).all()
        
        if len(merchants) < 10:
            print(f"⚠️  Only {len(merchants)} merchants with Place IDs found")
            sample = merchants
        else:
            # Random sample of 10
            sample = random.sample(merchants, 10)
        
        print(f"\n{'='*80}")
        print(f"🧪 TESTING GOOGLE PLACES ENRICHMENT ON {len(sample)} RANDOM MERCHANTS")
        print(f"{'='*80}\n")
        
        results = []
        
        for idx, merchant in enumerate(sample, 1):
            print(f"\n{'─'*80}")
            print(f"[{idx}/{len(sample)}] {merchant.name}")
            print(f"{'─'*80}")
            print(f"  📍 Coords: ({merchant.geo.get('lat') if merchant.geo else 'N/A'}, "
                  f"{merchant.geo.get('lng') if merchant.geo else 'N/A'})")
            print(f"  🆔 Place ID: {merchant.google_place_id}")
            print(f"  🔗 Source URL: {merchant.source_url[:60]}..." if merchant.source_url and len(merchant.source_url) > 60 else f"  🔗 Source URL: {merchant.source_url}")
            
            try:
                # Fetch Google Places details
                place_data = google_service.fetch_place_details(merchant.google_place_id)
                
                # Map to google_meta format
                google_meta = google_service.map_place_to_google_meta(place_data)
                
                # Analyze data completeness
                result = analyze_enrichment(merchant, google_meta)
                results.append(result)
                
                # Print results
                print(f"\n  ✅ ENRICHMENT SUCCESSFUL")
                print(f"  📊 Data Completeness: {result['completeness']:.1f}%")
                print(f"  📋 Fields Populated: {result['fields_populated']}/{result['total_fields']}")
                
                # Show key fields
                if google_meta.get('formatted_address'):
                    print(f"  📮 Address: {google_meta['formatted_address']}")
                
                if google_meta.get('opening_hours'):
                    hours_data = google_meta['opening_hours']
                    if isinstance(hours_data, dict) and hours_data.get('weekday_text'):
                        print(f"  ⏰ Hours: {hours_data['weekday_text'][0]}")  # Monday
                    elif isinstance(hours_data, dict) and hours_data.get('open_now') is not None:
                        print(f"  ⏰ Open Now: {hours_data['open_now']}")
                
                if google_meta.get('formatted_phone_number'):
                    print(f"  📞 Phone: {google_meta['formatted_phone_number']}")
                
                if google_meta.get('website'):
                    print(f"  🌐 Website: {google_meta['website'][:50]}...")
                
                if google_meta.get('photos'):
                    print(f"  📸 Photos: {len(google_meta['photos'])} available")
                
                if google_meta.get('types'):
                    print(f"  🏷️  Types: {', '.join(google_meta['types'][:3])}")
                
                if google_meta.get('price_level') is not None:
                    price_symbols = '$' * google_meta['price_level']
                    print(f"  💰 Price Level: {price_symbols}")
                
                if google_meta.get('rating'):
                    print(f"  ⭐ Rating: {google_meta['rating']}/5 ({google_meta.get('user_ratings_total', 0)} reviews)")
                
                if google_meta.get('business_status'):
                    status_emoji = '🟢' if google_meta['business_status'] == 'OPERATIONAL' else '🔴'
                    print(f"  {status_emoji} Status: {google_meta['business_status']}")
                
            except Exception as e:
                print(f"\n  ❌ ENRICHMENT FAILED: {e}")
                results.append({
                    'success': False,
                    'error': str(e),
                    'merchant': merchant.name
                })
        
        # Print summary statistics
        print_summary(results)
        
    finally:
        db.close()


def analyze_enrichment(merchant: Merchant, google_meta: Dict) -> Dict:
    """Analyze the quality and completeness of enrichment data."""
    
    # Fields we expect from the spec
    expected_fields = [
        'place_id', 'formatted_address', 'opening_hours', 'photos',
        'types', 'price_level', 'business_status', 'website',
        'formatted_phone_number', 'international_phone_number',
        'permanently_closed', 'rating', 'user_ratings_total', 'url'
    ]
    
    fields_populated = 0
    populated_fields = []
    
    for field in expected_fields:
        value = google_meta.get(field)
        # Count as populated if it exists and is not None/empty
        if value is not None and value != [] and value != {}:
            fields_populated += 1
            populated_fields.append(field)
    
    completeness = (fields_populated / len(expected_fields)) * 100
    
    return {
        'success': True,
        'merchant': merchant.name,
        'place_id': merchant.google_place_id,
        'completeness': completeness,
        'fields_populated': fields_populated,
        'total_fields': len(expected_fields),
        'populated_fields': populated_fields,
        'has_photos': bool(google_meta.get('photos')),
        'has_hours': bool(google_meta.get('opening_hours')),
        'has_phone': bool(google_meta.get('formatted_phone_number')),
        'has_website': bool(google_meta.get('website')),
        'is_operational': google_meta.get('business_status') == 'OPERATIONAL',
    }


def print_summary(results: List[Dict]):
    """Print summary statistics."""
    
    successful = [r for r in results if r.get('success')]
    failed = [r for r in results if not r.get('success')]
    
    print(f"\n\n{'='*80}")
    print(f"📊 ENRICHMENT TEST SUMMARY")
    print(f"{'='*80}")
    
    print(f"\n✅ Success Rate: {len(successful)}/{len(results)} ({len(successful)/len(results)*100:.1f}%)")
    print(f"❌ Failed: {len(failed)}")
    
    if successful:
        avg_completeness = sum(r['completeness'] for r in successful) / len(successful)
        avg_fields = sum(r['fields_populated'] for r in successful) / len(successful)
        
        print(f"\n📈 Data Quality Metrics:")
        print(f"  Average Completeness: {avg_completeness:.1f}%")
        print(f"  Average Fields Populated: {avg_fields:.1f}/14")
        
        # Field-specific success rates
        has_photos = sum(1 for r in successful if r['has_photos'])
        has_hours = sum(1 for r in successful if r['has_hours'])
        has_phone = sum(1 for r in successful if r['has_phone'])
        has_website = sum(1 for r in successful if r['has_website'])
        is_operational = sum(1 for r in successful if r['is_operational'])
        
        print(f"\n🔍 Field Coverage:")
        print(f"  📸 Photos: {has_photos}/{len(successful)} ({has_photos/len(successful)*100:.0f}%)")
        print(f"  ⏰ Hours: {has_hours}/{len(successful)} ({has_hours/len(successful)*100:.0f}%)")
        print(f"  📞 Phone: {has_phone}/{len(successful)} ({has_phone/len(successful)*100:.0f}%)")
        print(f"  🌐 Website: {has_website}/{len(successful)} ({has_website/len(successful)*100:.0f}%)")
        print(f"  🟢 Operational: {is_operational}/{len(successful)} ({is_operational/len(successful)*100:.0f}%)")
    
    if failed:
        print(f"\n❌ Failed Enrichments:")
        for r in failed:
            print(f"  • {r['merchant']}: {r['error']}")
    
    print(f"\n{'='*80}\n")
    
    # Expected outcome from spec
    print("📋 EXPECTED OUTCOMES (from spec):")
    print("  ✓ Parse success rate: ≥90%")
    print("  ✓ API success rate: ≥90%")
    print("  ✓ Data completeness: ≥70% per merchant")
    print(f"\n{'='*80}\n")


if __name__ == "__main__":
    test_10_random_merchants()

