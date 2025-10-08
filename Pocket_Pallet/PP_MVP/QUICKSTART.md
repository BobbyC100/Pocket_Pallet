# Pocket Pallet - Quick Start Guide

Get up and running in 5 minutes!

## Option 1: Docker Compose (Recommended)

The easiest way to get started. Requires only Docker and Docker Compose.

```bash
# Start all services
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

That's it! All services (PostgreSQL, Redis, Backend, Frontend, Celery) will start automatically.

### Default Credentials

Since this is a fresh install, you'll need to create an admin user:

```bash
# In another terminal
docker-compose exec backend python3 -c "
import asyncio
from app.db.session import AsyncSessionLocal
from app.services.user import create_user
from app.schemas.user import UserCreate, Role

async def create_admin():
    async with AsyncSessionLocal() as db:
        await create_user(db, UserCreate(
            email='admin@example.com',
            password='admin123',
            full_name='Admin User',
            role=Role.ADMIN
        ))

asyncio.run(create_admin())
"
```

Then login with:
- Email: `admin@example.com`
- Password: `admin123`

## Option 2: Manual Setup

Requires Python 3.11+, Node.js 18+, PostgreSQL 14+, and Redis 7+.

### 1. Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Install dependencies
- ✅ Create .env files
- ✅ Set up database
- ✅ Run migrations
- ✅ Create admin user (optional)

### 2. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Celery Worker (for imports):**
```bash
cd backend
source venv/bin/activate
celery -A app.services.celery worker --loglevel=info
```

**Terminal 4 - Redis:**
```bash
redis-server
```

### 3. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Option 3: Using Makefile

If you have `make` installed:

```bash
# Install dependencies
make install

# Start backend
make dev-backend

# In another terminal, start frontend
make dev-frontend

# In another terminal, start worker
make dev-worker
```

## Next Steps

### 1. Create Your First Wine

1. Login to http://localhost:3000
2. Click "New Wine" in the top right
3. Fill out the form (producer ID 1 is created by default)
4. Click "Publish"

### 2. Try Bulk Import

1. Go to "Imports" tab
2. Click "New Import"
3. Upload a CSV file with wine data
4. Choose or create a column mapping
5. Monitor the import progress

### 3. Review Fuzzy Matches

1. Go to "Review Queue" tab
2. See wines that matched 75-89% confidence
3. Accept to merge or reject to create new
4. View detailed match scoring

## Sample CSV for Testing

Create a file `sample_wines.csv`:

```csv
producer,cuvee,vintage,is_nv,abv,wine_type
Chateau Margaux,Grand Vin,2015,false,13.5,red
Domaine de la Romanée-Conti,La Tâche,2018,false,13.0,red
Krug,Grande Cuvée,2012,false,12.5,sparkling
```

## Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep pocket_pallet

# Run migrations
cd backend && alembic upgrade head
```

### Frontend shows API errors
```bash
# Check backend is running
curl http://localhost:8000/health

# Should return: {"status":"healthy"}
```

### Import jobs stuck
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG

# Check Celery worker is running
# You should see worker logs
```

## Getting Help

- 📖 Full documentation: See README.md
- 🐛 Found a bug? Open an issue
- 💡 Have a suggestion? We'd love to hear it!
- 📧 Email: support@pocketpallet.com

## What's Next?

- Explore the API docs at http://localhost:8000/docs
- Try the search functionality
- View wine version history
- Test the draft autosave feature
- Import a large CSV file
- Review the fuzzy match scores

Happy cataloging! 🍷

