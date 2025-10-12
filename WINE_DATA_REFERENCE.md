# Wine Data Reference - Models & Schemas

This document contains the complete data structure for wines in Pocket Pallet.

---

## 🗄️ Database Model

**File**: `PP_MVP/backend/app/models/wine.py`

```python
from sqlalchemy import Column, String, Float, Text, Integer
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from app.db.base import Base


class Wine(Base):
    __tablename__ = "wines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False, index=True)
    price_usd = Column(Float, nullable=True)
    url = Column(String, nullable=True)
    region = Column(String, nullable=True, index=True)
    grapes = Column(String, nullable=True)
    vintage = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### Field Descriptions

| Field | Type | Nullable | Indexed | Description |
|-------|------|----------|---------|-------------|
| `id` | Integer | No | Yes | Primary key, auto-incrementing |
| `name` | String | No | Yes | Wine name (e.g., "Niepoort Nat Cool Vinho Verde Branco") |
| `price_usd` | Float | Yes | No | Price in US dollars |
| `url` | String | Yes | No | Product URL (usually from buvonswine.com) |
| `region` | String | Yes | Yes | Wine region (e.g., "Vinho Verde, Portugal") |
| `grapes` | String | Yes | No | Grape varieties (e.g., "Azal + Arinto + Avesso") |
| `vintage` | String | Yes | No | Vintage year (e.g., "2023", "NV" for non-vintage) |
| `notes` | Text | Yes | No | Tasting notes, production details |
| `created_at` | DateTime | No | No | Timestamp when record was created |
| `updated_at` | DateTime | Yes | No | Timestamp when record was last updated |

### Database Indexes
- `id` (primary key)
- `name` (for searching/filtering)
- `region` (for filtering by region)

---

## 📋 Pydantic Schemas

**File**: `PP_MVP/backend/app/schemas/wine.py`

```python
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class WineBase(BaseModel):
    name: str
    price_usd: Optional[float] = None
    url: Optional[str] = None
    region: Optional[str] = None
    grapes: Optional[str] = None
    vintage: Optional[str] = None
    notes: Optional[str] = None


class WineCreate(WineBase):
    pass


class WineResponse(WineBase):
    id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ImportResponse(BaseModel):
    ok: bool
    rows: int
    message: str
```

### Schema Usage

#### `WineBase`
- Base schema with all wine fields
- Used as parent for other schemas
- All fields except `name` are optional

#### `WineCreate`
- Used for creating new wines via API
- Inherits all fields from `WineBase`
- Example:
  ```json
  {
    "name": "Domaine XYZ Pinot Noir",
    "price_usd": 45.0,
    "region": "Burgundy, France",
    "grapes": "Pinot Noir",
    "vintage": "2022"
  }
  ```

#### `WineResponse`
- Used for returning wine data from API
- Includes `id` and `created_at` (read-only fields)
- Configured to convert SQLAlchemy model to Pydantic
- Example:
  ```json
  {
    "id": 123,
    "name": "Domaine XYZ Pinot Noir",
    "price_usd": 45.0,
    "url": "https://...",
    "region": "Burgundy, France",
    "grapes": "Pinot Noir",
    "vintage": "2022",
    "notes": "Organic, biodynamic...",
    "created_at": "2025-10-12T10:30:00Z"
  }
  ```

#### `ImportResponse`
- Used for CSV import results
- Example:
  ```json
  {
    "ok": true,
    "rows": 16,
    "message": "Successfully imported 16 wines"
  }
  ```

---

## 📄 CSV Import Format

**Expected CSV Columns** (as defined in `Buvons_sample_wines__for_import_.csv`):

```csv
name,price_usd,url,region,grapes,vintage,notes
```

### Column Details

| Column | Required | Type | Example |
|--------|----------|------|---------|
| `name` | **Yes** | String | "Niepoort Nat Cool Vinho Verde Branco" |
| `price_usd` | No | Number | 30.0 |
| `url` | No | String | "https://www.buvonswine.com/..." |
| `region` | No | String | "Vinho Verde, Portugal" |
| `grapes` | No | String | "Azal + Arinto + Avesso + Trajadura" |
| `vintage` | No | String | "2023" or "NV" |
| `notes` | No | Text | "Organic; native yeasts; stainless" |

### Import Behavior

1. **Required Field**: Only `name` is required
2. **Empty Values**: Empty cells or "NaN" values are stored as `NULL` in database
3. **Skipped Rows**: Rows with empty/blank names are skipped
4. **Data Types**: 
   - `price_usd` converted to float
   - All other fields stored as strings
   - Whitespace is trimmed

### Sample CSV Rows

```csv
name,price_usd,url,region,grapes,vintage,notes
"Niepoort ""Nat Cool"" Vinho Verde Branco",30.0,https://www.buvonswine.com/collections/wine/products/niepoort-nat-cool-branco,"Vinho Verde, Portugal",Azal + Arinto + Avesso + Trajadura + Loureiro,2023,Organic; native yeasts; stainless; slight fizz
"Azimut ""Brut Nature"" Cava",25.0,https://www.buvonswine.com/collections/wine/products/azimut-brut-nature-cava,"Penedes, Catalonia, Spain",Macabeu + Xarel-lo + Parellada,NV,Organic; bottle-fermented; no dosage
```

---

## 🔌 API Endpoints

### List Wines
```
GET /api/v1/wines?skip=0&limit=100
```

**Query Parameters**:
- `skip` (int, default=0): Number of records to skip (pagination)
- `limit` (int, default=100, max=500): Number of records to return

**Response**:
```json
[
  {
    "id": 1,
    "name": "Niepoort Nat Cool Vinho Verde Branco",
    "price_usd": 30.0,
    "url": "https://...",
    "region": "Vinho Verde, Portugal",
    "grapes": "Azal + Arinto + Avesso + Trajadura + Loureiro",
    "vintage": "2023",
    "notes": "Organic; native yeasts; stainless; slight fizz",
    "created_at": "2025-10-12T10:30:00Z"
  },
  ...
]
```

### Count Wines
```
GET /api/v1/wines/count
```

**Response**:
```json
{
  "count": 16
}
```

### Get Single Wine
```
GET /api/v1/wines/{wine_id}
```

**Response**:
```json
{
  "id": 1,
  "name": "Niepoort Nat Cool Vinho Verde Branco",
  "price_usd": 30.0,
  ...
}
```

**Error (404)**:
```json
{
  "detail": "Wine not found"
}
```

### Import CSV
```
POST /api/v1/imports/csv
Content-Type: multipart/form-data
```

**Request**:
```
file: <wine_data.csv>
```

**Response (Success)**:
```json
{
  "ok": true,
  "rows": 16,
  "message": "Successfully imported 16 wines"
}
```

**Response (Error)**:
```json
{
  "detail": "Only .csv files are allowed"
}
```

---

## 🔍 SQL Queries

### Get all wines
```sql
SELECT * FROM wines 
ORDER BY created_at DESC;
```

### Count wines
```sql
SELECT COUNT(*) FROM wines;
```

### Search by name
```sql
SELECT * FROM wines 
WHERE name ILIKE '%vinho verde%';
```

### Filter by region
```sql
SELECT * FROM wines 
WHERE region LIKE '%France%';
```

### Wines by price range
```sql
SELECT * FROM wines 
WHERE price_usd BETWEEN 20 AND 50
ORDER BY price_usd;
```

### Recent imports
```sql
SELECT * FROM wines 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

