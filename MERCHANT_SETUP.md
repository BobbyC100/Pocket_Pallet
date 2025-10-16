# Merchant CMS & Google Maps Integration Setup

## 🗺️ Google Maps API Setup

### 1. Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select existing
3. Enable these APIs:
   - **Street View Static API**
   - **Maps JavaScript API** (for future features)
4. Go to Credentials → Create Credentials → API Key
5. Copy your API key

### 2. Add to Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   Name: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   Value: your_google_maps_api_key_here
   Environment: Production, Preview, Development
   ```
3. Redeploy your app

### 3. Local Development

Create `.env.local` in `PP_MVP/frontend/`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

## 📍 Import Merchants from Google Maps

### 1. Export Your Saved Places

1. Go to [Google Takeout](https://takeout.google.com/)
2. Deselect all → Select only "Maps"
3. Click "All Maps data included" → Select "Saved Places"
4. Choose JSON format
5. Download and extract `Saved Places.json`

### 2. Import via Web UI (Easiest)

1. Login to Pocket Pallet
2. Go to `/admin/merchants/import`
3. Upload your `Saved Places.json`
4. Click "Import Merchants"
5. Review imported merchants at `/merchants`

### 3. Import via CLI (Advanced)

```bash
cd PP_MVP/backend

# Activate virtual environment
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Run import script
python -m app.scripts.import_google_maps path/to/SavedPlaces.json

# With overwrite flag (updates existing merchants)
python -m app.scripts.import_google_maps path/to/SavedPlaces.json --overwrite
```

---

## 🏗️ Database Migration

Run this once to create the merchants table:

```bash
cd PP_MVP/backend
source venv/bin/activate
alembic upgrade head
```

This will:
- Create `merchants` table
- Add `merchant_id` column to `sources` table
- Enable linking scraper sources to merchants

---

## 🎨 Features

### Merchant Pages Include:
- ✅ **Street View** - Real-world imagery from Google Maps
- ✅ **Hero Section** - Name, type, address, tags
- ✅ **About Section** - Rich description and contact info
- ✅ **Wine Catalog** - Available wines (coming soon)
- ✅ **Location Map** - Embedded Google Maps (coming soon)

### Admin Features:
- ✅ **Bulk Import** - Upload Google Maps exports
- ✅ **CRUD API** - Manage merchants programmatically
- ✅ **Auto-Slugification** - URL-friendly slugs
- ✅ **Type Detection** - Auto-guess bistro/bar/shop

---

## 📊 API Endpoints

### Public:
- `GET /api/v1/merchants` - List all merchants
- `GET /api/v1/merchants/{id}` - Get merchant by ID or slug

### Admin:
- `POST /api/v1/merchants` - Create merchant
- `PATCH /api/v1/merchants/{id}` - Update merchant
- `DELETE /api/v1/merchants/{id}` - Delete merchant
- `POST /api/v1/merchants/import` - Bulk import

---

## 💰 Google Maps API Costs

| Tier  | Limit               | Cost           |
|-------|---------------------|----------------|
| Free  | 25,000 images/month | $0             |
| Paid  | Per image           | ~$0.007/image  |

**Tip**: Street View images are cached in browser, so repeated visits don't count toward quota!

---

## 🚀 Next Steps

1. ✅ Set up Google Maps API key
2. ✅ Import your saved wine spots
3. ✅ Visit `/merchants` to browse
4. 🔜 Link scraper sources to merchants
5. 🔜 Add "Near Me" geolocation feature
6. 🔜 Embed interactive maps

---

Need help? Check `/admin/merchants/import` for a visual import guide!

