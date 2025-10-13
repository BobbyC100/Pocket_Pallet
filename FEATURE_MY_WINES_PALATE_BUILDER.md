# 🍷 Pocket Pallet Feature Specification — "My Wines" & Palate Builder

**Author:** Bobby  
**Date:** October 2025  
**Version:** MVP v1  
**Status:** ✅ **DEPLOYED**

---

## 1️⃣ Overview

This feature introduces two connected modules within Pocket Pallet:

1. **My Wines** → Centralized dashboard for all user-associated wines
   - Wines appear automatically after CSV or OCR import
   - Users can categorize, rate, and flag wines ("Tried", "Want to Try", "Cellar")

2. **Palate Builder** → Guided tasting note and preference-tracking module
   - Helps users learn structured wine vocabulary
   - Records taste profiles used to recommend future wines

**Live at:** `https://pocket-pallet.vercel.app/dashboard`

---

## 2️⃣ Product Goals

| Goal | Description |
|------|-------------|
| **Single Source of Truth** | All imported wines live in one place, synced from both CSV and OCR uploads |
| **Structured Learning** | Users log tastings via standardized "Tasting Notes" |
| **Personalization** | Future recommendation engine can infer user preferences from logged data |
| **Education** | Introduce users to correct wine-tasting vocabulary through guided UI |
| **Consistency** | Tasting notes use fixed categorical fields for predictable analytics |

---

## 3️⃣ User Flow

### Import → My Wines → Palate Builder

1. **Upload via CSV or OCR**
   - User uploads file at `/imports/new` or `/ocr`
   - Backend parses and stores new wines in DB
   - User_id automatically associated on save

2. **View My Wines (Dashboard)**
   - List all wines linked to authenticated user
   - Each card shows:
     - Name, region, vintage, price, notes
     - Status badge (Tried, Want to Try, Cellar)
     - Rating (1–5 stars)

3. **Record Tasting Notes**
   - User clicks "Add Tasting Notes" on wine card
   - Predefined tasting categories appear
   - After submission, tasting data stored in `tasting_notes` table

4. **Build Palate Profile**
   - Aggregates averages per user (e.g., high acidity + medium body + low tannin)
   - Future: recommend wines based on vector similarity between palate + wine profile

---

## 4️⃣ UI / UX Components

### Dashboard (`app/dashboard/page.tsx`)

- Header: "My Wines"
- Quick Actions: Import CSV, Scan OCR, Browse All
- Wine Grid: Displays user's wines with cards

### Wine Card (`app/components/WineCard.tsx`)

```tsx
<Card>
  <h3>{wine.name}</h3>
  <p>{wine.region} — {wine.vintage}</p>
  <p>${wine.price_usd}</p>
  <Badge status={wine.status} />  // Tried | Cellar | Want to Try
  <Rating value={wine.rating} />  // 1–5 stars
  <Button>Add Tasting Notes</Button>
</Card>
```

### Tasting Notes Drawer (`app/components/TastingNotesDrawer.tsx`)

- Appears as a side-drawer/modal form
- Sections: Appearance, Aroma, Palate, Finish
- Fixed vocabulary via dropdowns/sliders to normalize data

---

## 5️⃣ Database Schema

### `tasting_notes` Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Primary Key |
| `wine_id` | FK → wines.id | Related wine |
| `user_id` | FK → users.id | Author |
| `appearance_clarity` | String (enum) | Clear / Hazy / Cloudy |
| `appearance_color` | String | e.g., "Pale Straw", "Ruby", "Deep Amber" |
| `appearance_intensity` | String (enum) | Pale / Medium / Deep |
| `aroma_primary` | String (enum) | Fruit / Floral / Herbal |
| `aroma_secondary` | String (enum) | Yeast / Butter / Vanilla / Toast |
| `aroma_tertiary` | String (enum) | Earth / Leather / Mushroom / Dried Fruit |
| `palate_sweetness` | Integer (1–5) | 1 = Bone Dry → 5 = Sweet |
| `palate_acidity` | Integer (1–5) |  |
| `palate_tannin` | Integer (1–5) |  |
| `palate_body` | Integer (1–5) |  |
| `palate_alcohol` | Integer (1–5) |  |
| `flavor_characteristics` | Text | Notes, e.g. "black cherry, cedar" |
| `finish_length` | Integer (1–5) | Duration of aftertaste |
| `created_at` | Timestamp | Auto |

### `wines` Table (Updated)

New fields added:
- `user_id` (FK → users.id) - Wine ownership
- `status` (String) - "Tried", "Want to Try", "Cellar", null
- `rating` (Integer 1-5) - Star rating

---

## 6️⃣ Backend Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/wines/my` | Return all wines for current user |
| `PATCH` | `/api/v1/wines/{id}/status` | Update wine status (Tried/Want/Cellar) |
| `PATCH` | `/api/v1/wines/{id}/rating` | Update star rating |
| `POST` | `/api/v1/tasting-notes` | Create a new tasting note |
| `GET` | `/api/v1/tasting-notes/by-wine/{wine_id}` | Retrieve tasting notes for one wine |
| `GET` | `/api/v1/tasting-notes/my` | Get all user's tasting notes (paginated) |
| `GET` | `/api/v1/tasting-notes/palate/profile` | Compute palate summary stats |

---

## 7️⃣ Data Flow Diagram

```
CSV / OCR Upload
       ↓
  /imports/new  or  /ocr
       ↓
   FastAPI backend → store in DB (wines) with user_id
       ↓
 Dashboard (/dashboard) → fetch /wines/my
       ↓
  User adds tasting notes → tasting_notes table
       ↓
 Palate Profile → computed via aggregate query
       ↓
 Future: Recommendation Engine
```

