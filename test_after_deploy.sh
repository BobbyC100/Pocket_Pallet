#!/bin/bash
echo "Waiting 3 minutes for Render to deploy..."
echo "Start time: $(date)"
echo ""
echo "You can monitor the deploy at:"
echo "  https://dashboard.render.com"
echo ""
echo "Press Ctrl+C to cancel this wait, or wait for automatic test..."
echo ""

sleep 180

echo ""
echo "=========================================="
echo "Testing OCR After Deploy"
echo "=========================================="
echo ""

echo "1. Test Azure connection..."
curl -s https://pocket-pallet.onrender.com/api/v1/ocr/test-azure-connection | python3 -m json.tool

echo ""
echo ""
echo "2. If that shows 'ok': true, upload your wine list image to:"
echo "   https://pocket-pallet.vercel.app/ocr"
echo ""

