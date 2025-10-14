# 🍷 Wine Scraper Roadmap

Future enhancements for the Pocket Pallet wine scraper system.

---

## 🎯 **Phase 1: MVP** ✅ COMPLETED

- [x] Database schema (sources, scraped_wines, products, snapshots, images)
- [x] SQLAlchemy models and Pydantic schemas
- [x] Web scraper service with BeautifulSoup
- [x] Admin-only API endpoints
- [x] Background job processing
- [x] Basic HTML scraping with CSS selectors

---

## 🚀 **Phase 2: Admin Tools** 📋 PLANNED

### **2.1 Frontend Admin Panel**
**Goal:** Web UI for managing the scraper system

**Features:**
- Dashboard showing active sources and recent jobs
- Create/edit/delete scraper sources
- Configure CSS selectors with live preview
- Start scrape jobs and monitor progress
- Browse scraped wines catalog
- View price history charts
- Manage duplicate wines

**Tech Stack:**
- Next.js admin route (`/admin/scraper`)
- shadcn/ui components (tables, forms, charts)
- Real-time job status updates (polling or WebSockets)

**API Endpoints:** ✅ Already implemented
- GET/POST/PATCH/DELETE `/api/v1/scraper/sources`
- POST `/api/v1/scraper/scrape`
- GET `/api/v1/scraper/jobs/{id}`
- GET `/api/v1/scraper/wines`
- GET `/api/v1/scraper/products`

---

## 🔍 **Phase 3: User Discovery** 📋 PLANNED

### **3.1 Browse Scraped Wine Catalog**
**Goal:** Let users discover wines from the master catalog

**Features:**
- Public browse page: `/wines/discover`
- Filter by: producer, region, price range, style
- Search by name
- Sort by: price, popularity, recently added
- Show current availability and prices from multiple sources
- Price comparison across retailers

**New API Endpoints:**
```
GET /api/v1/catalog/wines
  - Public endpoint (no auth required)
  - Filters: producer, region, style, price_min, price_max
  - Search: fuzzy match on name
  
GET /api/v1/catalog/wines/{id}
  - Wine details with all available products
  - Price history chart data
  - Retailer availability
```

### **3.2 Add to My Wines**
**Goal:** Users can add catalog wines to their personal collection

**Features:**
- "Add to My Wines" button on catalog wines
- Optional notes/rating when adding
- Automatically links to scraped_wine for future updates
- Track ownership vs. wishlist

**New API Endpoint:**
```
POST /api/v1/wines/from-catalog
{
  "scraped_wine_id": 123,
  "status": "Want to Try",
  "notes": "Recommended by sommelier"
}
```

**Database Update:**
```sql
-- Add link from user wines to scraped catalog
ALTER TABLE wines ADD COLUMN scraped_wine_id INTEGER 
  REFERENCES scraped_wines(id) ON DELETE SET NULL;
```

---

## 🔔 **Phase 4: Price Alerts** 📋 PLANNED

### **4.1 Wine Watch List**
**Goal:** Users can track wines and get notified of price drops

**Features:**
- Add wines to watch list
- Set target price threshold
- Email/push notifications when price drops
- Weekly price digest email

**New Tables:**
```sql
CREATE TABLE wine_watches (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  scraped_wine_id INTEGER REFERENCES scraped_wines(id),
  target_price_cents INTEGER,  -- Alert when below this
  notify_email BOOLEAN DEFAULT true,
  notify_push BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE price_alerts (
  id SERIAL PRIMARY KEY,
  watch_id INTEGER REFERENCES wine_watches(id),
  snapshot_id INTEGER REFERENCES product_snapshots(id),
  old_price_cents INTEGER,
  new_price_cents INTEGER,
  sent_at TIMESTAMP DEFAULT NOW()
);
```

**New API Endpoints:**
```
POST   /api/v1/watches              # Add wine to watch list
GET    /api/v1/watches              # List user's watches
DELETE /api/v1/watches/{id}         # Remove watch
GET    /api/v1/watches/{id}/alerts  # Price alert history
```

**Background Job:**
- Daily cron: check new snapshots vs. watch list
- Send email/push notification for price drops

---

## ⏰ **Phase 5: Automated Scheduling** 📋 PLANNED

### **5.1 Cron-based Scraping**
**Goal:** Automatically refresh wine prices weekly

**Implementation Options:**

**Option A: Render Cron Jobs**
- Create `cron.yaml` in backend
- Weekly schedule: `0 2 * * 1` (Monday 2 AM)
- Endpoint: `POST /api/v1/scraper/cron/weekly`

**Option B: GitHub Actions**
```yaml
name: Weekly Wine Scraper
on:
  schedule:
    - cron: '0 2 * * 1'  # Monday 2 AM UTC
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger scraper
        run: |
          curl -X POST ${{ secrets.API_URL }}/api/v1/scraper/cron/weekly \
            -H "Authorization: Bearer ${{ secrets.CRON_TOKEN }}"
```

**Features:**
- Scrape all enabled sources
- Rate limiting (1 request per 2 seconds)
- Error notification to admin
- Summary email after completion
- Skip sources scraped in last 6 days

**New API Endpoint:**
```
POST /api/v1/scraper/cron/weekly
  - Requires special cron token (not user JWT)
  - Queues jobs for all enabled sources
  - Returns job IDs
```

---

## 🤖 **Phase 6: AI Wine Parsing** 📋 PLANNED

### **6.1 GPT-4 Title Extraction**
**Goal:** Intelligently parse wine details from raw product titles

**Current Problem:**
```
"2019 Domaine Leroy Vosne-Romanée Les Beaux Monts 750ml"
```
Currently extracted as:
- producer: "Unknown"
- cuvee: "2019 Domaine Leroy Vosne-Romanée Les Beaux Monts 750ml"

