#!/usr/bin/env python3
"""
Test script for Google Place Sync Worker.

This script tests the Google Places API integration without requiring
the full FastAPI server to be running.

Usage:
    python test_google_sync.py
"""

import os
import sys
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app.services.google_places import GooglePlacesService
from app.db.session import SessionLocal
from app.models.merchant import Merchant
import uuid

# Load environment variables
load_dotenv()


def test_api_connection():
    """Test if Google Places API is configured and working."""
    print("\n" + "="*60)
    print("TEST 1: API Connection")
    print("="*60)
    
    api_key = os.getenv('GOOGLE_PLACES_API_KEY')
    
    if not api_key:
        print("❌ FAILED: GOOGLE_PLACES_API_KEY not found in environment")
        print("   Add it to your .env file and try again.")
        return False
    
    print(f"✅ API Key found: {api_key[:10]}...")
    
    try:
        service = GooglePlacesService(api_key=api_key)
        print("✅ GooglePlacesService initialized successfully")
        return True
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_place_search():
    """Test place search functionality."""
    print("\n" + "="*60)
    print("TEST 2: Place Search")
    print("="*60)
    
    try:
        service = GooglePlacesService()
        
        # Search for a well-known wine bar
        print("\nSearching for 'Buvons Long Beach'...")
        results = service.search_place(
            query="Buvons Long Beach",
            location=(33.77, -118.15)
        )
        
        if not results:
            print("⚠️  No results found (this might be expected)")
            return False
        
        print(f"✅ Found {len(results)} result(s):")
        for i, place in enumerate(results[:3], 1):
            print(f"\n  {i}. {place['name']}")
            print(f"     Place ID: {place['place_id']}")
            print(f"     Address: {place.get('address', 'N/A')}")
            print(f"     Types: {', '.join(place.get('types', [])[:3])}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_place_details():
    """Test fetching place details."""
    print("\n" + "="*60)
    print("TEST 3: Fetch Place Details")
    print("="*60)
    
    # Use a well-known place ID (Google's headquarters as example)
    # You should replace this with a real place ID for your merchants
    test_place_id = "ChIJj61dQgK6j4AR4GeTYWZsKWw"  # Google HQ
    
    print(f"\nFetching details for Place ID: {test_place_id}")
    
    try:
        service = GooglePlacesService()
        place_data = service.fetch_place_details(test_place_id)
        
        print("\n✅ Successfully fetched place details:")
        print(f"   Name: {place_data.get('name')}")
        print(f"   Address: {place_data.get('formatted_address')}")
        print(f"   Phone: {place_data.get('formatted_phone_number', 'N/A')}")
        print(f"   Website: {place_data.get('website', 'N/A')}")
        print(f"   Rating: {place_data.get('rating', 'N/A')} ({place_data.get('user_ratings_total', 0)} reviews)")
        print(f"   Business Status: {place_data.get('business_status')}")
        
        if 'opening_hours' in place_data:
            print(f"   Open Now: {place_data['opening_hours'].get('open_now', 'N/A')}")
        
        if 'photos' in place_data:
            print(f"   Photos: {len(place_data['photos'])} available")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_data_normalization():
    """Test data normalization."""
    print("\n" + "="*60)
    print("TEST 4: Data Normalization")
    print("="*60)
    
    test_place_id = "ChIJj61dQgK6j4AR4GeTYWZsKWw"
    
    try:
        service = GooglePlacesService()
        
        print("\nFetching and normalizing data...")
        place_data = service.fetch_place_details(test_place_id)
        normalized = service.normalize_google_data(place_data)
        
        print("\n✅ Successfully normalized data:")
        print(f"   Fields populated: {list(normalized.keys())}")
        
        if 'name' in normalized:
            print(f"   Name: {normalized['name']}")
        
        if 'address' in normalized:
            print(f"   Address: {normalized['address']}")
        
        if 'geo' in normalized:
            print(f"   Coordinates: {normalized['geo']}")
        
        if 'contact' in normalized:
            print(f"   Contact: {normalized['contact']}")
        
        if 'hours' in normalized:
            print(f"   Hours: {len(normalized['hours'])} days configured")
        
        if 'tags' in normalized:
            print(f"   Tags: {', '.join(normalized['tags'][:5])}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_merchant_sync():
    """Test syncing a test merchant."""
    print("\n" + "="*60)
    print("TEST 5: Merchant Sync (DB Test)")
    print("="*60)
    
    db = SessionLocal()
    
    try:
        # Create a test merchant
        test_merchant = Merchant(
            id=str(uuid.uuid4()),
            name="Test Wine Bar",
            slug="test-wine-bar-sync",
            type="wine_bar"
        )
        
        db.add(test_merchant)
        db.commit()
        db.refresh(test_merchant)
        
        print(f"✅ Created test merchant: {test_merchant.name} (ID: {test_merchant.id})")
        
        # Sync with Google (using Google HQ as example)
        test_place_id = "ChIJj61dQgK6j4AR4GeTYWZsKWw"
        
        print(f"\nSyncing with Google Place ID: {test_place_id}")
        
        service = GooglePlacesService()
        status, google_meta, error, updated_fields = service.sync_merchant(
            db=db,
            merchant_id=test_merchant.id,
            place_id=test_place_id,
            force_overwrite=False
        )
        
        if status == 'success' or status == 'no_changes':
            print(f"\n✅ Sync completed successfully!")
            print(f"   Status: {status}")
            print(f"   Fields updated: {updated_fields}")
            
            # Refresh merchant to see changes
            db.refresh(test_merchant)
            
            print(f"\n   Updated merchant data:")
            print(f"     Name: {test_merchant.name}")
            print(f"     Address: {test_merchant.address}")
            print(f"     Google Place ID: {test_merchant.google_place_id}")
            print(f"     Sync Status: {test_merchant.google_sync_status}")
            print(f"     Last Synced: {test_merchant.google_last_synced}")
            
        else:
            print(f"❌ Sync failed: {error}")
            return False
        
        # Cleanup - delete test merchant
        print(f"\n🧹 Cleaning up test merchant...")
        db.delete(test_merchant)
        db.commit()
        print("✅ Test merchant deleted")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        # Try to cleanup on error
        try:
            if test_merchant:
                db.delete(test_merchant)
                db.commit()
        except:
            pass
        return False
    finally:
        db.close()


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("🧪 GOOGLE PLACE SYNC WORKER TEST SUITE")
    print("="*60)
    
    tests = [
        ("API Connection", test_api_connection),
        ("Place Search", test_place_search),
        ("Place Details", test_place_details),
        ("Data Normalization", test_data_normalization),
        ("Merchant Sync", test_merchant_sync),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except KeyboardInterrupt:
            print("\n\n⚠️  Tests interrupted by user")
            sys.exit(1)
        except Exception as e:
            print(f"\n❌ Unexpected error in {test_name}: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print("\n" + "-"*60)
    print(f"Results: {passed}/{total} tests passed")
    print("="*60)
    
    if passed == total:
        print("\n🎉 All tests passed! Google Place Sync Worker is ready to use.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please check configuration.")
        return 1


if __name__ == "__main__":
    sys.exit(main())

