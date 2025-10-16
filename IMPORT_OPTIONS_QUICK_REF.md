# Merchant Import Options - Quick Reference

## Your Problem
Google Maps URLs like `http://maps.google.com/?cid=5816261256227932988` don't contain lat/lng coordinates directly. They use Google's internal place IDs.

---

## ✅ RECOMMENDED: Option 1 - Use Google Places API

**Best for:** CID-based URLs (most common from Google Maps exports)

### Setup
```bash
# Use your existing Google Maps API key
export GOOGLE_PLACES_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Or get a new one at: https://console.cloud.google.com/apis/credentials
export GOOGLE_PLACES_API_KEY='your-api-key-here'
```

### Test First
```bash
cd PP_MVP/backend
python test_cid_resolution.py
```

### Import Merchants
```bash
python import_merchants_with_google_api.py '../Takeout 3/Saved'
```

### Cost
- ~$0.017 per CID URL
- Example: 87 CID URLs = ~$1.48
- Free tier: $200/month credit

### Pros
✅ Handles CID URLs perfectly  
✅ Gets accurate coordinates from Google  
✅ Stores Place ID for future Google sync  
✅ Minimal cost  

### Cons
⚠️ Requires API key  
⚠️ Small cost per URL  
⚠️ Subject to API quotas  

---

## Option 2 - Use Existing Coordinates (No API)

**Best for:** GeoJSON files that already have coordinates

Your `merchants_import.json` already has coordinates in GeoJSON format:
```json
{
  "geometry": {
    "coordinates": [-58.4320259, -34.5732242]
  }
}
```

### Import
```bash
cd PP_MVP/backend
python -m app.scripts.import_google_maps ../merchants_import.json
```

### Pros
✅ Free - no API calls  
✅ Fast - no network requests  
✅ Uses existing coordinate data  

### Cons
⚠️ Only works if coordinates already in file  
⚠️ CSV exports usually don't have coordinates  
⚠️ Can't resolve CID URLs  

---

## Option 3 - Manual Data Enrichment

**Best for:** Small batches or when API quota exhausted

### Process
1. Open each Google Maps URL in browser
2. Click "Share" → "Embed a map"
3. Copy coordinates from embed code
4. Update CSV/JSON manually
5. Import with Option 2

### Pros
✅ Free  
✅ No API key needed  
✅ Complete control  

### Cons
⚠️ Very time-consuming  
⚠️ Error-prone  
⚠️ Not scalable (100+ merchants)  

---

## Comparison Table

| Feature | Option 1: API | Option 2: No API | Option 3: Manual |
|---------|---------------|------------------|------------------|
| **Handles CID URLs** | ✅ Yes | ❌ No | ✅ Yes (manual) |
| **Cost** | ~$0.02/URL | Free | Free (your time) |
| **Speed** | Fast | Very Fast | Very Slow |
| **Scale** | 1000s | 1000s | ~20 max |
| **Accuracy** | Excellent | Excellent | Good |
| **Setup** | API key | None | None |

---

## Decision Tree

```
Do your files have CID URLs (?cid=...)? 
├─ Yes → Do you have Google API key?
│         ├─ Yes → ✅ Use Option 1 (API)
│         └─ No  → Use Option 3 (Manual) or get API key
│
└─ No  → Do your files have coordinates already?
          ├─ Yes → ✅ Use Option 2 (No API)
          └─ No  → Check URL format:
                   ├─ Has @lat,lng → Use Option 2
                   ├─ Has !3d/!4d → Use Option 2
                   └─ Unknown → Use Option 1 or 3
```

---

## Files Overview

### For Option 1 (API)
- `app/services/google_places.py` - Enhanced with CID resolution
- `import_merchants_with_google_api.py` - New import script
- `test_cid_resolution.py` - Test script
- `GOOGLE_CID_RESOLUTION_GUIDE.md` - Full documentation

### For Option 2 (No API)
- `app/scripts/import_google_maps.py` - Existing script
- `import_merchants_from_csv.py` - CSV importer (coordinates only)
- `merchants_import.json` - Example with coordinates

---

## Quick Start Commands

### 1. Check Your Files
```bash
# Check if you have CID URLs
grep -r "cid=" ../merchants_import.json ../Takeout*/

# Check if you have coordinates
grep -r "coordinates" ../merchants_import.json
```

### 2. Choose Your Option
```bash
# Option 1: With API
export GOOGLE_PLACES_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
cd PP_MVP/backend
python test_cid_resolution.py  # Test first
python import_merchants_with_google_api.py '../path/to/csvs'

# Option 2: No API (if coordinates exist)
cd PP_MVP/backend
python -m app.scripts.import_google_maps ../merchants_import.json
```

---

## Need Help?

1. **API Key Issues**: See `GOOGLE_CID_RESOLUTION_GUIDE.md` - Setup section
2. **Testing**: Run `test_cid_resolution.py` to verify API works
3. **Cost Concerns**: Check `GOOGLE_CID_RESOLUTION_GUIDE.md` - API Costs section
4. **Data Format**: Check your files to see what format you have

---

## TL;DR

**Most users:** Use Option 1 with Google Places API
- Set `GOOGLE_PLACES_API_KEY`
- Run `python test_cid_resolution.py`
- Run `python import_merchants_with_google_api.py <directory>`
- Cost: ~$1-2 per 100 merchants

**If coordinates already in files:** Use Option 2
- No setup needed
- Run `python -m app.scripts.import_google_maps <file>`
- Free

