#!/usr/bin/env python3
"""
Merchant importer with Google Places API support for resolving CID URLs.
This script handles Google Maps URLs with CIDs (e.g., ?cid=5816261256227932988).

Usage:
    python import_merchants_with_google_api.py <csv_directory>

Requirements:
    - GOOGLE_PLACES_API_KEY environment variable must be set
    - CSV files with columns: Title, Note, URL
"""

import csv
import glob
import re
import sys
import os
from datetime import datetime
from slugify import slugify
from sqlalchemy.orm import Session

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.merchant import Merchant
from app.services.google_places import GooglePlacesService

# Keywords to EXCLUDE
exclude_keywords = [
    'hotel', 'museum', 'park', 'library', 'gallery', 'gym', 'sauna',
    'bookstore', 'book store', 'barbershop', 'barber', 'laundry', 'recycling',
    'school', 'tennis', 'parking', 'airport', 'station', 'subway', 'lookout',
    'trail', 'surf shop', 'optical', 'sunglasses', 'clothing', 'boutique',
    'dental', 'doctor', 'clinic', 'hospital', 'dry clean', 'alterations',
    'flower shop', 'bicycle', 'apartment', 'building', 'office', 'studio',
    'driving range', 'boat rental', 'repair', 'fountain', 'garden center',
    'frank lloyd wright', 'art institute', 'golf club', 'starbucks',
    'parked car', 'recording studio', 'fashion', 'showroom', 'surf +',
    'printed matter'
]

keep_keywords = [
    'wine', 'bar', 'restaurant', 'bistro', 'cafe', 'coffee', 'bakery', 
    'deli', 'brewery', 'tavern', 'pub', 'kitchen', 'grill', 'pizzeria',
    'sushi', 'ramen', 'taco', 'burrito', 'food', 'eatery', 'diner',
    'steakhouse', 'brasserie', 'trattoria', 'cantina', 'izakaya',
    'gastropub', 'noodle', 'dumpling', 'bbq', 'barbecue', 'seafood',
    'oyster', 'chophouse'
]

def is_likely_address(title):
    """Check if title is likely an address rather than business name."""
    if re.match(r'^\d+\s+[A-Z]', title):
        return True
    if 'coordinates' in title.lower() or re.search(r'\d+°\d+', title):
        return True
    if title.lower() in ['home', 'work', 'airbnb', 'parked car', 'shop']:
        return True
    return False

def categorize_merchant(title, note):
    """Determine merchant type based on name/note."""
    combined = f"{title} {note}".lower()
    
    if 'wine' in combined:
        if any(x in combined for x in ['shop', 'store', 'merchant', 'spirits', 'liquor']):
            return 'wine_shop'
        else:
            return 'wine_bar'
    elif any(x in combined for x in ['coffee', 'cafe']) and 'wine' not in combined:
        return 'cafe'
    elif any(x in combined for x in ['bakery', 'deli', 'patisserie']):
        return 'bakery'
    elif 'brew' in combined:
        return 'brewery'
    elif any(x in combined for x in ['bar', 'pub', 'tavern']):
        return 'bar'
    elif any(x in combined for x in ['bistro', 'brasserie', 'trattoria']):
        return 'bistro'
    else:
        return 'restaurant'

def get_country_code(city):
    """Map city list name to country code."""
    country_map = {
        'Amsterdam': 'NL', 'Bangkok': 'TH', 'Barcelona': 'ES', 'Biarritz': 'FR',
        'Copenhagen': 'DK', 'London': 'GB', 'Madrid': 'ES', 'Paris': 'FR',
        'Rome': 'IT', 'Tokyo': 'JP', 'Singapore': 'SG', 'Buenos Aires': 'AR',
        'Mexico City': 'MX', 'DF': 'MX', 'NYC': 'US', 'NYC Wine': 'US',
        'Los Angeles': 'US', 'SF': 'US', 'Charleston SC': 'US', 'Chicago': 'US',
        'Denver': 'US', 'Austin': 'US', 'New Orleans': 'US', 'Seattle': 'US',
        'Phoenix': 'US',
    }
    return country_map.get(city, 'US')

