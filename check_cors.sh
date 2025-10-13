#!/bin/bash

echo "🔍 Checking CORS Configuration"
echo "================================"
echo ""

echo "📡 Testing CORS preflight request to Render backend..."
echo ""

# Send OPTIONS request (CORS preflight)
curl -X OPTIONS https://pocket-pallet.onrender.com/api/v1/ocr/wine-list \
  -H "Origin: https://pocket-pallet.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i 2>&1 | grep -i "access-control"

echo ""
echo "================================"
echo ""
echo "✅ If you see 'Access-Control-Allow-Origin' header above, CORS is working!"
echo "❌ If empty or error, you need to update CORS_ORIGINS on Render."
echo ""
echo "Expected header:"
echo "  Access-Control-Allow-Origin: https://pocket-pallet.vercel.app"
echo ""
echo "To fix:"
echo "  1. Go to Render Dashboard → Your Service → Environment"
echo "  2. Set CORS_ORIGINS to: http://localhost:3000,https://pocket-pallet.vercel.app"
echo "  3. Save and wait for redeploy"

