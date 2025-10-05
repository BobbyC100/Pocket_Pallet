# Refinement Feature - Comprehensive Test Checklist

## ✅ **What We Built (7 Improvements)**

### **UI Enhancements (3)**
1. ✅ **Regenerate Button Separation** - Nuclear option visually separated with warning styling
2. ✅ **Voice Misalignment Flag** - 🚨 Special badge for Alignment < 7
3. ✅ **Delightful Loading States** - Enhanced messages and animations

### **Intelligence & Performance (2)**
4. ✅ **Weighted Alignment Scoring** - Alignment weighted 2x in quality calculations
5. ✅ **Performance Optimization** - GPT-3.5 for simple refinements (3-5x faster)

### **Data & Analytics (2)**
6. ✅ **Refinement History Storage** - Before/after, quality scores, timing data
7. ✅ **Analytics Tracking** - Key metrics logged for future analysis

---

## 🧪 **Test Checklist**

### **Test 1: End-to-End Generation Flow**

**Steps:**
1. Navigate to `/new` (New Brief page)
2. Click "Load Test Data" or fill all 8 questions
3. Click "Generate Brief & Vision Framework"
4. Wait ~35-40 seconds

**Expected Results:**
- ✅ Generation completes successfully
- ✅ Redirects to `/sos` page
- ✅ All 6 sections have quality badges
- ✅ Quality scores visible (e.g., "✨ 8.5/10 Excellent")
- ✅ Console log: `📊 ANALYTICS: framework_generated`

**Check Console for:**
```
✅ Framework saved to session storage with quality scores
📊 ANALYTICS: {
  event: 'framework_generated',
  avgQualityScore: '7.85',
  sectionsGenerated: 6,
  timestamp: '2025-...'
}
```

---

### **Test 2: Voice Misalignment Flag**

**Goal:** Verify the 🚨 Voice Misalignment badge appears for low Alignment scores

**Steps:**
1. After generation, inspect quality badges
2. Look for sections with Alignment < 7

**Expected:**
- ✅ If any section has Alignment < 7: **🚨 Voice Misalignment** badge appears
- ✅ Badge has red pulsing animation
- ✅ Badge takes priority over regular "👀 Needs Attention"

**To Force Test (if no low alignment):**
- Open DevTools Console
- Modify session storage:
  ```javascript
  let data = JSON.parse(sessionStorage.getItem('visionFrameworkV2Draft'));
  data.qualityScores.vision.alignment = 6;
  sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(data));
  location.reload();
  ```
- Should see 🚨 Voice Misalignment badge

---

### **Test 3: Quick Actions UI - Regenerate Separation**

**Goal:** Verify Regenerate button is visually separated as "Nuclear Option"

**Steps:**
1. Scroll to any section (e.g., Vision)
2. Click "Quick Actions"

**Expected Visual Structure:**
```
┌─────────────────────────────────────┐
│ QUICK REFINEMENTS                   │
│ [More Specific] [More Concise]     │
│ [Different Angle] [Add Detail]     │
├─────────────────────────────────────┤
│ NUCLEAR OPTION                      │
│ [⚠️ Regenerate from Scratch]       │
│ Completely rewrites this section... │
└─────────────────────────────────────┘
```

**Expected Styling:**
- ✅ "QUICK REFINEMENTS" and "NUCLEAR OPTION" labels
- ✅ Border divider between sections
- ✅ Regenerate button has warning colors (yellow/orange)
- ✅ Regenerate button is larger/more prominent
- ✅ Helper text explains it's a complete rewrite

---

### **Test 4: Refinement - More Specific (Fast Track)**

**Goal:** Test GPT-3.5 fast path for "More Specific"

**Steps:**
1. Find a section with score < 8
2. Click "Quick Actions" → "More Specific"
3. Start timer ⏱️

**Expected Results:**
- ✅ Loading message: "Banyan is thoughtfully incorporating your feedback..."
- ✅ Sub-message: "This usually takes 8-12 seconds"
- ✅ **Actual completion: 5-10 seconds** (faster due to GPT-3.5)
- ✅ Content updates
- ✅ Quality score updates
- ✅ Success message appears

