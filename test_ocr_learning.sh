#!/bin/bash

# Test OCR Learning System API Endpoints
# Usage: ./test_ocr_learning.sh YOUR_JWT_TOKEN

TOKEN="$1"

if [ -z "$TOKEN" ]; then
  echo "❌ Usage: ./test_ocr_learning.sh YOUR_JWT_TOKEN"
  echo ""
  echo "To get your token:"
  echo "1. Login at https://pocket-pallet.vercel.app/login"
  echo "2. Open browser console (F12)"
  echo "3. Type: localStorage.getItem('token')"
  echo "4. Copy the token (without quotes)"
  exit 1
fi

API_URL="https://pocket-pallet.onrender.com"

echo "🧪 Testing OCR Learning System"
echo "================================"
echo ""

# Test 1: Submit Accept Feedback
echo "📝 Test 1: Submit 'Accept' feedback..."
curl -s -X POST "$API_URL/api/v1/ocr/feedback" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "Château Margaux 2015 $350",
    "confidence": 0.95,
    "parsed_name": "Château Margaux",
    "parsed_vintage": "2015",
    "parsed_price": "350",
    "action": "accept"
  }' | python3 -m json.tool
echo ""

# Test 2: Submit Edit Feedback
echo "✏️  Test 2: Submit 'Edit' feedback..."
curl -s -X POST "$API_URL/api/v1/ocr/feedback" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "Dom Perignon NV $200",
    "confidence": 0.80,
    "parsed_name": "Dom Perignon NV",
    "action": "edit",
    "corrected_name": "Dom Pérignon",
    "corrected_vintage": "NV",
    "corrected_price": "200"
  }' | python3 -m json.tool
echo ""

# Test 3: Submit Reject Feedback
echo "❌ Test 3: Submit 'Reject' feedback..."
curl -s -X POST "$API_URL/api/v1/ocr/feedback" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "Please see our full wine list below",
    "confidence": 0.60,
    "parsed_name": "Please see our full wine list below",
    "action": "reject"
  }' | python3 -m json.tool
echo ""

# Test 4: Get Recent Feedback
echo "📊 Test 4: Get recent feedback..."
curl -s -X GET "$API_URL/api/v1/ocr/feedback/recent?limit=5" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Test 5: Get Feedback Stats
echo "📈 Test 5: Get feedback stats..."
curl -s -X GET "$API_URL/api/v1/ocr/feedback/stats" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "✅ All tests complete!"
echo ""
echo "Next steps:"
echo "1. Upload a wine list at /ocr"
echo "2. Check if the learning system applied your feedback"
echo "3. Monitor confidence score adjustments"

