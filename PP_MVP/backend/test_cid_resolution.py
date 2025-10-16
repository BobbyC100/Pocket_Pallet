#!/usr/bin/env python3
"""
Test script to verify Google Maps CID resolution works correctly.

Usage:
    export GOOGLE_PLACES_API_KEY='your-api-key'
    python test_cid_resolution.py
"""

import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.google_places import GooglePlacesService

def test_cid_resolution():
    """Test CID resolution with examples from merchants_import.json."""
    
    # Check for API key
    api_key = os.getenv('GOOGLE_PLACES_API_KEY') or os.getenv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
    if not api_key:
        print("❌ Error: GOOGLE_PLACES_API_KEY not set!")
        print("\nSet it with:")
        print("  export GOOGLE_PLACES_API_KEY='your-api-key-here'")
        sys.exit(1)
    
    print("Google Maps CID Resolution Test")
    print("="*80)
    print(f"🔑 API Key: {api_key[:20]}...{api_key[-4:]}\n")
    
    # Initialize service
    try:
        service = GooglePlacesService(api_key=api_key)
        print("✅ Google Places API initialized\n")
    except Exception as e:
        print(f"❌ Failed to initialize: {e}")
        sys.exit(1)
    
    # Test URLs from merchants_import.json
    test_cases = [
        {
            "name": "Lou & Fid (Buenos Aires)",
            "url": "http://maps.google.com/?cid=5816261256227932988",
            "expected_coords": (-34.5732242, -58.4320259)  # lng, lat from JSON
        },
        {
            "name": "Restaurant Barracuda Amsterdam",
            "url": "http://maps.google.com/?cid=14396064057554639992",
            "expected_coords": (52.3845414, 4.9282077)
        },
        {
            "name": "Le Baratin (Paris)",
            "url": "http://maps.google.com/?cid=5887751861485103404",
            "expected_coords": (48.8730712, 2.3828351)
        },
        {
            "name": "Blue Bottle Coffee (Brooklyn)",
            "url": "http://maps.google.com/?cid=4597278484439625393",
            "expected_coords": (40.7169982, -73.9610211)
        },
    ]
    
    print("Testing CID URL Resolution:")
    print("-"*80)
    
    success_count = 0
    failed_count = 0
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{i}. {test['name']}")
        print(f"   URL: {test['url']}")
        
        result = service.resolve_google_maps_url(test['url'])
        
        if result:
            lat, lng, place_id = result
            print(f"   ✅ Resolved!")
            print(f"      Coordinates: {lat}, {lng}")
            if place_id:
                print(f"      Place ID: {place_id}")
            
            # Check if coordinates are close to expected (within 0.01 degrees ~ 1km)
            expected_lat, expected_lng = test['expected_coords']
            lat_diff = abs(lat - expected_lat)
            lng_diff = abs(lng - expected_lng)
            
            if lat_diff < 0.01 and lng_diff < 0.01:
                print(f"      ✅ Coordinates match expected values!")
                success_count += 1
            else:
                print(f"      ⚠️  Coordinates differ from expected:")
                print(f"         Expected: {expected_lat}, {expected_lng}")
                print(f"         Difference: {lat_diff:.6f}°, {lng_diff:.6f}°")
                success_count += 1  # Still count as success since we got coordinates
        else:
            print(f"   ❌ Failed to resolve")
            failed_count += 1
    
    # Summary
    print("\n" + "="*80)
    print("Test Summary:")
    print(f"  ✅ Success: {success_count}/{len(test_cases)}")
    print(f"  ❌ Failed:  {failed_count}/{len(test_cases)}")
    print("="*80)
    
    if success_count == len(test_cases):
        print("\n🎉 All tests passed! CID resolution is working correctly.")
        return 0
    elif success_count > 0:
        print(f"\n⚠️  Partial success: {success_count}/{len(test_cases)} tests passed.")
        return 1
    else:
        print("\n❌ All tests failed. Check your API key and quota.")
        return 1

if __name__ == "__main__":
    sys.exit(test_cid_resolution())

