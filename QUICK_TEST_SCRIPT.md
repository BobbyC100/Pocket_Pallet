# 🚀 Quick Test Script - 5 Minutes

## 📋 **Pre-Flight Checklist**

- [ ] Dev server running (`npm run dev`)
- [ ] Browser open to `http://localhost:3000`
- [ ] Browser DevTools Console open (F12 / Cmd+Option+I)
- [ ] Dark mode enabled (preferred)

---

## ⚡ **5-Minute Test (All Features)**

### **STEP 1: Generate Framework (1 min)** 
```
1. Go to http://localhost:3000/new
2. Click "Load Test Data" (if available)
   OR fill 8 questions manually
3. Click "Generate Brief & Vision Framework"
4. Wait ~35-40 seconds
```

**✅ Check Console:**
```
📊 ANALYTICS: { event: 'framework_generated', avgQualityScore: '...', ... }
```

---

### **STEP 2: Visual Inspection (30 sec)**

**When you land on /sos page, verify:**

✅ All 6 sections show quality badges
- Vision: score visible (e.g., "✨ 8.5/10 Excellent")
- Strategy: score visible
- Operating Principles: score visible
- Near-term Bets: score visible
- Metrics: score visible
- Tensions: score visible

✅ Check for Voice Misalignment flag
- If any section has 🚨 "Voice Misalignment" → SUCCESS
- If not, that's okay (means all sections have good alignment)

---

### **STEP 3: Test Quick Actions UI (30 sec)**

```
1. Scroll to Vision section
2. Click "Quick Actions"
```

**✅ Verify Visual Structure:**
```
┌─────────────────────────────┐
│ QUICK REFINEMENTS           │
│ [More Specific] [More...    │
├─────────────────────────────┤
│ NUCLEAR OPTION              │
│ [⚠️ Regenerate from Scratch]│
└─────────────────────────────┘
```

**✅ Regenerate button should be:**
- Separated by border
- Larger than other buttons
- Yellow/warning colored
- Has warning icon ⚠️

---

### **STEP 4: Test Fast Refinement (10 sec)** ⏱️

```
1. Click "More Specific"
2. START TIMER
```

**✅ Expected:**
- Loading message: "Banyan is thoughtfully incorporating your feedback..."
- Duration: **5-10 seconds** (fast with GPT-3.5)
- Content updates
- Quality score updates
- Success message appears

**✅ Check Console:**
```
⚡ Using gpt-3.5-turbo for fast refinement
⏱️ Refinement took 6.3s
📊 ANALYTICS: { event: 'refinement_completed', ... }
```

---

### **STEP 5: Test Complex Refinement (15 sec)** ⏱️

```
1. Click "Quick Actions" again
2. Click "Different Angle"
3. START TIMER
```

**✅ Expected:**
- Duration: **10-15 seconds** (GPT-4)
- Content substantially different
- Quality score updates

**✅ Check Console:**
```
⚡ Using gpt-4-turbo-preview for complex refinement
⏱️ Refinement took 12.8s
```

---

### **STEP 6: Test Custom Feedback (20 sec)**

```
1. Click "+ Custom feedback"
2. Type: "Make this more focused on construction"
3. Click "Refine Section"
```

**✅ Expected:**
- AI interprets instruction
- Content changes appropriately
- Quality score updates

---

### **STEP 7: Verify Refinement History (30 sec)**

**Open Console and run:**
```javascript
const data = JSON.parse(sessionStorage.getItem('visionFrameworkV2Draft'));
console.log('Refinement History:', data.refinementHistory);
console.log('Total Refinements:', data.totalRefinements);
```

**✅ Expected Output:**
```javascript
Refinement History: [
  {
    section: 'vision',
    timestamp: '2025-...',
    feedback: 'Make this more specific...',
    previousContent: '...',
    refinedContent: '...',
    previousQuality: 6.5,
    newQuality: 7.8,
    duration: 6200
  },
  // ... more refinements
]
Total Refinements: 3
```

---

### **STEP 8: Test Save & Analytics (30 sec)**

```
1. Click "Save" button at top
2. Check console
```

**✅ Check Console:**
```
📊 ANALYTICS: {
  event: 'framework_saved',
  totalRefinements: 3,
  timeSinceGeneration: '5.2 min',
  timestamp: '...'
}
```

**✅ Verify:**
- Success message appears
- Session storage cleared

**Run in console to verify:**
```javascript
sessionStorage.getItem('visionFrameworkV2Draft') === null // should be true
```

---

## 🎯 **Quick Success Checklist**

If you saw all of these, **everything works!**

- [x] Framework generated with quality scores
- [x] Quality badges visible on all 6 sections
- [x] Regenerate button separated and styled
- [x] "More Specific" completed in 5-10 sec (GPT-3.5)
- [x] "Different Angle" completed in 10-15 sec (GPT-4)
- [x] Custom feedback worked
- [x] Refinement history stored
- [x] All 3 analytics events fired
- [x] No console errors

---

## 🐛 **If Something Goes Wrong**

### **Problem: Quality scores not showing**
```javascript
// Check if scores exist
const data = JSON.parse(sessionStorage.getItem('visionFrameworkV2Draft'));
console.log('Quality Scores:', data?.qualityScores);
```

### **Problem: Refinement too slow (>20 sec)**
```javascript
// Check which model was used (in console logs)
// Look for: "⚡ Using gpt-3.5-turbo" or "⚡ Using gpt-4-turbo-preview"
```

### **Problem: Session storage empty**
```javascript
// List all session storage keys
Object.keys(sessionStorage)
```

### **Reset everything:**
```javascript
sessionStorage.clear();
location.href = '/new';
```

---

## 📊 **Advanced: Check Weighted Scoring**

To verify Alignment is weighted 2x:

```javascript
const data = JSON.parse(sessionStorage.getItem('visionFrameworkV2Draft'));
const vision = data.qualityScores.vision;

// Manual calculation:
const calculatedScore = (
  vision.specificity + 
  vision.actionability + 
  (vision.alignment * 2)
) / 4;

console.log('AI Score:', vision.overallScore);
console.log('Calculated:', calculatedScore.toFixed(2));
console.log('Match:', Math.abs(vision.overallScore - calculatedScore) < 0.1 ? '✅' : '❌');
```

---

## 🎉 **That's It!**

**Total Time: ~5 minutes**

If everything passed, you're ready to ship! 🚀

**Next Steps:**
- Run full test suite (REFINEMENT_FEATURE_TEST_CHECKLIST.md)
- Test on mobile viewport
- Test with real user data
- Deploy to production

---

## 📞 **Report Results**

When done, report:
- ✅ All tests passed
- ⚠️ X tests had issues (list them)
- 🐛 Found bugs: (describe)

Let's ship this! 🚢

