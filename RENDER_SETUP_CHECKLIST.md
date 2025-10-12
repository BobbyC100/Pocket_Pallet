# Render Azure OCR Setup Checklist

## ✅ What We Just Fixed

1. **Added better error handling** to the OCR endpoint with detailed logging
2. **Added validation** for Azure credentials (endpoint must start with `https://`, key must be 32+ characters)
3. **Fixed async scope issue** that could cause crashes
4. **Added health check endpoint** at `/api/v1/ocr/health` to test Azure configuration
5. **Created comprehensive documentation** in `PP_MVP/backend/AZURE_OCR_SETUP.md`

## 🚀 What You Need to Do Now

### Step 1: Wait for Render to Deploy
The backend is being redeployed automatically. Check the deployment status:
- Go to: https://dashboard.render.com
- Look for your "pocket-pallet" service
- Wait for the status to show "Live" (usually takes 2-3 minutes)

### Step 2: Set Azure Environment Variables
**These are REQUIRED for OCR to work:**

1. Go to https://dashboard.render.com
2. Click on your "pocket-pallet" backend service
3. Click "Environment" in the left sidebar
4. Add these two variables:

   **Variable 1:**
   - Key: `AZURE_DOC_INTEL_ENDPOINT`
   - Value: `https://your-resource-name.cognitiveservices.azure.com`
   - (Get this from Azure Portal → Your Document Intelligence Resource → Keys and Endpoint)

   **Variable 2:**
   - Key: `AZURE_DOC_INTEL_KEY`
   - Value: Your 80+ character Azure key (starts with letters/numbers)
   - (Get this from Azure Portal → Your Document Intelligence Resource → Keys and Endpoint → KEY 1 or KEY 2)

5. Click "Save Changes" - this will trigger another deploy (wait 2-3 minutes)

### Step 3: Test the Configuration
After the deploy completes, test that Azure is configured correctly:

**Option A: Health Check (Recommended)**
```bash
curl https://pocket-pallet.onrender.com/api/v1/ocr/health
```

You should see:
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

✅ If `"configured": true` → You're all set!  
❌ If `"configured": false` → Check your environment variables

**Option B: Browser**
Visit: https://pocket-pallet.onrender.com/api/v1/ocr/health

### Step 4: Test OCR Upload
1. Go to https://pocket-pallet.vercel.app/ocr
2. Upload a wine list (PDF or image)
3. Check the results

If you get an error:
1. Open browser console (F12)
2. Look for error messages
3. Go to Render → Your Service → Logs
4. Look for log messages starting with "OCR request received"

## 📋 Optional Environment Variables

You can also set these for fine-tuning (not required):

- `AZURE_DOC_INTEL_MODEL`: Default is `prebuilt-layout` (recommended)
- `OCR_MIN_CONFIDENCE`: Default is `0.70` (70% confidence threshold)
- `OCR_GROUPING_MODE`: Default is `simple` (use `smarter` for advanced grouping)

## 🔍 Troubleshooting

### I get a 502 error when uploading
1. Check Render logs for the actual error message
2. Make sure you saved the environment variables and the deploy completed
3. Test the health check endpoint first

### Health check shows "configured": false
- Your environment variables aren't set
- Or the deploy hasn't finished yet
- Wait 30 seconds and refresh

### Health check shows "key_length": 0
- The `AZURE_DOC_INTEL_KEY` variable is not set or is empty
- Double-check you copied the full key from Azure

### "Azure analyze failed: 401"
- Your API key is wrong
- Copy the key again from Azure Portal
- Make sure you're using KEY 1 or KEY 2, not the endpoint

### "Azure analyze failed: 404"
- Your endpoint URL is wrong
- Make sure it starts with `https://`
- Make sure it ends with `.cognitiveservices.azure.com`

## 📖 Full Documentation

See `PP_MVP/backend/AZURE_OCR_SETUP.md` for:
- Detailed setup instructions
- Azure Portal navigation guide
- All environment variable options
- Security best practices
- Advanced troubleshooting

## ❓ Questions?

Common issues:
- **"The Azure key is 86 characters, not 32"**: That's correct! The validator checks that it's *at least* 32 characters. Your 86-character key is valid.
- **"Where do I find my Azure resource?"**: Azure Portal → Search for "Document Intelligence" → Click on your resource
- **"Can I use the free tier?"**: Yes! Free tier includes 500 pages/month, which is plenty for testing

## ✅ Success Checklist

- [ ] Render backend deployment shows "Live"
- [ ] Added `AZURE_DOC_INTEL_ENDPOINT` environment variable
- [ ] Added `AZURE_DOC_INTEL_KEY` environment variable
- [ ] Waited for second deploy after adding variables (shows "Live")
- [ ] Health check endpoint returns `"configured": true`
- [ ] Uploaded a test wine list successfully
- [ ] Saw extracted wine data in the response

Once all checkboxes are complete, your OCR feature is fully set up! 🎉

