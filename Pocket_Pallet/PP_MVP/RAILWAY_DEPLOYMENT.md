# Railway Deployment Guide

## 🚂 Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign in with GitHub

### Step 2: Deploy from GitHub

1. Click **"Deploy from GitHub repo"**
2. Select **`BobbyC100/Pocket_Pallet`**
3. Railway will detect your project

### Step 3: Configure Root Directory

1. In the deployment settings, set:
   - **Root Directory:** `PP_MVP/backend`
   - This tells Railway to only deploy the backend folder

### Step 4: Add PostgreSQL Database

1. Click **"+ New"** in your project
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway automatically provisions a PostgreSQL database
4. Connection string is auto-generated

### Step 5: Add Environment Variables

Railway will auto-generate some, but you need to add these manually:

Click on your **backend service** → **Variables** → **Raw Editor**, paste:

```env
# Database (Railway auto-provides DATABASE_URL)
DATABASE_URL_SYNC=${DATABASE_URL}

# Security - CHANGE THESE!
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis & Celery (add Redis service first)
REDIS_URL=${REDIS_URL}
CELERY_BROKER_URL=${REDIS_URL}
CELERY_RESULT_BACKEND=${REDIS_URL}

# Storage
STORAGE_TYPE=local
STORAGE_PATH=./storage

# Application
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://pocket-pallet.vercel.app,https://pocket-pallet-*.vercel.app

# Import Settings
MAX_UPLOAD_SIZE_MB=5000
CHUNK_SIZE_MB=100
VALIDATION_SAMPLE_SIZE=1000
AUTO_MERGE_THRESHOLD=0.90
REVIEW_THRESHOLD=0.75
```

### Step 6: Add Redis (Optional but Recommended)

For background jobs (imports):

1. Click **"+ New"** → **"Database"** → **"Add Redis"**
2. Railway auto-configures `REDIS_URL`

### Step 7: Generate SECRET_KEY

```python
# Run this locally to generate a secure key
import secrets
print(secrets.token_urlsafe(32))
```

Copy the output and paste as `SECRET_KEY` in Railway variables.

### Step 8: Deploy!

1. Railway automatically deploys on push
2. Watch the build logs
3. Once deployed, you'll get a URL like: `https://your-app.up.railway.app`

### Step 9: Update Vercel Environment Variable

1. Go to Vercel Dashboard → Pocket Pallet Project
2. Settings → Environment Variables
3. Add/Update:
   ```
   VITE_API_URL=https://your-app.up.railway.app/api/v1
   ```
4. Redeploy frontend

### Step 10: Create Admin User

Once backend is live, create your first admin:

```bash
# SSH into Railway (or use Railway CLI)
railway run python -c "
import asyncio
from app.db.session import AsyncSessionLocal
from app.services.user import create_user
from app.schemas.user import UserCreate, Role

async def create_admin():
    async with AsyncSessionLocal() as db:
        await create_user(db, UserCreate(
            email='admin@yourcompany.com',
            password='ChangeThisPassword123!',
            full_name='Admin User',
            role=Role.ADMIN
        ))
        print('✅ Admin created')

asyncio.run(create_admin())
"
```

## ✅ Verification Checklist

- [ ] Backend deployed to Railway
- [ ] PostgreSQL database connected
- [ ] Redis connected (optional)
- [ ] Environment variables set
- [ ] SECRET_KEY generated and added
- [ ] CORS_ORIGINS includes Vercel URL
- [ ] Migrations ran successfully
- [ ] Backend URL works: `https://your-app.up.railway.app/health`
- [ ] Vercel env var updated with backend URL
- [ ] Frontend redeployed
- [ ] Admin user created
- [ ] Can login at `https://pocket-pallet.vercel.app/login`

## 🔧 Troubleshooting

### Build Fails
- Check Railway build logs
- Verify `requirements.txt` is in `PP_MVP/backend/`
- Ensure Python version is 3.11+

### Database Connection Error
- Check `DATABASE_URL` is set
- Verify `DATABASE_URL_SYNC` references `${DATABASE_URL}`
- Check migrations ran: `alembic upgrade head`

### CORS Errors
- Add your Vercel URL to `CORS_ORIGINS`
- Include preview URLs: `https://pocket-pallet-*.vercel.app`

### 500 Errors
- Check Railway logs: Click service → Deployments → View Logs
- Verify all environment variables are set
- Check SECRET_KEY is at least 32 characters

## 🚀 Alternative: Render

If Railway doesn't work, try Render:

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Root Directory:** `PP_MVP/backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add PostgreSQL database
6. Set environment variables (same as above)

## 📊 Cost Estimate

**Railway Free Tier:**
- $5/month credit (includes usage)
- PostgreSQL + Redis included
- Auto-sleeps after inactivity
- Perfect for MVP testing

**Paid (if needed):**
- ~$10-20/month for production workload

## 🎯 Post-Deployment

Once everything is running:

1. Test API: `curl https://your-app.up.railway.app/health`
2. Test frontend: Visit your Vercel URL
3. Try logging in with admin credentials
4. Create your first producer
5. Import some wine data

## 🆘 Need Help?

If you get stuck:
1. Check Railway logs
2. Check Vercel deployment logs
3. Verify all environment variables
4. Test API endpoints directly
5. Check CORS configuration

---

**Your Stack:**
- Frontend: Vercel (React + TypeScript)
- Backend: Railway (FastAPI + Python)
- Database: Railway PostgreSQL
- Cache/Queue: Railway Redis (optional)

Perfect for MVPs and production! 🚀

