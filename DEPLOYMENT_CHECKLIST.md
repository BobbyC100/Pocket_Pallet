# 🚀 Banyan Deployment Checklist

## Current Status
✅ App built with Next.js 14 + Clerk + Supabase  
✅ Auth working (Magic Links + Google OAuth via Clerk)  
✅ Database schema created  
✅ Anonymous sessions + account upgrade flow  
⚠️ Need to migrate to production deployment

---

## Deployment Steps

### 1. **Vercel Setup** (5 min)
- [ ] Push code to GitHub (already done)
- [ ] Go to [vercel.com](https://vercel.com) and import repo
- [ ] Connect to `BobbyC100/Banyan` repository
- [ ] Framework: **Next.js**
- [ ] Root directory: `.`

### 2. **Environment Variables in Vercel** (10 min)

Add these to Vercel → Project Settings → Environment Variables:

```env
# OpenAI & Gemini
OPENAI_API_KEY=[your-key]
GEMINI_API_KEY=[your-key]

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sjxasklgwncgpzaptwft.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-key]
DATABASE_URL=[your-db-url]

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[your-key]
CLERK_SECRET_KEY=[your-key]
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/sos
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/sos

# App Config
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Set for all environments:** Production, Preview, Development

### 3. **Update Clerk Redirect URLs** (3 min)

In Clerk Dashboard → Configure:
- Add production domain: `https://your-app.vercel.app`
- Update allowed redirect URLs to include production domain

### 4. **Beta Access (Optional)** (5 min)

If you want invite-only beta:

#### Option A: Keep current open access
- No changes needed
- Anyone can create briefs (anonymous)
- Vision Framework requires sign-up

#### Option B: Add beta allowlist
```sql
-- Add to Supabase
create table if not exists public.beta_testers (
  email text primary key,
  note text,
  created_at timestamptz default now()
);

-- Seed initial testers
insert into public.beta_testers (email, note)
values
  ('you@yourco.com', 'founder'),
  ('friend@example.com', 'pilot');
```

Then update middleware to check `beta_testers` table.

### 5. **Analytics & Error Tracking** (Optional, 15 min)

#### PostHog Setup
1. Create account at [posthog.com](https://posthog.com)
2. Get Project API Key
3. Add to Vercel env vars:
   ```env
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

#### Sentry Setup
1. Create account at [sentry.io](https://sentry.io)
2. Run: `npx @sentry/wizard@latest -i nextjs`
3. Add DSN to Vercel env vars:
   ```env
   SENTRY_DSN=https://xxx@sentry.io/xxx
   SENTRY_AUTH_TOKEN=[from-wizard]
   ```

### 6. **Deploy!** (1 min)
- [ ] Click "Deploy" in Vercel
- [ ] Wait 2-3 minutes
- [ ] Visit your production URL
- [ ] Test the flow:
  - Create anonymous brief ✓
  - Click "Save Progress" → Sign up ✓
  - Generate Vision Framework ✓

---

## Post-Launch Checklist

### Week 1
- [ ] Set up custom domain (e.g., `beta.banyan.app`)
- [ ] Add Google Analytics or Plausible
- [ ] Monitor Supabase usage
- [ ] Set up automated backups (Supabase dashboard)

### Week 2
- [ ] Add feedback form (`/feedback` page)
- [ ] Set up Slack webhook for feedback notifications
- [ ] Create changelog page
- [ ] Add user onboarding flow

### Later
- [ ] Phase 2: Google Docs export
- [ ] Version history UI
- [ ] Team collaboration features
- [ ] Webhook integrations

---

## Quick Deploy Commands

```bash
# Commit latest changes
git add -A
git commit -m "feat: production-ready deployment"
git push origin main

# Vercel will auto-deploy on push
# Or trigger manual deploy:
# vercel --prod
```

---

## Current Features Live

✅ **Anonymous Flow**
- Create briefs without account
- Auto-save to localStorage
- View Founder Brief + VC Summary

✅ **Auth Flow**
- Magic link sign-up (via Clerk)
- Google OAuth sign-up
- Auto-migrate localStorage → Supabase

✅ **Vision Framework**
- Requires sign-up
- Generates: Vision, Strategy, Principles, Bets, Metrics, Tensions
- Executive One-Pager + QA Results

✅ **Strategic Operating System (SOS)**
- Unified doc hub
- All documents in one place
- Export to PDF/Markdown

---

## Need Help?

1. **Vercel not deploying?**
   - Check build logs in Vercel dashboard
   - Verify all env vars are set

2. **Clerk redirect issues?**
   - Add production domain to Clerk allowed origins
   - Check redirect URLs match env vars

3. **Database errors?**
   - Verify Supabase connection string
   - Check RLS policies are enabled

Let me know if you hit any issues!

