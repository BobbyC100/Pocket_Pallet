# Testing Guide: Iterative Refinement + Auto-Quality Detection

## 🎯 What We Built

1. **Iterative Refinement System** - Users can refine any section with AI feedback
2. **Auto-Quality Detection** - AI automatically scores each section on generation
3. **Visual Quality Indicators** - Badges show quality scores and issues

---

## ✅ Testing Checklist

### **Test 1: End-to-End Generation Flow**

**Steps:**
1. Navigate to `/new` (New Brief page)
2. Click "Load Test Data" (if available) or fill out all 8 wizard questions
3. Click "Generate Brief & Vision Framework"
4. Wait ~35-40 seconds (includes quality scoring)
5. Navigate to the SOS page when generation completes

**Expected Results:**
- ✅ Generation completes successfully
- ✅ Vision Framework loads on SOS page
- ✅ Each section shows a quality badge (e.g., "✨ 8.5/10 Excellent")
- ✅ Low-scoring sections show "👀 Needs Attention" badge
- ✅ Issue and suggestion counts display

**Verify in Console:**
```
✅ Framework saved to session storage with quality scores
✅ Quality scores loaded: vision, strategy, operating_principles, near_term_bets, metrics, tensions
```

---

### **Test 2: Quality Badge Visual Indicators**

**Location:** SOS page → Vision Framework section

**Check each section for:**
- **Score Badge**: Shows "X.X/10" with emoji
- **Quality Level**: 
  - 🟢 "Excellent" (8-10) in green
  - 🟡 "Good" (6-7.9) in yellow
  - 🔴 "Needs Work" (<6) in red
- **Attention Badge**: "👀 Needs Attention" appears on scores <6
- **Issue Count**: "2 issues" (if any)
- **Suggestion Count**: "💡 3 suggestions" (if any)

**Example Good Section:**
```
Vision
✨ 8.5/10 Excellent  💡 2 suggestions
```

**Example Weak Section:**
```
Near-term Bets
🔴 5.2/10 Needs Work  👀 Needs Attention  3 issues  💡 4 suggestions
```

---

### **Test 3: Refinement Panel - Quick Actions**

**Steps:**
1. Find any section (e.g., Vision)
2. Scroll to bottom to see "Refine This Section"
3. Click "Quick Actions" button
4. Try each quick action button:
   - 🎯 More Specific
   - ✂️ More Concise
   - 🔄 Different Angle
   - ➕ Add Detail
   - 🔃 Regenerate

**Expected for each action:**
- ✅ Loading state: "AI is refining this section..."
- ✅ Takes 5-15 seconds
- ✅ Section content updates with refined version
- ✅ Quality badge updates with new score
- ✅ Success message appears: "✨ Vision refined successfully!"
- ✅ Refinement panel closes or returns to default state

**Verify in Console:**
```
🔄 Starting refinement for section: vision
📝 User feedback: Make this more specific...
✅ Refinement complete
```

---

### **Test 4: Refinement Panel - Custom Feedback**

**Steps:**
1. Find any section
2. Click "+ Custom feedback"
3. Type specific feedback (e.g., "Add more details about our target market in NYC")
4. Click "Refine Section"

**Expected Results:**
- ✅ AI interprets your feedback
- ✅ Section content updates based on your instructions
- ✅ Quality score improves (usually)
- ✅ Success message appears

**Try these feedback examples:**
- "Make the vision more focused on construction industry"
- "Add specific numbers and timelines to the bets"
- "Make the principles sound less corporate, more startup-like"
- "Add details about our competitive advantage"

---

### **Test 5: Multiple Refinement Iterations**

**Goal:** Test that you can refine the same section multiple times

**Steps:**
1. Pick a low-scoring section (< 7)
2. Refine with "🎯 More Specific"
3. Check the new score
4. Refine again with "➕ Add Detail"
5. Check score again

**Expected Results:**
- ✅ Score improves with each refinement
- ✅ Content becomes progressively more detailed
- ✅ Each refinement builds on previous version
- ✅ Quality badges update each time

**Quality Progression Example:**
```
Initial: 🔴 5.2/10 Needs Work
After 1st refinement: 🟡 6.8/10 Good
After 2nd refinement: ✨ 8.3/10 Excellent
```

---

### **Test 6: All Sections Have Refinement**

