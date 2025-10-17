"""Sync one specific merchant by slug"""
import os
import sys
import json
import requests
from sqlalchemy import create_engine, text

# Get env vars
DATABASE_URL = os.getenv('DATABASE_URL')
GOOGLE_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY', 'AIzaSyAtiukMv5v-2ZCSQrJoIeUHwenudIvuNBE')

if len(sys.argv) < 2:
    print("Usage: python3 sync_one.py <merchant-slug>")
    sys.exit(1)

slug = sys.argv[1]

if not DATABASE_URL:
    print("❌ Missing DATABASE_URL")
    sys.exit(1)

print(f"\n🎯 Syncing merchant: {slug}\n")

# Connect to database
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Get merchant
    result = conn.execute(text("""
        SELECT id, name, slug, google_place_id, geo
        FROM merchants
        WHERE slug = :slug
    """), {"slug": slug})
    
    merchant = result.fetchone()
    
    if not merchant:
        print(f"❌ Merchant '{slug}' not found")
        sys.exit(1)
    
    merchant_id, name, slug, place_id, geo = merchant
    
    print(f"✅ Found: {name}")
    print(f"   ID: {merchant_id}")
    print(f"   Place ID: {place_id}")
    print(f"   Geo: {geo}\n")
    
    if not place_id:
        print("❌ No google_place_id for this merchant")
        sys.exit(1)
    
    # Fetch from Google Places API
    print("📡 Fetching from Google Places API...")
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        'place_id': place_id,
        'key': GOOGLE_API_KEY,
        'fields': 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,price_level,opening_hours,photos,types,editorial_summary,url,business_status'
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print(f"❌ Google API error: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    data = response.json()
    
    if data.get('status') != 'OK':
        print(f"❌ Google API status: {data.get('status')}")
        print(json.dumps(data, indent=2))
        sys.exit(1)
    
    place_data = data.get('result')
    
    # Build google_meta
    google_meta = {
        'place_id': place_data.get('place_id'),
        'formatted_address': place_data.get('formatted_address'),
        'formatted_phone_number': place_data.get('formatted_phone_number'),
        'website': place_data.get('website'),
        'url': place_data.get('url'),
        'rating': place_data.get('rating'),
        'user_ratings_total': place_data.get('user_ratings_total'),
        'price_level': place_data.get('price_level'),
        'business_status': place_data.get('business_status'),
        'types': place_data.get('types'),
        'editorial_summary': place_data.get('editorial_summary', {}).get('overview')
    }
    
    if 'opening_hours' in place_data:
        google_meta['opening_hours'] = {
            'open_now': place_data['opening_hours'].get('open_now'),
            'weekday_text': place_data['opening_hours'].get('weekday_text', [])
        }
    
    if 'photos' in place_data:
        google_meta['photos'] = [
            {
                'photo_reference': photo['photo_reference'],
                'width': photo.get('width', 0),
                'height': photo.get('height', 0)
            }
            for photo in place_data['photos'][:10]
        ]
    
    print(f"✅ Fetched data:")
    print(f"   Rating: {google_meta.get('rating')}")
    print(f"   Reviews: {google_meta.get('user_ratings_total')}")
    print(f"   Photos: {len(google_meta.get('photos', []))}")
    print(f"   Types: {google_meta.get('types')}")
    
    # Update database
    print("\n💾 Updating database...")
    meta_json = json.dumps(google_meta)
    
    conn.execute(text("""
        UPDATE merchants
        SET google_meta = CAST(:meta_json AS jsonb),
            google_sync_status = 'synced',
            last_synced_at = NOW()
        WHERE id = :merchant_id
    """), {
        'meta_json': meta_json,
        'merchant_id': str(merchant_id)
    })
    
    conn.commit()
    
    print("✅ Synced successfully!\n")
    print(f"🌐 View at: https://pocket-pallet.vercel.app/merchants/{slug}")
    print(f"💰 Cost: $0.05\n")

