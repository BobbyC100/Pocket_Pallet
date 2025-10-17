#!/usr/bin/env python3
"""Quick sync of 10 merchants - avoids circular imports"""
import os
import sys
import json
import requests
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

def fetch_place_details(place_id, api_key):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        'place_id': place_id,
        'key': api_key,
        'fields': 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,price_level,opening_hours,photos,types,editorial_summary,url,business_status'
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json().get('result')
    return None

def map_place_to_meta(place_data):
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
            'weekday_text': place_data['opening_hours'].get('weekday_text', [])
        }
    
    if 'photos' in place_data:
        meta['photos'] = [
            {
                'photo_reference': photo['photo_reference'],
                'width': photo.get('width', 0),
                'height': photo.get('height', 0)
            }
            for photo in place_data['photos'][:10]
        ]
    
    return meta

def main():
    print("\n" + "="*60)
    print("🎯 SYNCING 10 TEST MERCHANTS WITH GOOGLE PLACES API")
    print("="*60 + "\n")
    
    db_url = os.getenv('DATABASE_URL')
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    
    if not db_url or not api_key:
        print("❌ Missing DATABASE_URL or GOOGLE_MAPS_API_KEY")
        sys.exit(1)
    
    engine = create_engine(db_url)
    
    with Session(engine) as db:
        query = text("""
            SELECT id, name, slug, google_place_id
            FROM merchants
            WHERE google_place_id IS NOT NULL
            LIMIT 10
        """)
        
        result = db.execute(query)
        merchants = result.fetchall()
        
        if not merchants:
            print("❌ No merchants found with google_place_id")
            return
        
        print(f"✅ Found {len(merchants)} merchants to sync\n")
        
        success = 0
        errors = 0
        
        for i, merchant in enumerate(merchants, 1):
            merchant_id, name, slug, place_id = merchant
            
            print(f"[{i}/10] {name}")
            print(f"  Slug: {slug}")
            
            try:
                place_data = fetch_place_details(place_id, api_key)
                
                if place_data:
                    google_meta = map_place_to_meta(place_data)
                    
                    update_query = text("""
                        UPDATE merchants
                        SET google_meta = CAST(:meta AS jsonb),
                            google_sync_status = 'synced',
                            last_synced_at = NOW()
                        WHERE id = :id
                    """)
                    
                    db.execute(update_query, {
                        'id': str(merchant_id),
                        'meta': json.dumps(google_meta)
                    })
                    db.commit()
                    
                    print(f"  ✅ SUCCESS")
                    print(f"  📸 Photos: {len(google_meta.get('photos', []))}")
                    print(f"  ⭐ Rating: {google_meta.get('rating', 'N/A')}")
                    print(f"  🔗 https://pocket-pallet.vercel.app/merchants/{slug}")
                    success += 1
                else:
                    print(f"  ❌ No data from Google")
                    errors += 1
                    
            except Exception as e:
                print(f"  ❌ ERROR: {str(e)[:100]}")
                db.rollback()
                errors += 1
            
            print()
        
        print("="*60)
        print(f"✅ Successful: {success}/10")
        print(f"❌ Errors: {errors}/10")
        print(f"💰 Cost: ${success * 0.05:.2f}")
        print("="*60)
        print("\n🎉 View at: https://pocket-pallet.vercel.app/merchants\n")

if __name__ == "__main__":
    main()

