# Pocket Pallet Backend API

FastAPI-based backend for the Pocket Pallet wine management application.

## Features

- 🔐 JWT-based authentication
- 👤 User registration and login
- 🗄️ PostgreSQL database with SQLAlchemy
- 📝 Pydantic schemas for validation
- 🔄 CORS middleware configured
- 📚 Auto-generated API documentation (OpenAPI/Swagger)

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Database
- **Pydantic** - Data validation
- **Python-JOSE** - JWT tokens
- **Passlib** - Password hashing

## Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL database

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Set `SECRET_KEY` to a secure random string
   - Update `CORS_ORIGINS` with your frontend URL

### Database Setup

The application will automatically create tables on startup. For production, you should use Alembic for migrations:

```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create a migration
alembic revision --autogenerate -m "Initial migration"

# Run migrations
alembic upgrade head
```

### Running the Application

Development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Production server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### API Documentation

Once the server is running, access the interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/api/v1/openapi.json`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login (OAuth2 password flow)
  ```
  Content-Type: application/x-www-form-urlencoded
  
  username=user@example.com&password=password123
  ```

- `GET /api/auth/me` - Get current user (requires authentication)

### Health Check

- `GET /health` - Health check endpoint
- `GET /` - API root with version info

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   └── auth.py         # Auth endpoints
│   │   └── deps.py             # Dependencies
│   ├── core/
│   │   ├── config.py           # Settings
│   │   └── security.py         # Security utils
│   ├── db/
│   │   ├── base.py             # Base model
│   │   └── session.py          # Database session
│   ├── models/
│   │   └── user.py             # User model
│   ├── schemas/
│   │   ├── user.py             # User schemas
│   │   └── token.py            # Token schemas
│   ├── services/
│   │   └── user_service.py     # User business logic
│   └── main.py                 # FastAPI app
├── .env.example                # Environment variables template
├── requirements.txt            # Python dependencies
└── Procfile                    # Heroku deployment
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SECRET_KEY` | JWT secret key | Required |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | 30 |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

## Deployment

### Heroku

1. Create a new Heroku app:
```bash
heroku create your-app-name
```

2. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:mini
```

3. Set environment variables:
```bash
heroku config:set SECRET_KEY=your-secret-key
heroku config:set CORS_ORIGINS=https://your-frontend.vercel.app
```

4. Deploy:
```bash
git push heroku main
```

### Railway

1. Create a new project on [Railway](https://railway.app)
2. Add a PostgreSQL database
3. Connect your GitHub repository
4. Set environment variables in the Railway dashboard
5. Deploy!

## Testing

Run tests with pytest:
```bash
pytest
```

## Security Notes

- Always use HTTPS in production
- Never commit `.env` files
- Use strong SECRET_KEY (generate with `openssl rand -hex 32`)
- Keep dependencies updated
- Use environment-specific configurations

## License

Private - All rights reserved

