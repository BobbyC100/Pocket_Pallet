# Google Maps CID Resolution Guide

## Problem
Google Maps URLs from saved places often contain Customer IDs (CIDs) instead of lat/lng coordinates:
```
http://maps.google.com/?cid=5816261256227932988
```

These CID-based URLs don't contain coordinates directly, so we need to use the **Google Places API** to resolve them to lat/lng coordinates.

---

## Solution

We've enhanced the `GooglePlacesService` to resolve various Google Maps URL formats, including:

1. **CID URLs** (requires API call): `?cid=5816261256227932988`
2. **Coordinate URLs** (direct parsing): `@lat,lng` or `!3dlat!4dlng`
3. **Place ID URLs** (requires API call): URLs with Place IDs like `ChIJ...`

---

## Setup

### 1. Get Your Google Places API Key

If you already have a `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for Street View, you can use the same key:

```bash
export GOOGLE_PLACES_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

Or set it separately:
```bash
export GOOGLE_PLACES_API_KEY='your-api-key-here'
```

### 2. Install Dependencies

```bash
cd PP_MVP/backend
pip install -r requirements.txt
```

New dependencies added:
- `requests==2.32.3` - For direct API calls
- `python-slugify==8.0.1` - For generating URL-friendly slugs

---

## Usage

### Option 1: Test CID Resolution First

Before importing, test that CID resolution works:

```bash
cd PP_MVP/backend
export GOOGLE_PLACES_API_KEY='your-api-key'
python test_cid_resolution.py
```

This will test 4 real CID URLs from your `merchants_import.json` file and verify the coordinates match.

**Expected output:**
```
Google Maps CID Resolution Test
================================================================================
🔑 API Key: AIzaSyB...xYz

✅ Google Places API initialized

Testing CID URL Resolution:
--------------------------------------------------------------------------------

1. Lou & Fid (Buenos Aires)
   URL: http://maps.google.com/?cid=5816261256227932988
   ✅ Resolved!
      Coordinates: -34.5732242, -58.4320259
      Place ID: ChIJ8T1Z9XuxwoAR...
      ✅ Coordinates match expected values!

[... more tests ...]

================================================================================
Test Summary:
  ✅ Success: 4/4
  ❌ Failed:  0/4
================================================================================

🎉 All tests passed! CID resolution is working correctly.
```

---

### Option 2: Import Merchants with CID Resolution

Use the new import script that automatically resolves CID URLs:

```bash
cd PP_MVP/backend
export GOOGLE_PLACES_API_KEY='your-api-key'
python import_merchants_with_google_api.py '../Takeout 3/Saved'
```

**Features:**
- Automatically detects URL format (CID, coordinates, Place ID)
- Uses Google Places API only when needed (CID or Place ID URLs)
- Stores the resolved Place ID for future Google sync
- Shows which merchants were resolved via API vs direct parsing

**Expected output:**
```
Merchant Importer with Google Places API
================================================================================
📂 CSV Directory: ../Takeout 3/Saved
🔑 API Key: AIzaSyB...xYz
================================================================================
✅ Google Places API initialized

📍 Processing Amsterdam...
✅ 🔍 API | Amsterdam            | Restaurant Barracuda Amsterdam

📍 Processing Paris...
✅ 🔍 API | Paris                | Le Baratin
✅ 📍 URL | Paris                | Cafe de Flore

================================================================================
✅ Import complete!
   Imported:       125
   Via API:        87   ← CIDs resolved via Google Places API
   Skipped:        43
   Errors:         5
================================================================================
```

---

## How It Works

### 1. URL Parsing Priority

The `resolve_google_maps_url()` method tries these formats in order:

