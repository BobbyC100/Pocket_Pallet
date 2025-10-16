#!/usr/bin/env python3
"""
Import merchants from your specific GeoJSON format.
Handles the structure from Google Takeout exports.
"""
import json
import sys
import re
from datetime import datetime
from sqlalchemy.orm import Session

sys.path.insert(0, '.')
from app.db.session import SessionLocal
from app.models.merchant import Merchant

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def guess_merchant_type(name: str, address: str = "") -> str:
    """Guess merchant type from name/address."""
    text = (name + " " + address).lower()
    
    if any(word in text for word in ['wine bar', 'bar']):
        return 'wine_bar'
    elif any(word in text for word in ['wine shop', 'wine store', 'merchant', 'bottle shop']):
        return 'wine_shop'
    elif any(word in text for word in ['bistro', 'brasserie', 'trattoria']):
        return 'bistro'
    elif 'restaurant' in text or 'cafe' in text:
        return 'restaurant'
    else:
        return 'wine_bar'  # Default

def import_geojson(filepath: str):
    """Import from GeoJSON with structure: properties.location.name"""
    
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    features = data.get('features', [])
    print(f"Found {len(features)} places in GeoJSON")
    print("="*70)
    print()
    
    db: Session = SessionLocal()
    
    created = 0
    skipped = 0
    errors = []
    
    for feature in features:
        try:
            # Extract data from nested structure
            props = feature.get('properties', {})
            location_data = props.get('location', {})
            geometry = feature.get('geometry', {})
            coords = geometry.get('coordinates', [])
            
            name = location_data.get('name')
            if not name:
                skipped += 1
                continue
            
            address = location_data.get('address')
            country_code = location_data.get('country_code', 'US')
            google_url = props.get('google_maps_url')
            
            # Get coordinates (GeoJSON is [lng, lat])
            if len(coords) >= 2:
                lng, lat = coords[0], coords[1]
            else:
                print(f"⚠️  Skipping {name}: no coordinates")
                skipped += 1
                continue
            
            # Generate slug
            base_slug = slugify(name)
            slug = base_slug
            counter = 1
            while db.query(Merchant).filter(Merchant.slug == slug).first():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            # Determine type
            merchant_type = guess_merchant_type(name, address or '')
            
            # Create merchant
            merchant = Merchant(
                name=name,
                slug=slug,
                type=merchant_type,
                address=address,
                geo={"lat": lat, "lng": lng},
                country_code=country_code,
                tags=['Imported from Google Maps'],
                source_url=google_url
            )
            
            db.add(merchant)
            created += 1
            print(f"✅ {name}")
            print(f"   Address: {address}")
            print(f"   Coordinates: {lat}, {lng}")
            print()
            
        except Exception as e:
            error_msg = f"Error: {name if 'name' in locals() else 'unknown'}: {str(e)}"
            errors.append(error_msg)
            print(f"❌ {error_msg}")
    
    # Commit
    try:
        db.flush()  # Flush to get any errors
        db.commit()
        print("="*70)
        print("✅ Import Complete!")
        print(f"   Created: {created}")
        print(f"   Skipped: {skipped}")
        if errors:
            print(f"   Errors: {len(errors)}")
            for err in errors:
                print(f"      - {err}")
        print("="*70)
    except Exception as e:
        db.rollback()
        print(f"❌ Database error during commit: {e}")
        print(f"   Try checking database column types")
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python import_from_geojson.py <path-to-geojson>")
        sys.exit(1)
    
    import_geojson(sys.argv[1])

