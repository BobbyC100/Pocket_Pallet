# 🤖 AI Selector Detection - User Guide

## 🎯 **What Changed**

### **Before** (Old Way)
1. Visit retailer website
2. Open DevTools (F12)
3. Inspect elements
4. Figure out CSS selectors manually
5. Test in console
6. Copy/paste to form
7. Hope it works 🤞

### **After** (New Way - 10x Easier!)
1. Paste retailer URL
2. Click **"🤖 AI Detect"**
3. AI fills in everything
4. Review and save ✅

---

## ✨ **New Features**

### **1. Edit Source Button**
- Every source now has an **"Edit"** button
- Click to modify existing configuration
- No need to delete and recreate!

### **2. AI Selector Detection**
- **🤖 AI Detect** button next to URL field
- Uses GPT-4 to analyze the webpage
- Auto-detects:
  - Product link selectors
  - Pagination selectors
  - Framework (Shopify, WooCommerce, etc.)
  - Whether Playwright is needed
  - Suggests a source name

### **3. Better Error Messages**
- Clear guidance when detection fails
- Confidence levels (high/medium/low)
- Helpful notes about potential issues

---

## 🚀 **How to Use - Step by Step**

### **Creating a New Source (Easy Mode)**

1. **Click "+ Create Source"**

2. **Paste the URL**
   ```
   Example: https://www.monarchwinemerchants.com/collections/wine/Champagne
   ```

3. **Click "🤖 AI Detect"**
   - Button shows "🤖 Detecting..." while working
   - Takes 3-5 seconds

4. **Review AI Suggestions**
   The form auto-fills with:
   - **Name**: "Monarch Wine Merchants - Champagne"
   - **Product Selector**: `.product-card__title a`
   - **Pagination Selector**: `a[rel="next"]`
   - **Playwright**: ☐ (unchecked if not needed)

5. **Save**
   - If confidence is "high" → just click "Create Source"
   - If "medium/low" → review selectors, maybe test first

---

## 🧪 **Testing AI Detection**

### **Test URLs to Try**

#### **Shopify Stores** (Usually High Confidence)
```
https://www.monarchwinemerchants.com/collections/wine/Champagne
https://flatiron-wines.myshopify.com/collections/champagne
```

#### **Wine.com**
```
https://www.wine.com/list/wine/7155?pricemax=9999&sortby=popularity
```

#### **K&L Wines**
```
https://www.klwines.com/Products?filters=sv2$Burgundy$CategoryName
```

---

## 📊 **Understanding Confidence Levels**

### **High Confidence** ✅
- Clear product structure found
- Standard framework (Shopify, WooCommerce)
- Pagination easily detected
- **Action**: Safe to use as-is

### **Medium Confidence** ⚠️
- Some uncertainty in selectors
- Custom framework
- Unusual pagination
- **Action**: Review selectors, test with small scrape

### **Low Confidence** ❌
- Heavily customized site
- JavaScript-heavy (may need Playwright)
- No clear pattern
- **Action**: Manually adjust selectors or use fallbacks

---

## 🔧 **Editing an Existing Source**

### **Scenario**: You created a source but selectors are wrong

**Old Way**:
1. Delete source
2. Recreate from scratch
3. Re-enter all fields 😩

**New Way**:
1. Click **"Edit"** button
2. Modify selectors
3. Click **"Update Source"** ✨

---

## 🛠️ **Manual Fallbacks**

If AI detection fails or gives low confidence:

### **Common Shopify Patterns**
```css
Product Links: .product-card__title a
Pagination: a[rel="next"]
```

### **Common WooCommerce Patterns**
```css
Product Links: .woocommerce-loop-product__link
Pagination: .next.page-numbers
```

### **Generic Fallbacks**
```css
Product Links: a[href*="/product"]
Pagination: a:contains("Next")
```

---

## ⚠️ **Common Issues & Solutions**

### **Issue**: AI Detect button is disabled
**Solution**: Enter a URL first

### **Issue**: "Failed to detect selectors"
**Possible Causes**:
- Website blocks bots (try with Playwright checkbox)
- Invalid URL
- Website requires login
- Network timeout

**Solution**: 
- Check URL is accessible
- Try enabling "Use Playwright"
- Enter selectors manually

### **Issue**: Low confidence result
**Why**: Unusual site structure, heavy JavaScript

**Solution**:
- Test with small scrape (max_pages: 1)
- Adjust selectors if needed
- Use Edit button to refine

---

## 💡 **Pro Tips**

### **1. Start with Collection Pages**
✅ Good: `https://example.com/collections/red-wines`  
❌ Bad: `https://example.com` (homepage)

### **2. Use Specific Collections**
Better results from:
- `/collections/champagne`
- `/category/burgundy-red`
- `/wines/region/bordeaux`

### **3. Test Before Bulk Scraping**
1. Create source
2. Run with `max_pages: 1`
3. Check if products are found
4. If good → increase to 5-10 pages

### **4. Edit vs Delete**
- Selectors slightly off? → **Edit**
- Completely wrong site? → **Delete + Recreate**

### **5. Check Job Status**
- Watch "Job Status" column for errors
- If scrape finds 0 products → selectors likely wrong
- Use Edit to fix and re-run

---

## 📈 **Success Metrics**

After AI Detection, you should see:
- ✅ All fields filled
- ✅ Confidence level shown
- ✅ Suggested name makes sense
- ✅ No obvious errors in selectors

After running scrape:
- ✅ Products found > 0
- ✅ Wines created > 0
- ✅ Job completes without errors

---

## 🎯 **Next Steps**

1. **Wait for deployment** (2-3 mins)
2. **Visit Admin Panel**: `/admin/scraper`
3. **Try AI Detection** with Monarch Wine Merchants URL
4. **Run a test scrape**
5. **Edit if needed**
6. **Report any issues!**

---

## 🐛 **Found a Bug?**

If AI detection gives bad results:
1. Note the URL
2. Check what selectors it suggested
3. What the correct selectors should be
4. Confidence level it gave

This helps improve the AI! 🧠

---

**Happy scraping! The AI does the hard work for you now.** 🍷🤖

