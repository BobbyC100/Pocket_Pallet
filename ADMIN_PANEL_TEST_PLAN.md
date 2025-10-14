# Admin Panel Testing Checklist

## 🔐 **Pre-Testing Setup**
- [ ] Deployment completed successfully
- [ ] Navigate to: `https://pocket-pallet.vercel.app/admin/scraper`
- [ ] You're logged in (or redirected to login page)

---

## ✅ **Test Scenarios**

### **1. Authentication & Access**
- [ ] If not logged in, page redirects to `/login`
- [ ] After login, redirected back to admin panel
- [ ] "Admin access required" error is GONE (all users are admins now)

---

### **2. Overview Tab (Default View)**
- [ ] Overview tab is active by default
- [ ] Three stat cards visible:
  - Sources (0 initially)
  - Scraped Wines (0 initially)
  - Products (0 initially)
- [ ] Each card has a "View" button
- [ ] Clicking "View Sources" switches to Sources tab

---

### **3. Create Source Flow**

#### **3A. Empty State**
- [ ] Navigate to Sources tab
- [ ] See "No sources configured yet" message
- [ ] See "Create Your First Source" button
- [ ] Click button → modal opens

#### **3B. Create Form**
- [ ] Modal title: "Create Scraper Source"
- [ ] Required fields marked with `*`
- [ ] Test validation:
  - [ ] Submit empty form → see validation errors
  - [ ] Fill only Name → URL required
  - [ ] Fill Name + invalid URL → validation fails
  
#### **3C. Create a Test Source**

Fill in these values:

**Source 1: Wine.com Bordeaux Reds**
```
Name: Wine.com Bordeaux Reds
Base URL: https://www.wine.com/list/wine/7155?pricemax=9999&sortby=popularity
Product Link Selector: a.wineListItem_link__KGXeH
Pagination Next Selector: (leave empty for now)
Use Playwright: ☐ (unchecked)
Enabled: ☑ (checked)
```

- [ ] Click "Create Source"
- [ ] Loading state shows "Creating..."
- [ ] Modal closes on success
- [ ] Automatically switches to Sources tab
- [ ] New source appears in table

---

### **4. Sources Table View**

#### **4A. Table Columns**
Verify table has these columns:
- [ ] Name (with ID below)
- [ ] URL (clickable link)
- [ ] Status (Enabled/Disabled badge)
- [ ] Last Run (shows "Never" initially)
- [ ] Job Status (shows "—" initially)
- [ ] Actions (Run + Delete buttons)

#### **4B. Source Details**
- [ ] Name: "Wine.com Bordeaux Reds"
- [ ] ID displayed below name
- [ ] URL is clickable → opens Wine.com in new tab
- [ ] Status badge is green "Enabled"
- [ ] Last Run shows "Never"
- [ ] Run button is enabled (blue)
- [ ] Delete button is visible (red text)

---

### **5. Toggle Enabled/Disabled**

- [ ] Click the green "Enabled" badge
- [ ] Badge changes to gray "Disabled"
- [ ] Run button becomes disabled
- [ ] Click gray "Disabled" badge
- [ ] Badge changes back to green "Enabled"
- [ ] Run button becomes enabled

---

### **6. Run Scrape Job**

⚠️ **IMPORTANT**: This will actually scrape Wine.com. Only do this if:
- You have the scraper service code deployed on Render
- Environment variables are configured
- You're ready to scrape real data

#### **6A. Start Job**
- [ ] Click "▶ Run" button
- [ ] Button shows "Starting..."
- [ ] Button becomes disabled
- [ ] Job Status column updates with blue "started" badge

#### **6B. Monitor Job Progress**
- [ ] Status changes from "started" → "running"
- [ ] Page auto-polls every 5 seconds
- [ ] Watch for status updates (this may take 1-5 minutes)

#### **6C. Job Completion**
When job completes:
- [ ] Status badge turns green "completed"
- [ ] Shows: "X wines, Y products" below status
- [ ] "Last Run" timestamp updates
- [ ] Run button re-enables

