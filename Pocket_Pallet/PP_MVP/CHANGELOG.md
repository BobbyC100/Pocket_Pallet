# Changelog

All notable changes to Pocket Pallet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-08

### Added
- Initial release of Pocket Pallet Admin Console v1
- Manual wine entry with inline validation
- Auto-save drafts every 1-2 seconds
- Preview merge functionality before publishing
- Full version history and rollback capability
- Bulk import for CSV, Parquet, JSONL, and XLSX files
- Resumable uploads for large files
- Async import processing with Celery
- Fuzzy matching engine with configurable thresholds
- Review queue for human verification of matches (75-89% confidence)
- Side-by-side comparison of merge candidates
- Role-based access control (Viewer, Editor, Importer, Admin)
- Complete audit trail for all data changes
- Data lineage tracking from source to canonical record
- Comprehensive validation rules (producer, vintage, ABV, currency, price)
- Text normalization (diacritics, whitespace, common abbreviations)
- RESTful API with OpenAPI documentation
- React admin console with modern UI
- Real-time import status updates
- Search functionality with fuzzy producer/cuvée matching
- Wine detail view with full relationships
- Import job monitoring and statistics
- Review queue statistics dashboard
- Authentication with JWT tokens
- PostgreSQL database with async SQLAlchemy
- Redis for background job queueing
- Docker Compose for local development
- Comprehensive documentation and setup guides

### Backend Features
- FastAPI framework with async/await
- Pydantic schemas for validation
- SQLAlchemy ORM with relationship loading
- Alembic migrations for schema management
- Celery for background tasks
- Levenshtein-based fuzzy string matching
- Configurable match thresholds
- Source priority and freshness rules
- Attachment support for files/images
- Conflict resolution with manual override

### Frontend Features
- React 18 with TypeScript
- Vite for fast development and builds
- React Router v6 for navigation
- TanStack Query for server state
- Zustand for client state
- React Hook Form with Zod validation
- Tailwind CSS for styling
- Responsive design for all screen sizes
- Toast notifications for user feedback
- Loading states and error handling
- Protected routes with auth guards

### Database Schema
- Users and authentication
- Wines (canonical records)
- Wine versions (history snapshots)
- Draft versions (work-in-progress)
- Producers, regions, countries, grapes
- Market data (pricing, availability)
- Data sources
- Import jobs and mappings
- Merge candidates (review queue)
- Lineage records
- Attachments
- Audit log with GIN indexing

### API Endpoints
- Authentication (login, register)
- Wine CRUD operations
- Draft management (autosave, publish)
- Version history and rollback
- Merge preview
- Bulk import lifecycle
- Import mapping management
- Review queue operations
- Queue statistics
- Search functionality

### Documentation
- Comprehensive README with setup instructions
- API documentation (Swagger/ReDoc)
- Architecture overview
- Data flow diagrams
- Database schema documentation
- Development guidelines
- Contributing guide
- Deployment instructions
- Troubleshooting guide

## [Unreleased]

### Planned Features
- Advanced producer search with autocomplete
- Batch edit multiple wines
- Export wines to various formats
- Rich text editor for notes
- Image upload and display with thumbnails
- Advanced filtering and saved searches
- Email notifications for import completion
- GraphQL API option
- Real-time updates via WebSockets
- Machine learning for improved matching accuracy

