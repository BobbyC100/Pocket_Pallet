# Feature Summary: Intelligent Framework Generation

## 🎨 What You'll See

### **1. Quality Badges (Auto-Generated)**

Each section header now shows a quality indicator:

**Excellent Section (8-10):**
```
Vision
✨ 8.5/10 Excellent  💡 2 suggestions
```

**Good Section (6-7.9):**
```
Strategy (How We Win)
⚠️ 6.8/10 Good  💡 3 suggestions
```

**Needs Work Section (<6):**
```
Near-term Bets
🔴 5.2/10 Needs Work  👀 Needs Attention  3 issues  💡 4 suggestions
```

---

### **2. Refinement Panel (Bottom of Each Section)**

**Collapsed State:**
```
─────────────────────────────────────
REFINE THIS SECTION        Quick Actions →
─────────────────────────────────────
+ Custom feedback
```

**Expanded State:**
```
─────────────────────────────────────
REFINE THIS SECTION        Hide Options

[🎯 More Specific] [✂️ More Concise] [🔄 Different Angle]
[➕ Add Detail] [🔃 Regenerate]
─────────────────────────────────────
+ Custom feedback
```

**Active Refinement:**
```
─────────────────────────────────────
[Spinner] AI is refining this section...
─────────────────────────────────────
```

---

## 🔄 User Flow Example

### **Scenario: Founder generates a framework**

**Step 1: Generation**
```
User fills wizard → Clicks "Generate"

Loading screen shows:
✓ Generating Vision Framework (30s)
✓ Generating Founder Brief (12s) 
✓ Detecting contradictions and tensions
✓ Running quality checks (5s)
```

**Step 2: Initial Results**

User sees 6 sections with quality scores:
- ✨ Vision: 8.5/10 Excellent
- ⚠️ Strategy: 6.8/10 Good (2 issues)
- ✨ Operating Principles: 8.0/10 Excellent
- 🔴 Near-term Bets: 5.2/10 Needs Work (3 issues)
- ✨ Metrics: 8.3/10 Excellent
- ⚠️ Tensions: 6.5/10 Good (1 issue)

**Step 3: User Identifies Weak Section**

Near-term Bets (5.2/10) has red badge → Needs attention!

Issues shown:
- Bet 1 lacks clear measure
- Bet 2 doesn't specify owner role
- Bet 3 timeline too vague

Suggestions shown:
- Add concrete success metrics to each bet
- Ensure every bet has named owner (CEO, CTO)
- Make timeframes more specific
- Connect bets to strategy pillars

**Step 4: User Refines**

Clicks: "🎯 More Specific"

AI refines the bets:

**Before:**
```
Bet: Improve our product
Owner: Team
Horizon: Q2
Measure: Better metrics
```

**After:**
```
Bet: Reduce manual route adjustments by 60% through predictive 
     routing that accounts for traffic, permits, and lift availability
Owner: CTO
Horizon: Q2
Measure: Manual adjustment rate vs baseline (currently 40%)
```

New score: ✨ 8.1/10 Excellent

**Step 5: User Continues**

- Refines Strategy section to add more specificity
- Fine-tunes Tensions based on suggestions
- All sections now 7.5+ → Framework is high quality!
- Clicks "Save"

---

## 📊 Quality Criteria

### **What AI Evaluates:**

**1. Specificity (1-10)**
- Generic phrases like "revolutionize" = Low
- Concrete details like "NYC, Chicago, LA contractors" = High

**2. Actionability (1-10)**
- Vague: "Build great products" = Low
- Clear: "Integrate with Procore API by Q2" = High

**3. Alignment (1-10)**
- Off-brand: Contradicts founder's responses = Low
- On-brand: Matches founder's language/intent = High

**4. Measurability (1-10)** [Bets & Metrics only]
- Unmeasurable: "Increase revenue" = Low
- Measurable: "Reach $500K MRR by Q3" = High

---

## 🎯 Refinement Actions Explained

### **Quick Actions:**

**🎯 More Specific**
- Adds concrete details from founder's responses
- Replaces generic language with specifics
- Best for: Vague or high-level content

**✂️ More Concise**
- Removes fluff and unnecessary words
- Makes content punchier
- Best for: Wordy or redundant sections

**🔄 Different Angle**
- Approaches the same topic from new perspective
- Maintains intent but changes framing
- Best for: When current approach doesn't resonate

**➕ Add Detail**
- Expands on existing content
- Adds examples and context
- Best for: Incomplete or surface-level content

**🔃 Regenerate**
- Complete rewrite with fresh thinking
- Uses same source data
- Best for: Starting over when dissatisfied

### **Custom Feedback:**
Type specific instructions:
- "Focus more on construction industry specifics"
- "Add timelines and specific numbers"
- "Make this sound less corporate"
- "Connect this to our competitive advantage"

---

## 🚀 Key Benefits

### **For Founders:**
1. **Immediate Quality Feedback** - Know what's weak before sharing
2. **Guided Improvement** - Specific suggestions, not guesswork
3. **Iterative Refinement** - Improve until satisfied
4. **Time Savings** - AI does the rewriting

### **For Output Quality:**
1. **Higher Specificity** - Less generic, more concrete
2. **Better Alignment** - Stays true to founder's vision
3. **Actionability** - Clearer next steps
4. **Consistency** - All sections at similar quality level

---

## 🎬 Testing Scenarios

### **Scenario A: Generic Vision**
**Input:** "Revolutionize the industry"
**Score:** 🔴 3.2/10 (Too generic)
**After Refinement:** "Eliminate delivery delays for mid-market construction contractors..."
**Score:** ✨ 8.5/10 (Concrete and specific)

### **Scenario B: Unmeasurable Bets**
**Input:** "Improve product quality"
**Score:** 🔴 4.1/10 (No measure)
**After Refinement:** "Reduce bug reports by 50% (from 40/week to 20/week) by Q3, measured via Jira"
**Score:** ✨ 8.7/10 (Clear measure)

### **Scenario C: Weak Tensions**
**Input:** "Quality vs Speed"
**Score:** 🔴 5.0/10 (Too generic)
**After Refinement:** "Premium positioning (high-quality, high-touch) vs need for rapid site adoption may create pricing pressure"
**Score:** ✨ 7.8/10 (Specific to strategy)

---

## 📈 Expected Results

**After full refinement cycle:**
- All sections: 7.5+ average
- 0-1 sections with issues
- High confidence in framework quality
- Ready to share with team/investors

**Typical improvement:**
- Initial average: 6.2/10
- After refinement: 8.1/10
- Time invested: 5-10 minutes
- Quality increase: ~30%

---

## 🎯 Start Testing!

1. Open `/new` page
2. Generate a framework
3. Look for quality badges
4. Try refining lowest-scoring section
5. See the improvement!

**Questions or issues?** Check console logs or refer to TESTING_GUIDE.md

