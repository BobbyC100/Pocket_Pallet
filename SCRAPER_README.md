# 🍷 Wine Scraper MVP

Admin-only wine scraper for building a master wine catalog from retailer websites.

---

## 📊 **Architecture**

```
┌─────────────────┐
│  Sources Table  │  ← Wine retailer configs
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Scraper Service │  ← Fetches product listings
└────────┬────────┘
         │
         ↓
┌────────────────────────┐
│   Products Table       │  ← Individual product URLs
└──────────┬─────────────┘
           │
           ├──→ Product Snapshots  (price/stock history)
           ├──→ Product Images     (label images)
           │
           ↓
┌─────────────────────┐
│ Scraped Wines Table │  ← Master wine catalog
└─────────────────────┘
           ↓
    [User can "add to my wines"]
           ↓
┌─────────────────┐
│  Wines Table    │  ← User's personal collection
└─────────────────┘
```

---

## 🗄️ **Database Tables**

### **`sources`**
Wine retailer/distributor websites
- `id`, `name`, `base_url`
- `product_link_selector`, `pagination_next_selector` (CSS selectors)
- `use_playwright`, `enabled`, `last_run_at`

### **`scraped_wines`**
Master wine catalog (SEPARATE from user's `wines` table)
- `id`, `producer`, `cuvee`, `vintage`
- `country`, `region`, `appellation`, `style`
- `grapes`, `volume_ml`, `block_key`

### **`products`**
Individual product listings from sources
- `id`, `wine_id` (FK → scraped_wines), `source_id` (FK → sources)
- `product_url`, `external_sku`, `title_raw`, `data_raw`

### **`product_snapshots`**
Price/availability history
- `id`, `product_id`, `fetched_at`
- `price_cents`, `currency`, `in_stock`
- `title_raw`, `availability_raw`, `normalized`

### **`product_images`**
Product label images
- `id`, `product_id`, `src_url`, `stored_url`
- `sha1`, `width`, `height`

---

## 🔐 **Admin API Endpoints**

All endpoints under `/api/v1/scraper` require admin access.

### **Source Management**
```bash
# List sources
GET /api/v1/scraper/sources

# Create source
POST /api/v1/scraper/sources
{
  "name": "Wine.com",
  "base_url": "https://www.wine.com/list/wine/7155",
  "product_link_selector": "a.prodItemInfo_link",
  "pagination_next_selector": "a.pageLink_next",
  "use_playwright": false,
  "enabled": true
}

# Update source
PATCH /api/v1/scraper/sources/{id}

# Delete source
DELETE /api/v1/scraper/sources/{id}
```

### **Run Scraper**
```bash
# Start scrape job
POST /api/v1/scraper/scrape
{
  "source_id": 1,
  "max_pages": 5,
  "force": false
}

# Response
{
  "job_id": "uuid-here",
  "source_id": 1,
  "status": "started",
  "products_found": 0,
  "wines_created": 0,
  "snapshots_created": 0,
  "started_at": "2025-10-14T..."
}

# Check job status
GET /api/v1/scraper/jobs/{job_id}
```

### **Browse Scraped Data**
```bash
# List scraped wines
GET /api/v1/scraper/wines?producer=Burgundy&limit=50

# List products
GET /api/v1/scraper/products?source_id=1&limit=100
```

---

## 🚀 **Deployment Steps**

### **1. Run Migration**
```bash
cd PP_MVP/backend
alembic upgrade head
```

### **2. Configure Admin Access**
Update `app/api/endpoints/scraper.py`:
```python
admin_emails = ["your-email@gmail.com", "admin@pocketpallet.com"]
```

### **3. Test Locally**
```bash
# Start backend
uvicorn app.main:app --reload

# Visit API docs
http://localhost:8000/docs
```

### **4. Deploy to Render**
```bash
git add -A
git commit -m "feat: add wine scraper MVP"
git push origin main
```

Render will automatically:
- Install `beautifulsoup4`
- Run `alembic upgrade head`
- Deploy new endpoints

---

## 📝 **Usage Example**

```bash
# 1. Login as admin
POST /api/v1/auth/login
{"email": "admin@pocketpallet.com", "password": "..."}

# 2. Create a source
POST /api/v1/scraper/sources
{
  "name": "K&L Wine Merchants",
  "base_url": "https://www.klwines.com/Products?filters=sv2_100$eq$Red$True",
  "product_link_selector": ".tf-product-name a",
  "pagination_next_selector": ".pagination-next a"
}

# 3. Run scraper
POST /api/v1/scraper/scrape
{"source_id": 1, "max_pages": 3}

# 4. Check progress
GET /api/v1/scraper/jobs/{job_id}

# 5. Browse wines
GET /api/v1/scraper/wines?limit=20
```

---

## 🔮 **Future Enhancements**

- [ ] Playwright support for JavaScript-heavy sites
- [ ] AI-powered wine name parsing (GPT-4/Claude)
- [ ] Automated scheduling (weekly cron jobs)
- [ ] Duplicate detection/merging
- [ ] User feature: "Add to My Wines" from catalog
- [ ] Price drop alerts
- [ ] Image storage (S3/Cloudinary)

---

## 🛠️ **Customizing Selectors**

Each retailer requires custom CSS selectors. Use browser DevTools:

1. Open retailer wine list page
2. Right-click product → Inspect
3. Find unique CSS selector for:
   - Product links: `.product-card a.title`
   - Next page button: `.pagination .next`

Update source via API:
```bash
PATCH /api/v1/scraper/sources/{id}
{
  "product_link_selector": ".product-card a.title",
  "pagination_next_selector": ".pagination .next"
}
```

---

## 📊 **Tables: User Wines vs. Scraped Wines**

| **wines** (User Collection) | **scraped_wines** (Master Catalog) |
|---|---|
| User's personal wines | All wines from retailers |
| Linked to `user_id` | Admin-managed |
| Has tasting notes, ratings | Has price history, availability |
| From CSV, OCR, manual entry | From scraper |

**Future feature:** Users can browse `scraped_wines` and "add to my collection" → creates entry in `wines` table.

---

🎉 **Happy Scraping!**