```python
# 1. Direct coordinate formats (no API call needed)
if url.contains('!3d'):
    # Extract lat/lng from !3d<lat>!4d<lng>
    return lat, lng, None

if url.contains('@'):
    # Extract lat/lng from @lat,lng
    return lat, lng, None

# 2. CID format (requires API call)
if url.contains('?cid='):
    cid = extract_cid(url)
    result = resolve_cid_to_coordinates(cid)  # API call
    return lat, lng, place_id

# 3. Place ID format (requires API call)
if place_id in url:
    place_data = fetch_place_details(place_id)  # API call
    return lat, lng, place_id
```

### 2. CID Resolution Process

When a CID is found:
1. Extract CID from URL: `cid=5816261256227932988`
2. Call Google Places API: `places/details?cid=...`
3. Get response with Place ID and coordinates
4. Return `(lat, lng, place_id)`

### 3. Storage

Merchants imported via CID resolution will have:
- `geo`: `{"lat": ..., "lng": ...}` - Coordinates for maps
- `google_place_id`: `"ChIJ..."` - For future Google sync operations
- `source_url`: Original CID URL

---

## API Costs & Quotas

### Google Places API Pricing

- **Place Details**: $0.017 per request (Basic Data)
- **Free Tier**: $200 credit/month = ~11,764 requests/month

### Optimization

The script minimizes API calls by:
1. Only calling API for CID and Place ID URLs
2. Parsing coordinates directly when available in URL
3. Caching Place IDs for future sync operations

**Example from a typical import:**
- Total merchants: 125
- CID URLs requiring API: 87
- Direct coordinate URLs: 38
- **Cost**: 87 × $0.017 = ~$1.48

---

## Troubleshooting

### Error: "API key not configured"

```bash
export GOOGLE_PLACES_API_KEY='your-api-key-here'
```

Or use your existing Maps API key:
```bash
export GOOGLE_PLACES_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

### Error: "RESOURCE_EXHAUSTED" or "OVER_QUERY_LIMIT"

You've hit your API quota. Options:
1. Wait until next billing cycle
2. Enable billing on Google Cloud Console
3. Import in batches over several days

### Error: "Could not resolve CID"

Some CIDs might be:
- Invalid or expired
- For places that no longer exist
- Restricted by privacy settings

The script will skip these and log them in the error count.

### Coordinates Don't Match

The Google Places API returns the current location of a place, which might differ from your saved location if:
- The business moved
- The place data was updated
- Different branches of the same business

The test script shows coordinate differences for review.

---

## Advanced Usage

### Use in Python Code

```python
from app.services.google_places import GooglePlacesService

# Initialize service
service = GooglePlacesService(api_key='your-key')

# Resolve any Google Maps URL
url = "http://maps.google.com/?cid=5816261256227932988"
result = service.resolve_google_maps_url(url)

if result:
    lat, lng, place_id = result
    print(f"Coordinates: {lat}, {lng}")
    print(f"Place ID: {place_id}")
```

### Resolve Just the CID

```python
# If you already extracted the CID
cid = "5816261256227932988"
result = service.resolve_cid_to_coordinates(cid)

if result:
    lat, lng, place_id = result
    print(f"Resolved to: {lat}, {lng}")
```

---

## Future Enhancements

Potential improvements:
1. **Batch API Calls**: Reduce latency by batching CID lookups
2. **Caching**: Cache CID→Place ID mappings to avoid duplicate API calls
3. **Fallback Search**: If CID fails, try text search with merchant name
4. **Rate Limiting**: Add exponential backoff for API errors

---

## Related Files

- `app/services/google_places.py` - Google Places API service with CID resolution
- `import_merchants_with_google_api.py` - CSV importer with API support
- `test_cid_resolution.py` - Test script for CID resolution
- `merchants_import.json` - Sample GeoJSON with CID URLs

---

## Summary

✅ **Problem Solved**: CID-based Google Maps URLs can now be resolved to coordinates

✅ **Cost Effective**: Only uses API when necessary, ~$1.48 for 87 CID URLs

✅ **Easy to Use**: Just set `GOOGLE_PLACES_API_KEY` and run the script

✅ **Tested**: Includes test script to verify before importing

✅ **Future-Proof**: Stores Place IDs for future Google sync operations

