# Deployment Checklist - Action Required

## ✅ What We Just Did
- [x] Built complete frontend with wine-inspired design
- [x] Built complete backend with authentication
- [x] Pushed all code to GitHub

## 🔧 What You Need To Do Now

### Step 1: Configure Render Backend (5 minutes)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Find your service**: `pocket-pallet` (or whatever it's named)
3. **Check deployment**: 
   - You should see "Deploying..." or a recent deploy
   - Wait for it to finish (usually 2-5 minutes)
4. **Update Environment Variables**:
   - Click on your service → "Environment" tab
   - **Make sure these are set**:
     ```
     DATABASE_URL=<your postgres internal URL>
     DATABASE_URL_SYNC=<same as above>
     SECRET_KEY=<generate with: openssl rand -hex 32>
     CORS_ORIGINS=https://pocket-pallet-pnhynn1lh-bobbyai.vercel.app,http://localhost:3000
     ACCESS_TOKEN_EXPIRE_MINUTES=30
     ```
   - **Important**: Add your Vercel URL to `CORS_ORIGINS`
   - Click "Save Changes" (Render will redeploy)

5. **Test the backend** (wait for deploy to finish first):
   - Visit: https://pocket-pallet.onrender.com/health
   - Should return: `{"status":"healthy"}`
   - Visit: https://pocket-pallet.onrender.com/docs
   - Should show the API documentation with `/api/auth/login` endpoint

### Step 2: Configure Vercel Frontend (3 minutes)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find your project**: `pocket-pallet` 
3. **Update Settings**:
   - Go to Settings → General → Build & Development Settings
   - **Root Directory**: `PP_MVP/frontend` (CRITICAL!)
   - **Framework Preset**: Next.js
   - Click "Save"

4. **Add Environment Variable**:
   - Go to Settings → Environment Variables
   - Add new variable:
     - **Key**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://pocket-pallet.onrender.com`
     - **Environment**: All (Production, Preview, Development)
   - Click "Save"

5. **Redeploy**:
   - Go to Deployments tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"
   - Wait for build to complete (2-3 minutes)

### Step 3: Test Everything (2 minutes)

1. **Test Backend**:
   ```bash
   # Should return healthy
   curl https://pocket-pallet.onrender.com/health
   
   # Should return API docs (HTML)
   curl https://pocket-pallet.onrender.com/docs
   ```

2. **Test Frontend**:
   - Visit: https://pocket-pallet-pnhynn1lh-bobbyai.vercel.app/login
   - You should see:
     - ✅ Wine-colored background (not purple!)
     - ✅ Clean login form
     - ✅ "Welcome back" heading

3. **Test Login Flow**:
   - Click "Create account" (or go to /register)
   - Register with:
     - Username: `testuser`
     - Email: `test@example.com`
     - Password: `password123`
   - Should redirect to dashboard
   - Dashboard should show three modules:
     - 📓 Journal
     - ✨ Discovery  
     - 📱 Companion

4. **Check Browser Console** (F12):
   - Should see logs like:
     ```
     API Service initialized with URL: https://pocket-pallet.onrender.com
     Login attempt started...
     API Request: POST /api/auth/register
     API Response: 200
     ```

## 🐛 Troubleshooting

### Issue: Backend still shows old "Admin Console" message
**Solution**: 
- Render hasn't deployed yet - wait and refresh
- OR check Render logs for deployment errors

### Issue: CORS errors in frontend console
**Solution**: 
- Make sure `CORS_ORIGINS` in Render includes your Vercel URL
- Format: `https://pocket-pallet-pnhynn1lh-bobbyai.vercel.app,http://localhost:3000`
- Save changes in Render to trigger redeploy

### Issue: Frontend still shows blank/old page
**Solution**:
- Make sure `Root Directory` is set to `PP_MVP/frontend` in Vercel
- Make sure you clicked "Redeploy" after adding environment variable
- Clear browser cache and hard refresh (Cmd+Shift+R)

### Issue: 404 on /api/auth/login
**Solution**:
- Backend hasn't finished deploying
- Check Render deployment logs

### Issue: Network error in browser console
**Solution**:
- Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Should be: `https://pocket-pallet.onrender.com` (no trailing slash)

## 📱 What Success Looks Like

### Backend
```
GET https://pocket-pallet.onrender.com/
→ {"message":"Welcome to Pocket Pallet API","version":"1.0.0","docs":"/docs"}

GET https://pocket-pallet.onrender.com/health
→ {"status":"healthy"}
```

### Frontend
- Login page with wine-colored background
- Registration works
- Dashboard shows three module cards
- Console shows API requests/responses

## 🎉 Once Everything Works

You'll have:
- ✅ Beautiful wine-inspired frontend
- ✅ Secure authentication (JWT)
- ✅ Working login/register
- ✅ Module-based dashboard
- ✅ Full logging for debugging

---

**Estimated Total Time**: 10-15 minutes

**Your URLs**:
- Frontend: https://pocket-pallet-pnhynn1lh-bobbyai.vercel.app
- Backend: https://pocket-pallet.onrender.com
- GitHub: https://github.com/BobbyC100/Pocket_Pallet

