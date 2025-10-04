# 🔐 Auth Setup Guide

## Prerequisites
You'll need accounts for:
1. **Supabase** (database + auth)
2. **Clerk** (magic links + OAuth)

---

## Step 1: Set up Supabase

### 1.1 Create Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization (or create one)
4. Fill in:
   - **Name**: `banyan` (or your choice)
   - **Database Password**: (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine

### 1.2 Enable pgvector
1. Once project is created, go to **Database** → **Extensions**
2. Search for `vector` and enable the `pgvector` extension

### 1.3 Get Connection Strings
1. Go to **Project Settings** → **Database**
2. Copy these values:
   - **Project URL**: `https://[your-project-ref].supabase.co`
   - Go to **Project Settings** → **API**
   - Copy **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL`)
   - Copy **anon/public** key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Copy **service_role** key (for `SUPABASE_SERVICE_ROLE_KEY`)
   - Copy **Connection string** → **URI** (for `DATABASE_URL`)

---

## Step 2: Set up Clerk

### 2.1 Create Application
1. Go to [h://clerk.comWttps://clerk.com](https
2. Click "Add application"
3. Name it `Banyan`
4. Choose authentication methods:
   - ✅ **Email** (this enables magic links)
   - ✅ **Google**

### 2.2 Configure Magic Links
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Under **Email address**, ensure:
   - ✅ "Used for authentication" is ON
   - ✅ "Email verification" → **Email verification link**

### 2.3 Configure Google OAuth
1. Go to **User & Authentication** → **Social Connections**
2. Click **Google**
3. Toggle **Enable for sign-up and sign-in**
4. For now, use Clerk's development credentials (or add your own OAuth app later)

### 2.4 Get API Keys
1. Go to **API Keys**
2. Copy:
   - **Publishable key** (for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
   - **Secret key** (for `CLERK_SECRET_KEY`)

---

## Step 3: Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in all the values you collected above:

```bash
# OpenAI API (already configured)
OPENAI_API_KEY=your_existing_key

# Gemini API (already configured)
GEMINI_API_KEY=your_existing_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[your-publishable-key]
CLERK_SECRET_KEY=[your-secret-key]
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/sos
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/sos
```

---

## Step 4: Run Database Migrations

Push the schema to Supabase:

```bash
npm run db:push
```

This will create all the tables (users, profiles, documents, connections, exports, events_audit).

---

## Step 5: Set up RLS Policies (optional for now)

We'll handle RLS in the next phase, but here's a preview of what we'll add:

```sql
-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own documents OR anonymous documents they created
CREATE POLICY "Users can view own documents"
ON documents FOR SELECT
USING (
  auth.uid()::text = user_id::text
  OR (user_id IS NULL AND anonymous_id = current_setting('app.anonymous_id', true))
);

-- Similar policies for INSERT, UPDATE, DELETE
```

---

## ✅ Verification

After completing these steps, verify everything works:

1. **Database connection**: Run `npm run db:studio` and browse your tables
2. **Clerk**: The dev server should show Clerk UI when needed
3. **Keys are set**: No errors when starting `npm run dev`

---

## 🚀 Next Steps

Once your `.env.local` is configured:
1. I'll wrap up the Clerk integration
2. Add anonymous session management
3. Create the Save modal
4. Build the upgrade flow

**Let me know when you have the keys ready!**

