#!/bin/bash

# Banyan Improvements Test Script
# Tests: Health Check, Request IDs, Rate Limiting

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Banyan Improvements Test Suite       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Check if dev server is running
echo -e "${YELLOW}→${NC} Checking if dev server is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
  echo -e "${RED}✗${NC} Dev server is not running!"
  echo -e "${YELLOW}  Please run: npm run dev${NC}\n"
  exit 1
fi
echo -e "${GREEN}✓${NC} Dev server is running\n"

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check Endpoint${NC}"
echo -e "${YELLOW}→${NC} Calling /api/health..."

HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
HEALTH_STATUS=$(echo $HEALTH_RESPONSE | jq -r '.status')

if [ "$HEALTH_STATUS" = "ok" ]; then
  echo -e "${GREEN}✓${NC} Health check returned 'ok'"
  DB_CHECK=$(echo $HEALTH_RESPONSE | jq -r '.checks.database')
  OPENAI_CHECK=$(echo $HEALTH_RESPONSE | jq -r '.checks.openai')
  
  echo -e "  Database: ${GREEN}$DB_CHECK${NC}"
  echo -e "  OpenAI:   ${GREEN}$OPENAI_CHECK${NC}"
else
  echo -e "${RED}✗${NC} Health check failed!"
  echo $HEALTH_RESPONSE | jq
  exit 1
fi
echo ""

# Test 2: Request ID in Headers
echo -e "${BLUE}Test 2: Request ID Tracking${NC}"
echo -e "${YELLOW}→${NC} Checking for X-Request-ID header..."

REQUEST_ID=$(curl -s -I http://localhost:3000/api/health | grep -i "x-request-id" | cut -d' ' -f2 | tr -d '\r')

if [ -n "$REQUEST_ID" ]; then
  echo -e "${GREEN}✓${NC} Request ID found: ${YELLOW}$REQUEST_ID${NC}"
else
  echo -e "${RED}✗${NC} Request ID header missing!"
  exit 1
fi
echo ""

# Test 3: Rate Limiting (optional - costs money)
echo -e "${BLUE}Test 3: Rate Limiting (Optional - Uses API Credits)${NC}"
read -p "Test rate limiting? This will make 11 AI requests ($1-2 in API costs). [y/N] " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}→${NC} Testing rate limiting (this will take ~2 minutes)..."
  
  SUCCESS_COUNT=0
  RATE_LIMITED=false
  
  for i in {1..11}; do
    echo -ne "  Request $i/11... "
    
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/generate-brief \
      -H "Content-Type: application/json" \
      -d '{
        "responses": {
          "vision_audience_timing": "Test",
          "hard_decisions": "Test",
          "success_definition": "Test",
          "core_principles": "Test",
          "required_capabilities": "Test",
          "current_state": "Test",
          "vision_purpose": "Test",
          "vision_endstate": "Test"
        },
        "anonymousId": "test-script-'$(date +%s)'"
      }')
    
    ERROR=$(echo $RESPONSE | jq -r '.error // "null"')
    
    if [ "$ERROR" = "null" ]; then
      echo -e "${GREEN}OK${NC}"
      ((SUCCESS_COUNT++))
    elif [ "$ERROR" = "Rate limit exceeded" ]; then
      echo -e "${YELLOW}RATE LIMITED${NC}"
      RATE_LIMITED=true
      break
    else
      echo -e "${RED}ERROR: $ERROR${NC}"
    fi
    
    sleep 2
  done
  
  echo ""
  if [ $SUCCESS_COUNT -eq 10 ] && [ "$RATE_LIMITED" = true ]; then
    echo -e "${GREEN}✓${NC} Rate limiting works correctly!"
    echo -e "  Allowed: ${GREEN}10 requests${NC}"
    echo -e "  Blocked: ${YELLOW}11th request${NC}"
  elif [ $SUCCESS_COUNT -eq 11 ]; then
    echo -e "${YELLOW}⚠${NC} Rate limiting may not be enabled"
    echo -e "  All 11 requests succeeded"
    echo -e "  Check: DISABLE_RATE_LIMIT in .env.local"
  else
    echo -e "${RED}✗${NC} Unexpected result"
    echo -e "  Successful: $SUCCESS_COUNT"
    echo -e "  Rate limited: $RATE_LIMITED"
  fi
else
  echo -e "${YELLOW}→${NC} Skipping rate limit test (saves API credits)"
fi
echo ""

# Test 4: Cost Tracking (check if enabled)
echo -e "${BLUE}Test 4: Cost Tracking${NC}"
echo -e "${YELLOW}→${NC} Checking server logs for cost tracking..."
echo -e "  ${YELLOW}Note: This checks if cost tracking is wired up${NC}"
echo -e "  ${YELLOW}Look for '💰 Cost:' lines in your server logs${NC}"
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Test Summary                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo -e "  Health Check:    ${GREEN}✓ Passed${NC}"
echo -e "  Request IDs:     ${GREEN}✓ Passed${NC}"
if [[ $REPLY =~ ^[Yy]$ ]]; then
  if [ $SUCCESS_COUNT -eq 10 ] && [ "$RATE_LIMITED" = true ]; then
    echo -e "  Rate Limiting:   ${GREEN}✓ Passed${NC}"
  else
    echo -e "  Rate Limiting:   ${YELLOW}⚠ Review needed${NC}"
  fi
else
  echo -e "  Rate Limiting:   ${YELLOW}⊘ Skipped${NC}"
fi
echo -e "  Cost Tracking:   ${YELLOW}⊘ Check logs${NC}"
echo ""

echo -e "${GREEN}✓ Automated tests complete!${NC}"
echo -e "${YELLOW}→${NC} For manual tests (auto-save, keyboard shortcuts):"
echo -e "  See: ${BLUE}COMPREHENSIVE_TEST_PLAN.md${NC}\n"

echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Check server logs for cost tracking (💰 Cost:)"
echo -e "  2. Test auto-save in browser (/new page)"
echo -e "  3. Test keyboard shortcut (Cmd+S)"
echo -e "  4. Review ${BLUE}COMPREHENSIVE_TEST_PLAN.md${NC} for full checklist\n"

