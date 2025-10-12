# OCR Wine List Scanning - Setup Guide

## 🎯 Overview

Pocket Pallet now supports **OCR-powered wine list scanning**! Upload a photo or PDF of a wine menu, and we'll automatically extract:
- Wine names
- Vintages
- Prices
- Bottle sizes
- Confidence scores

Powered by **Azure Document Intelligence (Form Recognizer)** with 70%+ confidence threshold.

---

## 🚀 Quick Start

### **1. Create Azure Document Intelligence Resource**

1. Go to **Azure Portal**: https://portal.azure.com
2. Click **"Create a resource"** → Search for **"Document Intelligence"** (formerly Form Recognizer)
3. Click **"Create"**
4. Fill in:
   - **Subscription:** Your Azure subscription
   - **Resource group:** Create new or use existing (e.g., `pocket-pallet-resources`)
   - **Region:** Choose closest to you (e.g., `East US`, `West Europe`)
   - **Name:** Something like `pocket-pallet-ocr`
   - **Pricing tier:** **F0 (Free)** for testing or **S0 (Standard)** for production
5. Click **"Review + Create"** → **"Create"**
6. Wait for deployment (1-2 minutes)

### **Free Tier Limits:**
- **500 pages/month** free
- Perfect for MVP testing
- Upgrade to S0 ($1.50 per 1,000 pages) when needed

---

### **2. Get Your API Credentials**

1. Once deployed, click **"Go to resource"**
2. In the left sidebar, click **"Keys and Endpoint"**
3. Copy:
   - **KEY 1** (or KEY 2, either works)
   - **Endpoint** (looks like: `https://pocket-pallet-ocr.cognitiveservices.azure.com/`)

---

### **3. Configure Render Environment Variables**

1. Go to **Render dashboard**: https://dashboard.render.com
2. Open your **backend service** (pocket-pallet)
3. Click **"Environment"** tab
4. Add these **Environment Variables**:

```env
AZURE_DOC_INTEL_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOC_INTEL_KEY=your-32-character-key-here
AZURE_DOC_INTEL_MODEL=prebuilt-layout
OCR_MIN_CONFIDENCE=0.70
OCR_GROUPING_MODE=simple
```

**Important:** 
- Replace `your-resource` with your actual resource name
- Replace `your-32-character-key-here` with KEY 1 from Azure
- Don't add quotes around the values
- Don't add trailing slashes to the endpoint

5. Click **"Save Changes"**
6. Render will automatically redeploy with new environment variables

---

### **4. Deploy the Code**

The OCR feature code has been added to your repository. Just push and deploy:

```bash
git add -A
git commit -m "feat: add OCR wine list scanning with Azure Document Intelligence"
git push origin main
```

Render will:
1. Install `httpx` (for Azure API calls)
2. Create `/api/v1/ocr/wine-list` endpoint
3. Start accepting wine list uploads

---

## 📱 Using the OCR Feature

### **Frontend (Web App):**

1. Go to: `https://pocket-pallet.vercel.app/ocr`
2. Click **"Choose File"** and select a wine list (PDF or image)
3. Click **"Upload & Parse"**
4. Wait 5-30 seconds for processing
5. Review extracted wines with confidence scores
6. Wines with 70%+ confidence are marked **"ok"**
7. Lower confidence wines are marked **"review"**

### **API (cURL):**

```bash
# Test with an image
curl -X POST \
  "https://pocket-pallet.onrender.com/api/v1/ocr/wine-list" \
  -F "file=@wine-menu.jpg"

# Test with a PDF
curl -X POST \
  "https://pocket-pallet.onrender.com/api/v1/ocr/wine-list" \
  -F "file=@wine-list.pdf"
```

**Response Example:**
```json
{
  "ok": true,
  "items": [
    {
      "name": "Niepoort Nat Cool Vinho Verde Branco",
      "vintage": "2023",
      "price_usd": 30.00,
      "bottle_size": "750ml",
      "confidence": 0.923,
      "raw": "Niepoort Nat Cool Vinho Verde Branco 2023 $30.00 750ml",
      "status": "ok"
    },
    {
      "name": "Azimut Brut Nature Cava",
      "vintage": "NV",
      "price_usd": 25.00,
      "bottle_size": null,
      "confidence": 0.856,
      "raw": "Azimut Brut Nature Cava NV $25.00",
      "status": "ok"
    }
  ],
  "meta": {
    "pages": 1,
    "engine": "azure-document-intelligence-v4:prebuilt-layout",
    "threshold": 0.70,
    "grouping": "simple"
  }
}
```

---

## 🎛️ Configuration Options

### **OCR_GROUPING_MODE**

Controls how text lines are grouped into wine entries:

**`simple` (default):**
- Flushes buffer when price or vintage is detected
- Works well for basic lists
- Faster processing

**`smarter`:**
- Uses heuristics (capitalization + price/vintage hints)
- Better for complex menus with descriptions
- Slightly slower

