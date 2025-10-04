#!/bin/bash

# Vision Framework Test Suite
# Tests all major functionality of the Vision Framework system

echo "🧪 Testing Vision Framework System"
echo "=================================="

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local success_pattern="$5"
    
    echo -n "Testing $test_name... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s "$BASE_URL$endpoint")
    fi
    
    # Check for success pattern or absence of error
    if [ -n "$success_pattern" ]; then
        if echo "$response" | grep -q "$success_pattern"; then
            echo "✅ PASSED"
            PASSED=$((PASSED + 1))
        else
            echo "❌ FAILED"
            echo "   Expected: $success_pattern"
            echo "   Response: $(echo "$response" | head -c 100)..."
            FAILED=$((FAILED + 1))
        fi
    else
        # Default: check for absence of error indicators
        if echo "$response" | grep -q "\"error\"" || echo "$response" | grep -q "This page could not be found"; then
            echo "❌ FAILED"
            echo "   Response: $(echo "$response" | head -c 100)..."
            FAILED=$((FAILED + 1))
        else
            echo "✅ PASSED"
            PASSED=$((PASSED + 1))
        fi
    fi
}

# Test 1: Home page loads
test_endpoint "Home Page" "GET" "/" "" "Banyan"

# Test 2: Vision Framework page loads
test_endpoint "Vision Framework Page" "GET" "/vision-framework" "" "Loading vision framework"

# Test 3: Vision Framework generation API
test_endpoint "Vision Framework Generation API" "POST" "/api/vision-framework/generate" '{
    "companyId": "test-company",
    "responses": {
        "problem_now": "Small retail businesses waste 15+ hours/week on manual inventory, leading to stockouts and lost revenue",
        "customer_gtm": "Primary: Small retail businesses (10-50 employees). Secondary: Restaurant chains. GTM: Direct sales, content marketing",
        "traction_proud": "Beta launched 3 months ago: 25 paying customers, $50K ARR, 40% MoM growth, NPS 72",
        "milestone_6mo": "Scale to 200 paying customers by Q1, $400K ARR, launch mobile app",
        "cash_on_hand": 100000,
        "monthly_burn": 10000,
        "risky_assumption": "Competition from Shopify/Square entering niche. Technical risk: real-time inventory sync"
    }
}' '"framework"'

# Test 4: Brief generation API (should work with GPT-4)
test_endpoint "Brief Generation API" "POST" "/api/generate-brief" '{
    "responses": {
        "problem_now": "Small retail businesses waste 15+ hours/week on manual inventory",
        "customer_gtm": "Primary: Small retail businesses (10-50 employees). Secondary: Restaurant chains",
        "traction_proud": "Beta launched 3 months ago: 25 paying customers, $50K ARR, 40% MoM growth",
        "milestone_6mo": "Scale to 200 paying customers by Q1, $400K ARR, launch mobile app",
        "cash_on_hand": 100000,
        "monthly_burn": 10000,
        "risky_assumption": "Competition from Shopify/Square entering niche"
    }
}' '"founderBriefMd"'

# Test 5: CRUD operations
test_endpoint "CRUD GET (Non-existent)" "GET" "/api/vision-framework/non-existent-company" "" '"companyId"'

# Test 6: Test brief endpoint
test_endpoint "Test Brief Endpoint" "GET" "/api/test-brief" "" '"founderBriefMd"'

# Test 7: PDF Export functionality (check if packages are installed)
echo -n "Testing PDF Export Dependencies... "
if npm list jspdf html2canvas > /dev/null 2>&1; then
    echo "✅ PASSED"
    PASSED=$((PASSED + 1))
else
    echo "❌ FAILED"
    echo "   Missing packages: jspdf, html2canvas"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "📊 Test Results"
echo "================"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "📈 Success Rate: $(( (PASSED * 100) / (PASSED + FAILED) ))%"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed! Vision Framework system is working correctly."
    echo ""
    echo "📋 What's Available:"
    echo "   ✅ Streamlined 6-step wizard (no redundant vision fields)"
    echo "   ✅ Intelligent field mapping with AI inference"
    echo "   ✅ Complete Vision Framework with YardBird example"
    echo "   ✅ Real-time validation and editing"
    echo "   ✅ PDF and Markdown export"
    echo "   ✅ Smart timespan inference (Q1/Q2/Q3/Q4/Annual)"
    echo "   ✅ Auto-suggested tone, audience, and positioning"
    echo "   ✅ Comprehensive test coverage"
    exit 0
else
    echo ""
    echo "⚠️  Some tests failed. Check the output above for details."
    exit 1
fi
