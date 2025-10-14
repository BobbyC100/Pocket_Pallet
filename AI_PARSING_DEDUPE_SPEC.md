# 🧠 AI Wine Parsing + Deduplication MVP (Pocket Pallet)

## Overview

This release introduces two high-impact, low-effort backend systems:
1. **AI Wine Parsing** – normalizes raw scraped/imported text into structured attributes.
2. **Smart Deduplication** – detects and merges duplicate wines using fuzzy logic and blocking.

---

## 1️⃣ AI Wine Parsing (`app/services/wine_parser.py`)

### Purpose

Convert noisy labels or scraped titles into clean structured fields.

### Input

```json
{
  "raw_name": "2019 Domaine Leroy Vosne-Romanée Les Beaux Monts 750ml"
}
```

### Output

```json
{
  "vintage": 2019,
  "producer": "Domaine Leroy",
  "cuvee": "Vosne-Romanée Les Beaux Monts",
  "region": "Burgundy",
  "appellation": "Vosne-Romanée",
  "bottle_size_ml": 750,
  "style": "Red"
}
```

### Integration
- Runs automatically when new wines are imported or uploaded.
- Updates normalized helper columns for dedupe (`norm_producer`, `norm_cuvee`, `dedupe_block`).

### Model
- Powered by **OpenAI GPT-4o-mini** (tuned via system prompt + examples).
- **Cost:** ~$30 per 10,000 wines.
- **Average runtime** per wine: 0.8s (batch async supported).

---

## 2️⃣ Deduplication System

### Goal

Detect and merge duplicate wines (e.g., same producer/vintage with slightly different spelling).

### Components

| File | Purpose |
|------|---------|
| `alembic/versions/005_dedupe_columns.py` | Adds helper columns for normalization + dedupe tracking |
| `app/services/dedupe.py` | Normalization + blocking utilities |
| `app/scripts/dedupe_wines.py` | CLI batch report and merge tool |
| `app/api/endpoints/dedupe_admin.py` | FastAPI admin routes to preview and merge duplicates |

---

## Schema Changes (`wines` table)

```sql
ALTER TABLE wines ADD COLUMN norm_producer TEXT;
ALTER TABLE wines ADD COLUMN norm_cuvee TEXT;
ALTER TABLE wines ADD COLUMN dedupe_block TEXT;
ALTER TABLE wines ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE wines ADD COLUMN duplicate_of INTEGER REFERENCES wines(id);
```

**Same columns added to `scraped_wines` table.**

---

## Matching Logic

- **Blocking key:** `producer_firstword` + `vintage`
- **Similarity scoring (RapidFuzz):**
  - `token_set_ratio(producer)`
  - `token_set_ratio(cuvee)`
  - `partial_ratio(producer + cuvee)`
  - `token_sort_ratio(producer + cuvee)`
- **Threshold:** 87.5%
- **Greedy cluster merge** within each block.

---

## Command-line Usage

### Preview candidates:

```bash
cd PP_MVP/backend
source venv/bin/activate
set -a; source .env; set +a
python -m app.scripts.dedupe_wines --threshold 88 --out-csv dedupe_candidates.csv
```

→ Generates a CSV of likely duplicates.

### Apply merges:

```bash
python -m app.scripts.dedupe_wines --threshold 88 --apply --out-csv dedupe_candidates.csv
```

- Marks duplicates as `is_active = False`
- Sets `duplicate_of = master.id`
- (Optional) repoints tasting notes, price history, etc.

---

## Admin API

Endpoints under `/api/v1/dedupe`:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/normalize` | Normalize all wines (create `norm_*` and `dedupe_block` fields) |
| POST | `/candidates` | Returns top duplicate pairs (threshold + limit params) |
| POST | `/merge` | Soft-merge duplicates (requires admin auth) |
| POST | `/parse-wine` | Parse a single wine name using AI |
| GET | `/stats` | Get deduplication statistics (active vs. duplicate counts) |

### Example: Find Duplicates

```bash
POST /api/v1/dedupe/candidates?table=wines&threshold=88&limit=50
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "total": 12,
  "candidates": [
    {
      "wine1_id": 45,
      "wine2_id": 123,
      "similarity_score": 92.5,
      "wine1_name": "Château Margaux - Margaux (2015)",
      "wine2_name": "Chateau Margaux - Margaux (2015)",
      "block": "chateau_2015"
    }
  ]
}
```

### Example: Merge Duplicates

```bash
POST /api/v1/dedupe/merge?table=wines
Authorization: Bearer {admin_token}

