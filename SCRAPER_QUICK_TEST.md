# 🧪 Quick Scraper Test Guide

Two ways to test the wine scraper without building UI.

---

## 🐍 **Option A: Python Test Script** (Recommended)

Run the automated test script that creates a source, scrapes, and shows results.

### **Setup**
```bash
cd PP_MVP/backend
source venv/bin/activate  # or create: python3 -m venv venv
pip install -r requirements.txt
```

### **Run Test**
```bash
python test_scraper.py
```

**What it does:**
1. ✅ Creates test source (Wine.com red wines)
2. ✅ Scrapes 1 page (~24 products)
3. ✅ Shows products and wines found
4. ✅ Asks if you want to clean up test data

**Expected Output:**
```
============================================================
🍷 WINE SCRAPER TEST
============================================================

1️⃣  Creating test source...
   ✅ Created source: Test - Wine.com Red Wines (ID: 1)

2️⃣  Running scraper (max 1 page)...

   📊 Scrape Results:
   • Products found: 24
   • Wines created: 0
   • Snapshots created: 24

3️⃣  Fetching results from database...

   📦 Products (5 shown):
      • 2019 Château Lynch-Bages Pauillac 750ml
        URL: https://www.wine.com/product/...
        Price: $95.99 | ✅ In Stock
      
      • 2020 Domaine Drouhin Pinot Noir 750ml
        URL: https://www.wine.com/product/...
        Price: $42.99 | ✅ In Stock
      ...

4️⃣  Cleanup:
   Delete test data? (y/N):
```

---

## 🌐 **Option B: API Testing** (FastAPI Docs)

Test via browser using interactive API documentation.

### **Step 1: Login**

1. Visit: `https://<your-backend>.onrender.com/docs`
2. Click **"Authorize"** button (top right, 🔒 icon)
3. Enter credentials:
   - **username:** `bobbyciccaglione@gmail.com`
   - **password:** `your-password`
4. Click **"Authorize"** then **"Close"**

### **Step 2: Create Source**

1. Scroll to **"scraper"** section
2. Find `POST /api/v1/scraper/sources`
3. Click **"Try it out"**
4. Paste this JSON:

```json
{
  "name": "Test Wine Retailer",
  "base_url": "https://www.wine.com/list/wine/7155",
  "product_link_selector": "a.prodItemInfo_link",
  "pagination_next_selector": "a.pageLink_next",
  "use_playwright": false,
  "enabled": true
}
```

5. Click **"Execute"**
6. **Save the `id`** from response (e.g., `"id": 1`)

### **Step 3: Start Scrape Job**

1. Find `POST /api/v1/scraper/scrape`
2. Click **"Try it out"**
3. Paste:

```json
{
  "source_id": 1,
  "max_pages": 1,
  "force": false
}
```

4. Click **"Execute"**
5. **Save the `job_id`** from response

### **Step 4: Check Job Status**

1. Find `GET /api/v1/scraper/jobs/{job_id}`
2. Click **"Try it out"**
3. Enter your `job_id`
4. Click **"Execute"**

**Wait for `"status": "completed"`** (refresh by clicking Execute again)

### **Step 5: View Results**

**A) View Scraped Wines:**
1. Find `GET /api/v1/scraper/wines`
2. Click **"Try it out"**
3. Set `limit: 10`
4. Click **"Execute"**

**B) View Products:**
1. Find `GET /api/v1/scraper/products`
2. Click **"Try it out"**
3. Set `source_id: 1` (your source)
4. Set `limit: 10`
5. Click **"Execute"**

---

## 📊 **Option C: Database Query**

View raw data directly in PostgreSQL.

### **Via Render Dashboard**

1. Render Dashboard → Your **PostgreSQL Database**
2. Click **"Shell"** tab
3. Run queries:

```sql
-- Check sources
SELECT * FROM sources;

-- Check products
SELECT id, title_raw, product_url 
FROM products 
LIMIT 5;

-- Check snapshots (prices)
SELECT ps.fetched_at, ps.price_cents, ps.in_stock, p.title_raw
FROM product_snapshots ps
JOIN products p ON ps.product_id = p.id
ORDER BY ps.fetched_at DESC
LIMIT 10;

-- Check scraped wines
SELECT * FROM scraped_wines LIMIT 5;
```

---

## 🎯 **What to Expect**

### **Current Behavior**

✅ **What Works:**
- Creates sources
- Scrapes product listings
- Stores products and price snapshots
- Background job processing

⚠️ **Known Limitations:**
- Wine parsing is basic (creates generic wine records)
- No AI extraction yet (producer/vintage not parsed properly)
- Images not downloaded
- No frontend to view results

### **Typical Results**

From 1 page of Wine.com:
- **Products found:** 20-30
- **Snapshots created:** 20-30 (one per product)
- **Wines created:** 0-5 (basic parsing, often fails to create wine)

**Why so few wines?**
The scraper stores **products** but doesn't always create **wines** because:
1. Wine name parsing is basic (needs AI - see TODO list)
2. Duplicate detection needs improvement
3. Some products fail validation

---

## 🐛 **Troubleshooting**

### **"403 Forbidden" on scraper endpoints**
→ Your email (`bobbyciccaglione@gmail.com`) needs to be in the admin whitelist.
→ Check: `PP_MVP/backend/app/api/endpoints/scraper.py` line 30

### **Job stuck in "running" status**
→ Background task failed silently
→ Check Render logs for errors
→ Try a simpler source (fewer products)

### **No products found**
→ CSS selectors might be wrong for that site
→ Website might block scrapers
→ Try with `"use_playwright": true` (not implemented yet)

### **Database errors**
→ Make sure migration ran: `alembic upgrade head`
→ Check Render deployment logs

---

## 📝 **Next Steps After Testing**

Once you verify scraping works:

1. ✅ **Simple Admin UI** (top of TODO list)
   - View scraped wines in browser
   - Monitor scrape jobs
   - Manage sources

2. 🤖 **AI Wine Parsing** (high priority)
   - Extract producer/vintage/region properly
   - Dramatically improve wine quality

3. 🔍 **User Discovery** (core feature)
   - Let users browse scraped wines
   - "Add to My Wines" button

---

## 💡 **Pro Tips**

- **Start small:** Use `max_pages: 1` for testing
- **Check logs:** Render → Your Backend → Logs
- **Clean up:** Delete test sources after validating
- **Rate limiting:** Be respectful, don't scrape aggressively

---

**Happy Testing!** 🍷

Found issues? Check `SCRAPER_README.md` for troubleshooting.

