# Pocket Pallet - Project Status & Summary

**Last Updated**: October 12, 2025  
**Version**: MVP with Authentication & CSV Import

---

## 🎯 Current State

Pocket Pallet is a **full-stack wine management application** that allows users to:
- ✅ Register and login with JWT authentication
- ✅ Upload wine data via CSV files
- ⏳ View wines (backend endpoint exists, frontend UI pending)

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (wine-inspired color palette)
- **HTTP Client**: Axios
- **Hosting**: Vercel
- **URL**: https://pocket-pallet.vercel.app

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.13
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy 2.0.36
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt 4.0.1 + passlib 1.7.4
- **File Processing**: pandas 2.2.3
- **Hosting**: Render
- **URL**: https://pocket-pallet.onrender.com

---

## 📁 Project Structure

```
Pocket_Pallet/
├── PP_MVP/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py         # Login, register, /me
│   │   │   │   │   ├── imports.py      # CSV upload
│   │   │   │   │   └── wines.py        # List wines (NEW)
│   │   │   │   └── deps.py             # Auth dependencies
│   │   │   ├── core/
│   │   │   │   ├── config.py           # Settings
│   │   │   │   └── security.py         # JWT, password hashing
│   │   │   ├── db/
│   │   │   │   ├── base.py             # SQLAlchemy base
│   │   │   │   └── session.py          # DB session
│   │   │   ├── models/
│   │   │   │   ├── user.py             # User model
│   │   │   │   └── wine.py             # Wine model
│   │   │   ├── schemas/
│   │   │   │   ├── user.py             # User schemas
│   │   │   │   ├── token.py            # Token schemas
│   │   │   │   └── wine.py             # Wine schemas
│   │   │   ├── services/
│   │   │   │   └── user_service.py     # User business logic
│   │   │   └── main.py                 # FastAPI app entry point
│   │   ├── requirements.txt
│   │   └── runtime.txt (removed - using Python 3.13 default)
│   │
│   └── frontend/
│       ├── app/
│       │   ├── components/
│       │   │   └── CsvUpload.tsx       # CSV upload component
│       │   ├── contexts/
│       │   │   └── AuthContext.tsx     # Auth state management
│       │   ├── services/
│       │   │   └── api.ts              # API client
│       │   ├── dashboard/
│       │   │   └── page.tsx            # Dashboard page
│       │   ├── login/
│       │   │   └── page.tsx            # Login page
│       │   ├── register/
│       │   │   └── page.tsx            # Register page
│       │   ├── imports/new/
│       │   │   └── page.tsx            # CSV upload page
│       │   ├── globals.css             # Global styles
│       │   ├── layout.tsx              # Root layout
│       │   └── page.tsx                # Home page
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── tsconfig.json
│
├── Buvons_sample_wines__for_import_.csv  # Sample wine data (16 wines)
├── DESIGN_DOCS.md                         # Design philosophy & specs
├── PROJECT_STATUS.md                      # This file
└── [various other docs...]
```

---

## 🔐 Authentication