**Verify each section has refinement capability:**

1. ✅ **Vision** - Refine button at bottom
2. ✅ **Strategy** - Refine button at bottom
3. ✅ **Operating Principles** - Refine button at bottom
4. ✅ **Near-term Bets** - Refine button at bottom
5. ✅ **Metrics** - Refine button at bottom
6. ✅ **Tensions** - Refine button at bottom

**Test at least 2-3 different sections to ensure all work**

---

### **Test 7: Quality Scoring Accuracy**

**Manual Review:** Check if AI scores make sense

**Pick a section and evaluate:**
- Does a high score (8+) mean the content is actually good?
- Does a low score (<6) correctly identify weak content?
- Are the identified issues valid?
- Are the suggestions helpful?

**Example Good Vision (should score 8+):**
```
"We're eliminating delivery delays for mid-market construction contractors 
in NYC, Chicago, and LA by coordinating materials, traffic, and crane 
schedules in real-time—turning logistics from a project risk into a 
competitive advantage."
```

**Example Weak Vision (should score <6):**
```
"Revolutionize the construction industry with innovative technology"
```

---

### **Test 8: Error Handling**

**Test error scenarios:**

1. **Network Error During Refinement:**
   - Disconnect internet
   - Try to refine a section
   - Expected: Error message appears, UI doesn't break

2. **Empty Feedback:**
   - Click custom feedback
   - Don't type anything
   - Try to submit
   - Expected: Button is disabled

3. **Refinement While Another is Running:**
   - Start refining Vision
   - Immediately try to refine Strategy
   - Expected: Second request waits or shows "Already refining" state

---

### **Test 9: Save & Persistence**

**Steps:**
1. Generate a framework
2. Refine 2-3 sections
3. Note the quality scores
4. Click "Save" button at top
5. Refresh the page
6. Navigate back to SOS

**Expected Results:**
- ✅ Framework persists after save
- ✅ Refined content is saved (not original)
- ✅ Quality scores persist
- ✅ No data loss

---

### **Test 10: Mobile/Responsive View**

**Check on smaller screens:**
- Quality badges stack properly
- Refinement panel is usable
- Quick action buttons don't overflow
- Text is readable

---

## 🐛 Known Issues to Watch For

1. **Quality scores don't appear** → Check console for "Quality scores loaded"
2. **Refinement hangs** → Check API logs for errors
3. **Quality badge shows wrong color** → Verify score thresholds
4. **Suggestions don't display** → Check if `suggestions` array exists in quality data

---

## 📊 Success Metrics

**A successful test means:**
- ✅ All 6 sections show quality scores on generation
- ✅ Refinement works for all sections
- ✅ Quality scores update after refinement
- ✅ Visual indicators are clear and helpful
- ✅ No console errors
- ✅ System feels intuitive and responsive

---

## 🔍 Where to Check for Errors

### **Browser Console**
```bash
# Open DevTools (F12 or Cmd+Option+I)
# Look for:
✅ Framework saved to session storage with quality scores
✅ Quality scores loaded
🔄 Starting refinement for section: [section]
✅ Refinement complete

# Red flags:
❌ Failed to parse draft data
❌ Refinement error
❌ Quality scoring error
```

### **Network Tab**
Check these API calls succeed (200 status):
- `POST /api/vision-framework-v2/generate` (~35-40 sec)
- `POST /api/vision-framework-v2/refine` (~5-15 sec per refinement)

### **Server Logs** (if running locally)
```bash
# Terminal where Next.js is running
✅ Quality scoring complete
✅ Refinement complete
```

---

## 🎯 Quick Test Script

**5-Minute Smoke Test:**

1. Go to `/new` → Load test data → Generate (1 min wait)
2. Check 6 sections have quality badges (10 sec)
3. Pick lowest-scoring section (10 sec)
4. Click "🎯 More Specific" (15 sec wait)
5. Verify score improved (5 sec)
6. Try one custom feedback refinement (20 sec)
7. Verify all works smoothly (10 sec)

**Total: ~3 minutes**

If all works → ✅ System is functioning correctly!

---

## 🚀 Ready to Test!

Start with Test 1 (End-to-End Flow) and work through the checklist. Report any issues you find!

**Pro tip:** Keep browser console open during testing to see real-time feedback from the system.

