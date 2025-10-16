#!/bin/bash
# Interactive Google Places API Setup Helper
# This script guides you through setting up your Google Places API key

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Google Places API Setup Helper for Pocket Pallet      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check if key already exists
echo -e "${YELLOW}Step 1: Checking for existing API key...${NC}"
if [ ! -z "$GOOGLE_PLACES_API_KEY" ]; then
    echo -e "${GREEN}✅ Found existing GOOGLE_PLACES_API_KEY in environment${NC}"
    echo -e "   Key: ${GOOGLE_PLACES_API_KEY:0:20}...${GOOGLE_PLACES_API_KEY: -4}"
    echo ""
    read -p "Do you want to use this key? (y/n): " use_existing
    if [ "$use_existing" = "y" ] || [ "$use_existing" = "Y" ]; then
        API_KEY=$GOOGLE_PLACES_API_KEY
        echo -e "${GREEN}✅ Using existing key${NC}"
    else
        API_KEY=""
    fi
else
    echo -e "${YELLOW}⚠️  No API key found in environment${NC}"
    API_KEY=""
fi
echo ""

# Step 2: Get API key if not using existing
if [ -z "$API_KEY" ]; then
    echo -e "${YELLOW}Step 2: Get your Google Places API Key${NC}"
    echo ""
    echo -e "You need to get an API key from Google Cloud Console:"
    echo -e "${BLUE}1.${NC} Go to: ${BLUE}https://console.cloud.google.com/${NC}"
    echo -e "${BLUE}2.${NC} Create/select a project"
    echo -e "${BLUE}3.${NC} Go to: APIs & Services → Library"
    echo -e "${BLUE}4.${NC} Search for 'Places API' and click Enable"
    echo -e "${BLUE}5.${NC} Go to: APIs & Services → Credentials"
    echo -e "${BLUE}6.${NC} Click '+ Create Credentials' → 'API Key'"
    echo -e "${BLUE}7.${NC} Copy the API key that appears"
    echo ""
    echo -e "${GREEN}📖 Full guide: GOOGLE_PLACES_API_SETUP.md${NC}"
    echo ""
    read -p "Enter your Google Places API key: " API_KEY
    
    if [ -z "$API_KEY" ]; then
        echo -e "${RED}❌ No API key provided. Exiting.${NC}"
        exit 1
    fi
fi
echo ""

# Step 3: Validate API key format
echo -e "${YELLOW}Step 3: Validating API key format...${NC}"
if [[ $API_KEY =~ ^AIza[0-9A-Za-z_-]{35}$ ]]; then
    echo -e "${GREEN}✅ API key format looks valid${NC}"
else
    echo -e "${YELLOW}⚠️  API key format looks unusual (expected to start with 'AIza')${NC}"
    read -p "Continue anyway? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
        exit 1
    fi
fi
echo ""

# Step 4: Test API key
echo -e "${YELLOW}Step 4: Testing API key with Google Places API...${NC}"
echo -e "   Making a test request to Places API..."
TEST_PLACE_ID="ChIJN1t_tDeuEmsRUsoyG83frY4"  # Sydney Opera House
RESPONSE=$(curl -s "https://maps.googleapis.com/maps/api/place/details/json?place_id=$TEST_PLACE_ID&fields=name,geometry&key=$API_KEY")

STATUS=$(echo $RESPONSE | grep -o '"status" *: *"[^"]*"' | cut -d'"' -f4)

if [ "$STATUS" = "OK" ]; then
    echo -e "${GREEN}✅ API key works! Successfully called Places API${NC}"
    PLACE_NAME=$(echo $RESPONSE | grep -o '"name" *: *"[^"]*"' | cut -d'"' -f4)
    echo -e "   Test place: $PLACE_NAME"
elif [ "$STATUS" = "REQUEST_DENIED" ]; then
    echo -e "${RED}❌ API key is invalid or Places API is not enabled${NC}"
    echo -e "${YELLOW}Please check:${NC}"
    echo -e "  1. Places API is enabled in Google Cloud Console"
    echo -e "  2. API key is copied correctly"
    echo -e "  3. API key is not restricted to exclude Places API"
    echo ""
    read -p "Continue anyway and save the key? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Unexpected response status: $STATUS${NC}"
    echo -e "   Response: $RESPONSE"
    echo ""
    read -p "Continue anyway and save the key? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
        exit 1
    fi
fi
echo ""

# Step 5: Save API key
echo -e "${YELLOW}Step 5: Saving API key...${NC}"
echo ""
echo "Where would you like to save the API key?"
echo -e "${BLUE}1.${NC} Backend .env file (PP_MVP/backend/.env) - For import scripts"
echo -e "${BLUE}2.${NC} Shell profile (~/.zshrc) - For all terminal sessions"
echo -e "${BLUE}3.${NC} Both"
echo -e "${BLUE}4.${NC} Skip saving (just export for this session)"
echo ""
read -p "Choose option (1-4): " save_option