OR if job fails:
- [ ] Status badge turns red "failed"
- [ ] Error message shown below status
- [ ] Run button re-enables

---

### **7. Create Multiple Sources**

Create 2 more test sources:

**Source 2: K&L Burgundy**
```
Name: K&L Burgundy Whites
Base URL: https://www.klwines.com/Products?filters=sv2$Burgundy$CategoryName
Product Link Selector: .tf-product a
Pagination Next Selector: (empty)
Use Playwright: ☐
Enabled: ☑
```

**Source 3: Disabled Test Source**
```
Name: Test Disabled Source
Base URL: https://example.com/wines
Product Link Selector: (empty)
Pagination Next Selector: (empty)
Use Playwright: ☐
Enabled: ☐ (UNCHECKED - start disabled)
```

- [ ] All 3 sources appear in table
- [ ] Disabled source shows gray badge
- [ ] Disabled source's Run button is disabled

---

### **8. Delete Source**

- [ ] Click "Delete" on "Test Disabled Source"
- [ ] Confirmation dialog appears: "Are you sure you want to delete..."
- [ ] Click "Cancel" → nothing happens
- [ ] Click "Delete" again
- [ ] Click "OK" → source is deleted
- [ ] Source removed from table
- [ ] Only 2 sources remain

---

### **9. Scraped Wines Tab**

**If you ran a scrape job:**
- [ ] Click "Scraped Wines" tab
- [ ] Table shows scraped wines
- [ ] Columns: ID, Producer, Cuvee, Vintage, Region, Size
- [ ] Data populated from scrape

**If no scrapes run yet:**
- [ ] Shows "No wines scraped yet"

---

### **10. Products Tab**

**If you ran a scrape job:**
- [ ] Click "Products" tab
- [ ] Table shows product listings
- [ ] Columns: ID, Title, URL, Source
- [ ] URLs are clickable
- [ ] Source ID matches your source

**If no scrapes run yet:**
- [ ] Shows "No products scraped yet"

---

### **11. Navigation & UI**

- [ ] Click "← Back to Dashboard" → returns to dashboard
- [ ] Click dashboard "Admin →" link → returns to admin panel
- [ ] Tab switching works smoothly
- [ ] No console errors in browser DevTools

---

### **12. Error Handling**

#### **12A. Network Errors**
- [ ] Turn off WiFi
- [ ] Try to create source → see error message
- [ ] Turn WiFi back on
- [ ] Error message is displayed clearly

#### **12B. Validation Errors**
- [ ] Try to create duplicate source (same URL)
- [ ] Should show error: "Source with URL ... already exists"

---

## 🐛 **Known Limitations (Expected Behavior)**

1. **No Edit Function** - Can't edit sources yet (delete + recreate)
2. **Job History Not Saved** - Jobs only tracked in memory (refresh = lost)
3. **No Pagination** - Shows last 50 wines/products only
4. **Manual Polling** - Jobs don't auto-update (need to stay on page)
5. **No Filters** - Can't filter wines by producer/region yet

---

## 📊 **Expected Results After Testing**

After completing all tests, you should have:
- ✅ 2 active scraper sources created
- ✅ At least 1 successful scrape job (if run)
- ✅ Wines and products visible in tabs
- ✅ No console errors
- ✅ All CRUD operations working

---

## 🚨 **Report Issues**

If you encounter any issues, note:
1. **What you did** (steps to reproduce)
2. **What you expected** (expected behavior)
3. **What happened** (actual behavior)
4. **Console errors** (if any - F12 → Console tab)
5. **Screenshots** (if helpful)

---

## 🎯 **Next Steps After Testing**

Once testing is complete, we can:
1. Fix any bugs found
2. Add missing features
3. Build the User Discovery Feature
4. Implement Price Alerts
5. Set up automated scheduling

---

## ⏱️ **Estimated Testing Time**

- Basic functionality: **5-10 minutes**
- With scrape job: **10-15 minutes** (includes waiting for scrape)
- Full testing: **15-20 minutes**

---

**Good luck testing! Let me know what you find! 🚀**