def import_merchants(csv_directory, google_service: GooglePlacesService):
    """
    Import merchants from Google Maps CSV exports.
    Uses Google Places API to resolve CID URLs to coordinates.
    """
    
    db: Session = SessionLocal()
    imported_count = 0
    skipped_count = 0
    error_count = 0
    api_resolved_count = 0
    
    csv_files = sorted(glob.glob(os.path.join(csv_directory, "*.csv")))
    
    print(f"Found {len(csv_files)} CSV files")
    print("="*80)
    
    for csv_file in csv_files:
        city = os.path.basename(csv_file).replace('.csv', '')
        print(f"\n📍 Processing {city}...")
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    title = row.get('Title', '').strip()
                    note = row.get('Note', '').strip()
                    url = row.get('URL', '').strip()
                    
                    if not title:
                        continue
                    
                    # Skip addresses
                    if is_likely_address(title):
                        skipped_count += 1
                        continue
                    
                    # Check exclusions
                    combined = f"{title} {note}".lower()
                    should_exclude = any(kw in combined for kw in exclude_keywords)
                    if should_exclude:
                        skipped_count += 1
                        continue
                    
                    # Check if it's a food/drink place
                    should_keep = any(kw in combined for kw in keep_keywords)
                    if not should_keep:
                        skipped_count += 1
                        continue
                    
                    # Extract coordinates using Google Places API
                    lat, lng, place_id = None, None, None
                    
                    if url:
                        result = google_service.resolve_google_maps_url(url)
                        if result:
                            lat, lng, place_id = result
                            if place_id:
                                api_resolved_count += 1
                    
                    if not lat or not lng:
                        print(f"⚠️  No coords for {title} in {city}")
                        error_count += 1
                        continue
                    
                    # Generate slug
                    base_slug = slugify(title)
                    slug = base_slug
                    counter = 1
                    while db.query(Merchant).filter(Merchant.slug == slug).first():
                        slug = f"{base_slug}-{counter}"
                        counter += 1
                    
                    # Determine type and tags
                    merchant_type = categorize_merchant(title, note)
                    tags = ['Imported from Google Maps', city]
                    if note:
                        tags.append(note)
                    
                    # Create merchant
                    merchant = Merchant(
                        name=title,
                        slug=slug,
                        type=merchant_type,
                        geo={"lat": lat, "lng": lng},
                        country_code=get_country_code(city),
                        tags=tags,
                        source_url=url,
                        google_place_id=place_id,  # Store Place ID if resolved
                        last_synced_at=datetime.utcnow()
                    )
                    
                    db.add(merchant)
                    imported_count += 1
                    
                    # Show status with API indicator
                    api_indicator = "🔍 API" if place_id else "📍 URL"
                    print(f"✅ {api_indicator} | {city:20s} | {title}")
                    
        except Exception as e:
            print(f"❌ Error processing {csv_file}: {e}")
            error_count += 1
            continue
    
    try:
        db.commit()
        print("\n" + "="*80)
        print(f"✅ Import complete!")
        print(f"   Imported:       {imported_count}")
        print(f"   Via API:        {api_resolved_count}")
        print(f"   Skipped:        {skipped_count}")
        print(f"   Errors:         {error_count}")
        print("="*80)
    except Exception as e:
        db.rollback()
        print(f"❌ Database error during commit: {e}")
    finally:
        db.close()

def main():
    """CLI entry point."""
    
    # Check for API key
    api_key = os.getenv('GOOGLE_PLACES_API_KEY') or os.getenv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
    if not api_key:
        print("❌ Error: GOOGLE_PLACES_API_KEY environment variable not set!")
        print("\nSet it with:")
        print("  export GOOGLE_PLACES_API_KEY='your-api-key-here'")
        print("\nOr use your existing Maps API key:")
        print("  export GOOGLE_PLACES_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
        sys.exit(1)
    
    # Get CSV directory
    if len(sys.argv) < 2:
        print("Usage: python import_merchants_with_google_api.py <csv_directory>")
        print("Example: python import_merchants_with_google_api.py '../Takeout 3/Saved'")
        sys.exit(1)
    
    csv_dir = sys.argv[1]
    
    if not os.path.exists(csv_dir):
        print(f"❌ CSV directory not found: {csv_dir}")
        sys.exit(1)
    
    print("Merchant Importer with Google Places API")
    print("="*80)
    print(f"📂 CSV Directory: {csv_dir}")
    print(f"🔑 API Key: {api_key[:20]}...{api_key[-4:]}")
    print("="*80)
    
    # Initialize Google Places service
    try:
        google_service = GooglePlacesService(api_key=api_key)
        print("✅ Google Places API initialized\n")
    except Exception as e:
        print(f"❌ Failed to initialize Google Places API: {e}")
        sys.exit(1)
    
    # Run import
    import_merchants(csv_dir, google_service)

if __name__ == "__main__":
    main()

