# Vercel Deployment Guide for Frontend

## ⚠️ Important: This is a Vite App, NOT Next.js

The build error you're seeing happens because Vercel auto-detects this as Next.js. It's actually a **Vite + React** app.

## 🔧 Fix the Build

### Option 1: Configure in Vercel Dashboard (Easiest)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **pocket-pallet** project
3. Go to **Settings** → **General**
4. Find **"Framework Preset"**
5. Change from "Next.js" to **"Vite"**
6. Scroll down to **"Build & Development Settings"**
7. Set:
   - **Root Directory:** `PP_MVP/frontend` ✅
   - **Build Command:** `npm run build` (default is fine)
   - **Output Directory:** `dist` (default)
   - **Install Command:** `npm install` (default)

8. Click **"Save"**
9. Go to **Deployments** → Click latest → **"Redeploy"**

### Option 2: Deploy Frontend Separately

If the above doesn't work, deploy just the frontend:

1. In Vercel Dashboard → **"Add New..."** → **"Project"**
2. Import your GitHub repo again
3. This time, set:
   - **Project Name:** `pocket-pallet-frontend`
   - **Framework:** Vite ✅
   - **Root Directory:** `PP_MVP/frontend` ✅
4. Add environment variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-railway-backend.up.railway.app/api/v1`
5. Deploy!

### Option 3: Use vercel.json (Already Added)

I've added `vercel.json` files that should fix this automatically:

```bash
# Push to GitHub
git add -A
git commit -m "fix: Add Vercel configuration for Vite"
git push
```

Vercel will auto-redeploy and should detect Vite correctly now.

## 🎯 Correct Settings Summary

| Setting | Value |
|---------|-------|
| Framework | **Vite** (NOT Next.js) |
| Root Directory | `PP_MVP/frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node Version | 18.x or higher |

## ✅ After Deployment

Once frontend is working:

1. **Test it:** Visit your Vercel URL
2. **Should see:** Login page loads
3. **Add backend URL:** In Vercel env vars:
   ```
   VITE_API_URL=https://your-railway-backend.up.railway.app/api/v1
   ```
4. **Redeploy:** To apply the env var

## 🐛 Still Getting Errors?

### Error: "Cannot find module 'react-router-dom'"

**Cause:** Dependencies not installed or wrong directory

**Fix:**
1. In Vercel, make sure Root Directory is `PP_MVP/frontend`
2. Or change Build Command to: `cd PP_MVP/frontend && npm install && npm run build`

### Error: "Module not found: Can't resolve '@/components/Layout'"

**Cause:** TypeScript path aliases not configured

**Fix:** This should work automatically with our `tsconfig.json`. If not, check that `vite.config.ts` has the path alias:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Error: Build times out

**Cause:** Vercel trying to build from wrong directory

**Fix:** Set Root Directory to `PP_MVP/frontend` in Vercel settings

## 🚀 Quick Deploy from Scratch

If nothing works, start fresh:

1. **Delete current Vercel project**
2. **New Project** → Import from GitHub
3. **Select** `Pocket_Pallet` repo
4. **Configure:**
   - Framework: Vite
   - Root: `PP_MVP/frontend`
5. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api/v1
   ```
6. **Deploy!**

## 📦 What's Deployed

Your Vercel deployment includes:
- ✅ React 18 + TypeScript
- ✅ Vite for fast builds
- ✅ Tailwind CSS
- ✅ React Router for navigation
- ✅ TanStack Query for data fetching
- ✅ All producer & wine management pages

## 🌐 Final URLs

After successful deployment:
- **Frontend:** `https://pocket-pallet.vercel.app`
- **Backend:** `https://your-app.up.railway.app`
- **API Docs:** `https://your-app.up.railway.app/docs`

---

**Need help?** Share the exact error from Vercel deployment logs!

