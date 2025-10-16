# Google Places API Key Setup - Step by Step

## Overview
You'll need a Google Cloud account and about 5 minutes. The API has a generous free tier ($200/month credit).

---

## Step 1: Go to Google Cloud Console

Open in your browser:
```
https://console.cloud.google.com/
```

**Sign in** with your Google account.

---

## Step 2: Create or Select a Project

### Option A: Use Existing Project (if you already have one)
1. Click the project dropdown at the top of the page
2. Select your existing project (like "Pocket Pallet" or where you have your Maps API key)

### Option B: Create New Project
1. Click the project dropdown at the top
2. Click **"New Project"**
3. Enter project name: `Pocket-Pallet` (or whatever you like)
4. Click **"Create"**
5. Wait ~30 seconds for project creation

---

## Step 3: Enable the Places API

### 3a. Go to APIs & Services
1. Click the ☰ hamburger menu (top left)
2. Navigate to: **APIs & Services** → **Library**
3. Or use direct link: https://console.cloud.google.com/apis/library

### 3b. Search for Places API
1. In the search box, type: `Places API`
2. Click on **"Places API"** (not "Places API (New)")
3. Click the blue **"Enable"** button
4. Wait for it to enable (~10 seconds)

### 3c. Optional: Enable Maps JavaScript API (if not already enabled)
This is needed if you want to use the same key for maps on your frontend.
1. Go back to API Library
2. Search for: `Maps JavaScript API`
3. Click **"Enable"**

---

## Step 4: Create an API Key

### 4a. Go to Credentials
1. Click **APIs & Services** → **Credentials**
2. Or use direct link: https://console.cloud.google.com/apis/credentials

