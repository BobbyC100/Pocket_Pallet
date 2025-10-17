"""Sync endpoints for merchant enrichment"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
import requests
import json
from typing import Dict, Any

from app.db.session import get_db
from app.core.config import settings

router = APIRouter()


def fetch_place_details(place_id: str) -> Dict[str, Any] | None:
    """Fetch place details from Google Places API"""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        'place_id': place_id,
        'key': settings.GOOGLE_PLACES_API_KEY,
        'fields': 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,price_level,opening_hours,photos,types,editorial_summary,url,business_status'
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json().get('result')
    return None


def map_place_to_meta(place_data: Dict[str, Any]) -> Dict[str, Any] | None:
    """Map Google Place data to google_meta structure"""
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


@router.get("/sync-test-10")
async def sync_test_10_merchants(db: Session = Depends(get_db)):
    """
    Sync 10 random merchants with Google Places API
    
    Visit: https://pocket-pallet.onrender.com/api/v1/sync/sync-test-10
    """
    try:
        # Get 10 merchants with google_place_id
        query = text("""
            SELECT id, name, slug, google_place_id
            FROM merchants
            WHERE google_place_id IS NOT NULL
            LIMIT 10
        """)
        
        result = db.execute(query)
        merchants = result.fetchall()
        
        if not merchants:
            return {"error": "No merchants found with google_place_id"}
        
        results = []
        success = 0
        errors = 0
        
        for merchant in merchants:
            merchant_id, name, slug, place_id = merchant
            
            try:
                # Fetch from Google Places API
                place_data = fetch_place_details(place_id)
                
                if place_data:
                    # Map to google_meta
                    google_meta = map_place_to_meta(place_data)
                    meta_json = json.dumps(google_meta)
                    
                    # Update database using bindparam with CAST
                    from sqlalchemy import bindparam
                    update_query = text("""
                        UPDATE merchants
                        SET google_meta = CAST(:meta_json AS jsonb),
                            google_sync_status = 'synced',
                            last_synced_at = NOW()
                        WHERE id = :merchant_id
                    """).bindparams(
                        bindparam('meta_json', type_=None),
                        bindparam('merchant_id', type_=None)
                    )
                    
                    db.execute(update_query, {
                        'meta_json': meta_json,
                        'merchant_id': str(merchant_id)
                    })
                    db.commit()
                    
                    results.append({
                        "name": name,
                        "slug": slug,
                        "status": "success",
                        "photos": len(google_meta.get('photos', [])),
                        "rating": google_meta.get('rating'),
                        "url": f"https://pocket-pallet.vercel.app/merchants/{slug}"
                    })
                    success += 1
                else:
                    results.append({
                        "name": name,
                        "slug": slug,
                        "status": "error",
                        "error": "No data from Google"
                    })
                    errors += 1
                    
            except Exception as e:
                results.append({
                    "name": name,
                    "slug": slug,
                    "status": "error",
                    "error": str(e)
                })
                errors += 1
                db.rollback()
        
        return {
            "message": "Sync complete",
            "total": len(merchants),
            "success": success,
            "errors": errors,
            "cost_usd": round(success * 0.05, 2),
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