case $save_option in
    1|3)
        ENV_FILE="PP_MVP/backend/.env"
        if [ -f "$ENV_FILE" ]; then
            # Check if key already exists in file
            if grep -q "GOOGLE_PLACES_API_KEY" "$ENV_FILE"; then
                echo -e "${YELLOW}⚠️  GOOGLE_PLACES_API_KEY already exists in $ENV_FILE${NC}"
                read -p "Overwrite? (y/n): " overwrite
                if [ "$overwrite" = "y" ] || [ "$overwrite" = "Y" ]; then
                    # Remove old line and add new one
                    sed -i.bak '/GOOGLE_PLACES_API_KEY/d' "$ENV_FILE"
                    echo "GOOGLE_PLACES_API_KEY='$API_KEY'" >> "$ENV_FILE"
                    echo -e "${GREEN}✅ Updated API key in $ENV_FILE${NC}"
                fi
            else
                echo "GOOGLE_PLACES_API_KEY='$API_KEY'" >> "$ENV_FILE"
                echo -e "${GREEN}✅ Added API key to $ENV_FILE${NC}"
            fi
        else
            echo "GOOGLE_PLACES_API_KEY='$API_KEY'" > "$ENV_FILE"
            echo -e "${GREEN}✅ Created $ENV_FILE with API key${NC}"
        fi
        ;;
esac

case $save_option in
    2|3)
        SHELL_RC="$HOME/.zshrc"
        if [ -f "$SHELL_RC" ]; then
            if grep -q "GOOGLE_PLACES_API_KEY" "$SHELL_RC"; then
                echo -e "${YELLOW}⚠️  GOOGLE_PLACES_API_KEY already exists in $SHELL_RC${NC}"
                read -p "Overwrite? (y/n): " overwrite
                if [ "$overwrite" = "y" ] || [ "$overwrite" = "Y" ]; then
                    sed -i.bak '/GOOGLE_PLACES_API_KEY/d' "$SHELL_RC"
                    echo "export GOOGLE_PLACES_API_KEY='$API_KEY'" >> "$SHELL_RC"
                    echo -e "${GREEN}✅ Updated API key in $SHELL_RC${NC}"
                fi
            else
                echo "export GOOGLE_PLACES_API_KEY='$API_KEY'" >> "$SHELL_RC"
                echo -e "${GREEN}✅ Added API key to $SHELL_RC${NC}"
            fi
        else
            echo "export GOOGLE_PLACES_API_KEY='$API_KEY'" > "$SHELL_RC"
            echo -e "${GREEN}✅ Created $SHELL_RC with API key${NC}"
        fi
        echo -e "${BLUE}ℹ️  Run 'source ~/.zshrc' or restart terminal for changes to take effect${NC}"
        ;;
esac

# Export for current session
export GOOGLE_PLACES_API_KEY="$API_KEY"
echo ""

# Step 6: Test with our scripts
echo -e "${YELLOW}Step 6: Testing with Pocket Pallet scripts...${NC}"
echo ""
read -p "Run test_cid_resolution.py to verify CID resolution works? (y/n): " run_test

if [ "$run_test" = "y" ] || [ "$run_test" = "Y" ]; then
    cd PP_MVP/backend
    if [ -f "test_cid_resolution.py" ]; then
        echo -e "${BLUE}Running test script...${NC}"
        echo ""
        python test_cid_resolution.py
        TEST_EXIT_CODE=$?
        echo ""
        if [ $TEST_EXIT_CODE -eq 0 ]; then
            echo -e "${GREEN}✅ All tests passed!${NC}"
        else
            echo -e "${YELLOW}⚠️  Some tests failed. Check the output above.${NC}"
        fi
    else
        echo -e "${RED}❌ test_cid_resolution.py not found${NC}"
    fi
    cd ../..
fi
echo ""

# Step 7: Summary
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                         Setup Complete!                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ API Key:${NC} ${API_KEY:0:20}...${API_KEY: -4}"
echo -e "${GREEN}✅ Status:${NC} Ready to use"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo -e "${BLUE}1.${NC} Test CID resolution (if you skipped it):"
echo -e "   ${GREEN}cd PP_MVP/backend && python test_cid_resolution.py${NC}"
echo ""
echo -e "${BLUE}2.${NC} Import your merchants:"
echo -e "   ${GREEN}cd PP_MVP/backend${NC}"
echo -e "   ${GREEN}python import_merchants_with_google_api.py '../Takeout 3/Saved'${NC}"
echo ""
echo -e "${BLUE}3.${NC} Monitor API usage:"
echo -e "   ${GREEN}https://console.cloud.google.com/apis/dashboard${NC}"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo -e "   - Full setup guide: ${GREEN}GOOGLE_PLACES_API_SETUP.md${NC}"
echo -e "   - CID resolution guide: ${GREEN}GOOGLE_CID_RESOLUTION_GUIDE.md${NC}"
echo -e "   - Quick reference: ${GREEN}IMPORT_OPTIONS_QUICK_REF.md${NC}"
echo ""
echo -e "${GREEN}🎉 You're all set! Happy importing!${NC}"