### 4b. Create Credentials
1. Click **"+ Create Credentials"** at the top
2. Select **"API Key"**
3. A popup will show your new API key: `AIzaSyB...` (copy this!)
4. Click **"Close"** (we'll restrict it in the next step)

---

## Step 5: Secure Your API Key (IMPORTANT!)

### 5a. Restrict the API Key
1. In the Credentials page, find your newly created key
2. Click the **pencil icon** (Edit) next to it

### 5b. Set Application Restrictions
Choose based on your needs:

**Option A: HTTP referrers (websites)**
- Good for: Frontend usage (maps on your website)
- Under "Application restrictions", select **"HTTP referrers"**
- Add your domains:
  ```
  localhost:3000/*
  localhost:8000/*
  *.vercel.app/*
  your-domain.com/*
  ```

**Option B: IP addresses (servers)**
- Good for: Backend scripts (like our import script)
- Select **"IP addresses"**
- Add your server IPs (or leave unrestricted for development)

**Option C: None (for testing)**
- ⚠️ Less secure, but easier for testing
- Select **"None"**
- You can restrict it later

### 5c. Restrict API Access
1. Under "API restrictions", select **"Restrict key"**
2. Check these APIs:
   - ✅ Places API
   - ✅ Maps JavaScript API (if using maps on frontend)
   - ✅ Maps Static API (if using Street View)
3. Click **"Save"**

---

## Step 6: Set the API Key in Your Environment

### 6a. For Backend Scripts (Local Development)

**Option 1: Terminal (temporary - current session only)**
```bash
export GOOGLE_PLACES_API_KEY='AIzaSyB...'
```

**Option 2: .env file (permanent - recommended)**
```bash
cd /Users/bobbyciccaglione/Banyan/Pocket_Pallet/PP_MVP/backend
echo "GOOGLE_PLACES_API_KEY='AIzaSyB...'" >> .env
```

**Option 3: .zshrc (permanent - all sessions)**
```bash
echo "export GOOGLE_PLACES_API_KEY='AIzaSyB...'" >> ~/.zshrc
source ~/.zshrc
```

### 6b. For Frontend (if needed)
```bash
cd /Users/bobbyciccaglione/Banyan/Pocket_Pallet/PP_MVP/frontend
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY='AIzaSyB...'" >> .env.local
```

### 6c. For Production (Render/Vercel)

**Render (Backend):**
1. Go to Render Dashboard
2. Select your service
3. Go to **Environment** tab
4. Add: `GOOGLE_PLACES_API_KEY` = `AIzaSyB...`
5. Click **Save**

**Vercel (Frontend):**
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = `AIzaSyB...`
5. Redeploy

---

## Step 7: Verify the API Key Works

### 7a. Check it's set
```bash
echo $GOOGLE_PLACES_API_KEY
```
You should see: `AIzaSyB...` (your key)

### 7b. Test with our test script
```bash
cd /Users/bobbyciccaglione/Banyan/Pocket_Pallet/PP_MVP/backend
python test_cid_resolution.py
```

**Expected output:**
```
Google Maps CID Resolution Test
================================================================================
🔑 API Key: AIzaSyB...xyz
✅ Google Places API initialized

Testing CID URL Resolution:
1. Lou & Fid (Buenos Aires)
   ✅ Resolved!
      Coordinates: -34.5732242, -58.4320259
```

---

## Step 8: Check Your Billing & Quota

### 8a. Enable Billing (Required for API usage)
1. Go to: https://console.cloud.google.com/billing
2. Link a billing account (credit card required)
3. ⚠️ Don't worry: You get **$200 free credit per month**
4. For our use case (~100 merchants): **~$1-2 total**

### 8b. Set Budget Alerts (Recommended)
1. Go to: https://console.cloud.google.com/billing/budgets
2. Click **"Create Budget"**
3. Set budget: `$10/month`
4. Set alert at: `50%` and `90%`
5. Enter your email for alerts

### 8c. Monitor Usage
- Go to: https://console.cloud.google.com/apis/dashboard
- You'll see API calls and costs in real-time

---

## Common Issues & Solutions

### Issue 1: "API key not configured"
**Cause:** Environment variable not set  
**Fix:**
```bash
export GOOGLE_PLACES_API_KEY='AIzaSyB...'
echo $GOOGLE_PLACES_API_KEY  # Verify it's set
```

### Issue 2: "API key not valid" or "API_KEY_INVALID"
**Causes & Fixes:**
- ❌ Key has typo → Copy again carefully
- ❌ Key is restricted to wrong APIs → Add "Places API" in restrictions
- ❌ Key is restricted to wrong IPs/referrers → Temporarily remove restrictions

**Debug:**
```bash
# Test the key directly with curl
curl "https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4&key=YOUR_KEY"
```

### Issue 3: "This API project is not authorized to use this API"
**Fix:** Enable the Places API (Step 3)

### Issue 4: "RESOURCE_EXHAUSTED" or "OVER_QUERY_LIMIT"
**Causes:**
- Hit free tier limit ($200/month)
- Too many requests too fast

**Fixes:**
- Wait until next billing cycle
- Enable billing with credit card
- Import in smaller batches

### Issue 5: "Billing must be enabled"
**Fix:** Add a payment method (Step 8a)
- You still get $200 free credit
- You won't be charged unless you exceed it
- ~100 CID lookups = ~$1.70

---

## Security Best Practices

### ✅ DO:
- ✅ Restrict API keys to specific APIs
- ✅ Use different keys for frontend vs backend
- ✅ Set budget alerts
- ✅ Rotate keys periodically
- ✅ Keep keys in `.env` files (add to `.gitignore`)

### ❌ DON'T:
- ❌ Commit API keys to git
- ❌ Share API keys publicly
- ❌ Use the same key for everything
- ❌ Leave keys unrestricted in production

---

## Cost Estimation

### Places API Pricing
- **Place Details** (Basic Data): $0.017 per request
- **Free Tier**: $200/month credit = ~11,764 free requests

### Real Examples

**Small import (50 merchants with CIDs):**
- Cost: 50 × $0.017 = **$0.85**
- Time: ~30 seconds

**Medium import (200 merchants with CIDs):**
- Cost: 200 × $0.017 = **$3.40**
- Time: ~2 minutes

**Large import (1000 merchants with CIDs):**
- Cost: 1000 × $0.017 = **$17.00**
- Time: ~10 minutes

**Monthly usage (weekly imports of 50):**
- Cost: 4 × $0.85 = **$3.40/month**
- ✅ Well within $200 free tier

---

## Quick Reference

### Key URLs
- **Console**: https://console.cloud.google.com/
- **API Library**: https://console.cloud.google.com/apis/library
- **Credentials**: https://console.cloud.google.com/apis/credentials
- **Billing**: https://console.cloud.google.com/billing
- **API Dashboard**: https://console.cloud.google.com/apis/dashboard

### Commands to Remember
```bash
# Set API key (temporary)
export GOOGLE_PLACES_API_KEY='AIzaSyB...'

# Set API key (permanent - backend)
echo "GOOGLE_PLACES_API_KEY='AIzaSyB...'" >> PP_MVP/backend/.env

# Set API key (permanent - frontend)
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY='AIzaSyB...'" >> PP_MVP/frontend/.env.local

# Verify it's set
echo $GOOGLE_PLACES_API_KEY

# Test it works
cd PP_MVP/backend
python test_cid_resolution.py

# Import merchants
python import_merchants_with_google_api.py '../Takeout 3/Saved'
```

---

## Next Steps

After setup:
1. ✅ Run test script to verify
2. ✅ Import a small batch first (5-10 merchants)
3. ✅ Check the results in your database
4. ✅ Import the rest of your merchants

---

## Need Help?

- **Google Cloud Support**: https://cloud.google.com/support
- **Places API Docs**: https://developers.google.com/maps/documentation/places/web-service
- **Pricing Calculator**: https://cloud.google.com/products/calculator

**Still stuck?** Check the error message and search for it in the Common Issues section above.

