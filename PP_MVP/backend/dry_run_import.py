#!/usr/bin/env python3
"""
Dry run to preview what will be imported from CSV files.
Shows filtering results without actually importing to database.
"""
import csv
import glob
import re
import os
from collections import Counter

# Same filters as the real import script
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

def dry_run_import(csv_directory):
    """Preview what will be imported."""
    
    total_places = 0
    will_import = []
    skipped_addresses = []
    skipped_excluded = []
    skipped_not_food = []
    
    type_counts = Counter()
    city_counts = Counter()
    
    csv_files = sorted(glob.glob(os.path.join(csv_directory, "*.csv")))
    
    print(f"🔍 DRY RUN: Analyzing {len(csv_files)} CSV files")
    print("="*80)
    print()
    
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
                    
                    total_places += 1
                    
                    # Skip addresses
                    if is_likely_address(title):
                        skipped_addresses.append(title)
                        continue
                    
                    # Check exclusions
                    combined = f"{title} {note}".lower()
                    should_exclude = any(kw in combined for kw in exclude_keywords)
                    if should_exclude:
                        skipped_excluded.append((title, [kw for kw in exclude_keywords if kw in combined]))
                        continue
                    
                    # Check if it's a food/drink place
                    should_keep = any(kw in combined for kw in keep_keywords)
                    if not should_keep:
                        skipped_not_food.append(title)
                        continue
                    
                    # This will be imported!
                    merchant_type = categorize_merchant(title, note)
                    will_import.append({
                        'name': title,
                        'city': city,
                        'type': merchant_type,
                        'note': note
                    })
                    type_counts[merchant_type] += 1
                    city_counts[city] += 1
                    
        except Exception as e:
            print(f"❌ Error reading {csv_file}: {e}")
    
    # Print results
    print("📊 ANALYSIS RESULTS")
    print("="*80)
    print()
    print(f"Total places in CSV files:     {total_places}")
    print(f"✅ Will be imported:           {len(will_import)}")
    print(f"⏭️  Skipped (addresses):        {len(skipped_addresses)}")
    print(f"❌ Skipped (excluded):         {len(skipped_excluded)}")
    print(f"⏭️  Skipped (not food/drink):  {len(skipped_not_food)}")
    print()
    
    print("📈 BREAKDOWN BY TYPE:")
    print("-"*80)
    for mtype, count in type_counts.most_common():
        print(f"  {mtype:20s} {count:4d}")
    print()
    
    print("🌍 BREAKDOWN BY CITY (Top 10):")
    print("-"*80)
    for city, count in city_counts.most_common(10):
        print(f"  {city:30s} {count:4d}")
    print()
    
    print("📋 SAMPLE OF WHAT WILL BE IMPORTED (First 20):")
    print("-"*80)
    for i, place in enumerate(will_import[:20], 1):
        print(f"{i:2d}. {place['name']}")
        print(f"    📍 {place['city']}")
        print(f"    🏷️  {place['type']}")
        if place['note']:
            print(f"    💬 {place['note']}")
        print()
    
    if len(will_import) > 20:
        print(f"... and {len(will_import) - 20} more")
        print()
    
    print("⚠️  SAMPLE OF EXCLUDED PLACES (First 10):")
    print("-"*80)
    for i, (title, keywords) in enumerate(skipped_excluded[:10], 1):
        print(f"{i:2d}. {title}")
        print(f"    Excluded by: {', '.join(keywords)}")
    print()
    
    print("💰 ESTIMATED API COST:")
    print("-"*80)
    print(f"Places to import: {len(will_import)}")
    print(f"Estimated API calls: ~{len(will_import)} (if all need CID resolution)")
    print(f"Cost at $0.017/call: ~${len(will_import) * 0.017:.2f}")
    print(f"Note: Actual cost will be lower if URLs contain coordinates")
    print()
    
    print("="*80)
    print("✅ Dry run complete!")
    print()
    print("👉 To proceed with import, run:")
    print("   python3 import_merchants_with_google_api.py '../../Takeout 3/Saved'")
    print()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        csv_dir = "../../Takeout 3/Saved"
    else:
        csv_dir = sys.argv[1]
    
    if not os.path.exists(csv_dir):
        print(f"❌ Directory not found: {csv_dir}")
        sys.exit(1)
    
    dry_run_import(csv_dir)

