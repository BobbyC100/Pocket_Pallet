#!/bin/bash

# Pocket Pallet Local Testing Script
# This script helps you test the application locally before deploying

echo "🍷 Pocket Pallet Local Test Setup"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "PP_MVP" ]; then
    echo -e "${RED}Error: Please run this script from the Pocket_Pallet directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python found: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}✗ Python 3 not found. Please install Python 3.9+${NC}"
    exit 1
fi

# Check Node
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm found: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found. Please install npm${NC}"
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}✓ PostgreSQL found: $PSQL_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL not found. You'll need a PostgreSQL database${NC}"
    echo "  You can use a cloud database or install locally:"
    echo "  - Mac: brew install postgresql"
    echo "  - Ubuntu: sudo apt install postgresql"
    echo "  - Or use a cloud service like ElephantSQL, Neon, or Supabase"
fi

echo ""
echo -e "${YELLOW}Step 2: Setting up backend...${NC}"

cd PP_MVP/backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ No .env file found. Creating from template...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${RED}IMPORTANT: Edit PP_MVP/backend/.env with your database credentials!${NC}"
        echo "You need to set:"
        echo "  - DATABASE_URL (PostgreSQL connection string)"
        echo "  - SECRET_KEY (run: openssl rand -hex 32)"
    fi
fi

echo ""
echo -e "${YELLOW}Step 3: Setting up frontend...${NC}"

cd ../frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

# Check for .env.local file
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ No .env.local file found. Creating default...${NC}"
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
    echo -e "${GREEN}✓ Created .env.local with default backend URL${NC}"
fi

cd ../..

echo ""
echo "=================================="
echo -e "${GREEN}Setup complete!${NC}"
echo "=================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend (in one terminal):"
echo "   cd PP_MVP/backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   cd PP_MVP/frontend"
echo "   npm run dev"
echo ""
echo "3. Open your browser:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Don't forget to:${NC}"
echo "  - Edit backend/.env with your database credentials"
echo "  - Make sure PostgreSQL is running"
echo ""

