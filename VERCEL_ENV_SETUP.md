# 🔧 Vercel Environment Variables Setup

Your deployment failed because environment variables aren't configured in Vercel yet.

## ✅ Quick Fix (2 minutes)

### Option A: Via Vercel Dashboard (Easiest)

1. **Go to your Vercel dashboard**: https://vercel.com/dashboard
2. **Find your Banyan project** and click on it
3. **Click "Settings"** tab
4. **Click "Environment Variables"** in the left sidebar
5. **Add each variable below** (click "Add" for each one)

### Required Environment Variables:

Copy these from your local `.env.local` file:

```bash
# AI Keys
OPENAI_API_KEY=sk-proj-OTy...    # Your full key from .env.local
ANTHROPIC_API_KEY=sk-ant-...     # Your full key
GEMINI_API_KEY=AIza...           # Your full key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sjxasklgwncgpzaptwft.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...    # Your full key
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...        # Your full key
DATABASE_URL=postgresql://postgres:...     # Your full connection string

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/sos
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/sos
```

**Important**: 
- Set environment to: **Production, Preview, and Development**
- Copy the FULL values from your `.env.local` file

### Option B: Via CLI (Faster if you know the commands)

Run this script:

```bash
cd /Users/bobbyciccaglione/Banyan

# Copy each variable from .env.local
npx vercel env add OPENAI_API_KEY
npx vercel env add ANTHROPIC_API_KEY
npx vercel env add GEMINI_API_KEY
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add DATABASE_URL
npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
npx vercel env add CLERK_SECRET_KEY
npx vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL
npx vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL
npx vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
npx vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
```

It will prompt you for each value. Paste them from your `.env.local` file.

---

## 🚀 After Adding Variables

### Redeploy:

**Via Dashboard:**
1. Go to your project in Vercel
2. Click "Deployments" tab
3. Click "Redeploy" on the failed deployment
4. Or push a new commit to trigger deployment

**Via CLI:**
```bash
npx vercel deploy --prod
```

---

## 📋 Quick Copy Script

Here's a helper to copy all your env vars at once:

```bash
# Run this in your terminal
cd /Users/bobbyciccaglione/Banyan
cat .env.local
```

Then copy each value to Vercel dashboard.

---

## ✅ Verification

After adding variables and redeploying:

1. Deployment should succeed ✅
2. Visit your deployment URL
3. Test the API:
   ```bash
   curl https://your-deployment-url.vercel.app/api/health
   ```

---

## 🎯 For Google Docs Add-on Testing

Once deployment succeeds:

1. **Copy your Vercel URL**: `https://your-project.vercel.app`
2. **Update Code.gs line 14**:
   ```javascript
   const BANYAN_API_BASE = 'https://your-project.vercel.app';
   ```
3. **Continue with testing** (see DEPLOY_AND_TEST.md)

---

## 🐛 Still Having Issues?

### Check if variables are set:
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Should see all 13 variables listed

### Redeploy after adding:
```bash
npx vercel deploy --prod --force
```

### Test locally first:
```bash
# Your local server should still be running
curl http://localhost:3001/api/docs-addon/generate \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "tone": "professional"}'
```

If local works but Vercel doesn't, it's definitely an env var issue.

---

## 🔒 Security Note

Never commit `.env.local` to git. It's already in `.gitignore`.

These variables are safe to add to Vercel - they're encrypted and only accessible during builds and runtime.

---

**Ready?** Add those environment variables to Vercel and redeploy! 🚀

