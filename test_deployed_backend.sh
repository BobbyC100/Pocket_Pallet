#!/bin/bash
# Test the deployed backend to diagnose 502 errors

echo "=========================================="
echo "Testing Deployed Pocket Pallet Backend"
echo "=========================================="
echo ""

BASE_URL="https://pocket-pallet.onrender.com"

echo "1. Testing main health endpoint..."
echo "   GET $BASE_URL/health"
HEALTH=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$HEALTH" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ Main health: OK ($HTTP_CODE)"
  echo "   Response: $BODY"
else
  echo "   ❌ Main health: FAILED ($HTTP_CODE)"
  echo "   Response: $BODY"
  echo ""
  echo "   ⚠️  Backend is not responding. Check Render logs for errors."
  exit 1
fi
echo ""

echo "2. Testing OCR health endpoint..."
echo "   GET $BASE_URL/api/v1/ocr/health"
OCR_HEALTH=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/v1/ocr/health" 2>&1)
HTTP_CODE=$(echo "$OCR_HEALTH" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$OCR_HEALTH" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ OCR health: OK ($HTTP_CODE)"
  echo "   Response: $BODY" | head -c 500
  
  # Check if configured
  if echo "$BODY" | grep -q '"configured":true'; then
    echo ""
    echo "   ✅ Azure is CONFIGURED"
  else
    echo ""
    echo "   ⚠️  Azure is NOT configured (environment variables missing)"
  fi
else
  echo "   ❌ OCR health: FAILED ($HTTP_CODE)"
  echo "   Response: $BODY"
fi
echo ""

echo "3. Testing Azure connection..."
echo "   GET $BASE_URL/api/v1/ocr/test-azure-connection"
AZURE_TEST=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/v1/ocr/test-azure-connection" 2>&1)
HTTP_CODE=$(echo "$AZURE_TEST" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$AZURE_TEST" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ Azure connection test: OK ($HTTP_CODE)"
  echo "   Response: $BODY" | head -c 500
  
  # Check if connection succeeded
  if echo "$BODY" | grep -q '"ok":true'; then
    echo ""
    echo "   ✅ Azure connection SUCCESSFUL!"
    echo "   🎉 OCR should work now. Try uploading a wine list."
  else
    echo ""
    echo "   ⚠️  Azure connection failed. Check the error message above."
  fi
else
  echo "   ❌ Azure connection test: FAILED ($HTTP_CODE)"
  echo "   Response: $BODY"
fi
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "If you see 502 errors:"
echo "  1. Check Render dashboard → Your service → Logs"
echo "  2. Look for Python errors or startup failures"
echo "  3. Verify Azure env vars are set in Render"
echo "  4. Make sure deployment shows 'Live' not 'Failed'"
echo ""
echo "If main health is OK but OCR endpoints fail:"
echo "  1. Azure environment variables are missing/incorrect"
echo "  2. Add AZURE_DOC_INTEL_ENDPOINT and AZURE_DOC_INTEL_KEY"
echo "  3. Save and wait for redeploy (2-3 min)"
echo ""

