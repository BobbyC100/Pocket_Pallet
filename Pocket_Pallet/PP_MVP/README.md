# Pocket Pallet — Admin Console & Ingestion v1

A full-stack wine catalog management system with manual entry, bulk import, fuzzy matching, and comprehensive data lineage tracking.

## Overview

Pocket Pallet provides a unified platform for managing wine catalog data from multiple sources. Both manual edits and large bulk uploads share the same normalization, validation, and matching pipeline, ensuring consistency and data quality.

### Key Features

- **Manual Entry**: Create/edit single wines with inline validation and auto-save drafts
- **Bulk Import**: Upload multi-GB files (CSV/Parquet/JSONL/XLSX) with async processing
- **Fuzzy Matching**: Automatic duplicate detection with confidence scoring
- **Review Queue**: Human review for matches between 75-89% confidence
- **Version History**: Full audit trail with rollback capability
- **Role-Based Access**: Viewer, Editor, Importer, and Admin roles
- **Data Lineage**: Track every change back to its source

## Architecture

### Backend (Python/FastAPI)
- **API**: RESTful endpoints with OpenAPI documentation
- **Database**: PostgreSQL with async SQLAlchemy
- **Validation**: Shared validators for all data entry points
- **Matching**: Levenshtein-based fuzzy matching with blocking
- **Background Jobs**: Celery for async import processing

### Frontend (React/TypeScript)
- **Framework**: Vite + React 18 + TypeScript
- **Routing**: React Router v6
- **State**: Zustand for auth, TanStack Query for server state
- **Styling**: Tailwind CSS with custom design system
- **Forms**: React Hook Form with Zod validation

## Project Structure

```
PP_MVP/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/    # API routes
│   │   ├── core/             # Config, security
│   │   ├── db/               # Database session
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── validators/       # Validation rules
│   │   └── utils/            # Matching engine
│   ├── migrations/           # Alembic migrations
│   ├── tests/                # Unit & integration tests
│   └── requirements.txt      # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page components
    │   ├── services/         # API clients
    │   ├── hooks/            # Custom React hooks
    │   ├── types/            # TypeScript types
    │   └── utils/            # Helper functions
    ├── package.json          # Node dependencies
    └── vite.config.ts        # Vite configuration
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+ (for background jobs)

### Backend Setup

1. **Install Python dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and settings
   ```

3. **Set up database**:
   ```bash
   # Create database
   createdb pocket_pallet
   
   # Run migrations
   alembic upgrade head
   ```

4. **Create initial admin user** (optional):
   ```python
   python -c "
   import asyncio
   from app.db.session import AsyncSessionLocal
   from app.services.user import create_user
   from app.schemas.user import UserCreate, Role
   
   async def create_admin():
       async with AsyncSessionLocal() as db:
           await create_user(db, UserCreate(
               email='admin@example.com',
               password='changeme',
               full_name='Admin User',
               role=Role.ADMIN
           ))
   
   asyncio.run(create_admin())
   "
   ```

5. **Start the server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Start Celery worker** (in another terminal):
   ```bash
   celery -A app.services.celery worker --loglevel=info
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment** (optional):
   ```bash
   echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open http://localhost:3000 in your browser

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - Login and get JWT token
- `POST /api/v1/auth/register` - Register new user

#### Wines (Manual Entry)
- `GET /api/v1/wines/search?q={query}` - Search wines
- `GET /api/v1/wines/{id}` - Get wine details
- `POST /api/v1/wines` - Create new wine
- `PUT /api/v1/wines/{id}` - Update wine
- `GET /api/v1/wines/{id}/versions` - Get version history
- `POST /api/v1/wines/{id}/rollback/{version_id}` - Rollback to version

#### Drafts
- `GET /api/v1/wines/drafts/wine/{id}` - Get draft
- `POST /api/v1/wines/drafts/wine` - Save draft (autosave)
- `POST /api/v1/wines/drafts/{id}/publish` - Publish draft
- `POST /api/v1/wines/preview-merge` - Preview merge results

#### Bulk Import
- `POST /api/v1/imports` - Create import job
- `GET /api/v1/imports` - List import jobs
- `GET /api/v1/imports/{id}` - Get import details
- `POST /api/v1/imports/{id}/cancel` - Cancel import
- `GET /api/v1/imports/mappings` - List mappings
- `POST /api/v1/imports/mappings` - Create mapping

#### Review Queue
- `GET /api/v1/review-queue` - List merge candidates
- `GET /api/v1/review-queue/{id}` - Get candidate details
- `POST /api/v1/review-queue/{id}/accept` - Accept merge
- `POST /api/v1/review-queue/{id}/reject` - Reject merge
- `GET /api/v1/review-queue/stats/summary` - Get queue stats

