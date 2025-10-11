# Pocket Pallet Deployment Guide

This guide will help you deploy both the frontend and backend of Pocket Pallet.

## Overview

- **Frontend**: Next.js app deployed on Vercel
- **Backend**: FastAPI app deployed on Railway/Heroku/Render
- **Database**: PostgreSQL

## Backend Deployment

### Option 1: Render (Current Setup - Recommended)

Render is reliable, has great free tier, and excellent PostgreSQL support.

1. **Sign up at [Render.com](https://render.com)**

2. **Create PostgreSQL Database first**
   - Click "New +" → "PostgreSQL"
   - Name: `pocket-pallet-db`
   - Database: `pocket_pallet`
   - User: (auto-generated)
   - Region: Choose closest to you
   - Plan: Free or paid tier
   - Click "Create Database"
   - **Copy the Internal Database URL** (you'll need this)

3. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Repository: Select your Pocket Pallet repo
   - Configure service:
     - **Name**: `pocket-pallet-api`
     - **Root Directory**: `PP_MVP/backend`
     - **Environment**: Python 3
     - **Region**: Same as database
     - **Branch**: main
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free or paid tier

4. **Set environment variables**
   
   In the service's Environment tab, add:
   
   ```
   DATABASE_URL=<paste Internal Database URL from step 2>
   DATABASE_URL_SYNC=<same as DATABASE_URL>
   SECRET_KEY=<generate with: openssl rand -hex 32>
   CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy (takes ~5 minutes first time)
   - Get your backend URL (e.g., `https://pocket-pallet-api.onrender.com`)
   - **Note**: Free tier sleeps after 15 min of inactivity (first request will be slow)

### Option 2: Railway

1. **Sign up at [Railway.app](https://railway.app)**

2. **Create a new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub and select this repository
   - Choose the backend directory: `PP_MVP/backend`

3. **Add PostgreSQL**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically provision a database

4. **Set environment variables**
   
   ```
   SECRET_KEY=<generate with: openssl rand -hex 32>
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DATABASE_URL_SYNC=${{Postgres.DATABASE_URL}}
   CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Deploy**
   - Railway will automatically deploy on every push to main
   - Get your backend URL from the Railway dashboard

### Option 3: Heroku

1. **Install Heroku CLI** and login:
```bash
heroku login
```

2. **Create app and add PostgreSQL**:
```bash
cd PP_MVP/backend
heroku create your-backend-name
heroku addons:create heroku-postgresql:mini
```

3. **Set environment variables**:
```bash
heroku config:set SECRET_KEY=$(openssl rand -hex 32)
heroku config:set CORS_ORIGINS=https://your-frontend.vercel.app
heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. **Deploy**:
```bash
git push heroku main
```


## Frontend Deployment

### Deploy to Vercel

1. **Push your code to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the `PP_MVP/frontend` directory as the root

3. **Configure build settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Set environment variable**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
   
   Replace with your actual backend URL from Railway/Heroku/Render.

5. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a URL like `https://your-app.vercel.app`

6. **Update CORS in backend**:
   - Go back to your backend hosting (Railway/Heroku/Render)
   - Update the `CORS_ORIGINS` environment variable to include your Vercel URL:
   ```
   CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
   ```

## Post-Deployment Setup

### 1. Test the backend

Visit your backend URL and check:
- `https://your-backend.railway.app/` - Should show welcome message
- `https://your-backend.railway.app/health` - Should return `{"status": "healthy"}`
- `https://your-backend.railway.app/docs` - Should show API documentation

### 2. Test the frontend

Visit your Vercel URL:
- Should redirect to login page
- Try registering a new user
- Login should work and redirect to dashboard

### 3. Create first user

Option 1: Use the registration page in your app

Option 2: Use the API directly:
```bash
curl -X POST "https://your-backend.onrender.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "username": "admin",
    "password": "SecurePassword123!"
  }'
```

## Troubleshooting

### Frontend Issues

**Issue**: Can't connect to backend
- Check that `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Verify the backend URL is accessible
- Check browser console for CORS errors

**Issue**: Environment variables not working
- Make sure to redeploy after adding environment variables
- Variables must start with `NEXT_PUBLIC_` to be available in the browser

### Backend Issues

**Issue**: Database connection error
- Verify `DATABASE_URL` is set correctly in environment variables
- Check that PostgreSQL database is running (Render dashboard)
- Make sure you used the **Internal Database URL**, not the external one
- For Render free tier, database may take a moment to wake up

**Issue**: CORS errors
- Add your frontend URL to `CORS_ORIGINS`
- Make sure to include both `http://localhost:3000` (for development) and your Vercel URL
- Restart the backend after changing environment variables

**Issue**: 401 Unauthorized errors
- Check that `SECRET_KEY` is set
- Try logging out and logging back in
- Clear browser localStorage

## Local Development

### Backend
```bash
cd PP_MVP/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your local database credentials
uvicorn app.main:app --reload
```

### Frontend
```bash
cd PP_MVP/frontend
npm install
cp .env.example .env.local
# Edit .env.local to point to your local backend
npm run dev
```

## Monitoring and Logs

### Render
- View logs: Render dashboard → your service → "Logs" tab
- Real-time logs auto-update
- Filter by severity
- Check "Events" tab for deployment history
- Database metrics: PostgreSQL service → "Metrics"

### Railway
- View logs in the Railway dashboard
- Click on your service → "Deployments" → View logs

### Heroku
```bash
heroku logs --tail
```

### Vercel
- View logs in Vercel dashboard
- Click on your deployment → "Logs"
- Filter by type (Build, Function, Edge, Static)

## Security Checklist

- [ ] Change `SECRET_KEY` to a secure random value
- [ ] Use HTTPS for all production URLs
- [ ] Set strong passwords for database
- [ ] Restrict CORS origins to only your frontend domains
- [ ] Never commit `.env` files
- [ ] Use environment-specific configurations
- [ ] Enable database backups
- [ ] Set up monitoring and alerts

## Scaling Considerations

- **Render**: Upgrade to paid plan for:
  - No sleep on inactivity
  - More compute resources
  - Priority support
  - Faster builds
- **Heroku**: Add more dynos or upgrade dyno type
- **Database**: Upgrade Render PostgreSQL plan as data grows
- **CDN**: Vercel automatically provides global CDN for frontend

## Free Tier Limits

### Render Free Tier
- Web Services sleep after 15 minutes of inactivity
- 750 hours/month of runtime
- PostgreSQL: 1GB storage, expires in 90 days
- Shared CPU/RAM
- Good for: Development, testing, low-traffic apps

### Render Paid Plans (from $7/month)
- No sleep
- Dedicated resources
- Persistent databases
- Auto-scaling options

## Support

If you encounter issues:
1. Check the logs in your hosting platform
2. Verify all environment variables are set correctly
3. Test API endpoints directly using the `/docs` interface
4. Check browser console for frontend errors

---

**Note**: Make sure to update the URLs in this guide with your actual deployment URLs.

