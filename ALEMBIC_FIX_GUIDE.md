# 🔧 Alembic Migration Fix - Production Stamp Guide

**Issue:** `StringDataRightTruncation` error on Render  
**Cause:** Revision ID `add_tasting_notes_and_wine_ownership` (38 chars) exceeds 32-char limit  
**Solution:** Switch to short hex-like revision IDs and stamp production database

---

## ✅ Migration Chain (Updated)

| File | Old Revision ID | New Revision ID |
|------|----------------|-----------------|
| `001_add_producer_column.py` | `add_producer_column` | `a1b2c3d4e5f6` |
| `002_add_ocr_feedback_table.py` | `add_ocr_feedback_table` | `b2c3d4e5f6g7` |
| `003_add_tasting_notes_and_wine_ownership.py` | `add_tasting_notes_and_wine_ownership` | `c3d4e5f6g7h8` |

**Migration chain:** `None → a1b2c3d4e5f6 → b2c3d4e5f6g7 → c3d4e5f6g7h8`

---

## 🚀 Production Deployment Steps

### Step 1: Identify Current Production State

Your production database currently has:
```sql
SELECT version_num FROM alembic_version;
-- Result: 'add_ocr_feedback_table'
```

This corresponds to the new short ID: `b2c3d4e5f6g7`

### Step 2: Update Render Start Command (Temporary)

**Go to:** Render Dashboard → Your Backend Service → Settings → Start Command

**Replace the current command with:**
```bash
alembic stamp b2c3d4e5f6g7 && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**What this does:**
1. `alembic stamp b2c3d4e5f6g7` - Updates `alembic_version` table to use new short ID
2. `alembic upgrade head` - Runs any pending migrations (in this case, `c3d4e5f6g7h8`)
3. `uvicorn ...` - Starts the application

### Step 3: Trigger Manual Deploy

Click "Manual Deploy" → "Deploy latest commit"

Watch the logs for:
- ✅ `"Stamping revision b2c3d4e5f6g7"`
- ✅ `"Running upgrade b2c3d4e5f6g7 -> c3d4e5f6g7h8"`
- ✅ `"Your service is live 🎉"`

### Step 4: Revert to Normal Start Command

Once deployment succeeds, go back to Settings → Start Command

**Change back to normal:**
```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Save changes. (No need to redeploy immediately - this will apply on next deployment)

---

## 🧪 Verification

### Check Database State

```bash
# Via Render Shell
python -c "from app.db.session import engine; print(engine.execute('SELECT version_num FROM alembic_version').fetchone())"
```

Expected output: `('c3d4e5f6g7h8',)`

### Test Application

1. **Health Check:**
   ```bash
   curl https://pocket-pallet.onrender.com/health
   ```

2. **Test My Wines:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://pocket-pallet.onrender.com/api/v1/wines/my
   ```

3. **Test Tasting Notes:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://pocket-pallet.onrender.com/api/v1/tasting-notes/my
   ```

---

## 🔍 What Changed in Database

### Before (Failed)
```sql
alembic_version.version_num = 'add_ocr_feedback_table'  -- 23 chars (OK)
-- Trying to update to: 'add_tasting_notes_and_wine_ownership'  -- 38 chars (FAIL!)
```

### After (Success)
```sql
alembic_version.version_num = 'b2c3d4e5f6g7'  -- 12 chars (OK)
-- Upgraded to: 'c3d4e5f6g7h8'  -- 12 chars (OK)
```

---

## ⚠️ Important Notes

1. **One-time operation:** You only need to stamp once. Future migrations will use short IDs automatically.

2. **Local vs Production:** Your local database doesn't need stamping if it was created with the new migration files.

3. **If something goes wrong:** You can manually update the database:
   ```sql
   -- Via Render PostgreSQL shell
   UPDATE alembic_version SET version_num = 'b2c3d4e5f6g7';
   ```
   Then run normal migrations.

4. **Future migrations:** Always use short revision IDs (≤32 chars). You can use:
   - `alembic revision --autogenerate -m "description"` (generates short hex IDs)
   - Or manually pick short hex-like strings

---

## 📋 Quick Reference

### Verify Migration Chain Locally

```bash
cd PP_MVP/backend
source venv/bin/activate  # if needed
alembic history -v
```

Expected output:
```
a1b2c3d4e5f6 -> b2c3d4e5f6g7 (head), add_ocr_feedback_table
<base> -> a1b2c3d4e5f6, add producer column to wines
b2c3d4e5f6g7 -> c3d4e5f6g7h8, add tasting_notes table and wine ownership fields
```

### Check Current Head

```bash
alembic current
```

### Manually Stamp (if needed)

```bash
alembic stamp c3d4e5f6g7h8
```

---

## 🎯 Summary

| Action | Status |
|--------|--------|
| ✅ Migration files updated | Complete |
| ✅ Changes pushed to GitHub | Complete |
| ⏳ **Stamp production DB** | **← YOU ARE HERE** |
| ⏳ Run migrations on Render | Next |
| ⏳ Test My Wines & Tasting Notes | After deploy |

---

**Next Step:** Update Render start command and trigger manual deploy!

