# Fix Supabase Database Connection

## Current Status
- ✅ Using port 5432 (correct)
- ✅ Using direct connection (good for development)
- ✅ Migration ran successfully earlier
- ❌ Connection now failing with ECONNREFUSED

---

## Most Likely Issue: Project Paused

**Supabase free tier pauses projects after 1 week of inactivity.**

### Step 1: Check if Project is Paused

1. Go to **https://supabase.com/dashboard**
2. Look at your project
3. If you see a **"Resume Project"** or **"Restore"** button → Your project is paused

**How to fix:**
- Click **"Resume Project"** (takes ~30 seconds)
- Wait for the green "Active" status
- Then test connection: `npx tsx test-db-connection.ts`

---

## Alternative Issues & Fixes

### Issue 2: IP Restrictions

**Check if IP allowlist is blocking you:**

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection Pooling** section
4. Check **"Restrict connections"** settings
5. If enabled, add your IP or disable restrictions for development

---

### Issue 3: Wrong Connection String

**Get a fresh connection string:**

1. **Supabase Dashboard** → Your Project
2. **Settings** → **Database**
3. Under **Connection String**, select:
   - **Session mode** (port 5432) ← Recommended for development
   - **Transaction mode** (port 6543) ← For production with pooling

4. **Copy the connection string**
5. **Replace** `[YOUR-PASSWORD]` with your actual database password
6. **Update `.env.local`:**
   ```bash
   DATABASE_URL=postgresql://postgres.xxxx:[password]@db.xxxx.supabase.co:5432/postgres
   ```

---

### Issue 4: SSL/Connection Parameters

**Your postgres-js client needs specific config for Supabase.**

The current setup in `src/lib/db/index.ts` uses:
```typescript
const client = postgres(connectionString, { prepare: false });
```

**Try adding SSL config:**

We can modify this to:
```typescript
const client = postgres(connectionString, { 
  prepare: false,
  ssl: 'require',  // Force SSL
  max: 1,          // Limit connections for development
});
```

---

## Quick Test Commands

### 1. Test Database Connection
```bash
npx tsx test-db-connection.ts
```

**Expected output:**
```
✅ Database Connected Successfully!
```

### 2. Once Connected, Test RGRS
```bash
npx tsx test-rgrs.ts
```

**Expected output:**
```
✅ Ingestion complete: 12 chunks, 15 facts
✅ Retrieval working with similarity search
```

---

## What to Do Right Now

### Step 1: Resume Project (If Paused)
Go to https://supabase.com/dashboard → Click "Resume Project"

### Step 2: Test Connection
```bash
npx tsx test-db-connection.ts
```

### Step 3: If Still Failing, Try SSL Fix
Tell me, and I'll update `src/lib/db/index.ts` with SSL config.

---

## Supabase Free Tier is Perfect for RGRS

**You don't need to upgrade!** Free tier includes:
- ✅ PostgreSQL with pgvector (already enabled)
- ✅ 500 MB database (more than enough for 25 research papers)
- ✅ Direct connections (what we're using)
- ✅ Session pooling (optional, for production)
- ✅ Up to 2 projects
- ✅ Up to 500 MB data transfer/month (plenty for development)

**RGRS estimated usage:**
- 25 research papers = ~20 MB
- Embeddings (1536 dims × 250 chunks) = ~2 MB
- Facts (~500 triples) = ~100 KB
- **Total: ~22 MB (less than 5% of free tier limit)**

---

## Next Steps

1. **Check if project is paused** → Resume it
2. **Test connection:** `npx tsx test-db-connection.ts`
3. **If working:** Run full RGRS test
4. **If still failing:** Let me know, I'll add SSL config

**The free tier is perfect. We just need to wake up your project!** 🚀

