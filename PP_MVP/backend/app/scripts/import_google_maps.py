"""
Import merchants from Google Maps Saved Places JSON export.

Usage:
    python -m app.scripts.import_google_maps path/to/SavedPlaces.json

The Google Maps export is typically a GeoJSON file with this structure:
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [lng, lat]
      },
      "properties": {
        "name": "Buvons",
        "address": "1145 Loma Ave, Long Beach, CA",
        "google_maps_url": "https://maps.google.com/...",
        ...
      }
    }
  ]
}
"""

import json
import sys
import re
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

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
    
    if any(word in text for word in ['bistro', 'restaurant', 'cafe', 'brasserie']):
        return 'bistro'
    elif any(word in text for word in ['bar', 'wine bar']):
        return 'bar'
    elif any(word in text for word in ['wine shop', 'wine store', 'merchant', 'bottle shop']):
        return 'wine_shop'
    else:
        return 'wine_shop'  # Default


def parse_google_maps_json(filepath: str) -> list:
    """
    Parse Google Maps Saved Places JSON export.
    
    Returns list of merchant dicts ready for import.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    merchants = []
    
    # Handle GeoJSON format
    if data.get('type') == 'FeatureCollection':
        features = data.get('features', [])
        
        for feature in features:
            props = feature.get('properties', {})
            geom = feature.get('geometry', {})
            coords = geom.get('coordinates', [])
            
            name = props.get('name') or props.get('Name') or props.get('Title')
            if not name:
                continue
            
            # Extract coordinates
            lng, lat = None, None
            if len(coords) >= 2:
                lng, lat = coords[0], coords[1]
            
            # Extract address
            address = (
                props.get('address') or 
                props.get('Address') or 
                props.get('Location Address') or
                None
            )
            
            # Extract URL
            source_url = (
                props.get('google_maps_url') or
                props.get('Google Maps URL') or
                props.get('url') or
                None
            )
            
            # Country code (try to guess from address or coords)
            country_code = props.get('Country Code')
            if not country_code and address:
                # Simple heuristic: check for common country patterns
                if ', US' in address or 'USA' in address or any(state in address for state in ['CA', 'NY', 'TX']):
                    country_code = 'US'
                elif ', FR' in address or 'France' in address:
                    country_code = 'FR'
                elif ', UK' in address or 'United Kingdom' in address:
                    country_code = 'UK'
            
            merchants.append({
                'name': name,
                'address': address,
                'lat': lat,
                'lng': lng,
                'country_code': country_code,
                'source_url': source_url,
            })
    
    # Handle plain JSON array format
    elif isinstance(data, list):
        for item in data:
            name = item.get('name') or item.get('Name')
            if not name:
                continue
            
            merchants.append({
                'name': name,
                'address': item.get('address'),
                'lat': item.get('lat') or item.get('latitude'),
                'lng': item.get('lng') or item.get('longitude'),
                'country_code': item.get('country_code'),
                'source_url': item.get('url') or item.get('google_maps_url'),
            })
    
    return merchants


def import_merchants(filepath: str, db: Session, overwrite: bool = False):
    """
    Import merchants from Google Maps JSON file.
    
    Args:
        filepath: Path to JSON file
        db: Database session
        overwrite: If True, update existing merchants with same name
    
    Returns:
        Dict with stats: {created, updated, skipped, errors}
    """
    merchants_data = parse_google_maps_json(filepath)
    
    stats = {
        'created': 0,
        'updated': 0,
        'skipped': 0,
        'errors': []
    }
    
    for data in merchants_data:
        try:
            name = data['name']
            slug = slugify(name)
            
            # Check if merchant already exists
            existing = db.query(Merchant).filter(
                (Merchant.slug == slug) | (Merchant.name == name)
            ).first()
            
            if existing:
                if overwrite:
                    # Update existing merchant
                    existing.address = data.get('address') or existing.address
                    if data.get('lat') and data.get('lng'):
                        existing.geo = {'lat': data['lat'], 'lng': data['lng']}
                    existing.country_code = data.get('country_code') or existing.country_code
                    existing.source_url = data.get('source_url') or existing.source_url
                    existing.last_synced = datetime.utcnow()
                    
                    stats['updated'] += 1
                    print(f"✓ Updated: {name}")
                else:
                    stats['skipped'] += 1
                    print(f"⊘ Skipped (exists): {name}")
                    continue
            else:
                # Create new merchant
                merchant = Merchant(
                    id=str(uuid.uuid4()),
                    name=name,
                    slug=slug,
                    type=guess_merchant_type(name, data.get('address', '')),
                    address=data.get('address'),
                    geo={'lat': data['lat'], 'lng': data['lng']} if data.get('lat') and data.get('lng') else None,
                    country_code=data.get('country_code'),
                    tags=['Imported from Google Maps'],
                    source_url=data.get('source_url'),
                    last_synced=datetime.utcnow()
                )
                
                db.add(merchant)
                stats['created'] += 1
                print(f"✓ Created: {name} (slug: {slug})")
        
        except Exception as e:
            error_msg = f"Error processing {data.get('name', 'unknown')}: {str(e)}"
            stats['errors'].append(error_msg)
            print(f"✗ {error_msg}")
    
    db.commit()
    return stats


def main():
    """CLI entry point."""
    if len(sys.argv) < 2:
        print("Usage: python -m app.scripts.import_google_maps <path/to/SavedPlaces.json> [--overwrite]")
        sys.exit(1)
    
    filepath = sys.argv[1]
    overwrite = '--overwrite' in sys.argv
    
    print(f"Importing merchants from: {filepath}")
    print(f"Overwrite existing: {overwrite}\n")
    
    db = SessionLocal()
    try:
        stats = import_merchants(filepath, db, overwrite=overwrite)
        
        print("\n" + "="*50)
        print("Import Summary:")
        print(f"  Created: {stats['created']}")
        print(f"  Updated: {stats['updated']}")
        print(f"  Skipped: {stats['skipped']}")
        if stats['errors']:
            print(f"  Errors: {len(stats['errors'])}")
            for err in stats['errors']:
                print(f"    - {err}")
        print("="*50)
    finally:
        db.close()


if __name__ == '__main__':
    main()

