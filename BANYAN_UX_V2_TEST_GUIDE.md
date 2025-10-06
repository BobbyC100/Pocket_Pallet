# Banyan UX v2 — Comprehensive Test Guide

## 🎯 Test Objective
Validate the complete freemium conversion funnel, including URL schema, value gating, signup touchpoints, and strategic tools modal.

---

## ✅ Pre-Test Setup

### 1. Environment Check
- [ ] Dev server is running (`npm run dev`)
- [ ] Database connection is working
- [ ] OpenAI API key is configured
- [ ] Clerk authentication is configured

### 2. Browser Setup
- [ ] Open browser in **incognito mode** (for anonymous testing)
- [ ] Open browser dev tools (Console + Network tabs)
- [ ] Prepare a separate **signed-in browser** for authenticated tests

---

## 🧪 Test Suite

### **Test 1: Anonymous User Flow — Vision Statement Only**

#### 1.1 Landing & Wizard Start
- [ ] Navigate to `/` homepage
- [ ] Click "Get Started" or navigate to `/new`
- [ ] Verify URL is `/new`
- [ ] Verify wizard shows Step 1 of 9

#### 1.2 Wizard Progress (Steps 1-4)
- [ ] Fill out Steps 1-3 (Org, Challenge, Customers)
- [ ] Verify autosave banner appears
- [ ] Complete Step 4 (Purpose)
- [ ] After Step 4, **Soft Signup Modal** should appear
- [ ] Click "X" to dismiss modal (don't sign up yet)
- [ ] Verify modal closes and wizard continues

#### 1.3 Wizard Completion (Steps 5-9)
- [ ] Complete remaining steps (or click "Load Example" button)
- [ ] Verify "Load Example" button (formerly "Load Test Data") works
- [ ] Reach final step and click **"Generate Vision Statement"**
- [ ] **Pre-Generation Signup Modal** should appear
- [ ] Click "Continue as Guest" to proceed without signing up

#### 1.4 Generation & Redirect
- [ ] Verify generation progress modal shows "Generating Vision Statement..."
- [ ] Verify API call to `/api/generate-brief` succeeds
- [ ] **Verify redirect to `/results`** (NOT `/new`)
- [ ] Verify URL is now `/results`

#### 1.5 Results Page — Partial Content
- [ ] Verify Vision Statement tab is visible
- [ ] Verify VC Summary tab is visible
- [ ] **Verify content is PARTIALLY SHOWN** (first 1-2 sections only)
- [ ] Verify **blur overlay** appears on hidden content
- [ ] Verify **"Sign up to unlock"** CTA button appears
- [ ] Verify "Free forever • No credit card required" text appears

#### 1.6 Browser Navigation
- [ ] Click browser **back button**
- [ ] Verify navigation returns to `/new` (wizard)
- [ ] Click browser **forward button**
- [ ] Verify navigation returns to `/results`

#### 1.7 Session Persistence
- [ ] Refresh the page (`/results`)
- [ ] Verify partial content is still displayed
- [ ] Verify data is loaded from `sessionStorage`

---

### **Test 2: Anonymous User → Signup from Results**

#### 2.1 Signup from Results Page
- [ ] On `/results` page, click **"Sign up to unlock"** button
- [ ] Verify Clerk signup modal appears
- [ ] Complete signup process
- [ ] After signup, verify user is redirected back to `/results`
- [ ] **Verify full content is now visible** (no blur overlay)
- [ ] **Verify "Expand Your Vision into Strategy" section appears**

#### 2.2 Strategic Tools Section
- [ ] Scroll to "Expand Your Vision into Strategy" section
- [ ] Verify section lists:
  - "Vision Framework – comprehensive strategic foundation"
  - "Founder's Lens – focused leadership view"
  - "Strategic Briefs – investor-ready summaries"
- [ ] Click **"Unlock Strategic Tools"** button
- [ ] **Verify Strategic Tools Modal appears**

#### 2.3 Strategic Tools Modal
- [ ] Verify modal title: "Choose Your Next Strategic Tool"
- [ ] Verify three cards are shown:
  1. **Vision Framework** (Full strategic foundation)
  2. **Founder's Lens** (Leadership-focused view)
  3. **Strategic Brief** (Investor-ready summary)
- [ ] Click "Generate Vision Framework"
- [ ] Verify generation progress modal appears
- [ ] Verify streaming progress updates
- [ ] **Verify redirect to `/vision-framework-v2`**
- [ ] Verify URL is now `/vision-framework-v2`

---

### **Test 3: Authenticated User Flow — Full Framework**

#### 3.1 Start Fresh (Signed In)
- [ ] Sign out and sign in with a different account
- [ ] Navigate to `/new`
- [ ] Verify **no soft signup modal** appears during wizard
- [ ] Click "Load Example" to fill wizard
- [ ] Click **"Generate Vision Statement"**

#### 3.2 Generation & Redirect
- [ ] Verify **no pre-generation signup modal** appears
- [ ] Verify generation starts immediately
- [ ] Verify progress modal shows:
  - "Generating Vision Statement..." ✓
  - "Mapping strategic questions to framework..."
  - "Detecting contradictions and tensions..."
  - "Generating executive one-pager..."
  - "Running quality checks..."
- [ ] **Verify redirect to `/vision-framework-v2`** (NOT `/results`)
- [ ] Verify URL is now `/vision-framework-v2`

#### 3.3 Vision Framework Page
- [ ] Verify **full framework content is displayed**
- [ ] Verify all sections are visible (no blur overlay)
- [ ] Verify tabs/sections are navigable
- [ ] Verify "Strategic Tools" button exists
- [ ] Verify browser back/forward buttons work correctly

#### 3.4 Browser Navigation (Authenticated)
- [ ] Click browser **back button**
- [ ] Verify navigation returns to `/new`
- [ ] Click browser **forward button**
- [ ] Verify navigation returns to `/vision-framework-v2`

---

### **Test 4: Strategic Tools Modal (Authenticated)**

#### 4.1 Open Strategic Tools Modal
- [ ] From `/vision-framework-v2`, click "Strategic Tools" button
- [ ] OR from `/results` (authenticated), click "Unlock Strategic Tools"
- [ ] Verify **Strategic Tools Modal** opens

#### 4.2 Modal Content
- [ ] Verify modal title: "Choose Your Next Strategic Tool"
- [ ] Verify three tool cards:
  1. Vision Framework
  2. Founder's Lens
  3. Strategic Brief
- [ ] Verify each card has:
  - Icon
  - Title
  - Description
  - "Generate" button

#### 4.3 Tool Generation
- [ ] Click "Generate Founder's Lens" (if not already generated)
- [ ] Verify generation progress modal
- [ ] Verify successful generation
- [ ] Verify appropriate redirect/display

---

### **Test 5: Analytics Tracking**

Open browser console and verify analytics events are logged:

#### 5.1 Wizard Events
- [ ] `wizard_started` — on wizard mount
- [ ] `wizard_progress` — on each step advance
- [ ] `load_example_clicked` — when Load Example is clicked
- [ ] `wizard_completed` — on final step submit

#### 5.2 Signup Touchpoints
- [ ] `soft_wizard:shown` — soft signup modal shown
- [ ] `soft_wizard:dismissed` — soft signup modal dismissed
- [ ] `pre_generation:shown` — pre-generation signup modal shown
- [ ] `pre_generation:dismissed` — pre-generation modal dismissed
- [ ] `results_unlock:shown` — unlock CTA on results page

#### 5.3 Generation Events
- [ ] `vision_statement` generation (with `isAnonymous: true/false`)
- [ ] `vision_framework` generation
- [ ] `founders_lens` generation (if tested)

---

### **Test 6: Pro Upgrade Modal** (Future Feature)

#### 6.1 Trigger Pro Upgrade
- [ ] Generate 3+ strategic tools (if usage limit is implemented)
- [ ] OR click "Upgrade to Pro" button (if available)
- [ ] Verify **Pro Upgrade Modal** appears

#### 6.2 Modal Content
- [ ] Verify modal title: "Unlock Pro Features"
- [ ] Verify Pro benefits list:
  - Unlimited Strategic Tools
  - Advanced Analytics
  - Export to Multiple Formats
  - Priority Support
- [ ] Verify pricing tiers (if implemented)
- [ ] Verify CTA buttons

---

### **Test 7: Edge Cases & Error Handling**

#### 7.1 Direct URL Access
- [ ] As **anonymous user**, navigate directly to `/vision-framework-v2`
- [ ] Verify appropriate redirect or permission check
- [ ] As **anonymous user**, navigate directly to `/results` WITHOUT generating
- [ ] Verify redirect to `/new` (no data in sessionStorage)

#### 7.2 Session Storage Clearing
- [ ] Generate as anonymous user → go to `/results`
- [ ] Open dev tools → Application → Session Storage
- [ ] Delete `lastGeneratedBrief` key
- [ ] Refresh `/results` page
- [ ] Verify redirect to `/new`

#### 7.3 Network Errors
- [ ] Open Network tab in dev tools
- [ ] Go offline (throttle network)
- [ ] Try to generate Vision Statement
- [ ] Verify error handling (error message displayed)

#### 7.4 Incomplete Wizard
- [ ] Fill only Steps 1-3
- [ ] Try to click "Next" on Step 4 without filling
- [ ] Verify validation (button should be disabled)

---

## 🎨 UI/UX Validation

### Visual Checks
- [ ] All modals are properly centered and styled
- [ ] Blur overlay on partial content is visually appealing
- [ ] Buttons use correct Banyan design tokens
- [ ] Responsive layout works on mobile/tablet
- [ ] Dark mode works correctly (if applicable)

### Accessibility
- [ ] Tab navigation works through wizard steps
- [ ] Modals can be closed with Escape key
- [ ] Focus management is correct (modal opens → focus trapped)
- [ ] Screen reader announcements are appropriate

---

## 📊 Success Criteria

### Critical (Must Pass)
- ✅ Anonymous users only see partial results on `/results`
- ✅ Authenticated users get full framework on `/vision-framework-v2`
- ✅ URL schema supports browser back/forward navigation
- ✅ Soft signup and pre-generation modals appear at correct times
- ✅ Strategic Tools Modal works for authenticated users

### Important (Should Pass)
- ✅ Analytics events fire correctly
- ✅ Session storage persists data across refreshes
- ✅ Generation progress modal shows real-time updates
- ✅ All redirects work as expected

### Nice-to-Have
- ✅ Pro Upgrade Modal displays correctly
- ✅ Error handling is graceful
- ✅ UI is polished and responsive

---

## 🐛 Bug Reporting Template

If you find issues, document them as:

```markdown
### Bug: [Brief Description]
**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Console Errors:**
[Paste any console errors]

**Screenshots:**
[If applicable]
```

---

## 🚀 Next Steps After Testing

1. **Fix Critical Bugs** — Any broken flows or redirects
2. **Refine Analytics** — Ensure all events fire correctly
3. **Polish UI** — Adjust styling, animations, copy
4. **Database Integration** — Save documents to DB, not just sessionStorage
5. **Usage Limits** — Implement Pro upgrade triggers
6. **A/B Testing** — Test different signup touchpoint timings

---

## 📝 Test Completion Checklist

- [ ] All Test 1 (Anonymous Flow) steps passed
- [ ] All Test 2 (Anonymous → Signup) steps passed
- [ ] All Test 3 (Authenticated Flow) steps passed
- [ ] All Test 4 (Strategic Tools) steps passed
- [ ] All Test 5 (Analytics) events verified
- [ ] All Test 6 (Pro Upgrade) steps passed (if applicable)
- [ ] All Test 7 (Edge Cases) handled gracefully
- [ ] UI/UX validation completed
- [ ] Success criteria met

---

**Testing Date:** _______________  
**Tester:** _______________  
**Build Version:** _______________  
**Notes:**


