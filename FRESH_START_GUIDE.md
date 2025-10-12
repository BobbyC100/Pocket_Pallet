# Fresh Start - Complete Setup Guide

## 🎯 Goal
Get Pocket Pallet working with:
- ✅ Wine-inspired frontend (Next.js)
- ✅ Working backend API (already deployed on Render)
- ✅ Everything connected and functional

## 📋 Current Status

### What's Working ✅
- **Backend**: https://pocket-pallet.onrender.com
  - Has `/api/v1/auth/login`, `/api/v1/auth/register` endpoints
  - Database connected
  - Deployed and healthy

### What's a Mess ❌
- **Frontend**: Multiple Vercel projects, confusing URLs, 404 errors
- **Code**: Local code is good, but deployment is broken

## 🧹 Step 1: Clean Up Vercel (Do This First)

### Delete ALL Pocket Pallet Projects in Vercel

1. Go to https://vercel.com/dashboard
2. For EACH project with "Pocket" or "Pallet" in the name:
   - Click on the project
   - Settings → General → Scroll to bottom
   - Click "Delete Project"
   - Confirm deletion
3. Make sure you have ZERO Pocket Pallet projects left

**Checklist:**
- [ ] Deleted all old Pocket Pallet projects
- [ ] Vercel dashboard shows no Pocket Pallet projects

---

## 🚀 Step 2: Create Fresh Vercel Project (Proper Setup)

### A. Import Repository

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Find **`BobbyC100/Pocket_Pallet`** in the list
4. Click **"Import"**

### B. Configure Project Settings

**Project Settings Page:**

```
Project Name: pocket-pallet
Framework Preset: Next.js (SELECT FROM DROPDOWN - very important!)
Root Directory: PP_MVP/frontend (click "Edit" and type exactly this)

Build & Development Settings:
  ✓ Override: ON
  Build Command: npm run build
  Output Directory: (leave empty or set to .next)
  Install Command: npm install
  Development Command: npm run dev
```

### C. Add Environment Variable

**BEFORE clicking "Deploy":**

1. Click "Add" under "Environment Variables"
2. Enter:
   ```
   Key: NEXT_PUBLIC_API_URL
   Value: https://pocket-pallet.onrender.com
   Environments: ✓ Production ✓ Preview ✓ Development (check ALL three)
   ```
3. Click "Add"

### D. Deploy

1. Click **"Deploy"** button
2. Wait 2-3 minutes
3. Build should show:
   - ✅ Installing dependencies (394 packages)
   - ✅ Compiled successfully
   - ✅ Generating static pages
   - ✅ Build Completed

### E. Disable Protection (Very Important!)

**After deployment completes:**

1. Click on the project name to go to project dashboard
2. Go to **Settings** → **"Deployment Protection"**
3. Set to **"Disabled"** or **"None"**
4. Click **"Save"**

**Checklist:**
- [ ] Project created and deployed
- [ ] Build completed successfully (no errors)
- [ ] Environment variable NEXT_PUBLIC_API_URL is set
- [ ] Deployment protection is DISABLED
- [ ] Got the production URL (should be pocket-pallet.vercel.app or similar)

---

## ✅ Step 3: Test Everything

### A. Test Frontend

**Visit:** `https://[your-vercel-url]/login`

**You should see:**
- ✅ Wine-colored/beige background (NOT white or blue!)
- ✅ "Welcome back" heading
- ✅ Email and password fields
- ✅ Clean, modern design

**If you see 404:**
- Wait 1 minute (DNS propagation)
- Try the preview URL instead (should be shown in deployment)
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### B. Test Registration

1. Click "Create account" or go to `/register`
2. Fill in:
   - Username: testuser
   - Email: test@example.com
   - Password: password123
3. Click "Create account"
4. **Should:**
   - Show loading spinner
   - Redirect to `/dashboard`
   - Show three module cards (Journal, Discovery, Companion)

### C. Check Console Logs

Open browser DevTools (F12) → Console tab:

**You should see:**
```
API Service initialized with URL: https://pocket-pallet.onrender.com
authService.register called {email: "test@example.com", username: "testuser"}
API Request: POST /api/v1/auth/register
API Response: 200 {access_token: "...", user: {...}}
```

**If you see errors:**
- CORS error → Backend CORS needs updating (see Step 4)
- 404 on API → Check NEXT_PUBLIC_API_URL is set correctly
- Network error → Backend might be down

---

## 🔧 Step 4: Update Backend CORS (If Needed)

**Only do this if you see CORS errors in console:**

1. Go to https://dashboard.render.com
2. Click on your `pocket-pallet` backend service
3. Go to **Environment** tab
4. Find `CORS_ORIGINS` variable
5. Make sure it includes your Vercel URL:
   ```
   CORS_ORIGINS=https://your-vercel-url.vercel.app,http://localhost:3000
   ```
6. Click "Save Changes" (Render will auto-redeploy)
7. Wait 2-3 minutes for backend to restart

---

## 🐛 Troubleshooting

### Issue: Frontend shows 404
**Solutions:**
- Make sure Root Directory is set to `PP_MVP/frontend`
- Check Framework Preset is "Next.js"
- Try the specific deployment URL instead of production URL
- Disable deployment protection

### Issue: Frontend shows old blue design
**Solutions:**
- Make sure you're visiting the NEW Vercel project (delete all old ones first!)
- Hard refresh: Cmd+Shift+R
- Check in Vercel that latest commit (4255ecb) was deployed

### Issue: CORS errors in console
**Solutions:**
- Add your Vercel URL to backend CORS_ORIGINS (see Step 4)
- Make sure URL format is correct (https://, no trailing slash)

### Issue: API calls go to localhost:8000
**Solutions:**
- Environment variable NEXT_PUBLIC_API_URL is not set
- Or it's not checked for Production environment
- Redeploy after adding it

### Issue: Registration fails with error
**Solutions:**
- Check backend is running: https://pocket-pallet.onrender.com/health
- Should return: `{"status":"healthy"}`
- Check backend docs: https://pocket-pallet.onrender.com/docs
- Should show API documentation

---

## 📝 Final Checklist

When everything is working, you should have:

**Frontend:**
- [ ] One clean Vercel project
- [ ] Deployed successfully
- [ ] Wine-inspired design visible
- [ ] Registration works
- [ ] Login works
- [ ] Dashboard loads

**Backend:**
- [ ] Running on Render
- [ ] Health check returns healthy
- [ ] CORS includes Vercel URL
- [ ] Auth endpoints working

**Integration:**
- [ ] Frontend calls backend API
- [ ] No CORS errors
- [ ] Console shows proper API URL
- [ ] Can create account and login

---

## 🎉 Success Criteria

You'll know it's working when:
1. Visit login page → See wine-colored design ✅
2. Create account → Redirects to dashboard ✅
3. Dashboard shows three module cards ✅
4. Console shows API calls to Render backend ✅
5. No 404, no CORS errors, no blank pages ✅

---

## 💡 Pro Tips

1. **Use bookmarks:** Bookmark your Vercel project dashboard and deployment URLs
2. **Check commit hash:** Always verify Vercel deployed the latest commit (4255ecb)
3. **Clear cache:** When in doubt, hard refresh (Cmd+Shift+R)
4. **One project:** Keep only ONE Vercel project to avoid confusion
5. **Monitor logs:** Keep browser console open to catch errors early

---

**Ready to start? Begin with Step 1: Clean Up Vercel** ☝️

