#!/bin/bash

# Setup script for testing Google Docs Add-on locally

echo "🚀 Banyan Google Docs Add-on - Local Testing Setup"
echo "=================================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "Install it with:"
    echo "  brew install ngrok"
    echo ""
    echo "Or download from: https://ngrok.com/download"
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "⚠️  Warning: Backend server doesn't appear to be running on port 3000"
    echo ""
    echo "Start it with:"
    echo "  cd /Users/bobbyciccaglione/Banyan"
    echo "  npm run dev"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to exit..."
else
    echo "✅ Backend server is running on port 3000"
fi

echo ""
echo "🔗 Starting ngrok tunnel..."
echo ""
echo "=================================================="
echo "COPY THIS URL TO Code.gs LINE 14:"
echo "=================================================="
echo ""

# Start ngrok and show the URL
ngrok http 3000

echo ""
echo "When you're done testing, press Ctrl+C to stop ngrok"

