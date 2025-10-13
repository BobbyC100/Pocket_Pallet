#!/bin/bash

echo "🧪 Testing CORS Preflight Request"
echo "=================================="
echo ""

echo "📡 Sending OPTIONS request (simulating browser preflight)..."
echo ""

curl -i -X OPTIONS \
  -H "Origin: https://pocket-pallet.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://pocket-pallet.onrender.com/api/v1/ocr/wine-list

echo ""
echo "=================================="
echo ""
echo "✅ Look for these headers above:"
echo "   - HTTP/1.1 200 OK (or 204)"
echo "   - Access-Control-Allow-Origin: https://pocket-pallet.vercel.app"
echo "   - Access-Control-Allow-Methods: ... POST ..."
echo "   - Access-Control-Allow-Headers: ... content-type ..."
echo ""
echo "If you see these, CORS is working correctly!"