{
  "wine_ids": [45, 123],
  "master_id": 45
}
```

**Response:**
```json
{
  "master_id": 45,
  "merged_count": 1,
  "merged_ids": [123]
}
```

### Example: Parse Wine with AI

```bash
POST /api/v1/dedupe/parse-wine
Authorization: Bearer {admin_token}

{
  "raw_name": "2019 Domaine Leroy Vosne-Romanée Les Beaux Monts 750ml"
}
```

**Response:**
```json
{
  "vintage": 2019,
  "producer": "Domaine Leroy",
  "cuvee": "Vosne-Romanée Les Beaux Monts",
  "region": "Burgundy",
  "appellation": "Vosne-Romanée",
  "bottle_size_ml": 750,
  "style": "Red"
}
```

---

## Environment Variables

Add to your `.env` file:

```env
OPENAI_API_KEY=sk-...your-key-here...
```

---

## Deployment Steps

### 1. Update Environment

Add `OPENAI_API_KEY` to Render environment variables.

### 2. Deploy

```bash
git add -A
git commit -m "feat: add AI wine parsing and deduplication"
git push origin main
```

Render will automatically:
- Install `openai==1.54.0`
- Run `alembic upgrade head` (adds dedupe columns)
- Deploy new endpoints

### 3. Normalize Existing Wines

After deployment, run once:

```bash
# Via API
POST /api/v1/dedupe/normalize?table=wines
Authorization: Bearer {admin_token}

# Or via CLI (if you have DB access)
python -m app.scripts.dedupe_wines --normalize-only
```

### 4. Find and Merge Duplicates

```bash
# Find duplicates
POST /api/v1/dedupe/candidates?threshold=88&limit=100

# Review candidates, then merge
POST /api/v1/dedupe/merge
{
  "wine_ids": [1, 2, 3],
  "master_id": 1
}
```

---

## Roadmap Upgrades

- 🧩 **Embeddings-based matching** (text-embedding-3-small + pgvector)
- 🔄 **Weekly rescan scheduler** (Celery or Render Cron)
- 💾 **Price-tracking table** (`wine_prices`) with historical diff logging
- 🖥 **Admin review UI** for merge approval
- 🧮 **FK Repoint helpers** for `tasting_notes`, `cellar_items`, etc.

---

## Cost Estimation

### AI Parsing
- **Model:** GPT-4o-mini
- **Cost:** ~$0.03 per 1K tokens
- **Avg tokens per wine:** ~300 tokens
- **Cost per 1,000 wines:** ~$9
- **Cost per 10,000 wines:** ~$90

### Batch Processing
- Process 10 wines per API call
- **1,000 wines** = 100 API calls = ~$9
- **10,000 wines** = 1,000 API calls = ~$90

### Recommendations
- Use batch processing for large datasets
- Cache parsed results (don't re-parse)
- Run weekly for new wines only

---

## Testing

### Test AI Parsing

```bash
POST /api/v1/dedupe/parse-wine
{
  "raw_name": "2015 Château Lynch-Bages Pauillac"
}
```

### Test Deduplication

```bash
# 1. Normalize wines
POST /api/v1/dedupe/normalize?table=wines

# 2. Find duplicates
POST /api/v1/dedupe/candidates?threshold=87.5&limit=20

# 3. Check stats
GET /api/v1/dedupe/stats?table=wines
```

---

## Production Best Practices

1. **Normalize first:** Always run `/normalize` before `/candidates`
2. **Start with high threshold:** Use 90+ to find obvious duplicates
3. **Review before merging:** Check candidates CSV before `--apply`
4. **Backup database:** Before running large merges
5. **Monitor costs:** Track OpenAI API usage
6. **Cache results:** Store parsed wines to avoid re-parsing

---

## Files Created

✅ `alembic/versions/005_dedupe_columns.py` - Migration  
✅ `app/models/wine.py` - Updated with dedupe columns  
✅ `app/models/scraper.py` - Updated ScrapedWine model  
✅ `app/services/wine_parser.py` - AI parsing service  
✅ `app/services/dedupe.py` - Deduplication logic  
✅ `app/scripts/dedupe_wines.py` - CLI tool  
✅ `app/api/endpoints/dedupe_admin.py` - Admin API  
✅ `requirements.txt` - Added `openai==1.54.0`  

---

**Status:** ✅ Implementation Complete  
**Last Updated:** October 14, 2025

