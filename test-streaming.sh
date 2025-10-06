#!/bin/bash

# Test Streaming Generation Feature
# This script tests the new SSE streaming endpoint

echo "🧪 Testing Streaming Generation Feature"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test data
TEST_DATA='{
  "companyId": "test-streaming",
  "responses": {
    "stage": "early_traction",
    "vision_audience_timing": "Building AI-powered test automation",
    "hard_decisions": "Build vs buy decisions",
    "success_definition": "Become market leader",
    "core_principles": "Quality first, move fast",
    "required_capabilities": "AI models, testing frameworks",
    "current_state": "3 founders, 2 customers, $500K raised",
    "vision_purpose": "Make testing effortless",
    "vision_endstate": "Every developer uses our platform"
  }
}'

echo -e "${YELLOW}📡 Testing streaming endpoint...${NC}"
echo ""

# Test the streaming endpoint
RESPONSE=$(curl -N -s http://localhost:3002/api/vision-framework-v2/generate-stream \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  --max-time 90 \
  2>&1)

# Check if we got streaming data
if echo "$RESPONSE" | grep -q "data:"; then
  echo -e "${GREEN}✅ Streaming endpoint is working!${NC}"
  echo ""
  echo "Sample events received:"
  echo "$RESPONSE" | grep "data:" | head -5
  echo ""
  echo -e "${GREEN}✅ Test passed! Streaming is functional.${NC}"
  exit 0
else
  echo -e "${RED}❌ No streaming data received${NC}"
  echo ""
  echo "Response:"
  echo "$RESPONSE"
  exit 1
fi