**Check Console for:**
```
⚡ Using gpt-3.5-turbo for fast refinement
⏱️ Refinement took 6.3s
📊 ANALYTICS: {
  event: 'refinement_completed',
  section: 'vision',
  feedback: 'Make this more specific...',
  qualityImprovement: 0.8,
  duration: 6300,
  totalRefinements: 1
}
```

---

### **Test 5: Refinement - Different Angle (Complex)**

**Goal:** Test GPT-4 for complex refinements

**Steps:**
1. Click "Quick Actions" → "Different Angle"
2. Start timer ⏱️

**Expected Results:**
- ✅ **Actual completion: 10-15 seconds** (GPT-4 is slower but higher quality)
- ✅ Content is substantially different from original
- ✅ Quality score updates

**Check Console for:**
```
⚡ Using gpt-4-turbo-preview for complex refinement
⏱️ Refinement took 12.8s
```

---

### **Test 6: Custom Feedback Refinement**

**Goal:** Test user-provided custom feedback

**Steps:**
1. Click "+ Custom feedback" at bottom of section
2. Type: "Make this sound less corporate, more startup-like"
3. Click "Refine Section"

**Expected Results:**
- ✅ AI interprets custom instruction
- ✅ Content tone changes appropriately
- ✅ Quality score updates
- ✅ Refinement history logged

---

### **Test 7: Multiple Refinements on Same Section**

**Goal:** Test iterative refinement workflow

**Steps:**
1. Refine Vision section with "More Specific"
2. Note new quality score
3. Refine again with "Add Detail"
4. Note new quality score
5. Check session storage

**Expected Results:**
- ✅ Each refinement improves quality score
- ✅ Content progressively gets better
- ✅ Refinement history tracks all changes

**Check Session Storage:**
```javascript
JSON.parse(sessionStorage.getItem('visionFrameworkV2Draft')).refinementHistory
```

Should show:
```json
[
  {
    "section": "vision",
    "timestamp": "2025-...",
    "feedback": "Make this more specific...",
    "previousContent": "...",
    "refinedContent": "...",
    "previousQuality": 6.5,
    "newQuality": 7.8,
    "duration": 6200
  },
  {
    "section": "vision",
    "timestamp": "2025-...",
    "feedback": "Add more detail...",
    "previousContent": "...",
    "refinedContent": "...",
    "previousQuality": 7.8,
    "newQuality": 8.5,
    "duration": 8400
  }
]
```

---

### **Test 8: Regenerate (Nuclear Option)**

**Goal:** Verify complete rewrite functionality

**Steps:**
1. Click "Quick Actions"
2. Click "⚠️ Regenerate from Scratch"
3. Observe changes

**Expected Results:**
- ✅ Content is completely different (not just tweaked)
- ✅ Still aligned with original brief responses
- ✅ Uses GPT-4 (slower, ~12-15 sec)
- ✅ Quality score may go up or down significantly

---

### **Test 9: Weighted Alignment Scoring**

**Goal:** Verify Alignment is weighted 2x in quality calculations

**Example Scenario:**
- Section A: Specificity=8, Actionability=7, Alignment=9
- Section B: Specificity=9, Actionability=9, Alignment=6

**Calculate:**
- Section A: (8 + 7 + 9×2) / 4 = **8.25**
- Section B: (9 + 9 + 6×2) / 4 = **7.5**

**Even though Section B has higher Specificity/Actionability, Section A scores higher due to better Alignment.**

**Test:**
1. Find two sections with these approximate characteristics
2. Verify Section A (high alignment) scores higher than Section B (low alignment)

---

### **Test 10: Save with Refinement History**

**Goal:** Verify analytics tracked on save

**Steps:**
1. After doing 3-5 refinements, click "Save"
2. Check console logs

**Expected Console Output:**
```
📊 ANALYTICS: {
  event: 'framework_saved',
  totalRefinements: 4,
  timeSinceGeneration: '8.3 min',
  timestamp: '2025-...'
}
```

