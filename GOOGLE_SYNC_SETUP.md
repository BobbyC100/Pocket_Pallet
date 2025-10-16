# Google Place Sync Worker - Setup & Usage Guide

## Overview

The Google Place Sync Worker enriches merchant data by pulling structured information from Google Places API. It fills in missing fields like address, hours, photos, and business details without overwriting your curated Pocket Pallet content.

---

## 🚀 Quick Start

### 1. Get a Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Places API**
4. Create credentials → API Key
5. (Optional) Restrict key to Places API only

### 2. Configure Environment

Add to your `.env` file:

```bash
# Google Places API
GOOGLE_PLACES_API_KEY=your_api_key_here
GOOGLE_PLACES_AUTO_SYNC=false
GOOGLE_PLACES_SYNC_INTERVAL_DAYS=30
```

### 3. Install Dependencies

```bash
cd PP_MVP/backend
pip install -r requirements.txt
```

### 4. Run Database Migration

```bash
# Apply the new migration
alembic upgrade head
```

This adds the following fields to the `merchants` table:
- `google_place_id` - Google's unique identifier
- `google_meta` - Raw API response (JSONB)
- `google_last_synced` - Last sync timestamp
- `google_sync_status` - Current status (success, failed, pending, never_synced)

### 5. Start Your Backend

```bash
uvicorn app.main:app --reload
```

---

## 📡 API Endpoints

### **POST** `/api/v1/merchants/{merchant_id}/google-sync`

Sync a merchant with Google Places data.

**Auth Required:** Admin only

**Parameters:**
- `merchant_id` (path) - Merchant ID or slug
- `place_id` (query) - Google Place ID
- `force_overwrite` (query, optional) - Overwrite existing data (default: false)

**Example Request:**

```bash
curl -X POST "http://localhost:8000/api/v1/merchants/buvons/google-sync?place_id=ChIJ8T1Z9XuxwoARah7YaygWXpA" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response:**

```json
{
  "status": "success",
  "merchant_id": "abc-123",
  "google_place_id": "ChIJ8T1Z9XuxwoARah7YaygWXpA",
  "sync_timestamp": "2025-10-16T10:30:00",
  "fields_updated": [
    "address",
    "contact",
    "hours",
    "gallery_images",
    "tags"
  ],
  "error": null,
  "google_meta": {
    "place_id": "ChIJ8T1Z9XuxwoARah7YaygWXpA",
    "name": "Buvons Wine Bar",
    "formatted_address": "1145 Loma Ave, Long Beach, CA 90804",
    "business_status": "OPERATIONAL",
    ...
  }
}
```

---

### **GET** `/api/v1/merchants/{merchant_id}/google-sync-status`

Get sync status for a merchant.

**Auth Required:** None (public)

**Example Request:**

```bash
curl "http://localhost:8000/api/v1/merchants/buvons/google-sync-status"
```

**Example Response:**

```json
{
  "merchant_id": "abc-123",
  "google_place_id": "ChIJ8T1Z9XuxwoARah7YaygWXpA",
  "google_sync_status": "success",
  "google_last_synced": "2025-10-16T10:30:00",
  "has_google_data": true
}
```

---

## 🔍 Finding Google Place IDs

### Method 1: Google Maps URL

1. Find venue on [Google Maps](https://maps.google.com/)
2. Click on the venue
3. Look at URL: `https://www.google.com/maps/place/.../@33.77,-118.15/data=!4m6!3m5!1s0x80dd6fb97d5f6f01:0x90568a6a8c681eb1`
4. The Place ID is in the data parameter: `0x80dd6fb97d5f6f01:0x90568a6a8c681eb1`

### Method 2: Use the Search Helper

The service includes a search method:

```python
from app.services.google_places import GooglePlacesService

service = GooglePlacesService()
results = service.search_place("Buvons Long Beach", location=(33.77, -118.15))

for place in results:
    print(f"{place['name']}: {place['place_id']}")
```

---

## 🧠 Smart Merge Logic

The sync worker **never overwrites existing data** unless you use `force_overwrite=true`.

### Default Behavior (Smart Merge)

| Field | Merchant Has Data | Google Has Data | Result |
|-------|------------------|-----------------|---------|
| `address` | ✅ Yes | ✅ Yes | **Keep merchant data** |
| `address` | ❌ No | ✅ Yes | **Use Google data** |
| `contact.phone` | ✅ Yes | ✅ Yes | **Keep merchant phone** |
| `contact.website` | ❌ No | ✅ Yes | **Add Google website** |
| `tags` | `["Wine Bar"]` | `["Bar", "Restaurant"]` | **Merge to ["Wine Bar", "Bar", "Restaurant"]** |

### Force Overwrite Mode

Use `?force_overwrite=true` to replace all fields with Google data:

```bash
curl -X POST ".../google-sync?place_id=XXX&force_overwrite=true"
```

⚠️ **Warning:** This replaces your curated content. Use carefully!

---

## 📦 What Data Gets Synced?

### Fields Populated from Google

