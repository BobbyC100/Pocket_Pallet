# 🚀 Deploy and Test - Complete Guide

Your backend API is working! Now let's deploy and test in Google Docs.

## Option A: Deploy via Vercel CLI (Recommended)

### Step 1: Login to Vercel

```bash
cd /Users/bobbyciccaglione/Banyan
npx vercel login
```

This will:
1. Ask for your email
2. Send you a verification link
3. Confirm once you click it

### Step 2: Deploy

```bash
npx vercel deploy --prod
```

This will:
- Build your app
- Deploy to production
- Give you a URL like: `https://banyan-abc123.vercel.app`

**COPY THIS URL** - you'll need it for the next step!

---

## Option B: Deploy via Vercel Dashboard (Easier)

### Step 1: Push to GitHub

```bash
cd /Users/bobbyciccaglione/Banyan

# If not already a git repo
git add .
git commit -m "Add Google Docs add-on API"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com
2. Sign in (or create account)
3. Click "New Project"
4. Import your GitHub repo
5. Click "Deploy"
6. Wait ~2 minutes
7. **COPY THE URL** from the deployment

---

## 🎯 Once You Have Your Vercel URL

### Step 1: Update Code.gs

Open this file in your editor:
```
/Users/bobbyciccaglione/Banyan/google-workspace-addon/Code.gs
```

Change line 14 to:
```javascript
const BANYAN_API_BASE = 'https://your-vercel-url.vercel.app';
```

Replace `your-vercel-url.vercel.app` with your actual URL (NO trailing slash!)

### Step 2: Create Apps Script Project

1. **Go to**: https://script.google.com
2. **Click**: "New project"
3. **Name it**: "Banyan AI Writer"

### Step 3: Add Files

#### Add Code.gs
1. Delete default Code.gs
2. Click **+ Add file** → **Script** → Name: "Code"
3. Copy ENTIRE contents from:
   ```
   /Users/bobbyciccaglione/Banyan/google-workspace-addon/Code.gs
   ```
4. Paste into Apps Script
5. **VERIFY line 14 has your Vercel URL**

#### Add Sidebar.html
1. Click **+ Add file** → **HTML** → Name: "Sidebar"
2. Copy ENTIRE contents from:
   ```
   /Users/bobbyciccaglione/Banyan/google-workspace-addon/Sidebar.html
   ```
3. Paste into Apps Script

#### Add appsscript.json
1. Click ⚙️ **Project Settings**
2. Check ☑️ "Show 'appsscript.json' manifest file"
3. Click on `appsscript.json` in file list
4. Copy ENTIRE contents from:
   ```
   /Users/bobbyciccaglione/Banyan/google-workspace-addon/appsscript.json
   ```
5. Paste into Apps Script (replace everything)

6. **Save**: Press `Ctrl/Cmd + S`

### Step 4: Authorize and Run

In Apps Script:
1. Select function dropdown → Choose **`onOpen`**
2. Click **Run** ▶️
3. Click **Review Permissions**
4. Choose your Google account
5. Click **Advanced**
6. Click **Go to Banyan AI Writer (unsafe)**
7. Click **Allow**

### Step 5: Test in Google Docs

1. **Go to**: https://docs.google.com
2. **Create** a new blank document
3. **Refresh** the page (F5 or Cmd+R)
4. **Look for menu**: Add-ons → Banyan AI Writer → Start Banyan
5. **The sidebar should open!** 🎉

### Step 6: Generate Your First Document

In the sidebar:
```
Title: Product Strategy Q4 2025
Audience: Executive Team
Tone: Professional
Context: Focus on AI integration and market expansion
Destination: ○ Insert at cursor
```

Click **Generate Document** and wait ~20 seconds!

---

## 🎉 Expected Results

You should see:

### In the Preview:
```
Title: Product Strategy Q4 2025

# Executive Summary
This strategic document outlines...

1. Focus on operational efficiency
2. Enhance customer engagement
3. Drive technological innovation

# Strategic Recommendations
...
```

### After clicking "Insert into Doc":

Your Google Doc will have:
- ✅ Formatted headings (H1, H2)
- ✅ Bullet lists
- ✅ Numbered lists  
- ✅ Well-structured paragraphs

---

## 🧪 Test Cases

Try these to see different outputs:

### Test 1: Executive Strategy
```
Title: Executive Strategy Briefing
Audience: Board of Directors
Tone: Executive
Context: Quarterly business review and forward outlook
```

### Test 2: Technical Documentation
```
Title: API Integration Guide
Audience: Engineering Team
Tone: Technical
Context: Microservices architecture and REST API patterns
```

### Test 3: Team Communication
```
Title: Weekly Team Update
Audience: Product Team
Tone: Casual
Context: Sprint retrospective and next sprint planning
```

---

## 🐛 Troubleshooting

### "Failed to generate content: 500"
→ **Check**: Is your Vercel URL correct in Code.gs line 14?
→ **Check**: Does the URL have NO trailing slash?
→ **Try**: Visit your-url.vercel.app/api/health in browser

### "Add-on menu doesn't appear"
→ **Solution**: Refresh your Google Doc
→ **Solution**: Run `onOpen` again in Apps Script

### "Failed to generate content: 404"
→ **Check**: Endpoint should be `/api/docs-addon/generate`
→ **Check**: Make sure you deployed the latest code

### "Authorization error"
→ **Solution**: Click "Review Permissions" and allow all scopes
→ **Note**: The "unsafe" warning is normal for unpublished add-ons

### "No selection in the document"
→ **Solution**: You chose "Replace selection" without selecting text
→ **Fix**: Select some text first, then generate

---

## 📊 Performance Expectations

Based on our testing:
```
Generation Time: 15-25 seconds
Cost per Document: $0.013-0.017
Output Size: 30-40 blocks
Includes: Headings, paragraphs, bullets, numbered lists
```

---

## ✅ Success Checklist

You've successfully deployed and tested when:

- ☐ Vercel deployment completed
- ☐ Deployment URL copied
- ☐ Code.gs updated with URL
- ☐ Apps Script project created
- ☐ All 3 files added to Apps Script
- ☐ Authorization completed
- ☐ Add-on menu appears in Google Docs
- ☐ Sidebar opens
- ☐ Generation completes
- ☐ Content inserts correctly
- ☐ Formatting looks good

---

## 🔥 Quick Commands Reference

```bash
# Login to Vercel
npx vercel login

# Deploy to production
cd /Users/bobbyciccaglione/Banyan
npx vercel deploy --prod

# Or deploy via dashboard at vercel.com
```

---

## 🎯 What's Next?

After successful testing:

1. **Try different prompts** - Different tones, audiences, contexts
2. **Test all modes** - Insert, replace selection, new document
3. **Customize prompts** - Edit `/src/app/api/docs-addon/generate/route.ts`
4. **Improve UI** - Edit `/google-workspace-addon/Sidebar.html`
5. **Deploy for real** - Follow DEPLOYMENT_GUIDE.md for production

---

## 📞 Need Help?

1. **View logs**: Apps Script → View → Logs
2. **Check API**: Visit your-url.vercel.app/api/health
3. **Test endpoint**: 
   ```bash
   curl -X POST https://your-url.vercel.app/api/docs-addon/generate \
     -H "Content-Type: application/json" \
     -d '{"title": "Test", "tone": "professional"}'
   ```

---

**Ready to deploy?** Run:

```bash
npx vercel login
# Then follow the prompts!
```

🚀 Let's make this happen!

