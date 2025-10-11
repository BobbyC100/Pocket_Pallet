# Pocket Pallet - Quick Start Guide

## 🚀 What Was Created

I've built a complete full-stack wine management application for you:

### Frontend (Next.js + React + TypeScript + Tailwind CSS)
- ✅ Modern login page with beautiful UI
- ✅ User registration page
- ✅ Dashboard with wine collection stats
- ✅ Authentication context and API services
- ✅ Console logging for debugging
- ✅ Responsive design
- ✅ Vercel deployment configuration

### Backend (FastAPI + PostgreSQL + SQLAlchemy)
- ✅ User authentication with JWT tokens
- ✅ Login and registration endpoints
- ✅ Password hashing with bcrypt
- ✅ Database models and schemas
- ✅ CORS middleware configured
- ✅ Auto-generated API docs

## 🔧 The Issue

Your frontend directory was **completely empty**, which is why you were seeing issues on Vercel. There was no login page or any code to load!

## 📝 Next Steps to Fix Your Deployment

### Step 1: Deploy the Backend First

The frontend needs a backend API to authenticate against. Here's how to deploy it on Render:

#### Deploy to Render (Current Setup)

1. **Sign up at [render.com](https://render.com)**

2. **Create PostgreSQL Database** (do this first):
   - Click "New +" → "PostgreSQL"
   - Name: `pocket-pallet-db`
   - Choose free tier or paid tier
   - Click "Create Database"
   - Copy the **Internal Database URL** (starts with `postgresql://`)

3. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select this repository
   - Configure:
     - **Name**: `pocket-pallet-api`
     - **Root Directory**: `PP_MVP/backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables** (in Render dashboard):
   ```
   DATABASE_URL=<paste your Internal Database URL from step 2>
   DATABASE_URL_SYNC=<same as DATABASE_URL>
   SECRET_KEY=<generate with: openssl rand -hex 32>
   CORS_ORIGINS=https://your-vercel-url.vercel.app,http://localhost:3000
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Copy your Render URL (e.g., `https://pocket-pallet-api.onrender.com`)

#### Alternative: Railway or Heroku

If you prefer other services, see `DEPLOYMENT_GUIDE.md` for alternatives.

### Step 2: Update and Redeploy Frontend on Vercel

1. **Push this code to GitHub**:
   ```bash
   cd /Users/bobbyciccaglione/Banyan/Pocket_Pallet
   git add .
   git commit -m "Add complete frontend and backend"
   git push origin main
   ```

2. **Update Vercel project settings**:
   - Go to your Vercel project dashboard
   - Go to Settings → General
   - Under "Build & Development Settings":
     - Root Directory: `PP_MVP/frontend`
     - Framework Preset: `Next.js`
   
3. **Add environment variable**:
   - Go to Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.onrender.com`
   - Use your actual Render backend URL from Step 1

4. **Trigger redeployment**:
   - Go to Deployments tab
   - Click "..." on the latest deployment
   - Click "Redeploy"

### Step 3: Update Backend CORS

After your Vercel frontend is deployed:

1. Get your Vercel URL (e.g., `https://pocket-pallet-pnhynn1lh-bobbyai.vercel.app`)
2. Go to Render dashboard → your backend service → Environment
3. Update the `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS=https://pocket-pallet-pnhynn1lh-bobbyai.vercel.app,http://localhost:3000
   ```
4. Click "Save Changes" - Render will auto-redeploy

### Step 4: Test Your Application

1. Visit your Vercel URL
2. You should see the login page now (not a blank screen!)
3. Click "Sign up" to create an account
4. After registration, you'll be logged in and see the dashboard
5. Check browser console - you should see detailed logging

## 🐛 Debugging

If you still see issues:

### Check Frontend Console
Open browser DevTools (F12) → Console tab. You should see logs like:
- "API Service initialized with URL: ..."
- "Login attempt started..."
- "API Request: ..."

### Check Backend Health
Visit these URLs (replace with your backend URL):
- `https://your-backend.onrender.com/` - Should show welcome message
- `https://your-backend.onrender.com/health` - Should return `{"status": "healthy"}`
- `https://your-backend.onrender.com/docs` - Should show API documentation

### Common Issues

**Issue**: Console shows CORS errors
- **Fix**: Make sure your Vercel URL is in the backend's `CORS_ORIGINS` environment variable

**Issue**: "Network Error" in console
- **Fix**: Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Make sure backend is accessible at that URL

**Issue**: 401 Unauthorized
- **Fix**: Try registering a new account, don't try to use old credentials

**Issue**: Page is blank/white screen
- **Fix**: Check Vercel build logs for errors
- Make sure Root Directory is set to `PP_MVP/frontend`

## 🎨 What You'll See

### Login Page
- Beautiful gradient background (purple to pink)
- Email and password fields
- "Remember me" checkbox
- "Forgot password?" link
- "Sign up" link
- Loading spinner during login
- Error messages if login fails

### Dashboard
- Navigation bar with logout button
- Welcome message
- Three stat cards: Total Wines, Categories, Total Value (all showing 0 for now)
- Quick action buttons for adding wines and searching

## 📚 Additional Resources

- **Detailed Deployment Guide**: See `PP_MVP/DEPLOYMENT_GUIDE.md`
- **Backend README**: See `PP_MVP/backend/README.md`
- **Frontend README**: See `PP_MVP/frontend/README.md`

## 📊 Monitoring on Render

- View logs: Render dashboard → your service → "Logs" tab
- Check deployments: "Events" tab
- Database metrics: PostgreSQL service → "Metrics"

## 🔒 Security Notes

- Never commit `.env` files
- Use strong SECRET_KEY (generate with `openssl rand -hex 32`)
- Keep your database credentials secure
- Always use HTTPS in production
- Render provides free SSL certificates automatically

## 🎯 Local Development (Optional)

### Backend
```bash
cd PP_MVP/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create .env file with database credentials
uvicorn app.main:app --reload
```

### Frontend
```bash
cd PP_MVP/frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

---

**Ready to deploy?** Start with Step 1 above! 🚀

Let me know if you run into any issues, and check the console logs - they'll tell us exactly what's happening now!

