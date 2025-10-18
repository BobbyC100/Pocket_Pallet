#!/usr/bin/env python3
"""Add Tacos Fenix to the database and sync Google Places data."""

import os
import sys
import json
from datetime import datetime
import requests
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# Database URL from environment
DATABASE_URL = os.getenv('DATABASE_URL')
GOOGLE_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', 'AIzaSyAtiukMv5v-2ZCSQrJoIeUHwenudIvuNBE')

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set")
    sys.exit(1)

# Tacos Fenix data
PLACE_ID = "ChIJYblmQ3qS2IARnjZgt4i08d0"
MERCHANT_DATA = {
    'name': 'Tacos Fenix (Fish & Shrimp)',
    'slug': 'tacos-fenix',
    'type': 'restaurant',
    'address': 'Av. Espinoza 451, Obrera, 22830 Ensenada, B.C., Mexico',
    'google_place_id': PLACE_ID,
    'country_code': 'MX',
}

def fetch_place_details(place_id: str) -> dict:
    """Fetch place details from Google Places API."""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        'place_id': place_id,
        'key': GOOGLE_API_KEY,
        'fields': 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,price_level,opening_hours,photos,types,editorial_summary,url,business_status,geometry'
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json().get('result')
    return None

def map_place_to_meta(place_data: dict) -> dict:
    """Map place details to google_meta format."""
    if not place_data:
        return None
    
    meta = {
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
        meta['opening_hours'] = {
            'open_now': place_data['opening_hours'].get('open_now'),
            'weekday_text': place_data['opening_hours'].get('weekday_text', []),
            'periods': place_data['opening_hours'].get('periods', [])
        }
    
    if 'photos' in place_data:
        meta['photos'] = [
            {
                'photo_reference': p['photo_reference'],
                'width': p.get('width', 0),
                'height': p.get('height', 0)
            }
            for p in place_data['photos'][:10]
        ]
    
    if 'geometry' in place_data and 'location' in place_data['geometry']:
        location = place_data['geometry']['location']
        meta['geometry'] = {
            'lat': location['lat'],
            'lng': location['lng']
        }
    
    return meta

def main():
    print("🌮 Adding Tacos Fenix to database...")
    
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    with Session(engine) as db:
        # Check if merchant already exists
        check_query = text("SELECT id FROM merchants WHERE slug = :slug")
        result = db.execute(check_query, {'slug': MERCHANT_DATA['slug']}).fetchone()
        
        if result:
            print(f"✅ Merchant already exists with ID: {result[0]}")
            merchant_id = result[0]
        else:
            # Fetch Google data
            print("📍 Fetching Google Places data...")
            place_data = fetch_place_details(PLACE_ID)
            
            if not place_data:
                print("❌ Failed to fetch Google Places data")
                sys.exit(1)
            
            google_meta = map_place_to_meta(place_data)
            geo = google_meta.get('geometry', {})
            
            # Insert merchant
            insert_query = text("""
                INSERT INTO merchants (
                    name, slug, type, address, google_place_id, country_code,
                    geo, google_meta, google_sync_status, last_synced_at, created_at
                )
                VALUES (
                    :name, :slug, :type, :address, :google_place_id, :country_code,
                    :geo, CAST(:google_meta AS jsonb), 'synced', NOW(), NOW()
                )
                RETURNING id
            """)
            
            result = db.execute(insert_query, {
                'name': MERCHANT_DATA['name'],
                'slug': MERCHANT_DATA['slug'],
                'type': MERCHANT_DATA['type'],
                'address': MERCHANT_DATA['address'],
                'google_place_id': MERCHANT_DATA['google_place_id'],
                'country_code': MERCHANT_DATA['country_code'],
                'geo': json.dumps({'lat': geo.get('lat'), 'lng': geo.get('lng')}) if geo else None,
                'google_meta': json.dumps(google_meta)
            })
            
            merchant_id = result.fetchone()[0]
            db.commit()
            
            print(f"✅ Created merchant with ID: {merchant_id}")
        
        print(f"")
        print(f"🎉 Success! View at:")
        print(f"   https://pocket-pallet.vercel.app/merchants/tacos-fenix")
        print(f"")
        print(f"📊 Google Data:")
        print(f"   - Rating: {google_meta.get('rating')} ({google_meta.get('user_ratings_total')} reviews)")
        print(f"   - Photos: {len(google_meta.get('photos', []))}")
        print(f"   - Hours: {'Yes' if google_meta.get('opening_hours') else 'No'}")
        print(f"   - Open Now: {google_meta.get('opening_hours', {}).get('open_now')}")

if __name__ == '__main__':
    main()