### User Account
- **Username**: `bobbyc`
- **Email**: `rjcicc@gmail.com`
- **Password**: [User's password]

### How It Works
1. User registers/logs in via frontend
2. Backend validates credentials
3. Backend returns JWT token + user data
4. Frontend stores token in localStorage
5. Token included in all subsequent API requests via Authorization header
6. Token expires after 30 minutes (configurable)

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

### Wines Table
```sql
CREATE TABLE wines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR NOT NULL,
    price_usd FLOAT,
    url VARCHAR,
    region VARCHAR,
    grapes VARCHAR,
    vintage VARCHAR,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Authentication (`/api/v1/auth`)
- **POST** `/login` - Login with email/password (OAuth2 form)
- **POST** `/register` - Create new user account
- **GET** `/me` - Get current user info (protected)

### Imports (`/api/v1/imports`)
- **POST** `/csv` - Upload CSV file with wine data

### Wines (`/api/v1/wines`) - NEW
- **GET** `` - List wines (with pagination)
- **GET** `/count` - Get total wine count
- **GET** `/{wine_id}` - Get specific wine by ID

### System
- **GET** `/` - API info
- **GET** `/health` - Health check
- **GET** `/docs` - Interactive API documentation (Swagger)

---

## 🎨 Frontend Pages

### Public Pages
- `/` - Home (redirects to login if not authenticated)
- `/login` - Login page
- `/register` - Registration page

### Protected Pages (require login)
- `/dashboard` - Main dashboard with module cards
- `/imports/new` - CSV upload page

### Pending Pages
- `/wines` - Wine list (to be built)
- `/wines/{id}` - Wine detail page (to be built)

---

## 🎨 Design System

### Color Palette
```javascript
wine: {
  50:  '#fdf8f6',  // Backgrounds
  100: '#f7ede8',
  600: '#a85d4a',  // Primary actions
  700: '#8b4839',  // Hover states
}

clay: {
  50:  '#f9f7f4',
  700: '#715542',
}

sage: {
  50:  '#f6f7f4',
  700: '#475238',
}
```

### Typography
- **Sans**: System fonts (native iOS/Android feel)
- **Serif**: Georgia, Cambria (for warmth)

### Design Principles
1. Confident, never pushy
2. Positive by design
3. Frictionless motion
4. Familiar, not generic
5. Human in the loop
6. Quiet confidence

---

## 🚀 Deployment Setup

### Backend (Render)
- **Service**: `pocket-pallet` (Web Service)
- **Root Directory**: `PP_MVP/backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Python Version**: 3.13 (default)

**Environment Variables**:
```
DATABASE_URL=<PostgreSQL internal URL>
DATABASE_URL_SYNC=<same as above>
SECRET_KEY=<generated with openssl rand -hex 32>
CORS_ORIGINS=https://pocket-pallet.vercel.app,https://pocket-pallet-33tmhnalg-bobbyai.vercel.app,http://localhost:3000
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
```

### Frontend (Vercel)
- **Project**: `pocket-pallet`
- **Root Directory**: `PP_MVP/frontend`
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

**Environment Variables**:
```
NEXT_PUBLIC_API_URL=https://pocket-pallet.onrender.com
```

### Database (Render PostgreSQL)
- **Name**: `pocket-pallet-db`
- **Plan**: Free tier
- **Tables**: `users`, `wines`

---

## 📊 Current Data

### Wines Imported
- **Source**: `Buvons_sample_wines__for_import_.csv`
- **Count**: 16 wines (as of last CSV upload)
- **Columns**: name, price_usd, url, region, grapes, vintage, notes

### Users
- **Count**: 1 user (bobbyc)

---

## 🐛 Known Issues & Fixes

### Issue 1: Python Version Compatibility
- **Problem**: Python 3.13 had issues with pydantic-core compilation
- **Solution**: Upgraded all dependencies to Python 3.13 compatible versions
- **Files Changed**: `requirements.txt`

### Issue 2: Database Schema Mismatch
- **Problem**: Old database had tables without `username` column
- **Solution**: Dropped and recreated schema (one-time fix)
- **Status**: Resolved

### Issue 3: bcrypt/passlib Compatibility
- **Problem**: bcrypt 4.1.3+ incompatible with passlib 1.7.4
- **Solution**: Downgraded to bcrypt 4.0.1
- **Files Changed**: `requirements.txt`

### Issue 4: CORS Errors
- **Problem**: Frontend URL not in backend CORS_ORIGINS
- **Solution**: Added all Vercel URLs to CORS_ORIGINS environment variable
- **Status**: Resolved

---

## 🔄 Git Repository

- **GitHub**: https://github.com/BobbyC100/Pocket_Pallet
- **Branch**: `main`
- **Latest Commit**: `4ba4128` - "feat: add CSV wine import functionality"

---

## 🎯 Next Steps (Not Yet Built)

### High Priority
1. **Wines List Page** (`/wines`)
   - Display all wines in a table/grid
   - Search and filter functionality
   - Pagination

2. **Update Dashboard**
   - Show real wine count (fetch from `/api/v1/wines/count`)
   - Add link to wines page
   - Update stats cards

3. **Wine Detail Page** (`/wines/{id}`)
   - Show full wine information
   - Edit wine details
   - Delete wine

### Medium Priority
4. **Journal Module**
   - Photo upload
   - Tasting notes
   - Rating system

5. **Discovery Module**
   - Personalized recommendations
   - Browse by region/grape

6. **Companion Module**
   - Label scanning (OCR)
   - Quick wine lookup

### Low Priority
7. **User Profile**
8. **Export wines to CSV**
9. **Bulk wine operations**

---

## 🔧 Local Development

### Backend
```bash
cd PP_MVP/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with:
# DATABASE_URL=postgresql://...
# SECRET_KEY=...
# CORS_ORIGINS=http://localhost:3000

uvicorn app.main:app --reload
# Backend runs at http://localhost:8000
```

### Frontend
```bash
cd PP_MVP/frontend
npm install

# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
# Frontend runs at http://localhost:3000
```

---

## 📖 API Documentation

Interactive API docs available at:
- **Swagger UI**: https://pocket-pallet.onrender.com/docs
- **ReDoc**: https://pocket-pallet.onrender.com/redoc

---

## 🆘 Troubleshooting

### "CORS policy" error in browser
- **Cause**: Backend rejecting frontend URL
- **Fix**: Add frontend URL to `CORS_ORIGINS` in Render environment variables

### "404 Not Found" on API requests
- **Cause**: Wrong API endpoint path
- **Fix**: Verify using `/api/v1/` prefix (not `/api/`)

### "401 Unauthorized"
- **Cause**: Invalid or expired JWT token
- **Fix**: Log out and log back in to get fresh token

### CSV upload fails
- **Cause**: File too large or wrong format
- **Fix**: Ensure file is .csv and under 50MB

### Backend build fails on Render
- **Cause**: Python version or dependency compatibility
- **Fix**: Check `requirements.txt` for compatible versions

---

## 📞 Important Commands

```bash
# Commit and push changes
git add .
git commit -m "your message"
git push origin main

# Install new frontend dependency
cd PP_MVP/frontend
npm install <package-name>

# Install new backend dependency
cd PP_MVP/backend
pip install <package-name>
pip freeze > requirements.txt

# Check backend health
curl https://pocket-pallet.onrender.com/health

# Test CSV upload
curl -X POST https://pocket-pallet.onrender.com/api/v1/imports/csv \
  -F "file=@Buvons_sample_wines__for_import_.csv"
```

---

## 🎉 What Works Right Now

✅ User registration and login  
✅ JWT authentication with token management  
✅ CSV wine import (drag-and-drop, progress tracking)  
✅ Wine data storage in PostgreSQL  
✅ Backend API endpoints for wines (list, count, get by ID)  
✅ Beautiful wine-inspired UI design  
✅ Deployed and live on Vercel + Render  

---

## 📝 Notes for Future AI Assistant

- The codebase uses **Next.js 14 App Router** (not Pages Router)
- All frontend components must be marked `"use client"` if using React hooks
- Backend uses `/api/v1/` prefix for all endpoints
- Authentication tokens stored in browser localStorage
- Wine CSV format: `name, price_usd, url, region, grapes, vintage, notes`
- Database schema auto-creates on backend startup via `Base.metadata.create_all()`
- Render free tier sleeps after 15 minutes of inactivity (first request may be slow)

---

**End of Document**

