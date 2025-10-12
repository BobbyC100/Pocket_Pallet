# Azure Document Intelligence Setup for OCR

This guide explains how to configure Azure Document Intelligence for the Pocket Pallet OCR wine list feature.

## Required Environment Variables

You need to set these environment variables on your Render backend service:

### 1. AZURE_DOC_INTEL_ENDPOINT
- **Description**: Your Azure Document Intelligence endpoint URL
- **Format**: Must start with `https://`
- **Example**: `https://your-resource-name.cognitiveservices.azure.com`
- **Where to find it**: 
  1. Go to Azure Portal
  2. Navigate to your Document Intelligence resource
  3. Go to "Keys and Endpoint"
  4. Copy the "Endpoint" value

### 2. AZURE_DOC_INTEL_KEY
- **Description**: Your Azure Document Intelligence API key
- **Format**: 32+ character string (typically 80+ characters)
- **Example**: `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567...` (your actual key will be longer)
- **Where to find it**:
  1. Go to Azure Portal
  2. Navigate to your Document Intelligence resource
  3. Go to "Keys and Endpoint"
  4. Copy either "KEY 1" or "KEY 2"

### 3. AZURE_DOC_INTEL_MODEL (Optional)
- **Description**: The Document Intelligence model to use
- **Default**: `prebuilt-layout`
- **Other options**: `prebuilt-read`, `prebuilt-document`
- **Recommendation**: Use `prebuilt-layout` for best results with wine lists

### 4. OCR_MIN_CONFIDENCE (Optional)
- **Description**: Minimum confidence threshold for extracted text (0.0 to 1.0)
- **Default**: `0.70`
- **Recommendation**: Keep at 0.70 for good balance of accuracy and recall

### 5. OCR_GROUPING_MODE (Optional)
- **Description**: How to group extracted lines into wine entries
- **Default**: `simple`
- **Options**: 
  - `simple`: Basic grouping by price/vintage detection
  - `smarter`: Advanced grouping with capitalization and price hints
- **Recommendation**: Start with `simple`, upgrade to `smarter` if needed

## Setting Environment Variables on Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your "pocket-pallet" backend service
3. Click on "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Add each variable:
   - Key: `AZURE_DOC_INTEL_ENDPOINT`
   - Value: Your endpoint URL
   - Click "Add"
6. Repeat for `AZURE_DOC_INTEL_KEY`
7. Optionally add the other variables if you want to customize them
8. Click "Save Changes" - this will trigger a redeploy

## Testing the Configuration

### Option 1: Health Check Endpoint
After deploying, test that Azure is configured:

```bash
curl https://pocket-pallet.onrender.com/api/v1/ocr/health
```

Expected response:
```json
{
  "service": "OCR",
  "configured": true,
  "endpoint": "https://your-resource-name.cognitiveservices.azure...",
  "model": "prebuilt-layout",
  "min_confidence": 0.7,
  "grouping_mode": "simple",
  "key_length": 86
}
```

If `"configured": false`, check that your environment variables are set correctly.

### Option 2: Frontend Upload
1. Go to https://pocket-pallet.vercel.app/ocr
2. Upload a wine list PDF or image
3. Check the browser console for errors
4. If you get a 502 error, check the Render logs for details

## Checking Render Logs

To see detailed OCR processing logs:

1. Go to Render dashboard
2. Select your backend service
3. Click on "Logs" in the left sidebar
4. Look for log messages starting with:
   - `OCR request received for file:`
   - `Azure endpoint:`
   - `Submitting to Azure:`
   - `Azure response status:`

Common errors:
- **"Azure credentials not configured"**: Environment variables not set
- **"Azure analyze failed: 401"**: Invalid API key
- **"Azure analyze failed: 404"**: Invalid endpoint URL
- **"Failed to connect to Azure"**: Network issue or malformed URL

## Azure Free Tier Limits

Azure Document Intelligence Free (F0) tier includes:
- 500 pages per month
- Maximum 20 requests per minute
- Maximum 4 MB per request

If you exceed these limits, you'll get a 429 (Too Many Requests) error.

## Troubleshooting

### "Invalid or missing reset token"
This is a different error - related to password reset, not OCR.

### "502 Bad Gateway" when uploading
- Check Render logs for the actual error
- Verify Azure credentials are set correctly
- Test the health check endpoint
- Ensure your Azure resource is in the same region for best performance

### "Azure analyze failed: 401 Unauthorized"
- Your API key is incorrect or expired
- Regenerate the key in Azure Portal and update Render

### "Azure analyze failed: 403 Forbidden"
- Your Azure resource might be disabled
- Check your Azure subscription is active
- Verify billing is set up correctly

### OCR returns empty results
- Try increasing the timeout in `ocr.py` (currently 60 seconds)
- Check if the uploaded file is readable
- Try using a different model (e.g., `prebuilt-read`)
- Lower `OCR_MIN_CONFIDENCE` to see more results

## Security Notes

- **Never commit** your Azure keys to git
- Use Render's environment variables for all secrets
- Rotate your Azure keys regularly
- Monitor your Azure usage to detect unauthorized access
- Consider using Azure Key Vault for production deployments

