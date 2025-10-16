#!/usr/bin/env python3
"""
Import merchants from Google Maps CSV exports with API support.
Streamlined version that avoids circular imports.
"""
import csv
import glob
import re
import sys
import os
from datetime import datetime
from slugify import slugify
from sqlalchemy.orm import Session

sys.path.insert(0, '.')
from app.db.session import SessionLocal
from app.models.merchant import Merchant

# Import Google Places service directly
import googlemaps

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
    if re.match(r'^\d+\s+[A-Z]', title):
        return True
    if 'coordinates' in title.lower() or re.search(r'\d+°\d+', title):
        return True
    if title.lower() in ['home', 'work', 'airbnb', 'parked car', 'shop']:
        return True
    return False

def categorize_merchant(title, note):
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

def resolve_url_to_coordinates(url, gmaps_client, api_key):
    """Extract coordinates from URL or resolve via API."""
    import requests
    from urllib.parse import urlparse, parse_qs, unquote
    
    if not url:
        return None, None, None
    
    try:
        # Try direct coordinate extraction first
        # Format 1: !3d<lat>!4d<lng>
        match = re.search(r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)', url)
        if match:
            return float(match.group(1)), float(match.group(2)), None
        
        # Format 2: @<lat>,<lng>
        match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', url)
        if match:
            return float(match.group(1)), float(match.group(2)), None
        
        # Format 3: ?q=<lat>,<lng>
        parsed = urlparse(url)
        if 'q=' in url:
            q_param = parse_qs(parsed.query).get('q', [''])[0]
            coords = re.search(r'(-?\d+\.\d+),(-?\d+\.\d+)', q_param)
            if coords:
                return float(coords.group(1)), float(coords.group(2)), None
        
        # Format 4: ?cid=<number> (requires API call)
        if 'cid=' in url:
            cid = parse_qs(parsed.query).get('cid', [None])[0]
            if cid:
                # Call Google Places API
                api_url = "https://maps.googleapis.com/maps/api/place/details/json"
                params = {
                    'cid': cid,
                    'key': api_key,
                    'fields': 'place_id,geometry,name'
                }
                response = requests.get(api_url, params=params)
                data = response.json()
                
                if data.get('status') == 'OK' and 'result' in data:
                    result = data['result']
                    location = result['geometry']['location']
                    return location['lat'], location['lng'], result.get('place_id')
        
        # Format 5: Hex Place ID format (0x...:0x...)
        # Example: /1s0x8644b5a7a6b0f14f:0xa4b96016fe139021
        hex_match = re.search(r'1s(0x[0-9a-f]+:0x[0-9a-f]+)', url, re.IGNORECASE)
        if hex_match:
            hex_place_id = hex_match.group(1)
            # Try to use Find Place or Text Search with the place name
            # Extract place name from URL
            name_match = re.search(r'/place/([^/]+)/', unquote(url))
            if name_match:
                place_name = name_match.group(1).replace('+', ' ')
                
                # Use Google Places Text Search
                api_url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
                params = {
                    'input': place_name,
                    'inputtype': 'textquery',
                    'fields': 'place_id,geometry,name',
                    'key': api_key
                }
                response = requests.get(api_url, params=params)
                data = response.json()
                
                if data.get('status') == 'OK' and data.get('candidates'):
                    candidate = data['candidates'][0]
                    location = candidate['geometry']['location']
                    return location['lat'], location['lng'], candidate.get('place_id')
        
        return None, None, None
        
    except Exception as e:
        print(f"    ⚠️  Error resolving URL: {e}")
        return None, None, None

def import_merchants(csv_directory, api_key):
    """Import merchants from CSV files."""
    
    db = SessionLocal()
    gmaps_client = googlemaps.Client(key=api_key)
    
    imported_count = 0
    skipped_count = 0
    error_count = 0
    api_resolved_count = 0
    
    csv_files = sorted(glob.glob(os.path.join(csv_directory, "*.csv")))
    
    print(f"🚀 Starting import from {len(csv_files)} CSV files")
    print("="*80)
    print()
    
    for csv_file in csv_files:
        city = os.path.basename(csv_file).replace('.csv', '')
        print(f"📍 Processing {city}...")
        
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
                    
                    # Extract coordinates
                    lat, lng, place_id = resolve_url_to_coordinates(url, gmaps_client, api_key)
                    
                    if not lat or not lng:
                        error_count += 1
                        continue
                    
                    if place_id:
                        api_resolved_count += 1
                    
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
                    try:
                        merchant = Merchant(
                            name=title,
                            slug=slug,
                            type=merchant_type,
                            geo={"lat": lat, "lng": lng},
                            country_code=get_country_code(city),
                            tags=tags,
                            source_url=url,
                            google_place_id=place_id
                        )
                        
                        db.add(merchant)
                        db.flush()  # Check for errors immediately
                        imported_count += 1
                        
                        # Show status
                        api_indicator = "🔍" if place_id else "📍"
                        print(f"  {api_indicator} {title}")
                        
                        # Commit every 10 for safety
                        if imported_count % 10 == 0:
                            db.commit()
                            print(f"     💾 Checkpoint: {imported_count} imported")
                    except Exception as e:
                        db.rollback()
                        if "duplicate" in str(e).lower():
                            skipped_count += 1  # Already exists
                        else:
                            error_count += 1
                    
        except Exception as e:
            print(f"  ❌ Error processing {csv_file}: {e}")
            error_count += 1
            continue
    
    try:
        db.commit()
        print()
        print("="*80)
        print("✅ Import Complete!")
        print(f"   Imported:       {imported_count}")
        print(f"   Via API:        {api_resolved_count}")
        print(f"   Skipped:        {skipped_count}")
        print(f"   Errors:         {error_count}")
        print("="*80)
    except Exception as e:
        db.rollback()
        print(f"❌ Database error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    api_key = os.getenv('GOOGLE_PLACES_API_KEY')
    if not api_key:
        print("❌ GOOGLE_PLACES_API_KEY not set!")
        sys.exit(1)
    
    if len(sys.argv) < 2:
        print("Usage: python import_csv_merchants.py <csv_directory>")
        sys.exit(1)
    
    csv_dir = sys.argv[1]
    
    if not os.path.exists(csv_dir):
        print(f"❌ Directory not found: {csv_dir}")
        sys.exit(1)
    
    print("Merchant CSV Importer with Google Places API")
    print("="*80)
    print(f"📂 CSV Directory: {csv_dir}")
    print(f"🔑 API Key: {api_key[:20]}...{api_key[-4:]}")
    print("="*80)
    print()
    
    import_merchants(csv_dir, api_key)

