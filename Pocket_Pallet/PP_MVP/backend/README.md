# Pocket Pallet Backend

FastAPI-based backend for the Pocket Pallet wine catalog management system.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Set up database
createdb pocket_pallet
alembic upgrade head

# Run server
uvicorn app.main:app --reload
```

## API Documentation

Visit http://localhost:8000/docs for interactive API documentation.

## Project Structure

```
app/
├── api/endpoints/    # API route handlers
├── core/            # Configuration and security
├── db/              # Database connection
├── models/          # SQLAlchemy models
├── schemas/         # Pydantic schemas
├── services/        # Business logic
├── validators/      # Validation rules
└── utils/           # Matching engine
```

## Key Components

### Models
All database models using SQLAlchemy ORM with async support.

### Schemas
Pydantic models for request/response validation.

### Services
Business logic layer separating API from data access.

### Validators
Reusable validation functions for wine data.

### Utils
Fuzzy matching engine for duplicate detection.

## Testing

```bash
pytest
```

## Code Quality

```bash
# Format
black app/

# Lint
flake8 app/

# Type check
mypy app/
```