---

## 8️⃣ Technical Implementation

### Backend

**Files Created:**
- `app/models/tasting_note.py` - SQLAlchemy model
- `app/schemas/tasting_note.py` - Pydantic schemas
- `app/api/endpoints/tasting_notes.py` - API routes
- `alembic/versions/003_add_tasting_notes_and_wine_ownership.py` - Migration

**Files Modified:**
- `app/models/wine.py` - Added user_id, status, rating
- `app/api/endpoints/wines.py` - Added /my endpoint, status/rating updates
- `app/main.py` - Registered tasting_notes router

### Frontend

**Files Created:**
- `app/types/tasting.ts` - TypeScript types + standardized vocabulary
- `app/components/TastingNotesDrawer.tsx` - Guided note entry form
- `app/components/WineCard.tsx` - Wine card with tasting notes CTA

**Files Modified:**
- `app/services/api.ts` - Added `setAuthToken()` helper
- `app/dashboard/page.tsx` - Redesigned for My Wines view

**Dependencies Added:**
- `react-hook-form` - Form state management

---

## 9️⃣ Deployment

### Database Migration

```bash
# On Render, this runs automatically via start command:
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Migration creates:
- `tasting_notes` table with all fields
- Foreign keys to `wines` and `users`
- Indexes for performance (user_id, wine_id, created_at)
- Wine ownership fields (user_id, status, rating)

### Environment Variables

No new variables needed. Uses existing:
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`

---

## 🔟 Testing Steps

### Manual Testing Flow

1. **Login** at `https://pocket-pallet.vercel.app/login`

2. **Upload Wine List**
   - Go to `/ocr` and upload a wine list image
   - Or go to `/imports/new` and upload CSV

3. **View Dashboard**
   - Navigate to `/dashboard`
   - See "My Wines" grid with uploaded wines

4. **Add Tasting Notes**
   - Click "Add Tasting Notes" on any wine card
   - Fill out appearance, aroma, palate sections
   - Submit

5. **View Palate Profile**
   - Call `GET /api/v1/tasting-notes/palate/profile`
   - See aggregated taste preferences

### API Testing

```bash
# Get user's wines
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://pocket-pallet.onrender.com/api/v1/wines/my

# Create tasting note
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"wine_id": 1, "palate_sweetness": 1, "palate_acidity": 4, "aroma_primary": "Fruit"}' \
  https://pocket-pallet.onrender.com/api/v1/tasting-notes

# Get palate profile
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://pocket-pallet.onrender.com/api/v1/tasting-notes/palate/profile
```

---

## 1️⃣1️⃣ Future Extensions

| Feature | Description |
|---------|-------------|
| **Recommendations** | Use palate vectors + wine features for similarity matching |
| **Social Sharing** | Compare palates with friends |
| **Label Recognition Enhancement** | Auto-link OCR'd labels to existing wines |
| **Cellar Inventory** | Add bottle counts and consumption tracking |
| **"Seen on Menu" Tag** | When scanning a menu, highlight wines the user has logged |
| **ML-based Palate Clustering** | Group users by taste profiles for community recommendations |
| **Tasting Note History** | Show progression of user's palate over time |
| **Export Palate Profile** | Download tasting data for personal records |

---

## 1️⃣2️⃣ Design Principles Alignment

| Banyan Principle | Implementation |
|------------------|----------------|
| **Clarity Creates Possibility** | Consistent, structured categories guide user expression |
| **Design for Human Potential** | Empowers users to understand their taste and make better selections |
| **Align Progress with Meaning** | Each tasting note adds to the personal palate story |
| **Build with Empathy & Precision** | Fixed vocabularies, accessible contrast, mobile-friendly forms |
| **Leave Work Better Than We Found It** | Creates a data foundation for future AI-driven suggestions |

---

## ✅ Implementation Checklist

- [x] Add `tasting_notes` model + migration
- [x] Implement endpoints under `/api/v1/tasting-notes`
- [x] Update `/dashboard` UI with "My Wines" grid
- [x] Add modal for structured tasting inputs
- [x] Sync wine imports → Dashboard automatically (via user_id)
- [x] Wire up auth token in API service
- [x] Deploy backend to Render
- [x] Deploy frontend to Vercel
- [ ] Write smoke tests for CRUD operations *(Future)*
- [ ] Add palate profile visualization *(Future)*

---

## 📊 Success Metrics

### MVP Success Criteria

- ✅ Users can view their wines on dashboard
- ✅ Users can add structured tasting notes
- ✅ Tasting notes stored in database
- ✅ Palate profile calculation available via API
- ✅ Wine ownership tracked per user
- ✅ Status and ratings supported

### Future Metrics to Track

- Tasting notes per user (adoption rate)
- Average time to complete tasting note
- Most common palate profiles
- Correlation between palate profile and wine preferences

---

## 🎓 Educational Value

The structured tasting note system teaches users:
- How to evaluate wine appearance (clarity, color, intensity)
- Primary/secondary/tertiary aroma distinctions
- Palate attributes (sweetness, acidity, tannin, body, alcohol)
- Professional wine vocabulary
- Systematic approach to wine tasting

---

## 📝 Notes

- All text colors meet WCAG-AA contrast requirements (`text-gray-700+` on `bg-wine-50`)
- Form uses `react-hook-form` for efficient state management
- Tasting note drawer uses slide-out panel pattern for mobile-friendly UX
- Wine ownership claimed automatically when user interacts with wine (status/rating/tasting note)
- Future: Add normalization/matching system for duplicate wine detection

---

**End of Specification**

*Built with 🍷 for wine enthusiasts who want to understand and remember what they love*