---

## 🆕 Future Enhancements (Not Yet Implemented)

### Potential New Fields
- `producer` (String) - Wine producer/winery
- `color` (Enum: red, white, rosé, orange, sparkling)
- `country` (String) - Separate from region
- `abv` (Float) - Alcohol by volume percentage
- `bottle_size` (String) - e.g., "750ml", "1.5L"
- `in_stock` (Boolean) - Availability flag
- `user_rating` (Float) - User's personal rating
- `favorite` (Boolean) - User's favorite flag
- `user_notes` (Text) - User's personal notes
- `purchased_date` (Date) - When user bought it
- `consumed_date` (Date) - When user drank it
- `image_url` (String) - Wine label photo

### Potential Relations
- `user_id` (Foreign Key) - Link wine to user's collection
- `tasting_notes` (One-to-Many) - Separate table for detailed notes
- `pairings` (Many-to-Many) - Food pairings
- `similar_wines` (Many-to-Many) - Related wines

---

## 📊 Sample Data

Based on `Buvons_sample_wines__for_import_.csv`, here are the first 3 wines:

### Wine 1
```json
{
  "id": 1,
  "name": "Niepoort \"Nat Cool\" Vinho Verde Branco",
  "price_usd": 30.0,
  "url": "https://www.buvonswine.com/collections/wine/products/niepoort-nat-cool-branco",
  "region": "Vinho Verde, Portugal",
  "grapes": "Azal + Arinto + Avesso + Trajadura + Loureiro",
  "vintage": "2023",
  "notes": "Organic; native yeasts; stainless; slight fizz"
}
```

### Wine 2
```json
{
  "id": 2,
  "name": "Azimut \"Brut Nature\" Cava",
  "price_usd": 25.0,
  "url": "https://www.buvonswine.com/collections/wine/products/azimut-brut-nature-cava",
  "region": "Penedes, Catalonia, Spain",
  "grapes": "Macabeu + Xarel-lo + Parellada",
  "vintage": "NV",
  "notes": "Organic; bottle-fermented; no dosage"
}
```

### Wine 3
```json
{
  "id": 3,
  "name": "Lestignac \"Michel-Michel\"",
  "price_usd": 32.0,
  "url": "https://www.buvonswine.com/collections/wine",
  "region": null,
  "grapes": null,
  "vintage": null,
  "notes": null
}
```

---

**End of Document**

