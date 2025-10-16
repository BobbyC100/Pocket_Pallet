import csv
import glob
import re
import sys
import os
from datetime import datetime
from urllib.parse import urlparse, parse_qs
from slugify import slugify
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.merchant import Merchant

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

def extract_coordinates_from_url(url):
    """Extract lat/lng from Google Maps URL"""
    if not url:
        return None, None
    
    try:
        # Try to find coordinates in various Google Maps URL formats
        # Format 1: !3d<lat>!4d<lng>
        match = re.search(r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)', url)
        if match:
            return float(match.group(1)), float(match.group(2))
        
        # Format 2: @<lat>,<lng>
        match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', url)
        if match:
            return float(match.group(1)), float(match.group(2))
        
        # Format 3: ?q=<lat>,<lng>
        parsed = urlparse(url)
        if 'q=' in url:
            q_param = parse_qs(parsed.query).get('q', [''])[0]
            coords = re.search(r'(-?\d+\.\d+),(-?\d+\.\d+)', q_param)
            if coords:
                return float(coords.group(1)), float(coords.group(2))
    except Exception as e:
        print(f"Error extracting coords from {url}: {e}")
    
    return None, None

def categorize_merchant(title, note):
    """Determine merchant type based on name/note"""
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
    """Map city list name to country code"""
    country_map = {
        'Amsterdam': 'NL',
        'Bangkok': 'TH',
        'Barcelona': 'ES',
        'Biarritz': 'FR',
        'Copenhagen': 'DK',
        'London': 'GB',
        'Madrid': 'ES',
        'Paris': 'FR',
        'Rome': 'IT',
        'Tokyo': 'JP',
        'Singapore': 'SG',
        'NYC': 'US',
        'NYC Wine': 'US',
        'Los Angeles': 'US',
        'SF': 'US',
        'Charleston SC': 'US',
        'Chicago': 'US',
        'Denver': 'US',
        'Austin': 'US',
        'New Orleans': 'US',
        'Seattle': 'US',
        'Phoenix': 'US',
    }
    
    # Default to US for most cities
    return country_map.get(city, 'US')

def import_merchants(csv_directory):
    """Import merchants from Google Maps CSV exports"""
    
    db: Session = SessionLocal()
    imported_count = 0
    skipped_count = 0
    error_count = 0
    
    csv_files = sorted(glob.glob(os.path.join(csv_directory, "*.csv")))
    
    print(f"Found {len(csv_files)} CSV files")
    print("="*80)
    
    for csv_file in csv_files:
        city = os.path.basename(csv_file).replace('.csv', '')
        
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
                    lat, lng = extract_coordinates_from_url(url)
                    
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
                        last_synced_at=datetime.utcnow()
                    )
                    
                    db.add(merchant)
                    imported_count += 1
                    print(f"✅ {city:20s} | {title}")
                    
        except Exception as e:
            print(f"❌ Error processing {csv_file}: {e}")
            error_count += 1
            continue
    
    try:
        db.commit()
        print("\n" + "="*80)
        print(f"✅ Import complete!")
        print(f"   Imported: {imported_count}")
        print(f"   Skipped:  {skipped_count}")
        print(f"   Errors:   {error_count}")
        print("="*80)
    except Exception as e:
        db.rollback()
        print(f"❌ Database error during commit: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    csv_dir = "../../Takeout 3/Saved"
    
    if not os.path.exists(csv_dir):
        print(f"❌ CSV directory not found: {csv_dir}")
        sys.exit(1)
    
    print("Starting merchant import from Google Maps CSV files...")
    print("="*80)
    import_merchants(csv_dir)