| Pocket Pallet Field | Google Places Field | Notes |
|---------------------|---------------------|-------|
| `name` | `name` | Venue name |
| `address` | `formatted_address` | Full address |
| `geo` | `geometry.location` | Lat/lng coordinates |
| `contact.phone` | `formatted_phone_number` | Phone number |
| `contact.website` | `website` | Website URL |
| `hours` | `opening_hours.weekday_text` | Converted to {mon: "9-5", ...} |
| `hero_image` | `photos[0]` | First photo |
| `gallery_images` | `photos[0:5]` | Up to 5 photos |
| `tags` | `types` | Mapped to readable tags |
| `source_url` | `url` | Google Maps link |
| `google_meta` | *(entire response)* | Raw API data for reference |

### Example `google_meta` Structure

```json
{
  "place_id": "ChIJ8T1Z9XuxwoARah7YaygWXpA",
  "name": "Buvons Wine Bar",
  "formatted_address": "1145 Loma Ave, Long Beach, CA 90804, USA",
  "formatted_phone_number": "(562) 508-0031",
  "website": "https://www.buvonswine.com/",
  "business_status": "OPERATIONAL",
  "price_level": 2,
  "rating": 4.7,
  "user_ratings_total": 843,
  "types": ["bar", "restaurant", "food", "point_of_interest"],
  "geometry": {
    "location": {"lat": 33.7745, "lng": -118.1512}
  },
  "opening_hours": {
    "open_now": true,
    "weekday_text": [
      "Monday: Closed",
      "Tuesday: 3:00 – 10:00 PM",
      "Wednesday: 3:00 – 10:00 PM",
      "Thursday: 3:00 – 11:00 PM",
      "Friday: 3:00 – 11:00 PM",
      "Saturday: 3:00 – 11:00 PM",
      "Sunday: 3:00 – 9:00 PM"
    ]
  },
  "photos": [
    {"photo_reference": "Aap_uEA...", "height": 768, "width": 1024}
  ]
}
```

---

## 🔄 Auto-Sync (Future Feature)

The configuration includes options for automatic syncing:

```python
# .env
GOOGLE_PLACES_AUTO_SYNC=true
GOOGLE_PLACES_SYNC_INTERVAL_DAYS=30
```

**Planned Implementation:** Celery worker that runs nightly and syncs merchants where:
- `google_place_id` is set
- `google_last_synced` is older than 30 days
- `google_sync_status` != 'failed'

---

## 🛠️ Troubleshooting

### Error: "Google Places API key not configured"

**Solution:** Add `GOOGLE_PLACES_API_KEY` to your `.env` file.

### Error: "Google Places API returned status: REQUEST_DENIED"

**Solutions:**
1. Check API key is valid
2. Ensure Places API is enabled in Google Cloud Console
3. Check for billing issues
4. Verify API key restrictions

### Error: "Merchant not found"

**Solution:** Check that the merchant ID or slug is correct. Try the `/api/v1/merchants` endpoint to list all merchants.

### No Fields Updated

**Cause:** All fields already have data, and you're not using `force_overwrite`.

**Solution:** Either:
1. Use `?force_overwrite=true` to replace data
2. Manually clear fields you want to update first

---

## 💡 Usage Examples

### Example 1: Sync Single Merchant

```python
import requests

# Admin login
auth_response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    data={"username": "admin@example.com", "password": "password"}
)
token = auth_response.json()["access_token"]

# Sync merchant
response = requests.post(
    "http://localhost:8000/api/v1/merchants/buvons/google-sync",
    params={"place_id": "ChIJ8T1Z9XuxwoARah7YaygWXpA"},
    headers={"Authorization": f"Bearer {token}"}
)

print(response.json())
```

### Example 2: Bulk Sync All Merchants with Place IDs

```python
from app.services.google_places import GooglePlacesService
from app.db.session import SessionLocal
from app.models.merchant import Merchant

db = SessionLocal()
service = GooglePlacesService()

merchants = db.query(Merchant).filter(
    Merchant.google_place_id.isnot(None)
).all()

for merchant in merchants:
    print(f"Syncing {merchant.name}...")
    status, meta, error, fields = service.sync_merchant(
        db=db,
        merchant_id=merchant.id,
        place_id=merchant.google_place_id
    )
    print(f"  Status: {status}, Fields updated: {fields}")
```

---

## 📊 API Rate Limits

Google Places API has quotas:
- **Free tier:** 0 requests/month (billing required)
- **Paid:** $17 per 1,000 requests for Place Details

**Recommendation:** 
- Only sync when needed (not on every page load)
- Cache results for 30 days
- Use Redis caching (Phase 2) for API responses

---

## 🎯 Next Steps

Now that the sync worker is set up:

1. ✅ Test with a single merchant
2. ✅ Verify data in admin panel
3. 🔄 Add Celery for background jobs (Phase 3)
4. 🔄 Implement 30-day auto-refresh
5. 🔄 Add Redis caching layer
6. 🔄 Build admin UI for bulk sync

---

## 📝 API Documentation

Full API docs available at: `http://localhost:8000/docs` (FastAPI auto-generated Swagger UI)

---

**Questions?** Check the [main README](README.md) or open an issue on GitHub.