**Expected:**
- ✅ totalRefinements matches number of refinements made
- ✅ timeSinceGeneration shows elapsed time since initial generation
- ✅ Session storage cleared after successful save

---

## 📊 **Analytics Events to Verify**

All events should appear in console with `📊 ANALYTICS:` prefix:

### **1. framework_generated**
```json
{
  "event": "framework_generated",
  "avgQualityScore": "7.85",
  "sectionsGenerated": 6,
  "timestamp": "2025-10-05T..."
}
```

### **2. refinement_completed**
```json
{
  "event": "refinement_completed",
  "section": "vision",
  "feedback": "Make this more specific...",
  "qualityImprovement": 0.8,
  "duration": 6300,
  "totalRefinements": 1
}
```

### **3. framework_saved**
```json
{
  "event": "framework_saved",
  "totalRefinements": 4,
  "timeSinceGeneration": "8.3 min",
  "timestamp": "2025-10-05T..."
}
```

---

## 🎯 **Success Criteria**

### **Must Pass (Critical):**
- [ ] Framework generates with quality scores
- [ ] All 6 sections show quality badges
- [ ] Voice Misalignment badge appears when Alignment < 7
- [ ] Regenerate button is visually separated
- [ ] "More Specific" completes in 5-10 seconds
- [ ] "Different Angle" completes in 10-15 seconds
- [ ] Refinement updates content and quality scores
- [ ] Multiple refinements on same section work
- [ ] Refinement history stored in session storage
- [ ] All 3 analytics events fire correctly

### **Nice to Have:**
- [ ] Loading animations are smooth
- [ ] Success messages clear and helpful
- [ ] UI is responsive on mobile
- [ ] No console errors or warnings

---

## 🐛 **Known Issues / Edge Cases**

### **Issue: Quality scores not appearing**
**Solution:** Check console for "Quality scores loaded". If missing, regenerate framework.

### **Issue: Refinement takes too long (>20 sec)**
**Solution:** Check which model is being used. Simple refinements should use GPT-3.5.

### **Issue: Voice Misalignment badge not showing**
**Solution:** Check if any section actually has Alignment < 7. Use console trick above to force it.

### **Issue: Session storage full**
**Solution:** Refinement history can grow large. Clear with: `sessionStorage.clear()`

---

## 🚀 **Testing Commands**

### **Check Session Storage:**
```javascript
// View entire draft data
JSON.parse(sessionStorage.getItem('visionFrameworkV2Draft'))

// View just refinement history
JSON.parse(sessionStorage.getItem('visionFrameworkV2Draft')).refinementHistory

// View quality scores
JSON.parse(sessionStorage.getItem('visionFrameworkV2Draft')).qualityScores

// Clear storage (reset test)
sessionStorage.clear()
```

### **Simulate Low Alignment:**
```javascript
let data = JSON.parse(sessionStorage.getItem('visionFrameworkV2Draft'));
data.qualityScores.vision.alignment = 6;
sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(data));
location.reload();
```

### **View Analytics Summary:**
```javascript
const data = JSON.parse(sessionStorage.getItem('visionFrameworkV2Draft'));
console.log({
  totalRefinements: data.totalRefinements,
  refinementHistory: data.refinementHistory?.length,
  generatedAt: data.generatedAt,
  lastRefinedAt: data.lastRefinedAt
});
```

---

## ✅ **Final Checklist**

Before marking complete:
- [ ] Run all 10 tests
- [ ] Verify all 3 analytics events
- [ ] Check console for errors
- [ ] Test on both light and dark mode
- [ ] Test on mobile viewport
- [ ] Verify refinement history persists across page refreshes (until save)
- [ ] Confirm session storage clears after save

---

## 🎉 **Ready to Test!**

Start with **Test 1** (End-to-End Generation) and work through systematically.

Report any issues with:
- What you were doing
- What you expected
- What actually happened
- Console logs

Good luck! 🚀

