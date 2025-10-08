# Railway Build Error - Troubleshooting Guide

## 🔴 If Build Fails

### Quick Fixes (Try These First)

#### Fix 1: Use Minimal Requirements
Railway might be timing out with heavy dependencies. Try:

1. In Railway dashboard → Your service → Settings
2. Under "Build", add custom build command:
   ```
   pip install --no-cache-dir -r requirements-minimal.txt
   ```
3. Redeploy

#### Fix 2: Increase Build Timeout
1. Railway Settings → Build timeout
2. Set to maximum (20 minutes)

#### Fix 3: Check Python Version
Make sure Railway is using Python 3.11:
1. Verify `runtime.txt` exists with `python-3.11.6`
2. Or set in Railway variables:
   ```
   NIXPACKS_PYTHON_VERSION=3.11
   ```

#### Fix 4: Use Render Instead (Easier Alternative)

If Railway keeps failing, **Render.com** often works better:

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub → Select `Pocket_Pallet` repo
4. Configure:
   - **Name:** pocket-pallet-api
   - **Root Directory:** `PP_MVP/backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. Add PostgreSQL database (free tier available)
6. Set environment variables (same as Railway guide)
7. Deploy!

### Common Build Errors

#### Error: "No module named 'app'"
**Fix:** Make sure Root Directory is set to `PP_MVP/backend`

#### Error: "Could not find a version that satisfies the requirement"
**Fix:** Use `requirements-minimal.txt` or update package versions

#### Error: "Out of memory"
**Fix:** Remove heavy dependencies (pandas, pyarrow, boto3) temporarily

#### Error: "Build timeout"
**Fix:** Use Render or upgrade Railway plan

### Step-by-Step: Switch to Minimal Requirements

If you need to simplify:

1. **Backup your current requirements:**
   ```bash
   cp requirements.txt requirements-full.txt
   ```

2. **Use minimal version:**
   ```bash
   cp requirements-minimal.txt requirements.txt
   git add requirements.txt
   git commit -m "Deploy: Use minimal requirements for Railway"
   git push
   ```

3. **Redeploy on Railway**

4. **What you'll lose temporarily:**
   - Bulk import (pandas, pyarrow)
   - Celery background jobs (redis, celery)
   - AWS S3 storage (boto3)
   - Testing dependencies (pytest, faker)

5. **What still works:**
   - ✅ All core API endpoints
   - ✅ Manual wine/producer entry
   - ✅ Authentication
   - ✅ Database operations
   - ✅ Fuzzy matching
   - ✅ Review queue

You can add back features incrementally once the core is deployed.

### Alternative: Deploy Locally First

Test if your code runs:

```bash
cd PP_MVP/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

If this fails, fix local errors first before deploying.

### Get Railway Logs

To see exact error:

1. Railway Dashboard → Your service
2. Deployments tab → Click failed deployment
3. View Logs
4. Copy the error message

Common errors and fixes:

```
ERROR: No matching distribution found for iso4217
→ Update to: iso4217parse==0.3.0

ERROR: Could not build wheels for psycopg2-binary
→ Railway needs postgresql system package (already in nixpacks.toml)

ERROR: Module 'app' has no attribute 'main'
→ Check that app/main.py exists and has correct imports
```

### Last Resort: Fresh Deploy

If nothing works:

1. Delete the Railway service
2. Create new Railway project
3. Deploy just the database first
4. Then deploy backend with minimal requirements
5. Add features back one by one

### Check if Backend Needs Redis

If you don't need background jobs yet:

1. Remove Celery/Redis from code temporarily
2. Comment out celery imports in `app/main.py`
3. Deploy without those dependencies
4. Add back later when needed

---

## ✅ Once Fixed

After successful deployment:

1. Test health endpoint: `curl https://your-app.up.railway.app/health`
2. Check logs for any runtime errors
3. Update Vercel with backend URL
4. Create admin user
5. Test login

## 🆘 Still Stuck?

Share the exact error from Railway logs and I can help debug further!

