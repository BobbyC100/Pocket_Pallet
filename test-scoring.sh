#!/bin/bash

# Quick scoring test script
# Usage: ./test-scoring.sh [good|poor|mixed|custom]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 Vision Framework Scoring Test${NC}\n"

# Determine which example to use
EXAMPLE=${1:-good}

if [ "$EXAMPLE" = "good" ]; then
  echo -e "${GREEN}Loading: Good Example${NC}"
  FRAMEWORK='{
    "companyId": "demo-company",
    "updatedAt": "2025-10-05T00:00:00Z",
    "vision": "Every construction site receives materials exactly when and where needed, eliminating costly delays and improving project efficiency across the entire industry.",
    "strategy": [
      "Dominate NYC general contractors (GCs doing $200M+/year) before expanding to Chicago and LA in 18 months",
      "Own the scheduling layer by integrating with Procore, Autodesk, and PlanGrid – become the default dispatch for construction software"
    ],
    "operating_principles": [
      "Safety first, always – no delivery is worth a workplace injury or OSHA violation",
      "Earn trust through radical transparency – if there is a delay, customers hear it from us first with a recovery plan"
    ],
    "near_term_bets": [
      {
        "bet": "Launch API integration with Procore to automatically sync delivery windows with construction schedules",
        "owner": "CTO",
        "horizon": "Q2",
        "measure": "5 pilot customers using live integration, 90%+ schedule accuracy"
      }
    ],
    "metrics": [
      {
        "name": "On-time delivery rate",
        "target": "95%+ within 15-min window",
        "cadence": "daily"
      },
      {
        "name": "Customer NPS",
        "target": "50+ (construction avg is 15)",
        "cadence": "monthly"
      }
    ],
    "tensions": [
      "Premium positioning (high-quality, safety-first) vs need for rapid customer growth may limit driver pool"
    ]
  }'
  RESPONSES='{
    "vision_audience_timing": "Building a dynamic dispatch layer for mid-market construction contractors who lose 30% of crew time to delivery delays.",
    "success_definition": "Build a $100M+ revenue business with 70%+ gross margins"
  }'

elif [ "$EXAMPLE" = "poor" ]; then
  echo -e "${YELLOW}Loading: Poor Example${NC}"
  FRAMEWORK='{
    "companyId": "demo-company",
    "updatedAt": "2025-10-05T00:00:00Z",
    "vision": "Revolutionize the industry and build great products.",
    "strategy": [
      "Focus on customer success",
      "Innovate and move fast"
    ],
    "operating_principles": [
      "Always do the right thing",
      "Work hard"
    ],
    "near_term_bets": [
      {
        "bet": "Increase revenue",
        "owner": "Team",
        "horizon": "12mo",
        "measure": "More revenue"
      }
    ],
    "metrics": [
      {
        "name": "Revenue",
        "target": "Growth",
        "cadence": "monthly"
      }
    ],
    "tensions": [
      "Quality vs speed"
    ]
  }'
  RESPONSES='{}'

elif [ "$EXAMPLE" = "mixed" ]; then
  echo -e "${BLUE}Loading: Mixed Quality Example${NC}"
  FRAMEWORK='{
    "companyId": "demo-company",
    "updatedAt": "2025-10-05T00:00:00Z",
    "vision": "Build the leading construction logistics platform connecting contractors with reliable delivery services.",
    "strategy": [
      "Focus on customer success and building great products",
      "Integrate deeply with Procore and major construction software"
    ],
    "operating_principles": [
      "Safety first – no delivery is worth a workplace injury",
      "Always do the right thing"
    ],
    "near_term_bets": [
      {
        "bet": "Expand to new markets",
        "owner": "CEO",
        "horizon": "6mo",
        "measure": "Market expansion complete"
      }
    ],
    "metrics": [
      {
        "name": "On-time delivery",
        "target": "95%",
        "cadence": "daily"
      },
      {
        "name": "Growth",
        "target": "Up and to the right",
        "cadence": "monthly"
      }
    ],
    "tensions": [
      "Quality vs speed"
    ]
  }'
  RESPONSES='{}'

else
  echo -e "${RED}Unknown example: $EXAMPLE${NC}"
  echo "Usage: ./test-scoring.sh [good|poor|mixed]"
  exit 1
fi

# Make request
echo -e "\n${BLUE}Calling scoring API...${NC}\n"

RESPONSE=$(curl -s -X POST http://localhost:3000/api/vision-framework-v2/score \
  -H "Content-Type: application/json" \
  -d "{
    \"framework\": $FRAMEWORK,
    \"originalResponses\": $RESPONSES
  }")

# Check if response contains error
if echo "$RESPONSE" | grep -q '"error"'; then
  echo -e "${RED}❌ Error:${NC}"
  echo "$RESPONSE" | jq -r '.error, .details'
  exit 1
fi

# Parse and display results
echo -e "${GREEN}✅ Scoring Complete!${NC}\n"

OVERALL=$(echo "$RESPONSE" | jq -r '.overallQuality')
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}Overall Quality Score: $OVERALL/10${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

# Display weak sections if any
WEAK=$(echo "$RESPONSE" | jq -r '.weakSections | join(", ")')
if [ "$WEAK" != "" ]; then
  echo -e "${YELLOW}⚠️  Sections needing attention: $WEAK${NC}\n"
fi

# Display individual section scores
echo "$RESPONSE" | jq -r '.scores | to_entries[] | 
  "\n\u001b[1m\(.key | gsub("_"; " ") | ascii_upcase)\u001b[0m
  Score: \(.value.overallScore)/10
  Specificity: \(.value.specificity) | Actionability: \(.value.actionability) | Alignment: \(.value.alignment)\(if .value.measurability then " | Measurability: \(.value.measurability)" else "" end)
  \(if (.value.issues | length) > 0 then "❌ Issues: \(.value.issues | join("; "))" else "" end)
  \(if (.value.suggestions | length) > 0 then "💡 Suggestions: \(.value.suggestions | join("; "))" else "" end)
  \(if (.value.strengths | length) > 0 then "✅ Strengths: \(.value.strengths | join("; "))" else "" end)"'

echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}Test complete!${NC}"
echo -e "\nTo test different examples:"
echo -e "  ${BLUE}./test-scoring.sh good${NC}   - High quality framework"
echo -e "  ${BLUE}./test-scoring.sh poor${NC}   - Low quality framework"
echo -e "  ${BLUE}./test-scoring.sh mixed${NC}  - Mixed quality framework"

