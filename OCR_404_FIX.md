# Fixed: Azure 404 "Resource not found" Error

## 🔍 What Was Wrong

The Azure endpoint was returning **404 "Resource not found"** because:
- The endpoint URL might have had trailing slashes
- Or the endpoint URL included `/formrecognizer` (causing duplicate paths)
- The full URL was malformed: `https://endpoint.com//formrecognizer/documentModels/...`

## ✅ What I Fixed

1. **URL cleaning**: Now removes trailing slashes and duplicate `/formrecognizer` paths
2. **Better logging**: Shows the cleaned endpoint and full URL in logs
3. **New diagnostic endpoints**:
   - `/api/v1/ocr/health` - Shows configuration and cleaned URLs
   - `/api/v1/ocr/test-azure-connection` - Tests Azure credentials without uploading

## 🚀 Test After Deploy (2-3 minutes)

### Step 1: Check Health
```bash
curl https://pocket-pallet.onrender.com/api/v1/ocr/health
```

Look for:
```json
{
  "endpoint_cleaned": "https://your-resource.cognitiveservices.azure.com",
  "full_url_sample": "https://your-resource.cognitiveservices.azure.com/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=2024-07-31"
}
```

✅ The `full_url_sample` should look like this format  
❌ If you see double slashes `//` or duplicate `/formrecognizer/formrecognizer/`, your endpoint is still wrong

### Step 2: Test Azure Connection
```bash
curl https://pocket-pallet.onrender.com/api/v1/ocr/test-azure-connection
```

Expected success:
```json
{
  "ok": true,
  "message": "Azure connection successful",
  "endpoint": "https://your-resource.cognitiveservices.azure.com",
  "api_version": "2024-07-31",
  "models_available": 15
}
```

If you get `"ok": false`:
- **401 error**: Your API key is wrong
- **404 error**: Your endpoint URL is still malformed
- **Connection error**: Network issue or wrong domain

### Step 3: Try Wine List Upload
1. Go to https://pocket-pallet.vercel.app/ocr
2. Upload a wine list PDF or image
3. Should now work! 🎉

## 🔍 If Still Getting 404

### Check Your Azure Endpoint Format

Your `AZURE_DOC_INTEL_ENDPOINT` should look like:
```
https://your-resource-name.cognitiveservices.azure.com
```

**Common mistakes:**
- ❌ `https://your-resource.cognitiveservices.azure.com/formrecognizer` (has extra path)
- ❌ `https://your-resource.cognitiveservices.azure.com/` (has trailing slash)
- ❌ `your-resource.cognitiveservices.azure.com` (missing `https://`)
- ✅ `https://your-resource.cognitiveservices.azure.com` (correct!)

### How to Fix on Render

1. Go to https://dashboard.render.com
2. Click your backend service
3. Click "Environment"
4. Find `AZURE_DOC_INTEL_ENDPOINT`
5. Click "Edit"
6. Make sure it's exactly: `https://YOUR-RESOURCE-NAME.cognitiveservices.azure.com`
   - No trailing `/`
   - No `/formrecognizer` at the end
   - Must start with `https://`
7. Click "Save Changes"
8. Wait 2-3 minutes for redeploy

### Check Render Logs

Go to Render → Your Service → Logs

Look for these log lines when you upload:
```
OCR request received for file: your-file.pdf
Cleaned endpoint: https://your-resource.cognitiveservices.azure.com
Full URL: https://your-resource.cognitiveservices.azure.com/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=2024-07-31
Model: prebuilt-layout
API Version: 2024-07-31
Submitting to Azure: https://...
Azure response status: 202
```

✅ If you see status `202` or `200` → Success!  
❌ If you see status `404` → Endpoint URL is still wrong

## 🔧 Advanced Troubleshooting

### Try Different API Versions

If 404 persists, your Azure resource might use an older API version. Try:

Add this to Render environment variables:
- Key: `AZURE_DOC_INTEL_API_VERSION`  
- Value: `2023-07-31` (or `2024-02-29-preview`)

Then update the code to use it (or I can help with this).

### Check Azure Region

Make sure your Azure resource is in a supported region:
- East US
- West US 2
- West Europe
- etc.

Some regions have limited API versions.

### Verify Resource Type

In Azure Portal, confirm your resource is:
- **Type**: "Document Intelligence" (or "Form Recognizer")
- **Not**: "Computer Vision" or "Cognitive Services Multi-Service"

## 📞 Next Steps

After the deploy completes (2-3 minutes):

1. ✅ Test health endpoint
2. ✅ Test Azure connection endpoint
3. ✅ Try uploading a wine list
4. ❌ Still 404? Check your endpoint format in Render
5. ❌ Still issues? Share the Render logs

The logs will now show exactly what URL is being called, making it much easier to debug!