Change in Render:
```env
OCR_GROUPING_MODE=smarter
```

---

### **OCR_MIN_CONFIDENCE**

Minimum confidence score (0.0 to 1.0) for marking items as "ok":

- **0.70 (default):** Balanced accuracy
- **0.80:** Stricter (fewer false positives)
- **0.60:** More permissive (more items accepted)

Change in Render:
```env
OCR_MIN_CONFIDENCE=0.80
```

---

### **AZURE_DOC_INTEL_MODEL**

Azure Document Intelligence model to use:

**`prebuilt-layout` (default):**
- Best for menus with structure
- Handles tables, columns, and formatting
- Returns lines + layout info

**`prebuilt-read`:**
- Faster, text-only extraction
- No layout/table detection
- Good for simple lists

Change in Render:
```env
AZURE_DOC_INTEL_MODEL=prebuilt-read
```

---

## 🔧 Troubleshooting

### **Error: "Azure Document Intelligence not configured"**

**Cause:** Missing environment variables

**Fix:**
1. Check Render environment variables are set
2. Ensure no typos in variable names
3. Redeploy after adding variables

---

### **Error: "Azure analyze failed: 401 Unauthorized"**

**Cause:** Invalid API key

**Fix:**
1. Go to Azure Portal → Your resource → Keys and Endpoint
2. Copy KEY 1 again (ensure no extra spaces)
3. Update `AZURE_DOC_INTEL_KEY` in Render
4. Redeploy

---

### **Error: "Azure OCR did not complete in time"**

**Cause:** Large file or slow Azure processing

**Fix:**
1. Reduce image resolution (max 2-3 MB is ideal)
2. For PDFs, limit to 10 pages
3. Try again in a few seconds

---

### **Poor Extraction Quality**

**Tips for better results:**
1. **Good lighting** - avoid shadows and glare
2. **Straight angles** - hold phone directly over menu
3. **High resolution** - use phone camera, not screenshots
4. **Clean formatting** - works best with typed menus
5. **Clear text** - handwritten menus may be less accurate

**Try this:**
- Change `OCR_GROUPING_MODE=smarter` for complex menus
- Lower `OCR_MIN_CONFIDENCE=0.60` to see more results
- Use PDF scans instead of photos when possible

---

## 💰 Pricing

### **Azure Document Intelligence:**

**Free Tier (F0):**
- 500 pages/month free
- ~10-20 wine lists per month (depending on length)
- Perfect for MVP

**Standard Tier (S0):**
- $1.50 per 1,000 pages
- Example: 1,000 wine lists = ~$7.50/month
- Scales automatically

### **Cost Estimation:**
- Average wine list: 2-3 pages
- 100 uploads/month = 250 pages = **FREE** on F0
- 1,000 uploads/month = 2,500 pages = **$3.75** on S0

---

## 🔐 Security Notes

1. **API Keys:** Never commit keys to GitHub. Use environment variables only.
2. **File Size Limit:** Backend enforces 25MB max to prevent abuse.
3. **CORS:** Only your frontend domain can upload files.
4. **Authentication:** OCR endpoint requires user login (JWT token).

---

## 📊 Monitoring

### **Check Azure Usage:**

1. Go to Azure Portal → Your resource
2. Click **"Metrics"** in left sidebar
3. View:
   - Total API calls
   - Success rate
   - Average processing time
   - Pages processed

### **Set Up Alerts:**

1. Azure Portal → Your resource → **"Alerts"**
2. Create alert for:
   - **95% of free tier used** (475 pages)
   - **High error rate** (> 10%)

---

## 🚀 Next Steps

Once OCR is working:

1. **Create Review Queue:**
   - UI to review "review" status items
   - Edit fields before import
   - Bulk accept/reject

2. **Add Wine Details:**
   - Match extracted names to wine database
   - Auto-fill producer, region, grapes
   - Suggest similar wines

3. **Mobile Optimization:**
   - Add camera capture button
   - Real-time preview
   - Crop guides

4. **Batch Processing:**
   - Upload multiple photos
   - Process entire restaurant menu
   - Export to CSV

---

## ✅ Testing Checklist

- [ ] Azure resource created
- [ ] API key and endpoint copied
- [ ] Render environment variables set
- [ ] Backend redeployed
- [ ] `/api/v1/ocr/wine-list` endpoint exists (check `/docs`)
- [ ] Test upload via `/ocr` page
- [ ] PDF upload works
- [ ] Image upload works
- [ ] Extracted items show correct data
- [ ] Confidence scores display
- [ ] "ok" vs "review" status working

---

## 📞 Support

**Azure Documentation:**
- https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/

**Common Issues:**
- Endpoint format: Must end with `/` (Render adds it automatically)
- Region availability: Some regions don't support free tier
- Rate limiting: Max 15 requests/minute on free tier

---

**Your OCR feature is ready to go! 🍷✨**

Just add Azure credentials to Render and start scanning wine lists!