## User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Viewer** | Read-only: search, view wine details & lineage |
| **Editor** | Manual create/edit, draft/publish, resolve review queue |
| **Importer** | Start/abort imports, manage mappings, publish import results |
| **Admin** | All + manage sources, grapes/regions dictionaries, role assignments |

## Data Flow

### Manual Entry Flow
1. User creates/edits wine in form
2. Auto-save to `draft_versions` every 1-2s
3. "Preview Merge" runs matching against canonical wines
4. "Publish" creates/updates wine and records version
5. Audit log captures change with diff

### Bulk Import Flow
1. Upload file (resumable for large files)
2. Choose/create column mapping
3. Validate sample (first 1000 rows)
4. Run import job (async via Celery)
5. Process each row:
   - Validate against rules
   - Normalize producer, cuvée, grapes
   - Run fuzzy matching
   - Auto-merge (≥90%), queue for review (75-89%), or create new (<75%)
6. Review queue items require human decision
7. Finalize with stats and lineage links

### Fuzzy Matching Algorithm

**Blocking**: Filter by normalized producer + vintage/NV

**Scoring** (weighted average):
- Producer name similarity (40%) - Levenshtein ratio
- Cuvée similarity (30%) - if both have cuvée
- Vintage exact match (15%)
- Grape overlap (10%) - Jaccard similarity
- Region match (5%) - bonus points

**Thresholds**:
- ≥ 0.90: Auto-merge
- 0.75-0.89: Review queue
- < 0.75: Create new wine

## Database Schema

### Core Tables
- `users` - Authentication and authorization
- `wines` - Canonical wine records
- `wine_versions` - Version history snapshots
- `draft_versions` - Work-in-progress drafts
- `producers` - Wine producers/wineries
- `regions`, `countries` - Geographic data
- `grapes` - Grape varieties
- `markets` - Pricing and availability
- `sources` - Data source definitions

### Import & Lineage
- `import_jobs` - Bulk import tracking
- `import_mappings` - Column mapping configs
- `lineage` - Data provenance tracking
- `merge_candidates` - Review queue items
- `attachments` - File attachments
- `audit_log` - Complete change history

## Validation Rules

### Producer
- Required
- 2-120 characters
- Diacritics normalized

### Vintage
- Integer 1900-current year (or +2 for futures)
- OR `is_nv = true`
- Cannot have both

### ABV
- 5.0-18.0%
- Warning if outside 8.0-16.0%

### Currency
- ISO-4217 code
- Required if price specified

### Price
- >= 0
- Warning if > 10,000

## Development

### Running Tests

Backend:
```bash
cd backend
pytest
```

Frontend:
```bash
cd frontend
npm run test
```

### Code Quality

Backend:
```bash
# Format
black app/

# Lint
flake8 app/

# Type check
mypy app/
```

Frontend:
```bash
# Lint
npm run lint

# Type check
npm run type-check
```

### Database Migrations

Create new migration:
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback:
```bash
alembic downgrade -1
```

## Production Deployment

### Backend

1. Set production environment variables
2. Use gunicorn with uvicorn workers:
   ```bash
   gunicorn app.main:app \
     --workers 4 \
     --worker-class uvicorn.workers.UvicornWorker \
     --bind 0.0.0.0:8000
   ```
3. Set up Celery workers with supervisor/systemd
4. Use Redis for Celery broker
5. Configure PostgreSQL connection pooling
6. Enable CORS for your frontend domain
7. Use nginx as reverse proxy
8. Enable HTTPS with Let's Encrypt

### Frontend

1. Build production assets:
   ```bash
   npm run build
   ```
2. Serve `dist/` folder with nginx or CDN
3. Set `VITE_API_URL` to production API URL
4. Enable compression (gzip/brotli)
5. Configure caching headers

### Database

1. Regular backups (pg_dump)
2. Connection pooling (PgBouncer)
3. Read replicas for analytics
4. Monitoring (pg_stat_statements)
5. Regular VACUUM ANALYZE

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep pocket_pallet`
- Check migrations: `alembic current`
- Review .env configuration

### Frontend API errors
- Verify backend is running: `curl http://localhost:8000/health`
- Check CORS configuration in backend
- Inspect browser console for errors
- Verify JWT token in localStorage

### Import jobs stuck
- Check Celery worker is running
- Review Celery logs for errors
- Verify Redis connection
- Check disk space for file uploads

## Future Enhancements

- [ ] Advanced producer search with fuzzy matching
- [ ] Batch edit multiple wines
- [ ] Export wines to various formats
- [ ] Rich text editor for notes
- [ ] Image upload and display
- [ ] Advanced filtering and saved searches
- [ ] Email notifications for import completion
- [ ] GraphQL API option
- [ ] Real-time updates via WebSockets
- [ ] Machine learning for better matching

## License

Proprietary - All rights reserved

## Support

For questions or issues, contact: support@pocketpallet.com

