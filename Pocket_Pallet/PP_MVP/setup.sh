#!/bin/bash

# Pocket Pallet Setup Script
# This script sets up the development environment

set -e

echo "🍷 Setting up Pocket Pallet Admin Console..."
echo ""

# Check prerequisites
echo "Checking prerequisites..."
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL is required but not installed."; exit 1; }
echo "✅ Prerequisites check passed"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Created Python virtual environment"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
echo "✅ Installed Python dependencies"

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file from example"
        echo "⚠️  Please edit backend/.env with your database credentials"
    else
        echo "⚠️  No .env.example file found"
    fi
fi

cd ..

# Frontend setup
echo ""
echo "🎨 Setting up frontend..."
cd frontend

# Install dependencies
npm install
echo "✅ Installed Node dependencies"

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
    echo "✅ Created frontend/.env file"
fi

cd ..

# Database setup
echo ""
echo "🗄️  Setting up database..."
read -p "Create database 'pocket_pallet'? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    createdb pocket_pallet 2>/dev/null || echo "Database might already exist"
    echo "✅ Database created"
fi

# Run migrations
echo ""
read -p "Run database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend
    source venv/bin/activate
    alembic upgrade head
    echo "✅ Migrations completed"
    cd ..
fi

# Create admin user
echo ""
read -p "Create admin user? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Admin email: " admin_email
    read -sp "Admin password: " admin_password
    echo
    
    cd backend
    source venv/bin/activate
    python3 -c "
import asyncio
from app.db.session import AsyncSessionLocal
from app.services.user import create_user
from app.schemas.user import UserCreate, Role

async def create_admin():
    async with AsyncSessionLocal() as db:
        try:
            await create_user(db, UserCreate(
                email='$admin_email',
                password='$admin_password',
                full_name='Admin User',
                role=Role.ADMIN
            ))
            print('✅ Admin user created')
        except Exception as e:
            print(f'❌ Error creating admin user: {e}')

asyncio.run(create_admin())
"
    cd ..
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the development servers:"
echo ""
echo "Backend:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Or use Docker Compose:"
echo "  docker-compose up"
echo ""
echo "Visit http://localhost:3000 to access the admin console"
echo "API docs available at http://localhost:8000/docs"
echo ""

