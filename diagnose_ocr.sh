#!/bin/bash

echo "🔍 Pocket Pallet OCR Diagnostics"
echo "=================================="
echo ""

# Test 1: Backend Health
echo "1️⃣  Testing backend health..."
HEALTH=$(curl -s https://pocket-pallet.onrender.com/health)
echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "❌ Backend not responding"
echo ""

# Test 2: OCR Health
echo "2️⃣  Testing OCR endpoint health..."
OCR_HEALTH=$(curl -s https://pocket-pallet.onrender.com/api/v1/ocr/health)
echo "$OCR_HEALTH" | python3 -m json.tool 2>/dev/null || echo "❌ OCR endpoint not responding"
echo ""

# Test 3: CORS Preflight
echo "3️⃣  Testing CORS preflight..."
CORS_RESPONSE=$(curl -s -i -X OPTIONS \
  -H "Origin: https://pocket-pallet.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://pocket-pallet.onrender.com/api/v1/ocr/wine-list 2>&1)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo "✅ CORS headers present:"
    echo "$CORS_RESPONSE" | grep -i "access-control"
else
    echo "❌ CORS headers missing!"
    echo "Response:"
    echo "$CORS_RESPONSE" | head -20
fi
echo ""

# Test 4: Azure Connection
echo "4️⃣  Testing Azure Document Intelligence connection..."
AZURE_TEST=$(curl -s https://pocket-pallet.onrender.com/api/v1/ocr/test-azure-connection)
echo "$AZURE_TEST" | python3 -m json.tool 2>/dev/null || echo "❌ Azure test endpoint failed"
echo ""

# Summary
echo "=================================="
echo "📋 Summary:"
echo ""

# Check if backend is healthy
if echo "$HEALTH" | grep -q "healthy"; then
    echo "✅ Backend is running"
else
    echo "❌ Backend health check failed"
fi

# Check if OCR is configured
if echo "$OCR_HEALTH" | grep -q '"configured": true'; then
    echo "✅ OCR is configured"
else
    echo "❌ OCR is not configured (missing Azure env vars)"
fi

# Check CORS
if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo "✅ CORS is properly configured"
else
    echo "❌ CORS is not working"
fi

# Check Azure connection
if echo "$AZURE_TEST" | grep -q '"ok": true'; then
    echo "✅ Azure connection successful"
else
    echo "⚠️  Azure connection issue (check API key)"
fi

echo ""
echo "=================================="
echo ""
echo "Next steps:"
echo "1. If backend is down: Check Render logs"
echo "2. If CORS fails: Update CORS_ORIGINS on Render"
echo "3. If Azure fails: Check AZURE_DOC_INTEL_ENDPOINT and AZURE_DOC_INTEL_KEY"
echo "4. Try uploading at: https://pocket-pallet.vercel.app/ocr"