**Solution: AI Parsing**
```python
async def parse_wine_with_ai(title: str) -> dict:
    prompt = f"""
    Extract wine details from this product title:
    "{title}"
    
    Return JSON:
    {{
      "producer": "Domaine Leroy",
      "cuvee": "Vosne-Romanée Les Beaux Monts",
      "vintage": "2019",
      "region": "Burgundy",
      "appellation": "Vosne-Romanée",
      "volume_ml": 750,
      "style": "Red"
    }}
    """
    
    response = await openai.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)
```

**Features:**
- Batch processing (100 titles per API call)
- Fallback to regex if AI fails
- Cache parsed results
- Admin UI to review/correct AI extractions
- Train on corrections (fine-tuning dataset)

**Cost Estimation:**
- GPT-4: ~$0.03 per 1K tokens
- 100 wine titles ≈ 10K tokens = $0.30
- 10,000 wines = $30 one-time

**Dependencies:**
```
openai==1.50.0
anthropic==0.40.0  # Alternative: Claude
```

---

## 📸 **Phase 7: Image Storage** 📋 PLANNED

### **7.1 Wine Label Image Pipeline**
**Goal:** Download, store, and serve wine label images via CDN

**Architecture:**
```
Scraper → Download Image → S3 Upload → CloudFront CDN → Frontend
```

**Features:**
- Download images during scraping
- Generate thumbnails (200x200, 400x400)
- Store original + thumbnails in S3
- SHA-1 deduplication
- Lazy loading in UI
- Broken image fallback

**AWS Setup:**
```
S3 Bucket: pocket-pallet-wine-images
  - /originals/{sha1}.jpg
  - /thumbs/200/{sha1}.jpg
  - /thumbs/400/{sha1}.jpg

CloudFront Distribution:
  - domain: images.pocketpallet.com
  - Cache TTL: 1 year
```

**Code Example:**
```python
import boto3
from PIL import Image
import httpx
import hashlib

async def download_and_store_image(product: Product, image_url: str):
    # Download
    async with httpx.AsyncClient() as client:
        response = await client.get(image_url)
        img_bytes = response.content
    
    # Calculate SHA-1
    sha1 = hashlib.sha1(img_bytes).hexdigest()
    
    # Check if already stored
    existing = db.query(ProductImage).filter(
        ProductImage.sha1 == sha1
    ).first()
    if existing:
        return existing
    
    # Upload to S3
    s3 = boto3.client('s3')
    bucket = 'pocket-pallet-wine-images'
    
    # Original
    s3.put_object(
        Bucket=bucket,
        Key=f'originals/{sha1}.jpg',
        Body=img_bytes,
        ContentType='image/jpeg'
    )
    
    # Thumbnail
    img = Image.open(BytesIO(img_bytes))
    img.thumbnail((400, 400))
    thumb_buffer = BytesIO()
    img.save(thumb_buffer, 'JPEG')
    
    s3.put_object(
        Bucket=bucket,
        Key=f'thumbs/400/{sha1}.jpg',
        Body=thumb_buffer.getvalue(),
        ContentType='image/jpeg'
    )
    
    # Save metadata
    product_image = ProductImage(
        product_id=product.id,
        src_url=image_url,
        stored_url=f'https://images.pocketpallet.com/originals/{sha1}.jpg',
        sha1=sha1,
        width=img.width,
        height=img.height
    )
    db.add(product_image)
    db.commit()
    
    return product_image
```

**Environment Variables:**
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=pocket-pallet-wine-images
AWS_CLOUDFRONT_DOMAIN=images.pocketpallet.com
```

**Dependencies:**
```
boto3==1.35.80
pillow==11.1.0
```

---

## 📊 **Priority Ranking**

| Phase | Feature | Priority | Effort | Impact | Status |
|---|---|---|---|---|---|
| 2 | Frontend Admin Panel | 🔥 High | Medium | High | 📋 Planned |
| 3 | User Discovery | 🔥 High | Medium | Very High | 📋 Planned |
| 6 | AI Wine Parsing | 🔥 High | Low | Very High | 📋 Planned |
| 5 | Automated Scheduling | ⚡ Medium | Low | High | 📋 Planned |
| 4 | Price Alerts | ⚡ Medium | Medium | High | 📋 Planned |
| 7 | Image Storage | 💡 Low | High | Medium | 📋 Planned |

---

## 🎯 **Recommended Next Steps**

1. **Phase 6 (AI Parsing)** - Quick win, huge impact
   - Improves data quality immediately
   - Low effort (1-2 days)
   - Use OpenAI API

2. **Phase 3 (User Discovery)** - Core product feature
   - Unlocks user value from scraper
   - Medium effort (3-5 days)
   - High user engagement

3. **Phase 2 (Admin Panel)** - Better management
   - Makes scraper maintainable
   - Medium effort (4-6 days)
   - Required for scaling

4. **Phase 5 (Scheduling)** - Automation
   - Reduces manual work
   - Low effort (1 day)
   - Keep data fresh

5. **Phase 4 (Alerts)** - User retention
   - Drives repeat visits
   - Medium effort (3-4 days)
   - Email infrastructure needed

6. **Phase 7 (Images)** - Polish
   - Nice to have
   - High effort (5-7 days)
   - AWS costs

---

## 📝 **Notes**

- All phases designed to be **backward compatible**
- No breaking changes to existing APIs
- Can be implemented **incrementally**
- Each phase adds clear user/admin value

---

**Last Updated:** October 14, 2025  
**Status:** Phase 1 (MVP) Complete ✅

