# Generation Flow Analysis & Optimization Opportunities

**Date:** October 6, 2025  
**Purpose:** Document complete generation pipeline and identify optimization opportunities

---

## 📊 Current Flow: What Happens After Wizard Submission

### **Phase 1: Vision Statement Generation** (~10-15 seconds)
**Location:** `/api/generate-brief`  
**User Experience:** Blocking modal with progress

1. **Parse wizard responses** (instant)
   - Extract `vision_purpose`, `vision_endstate`, strategy, etc.

2. **Generate Founder Brief** (5-8s)
   - Model: GPT-4o
   - Output: ~800-1200 tokens
   - Format: Markdown

3. **Generate VC Summary** (5-8s)
   - Model: GPT-4o
   - Output: Structured JSON (~600 tokens)
   - Sections: What/Why, Market, Solution, Traction, etc.

4. **Save to sessionStorage** (instant)

5. **Save to Database** (0.5-1s) - Signed-in users only
   - POST to `/api/documents`
   - Creates document record

**Cost:** ~$0.02-0.04 per generation  
**Total Time:** ~10-15 seconds

---

### **Phase 2: Vision Framework V2 Generation** (~30-45 seconds)
**Location:** `/api/vision-framework-v2/generate-stream`  
**User Experience:** Blocking modal with live progress updates  
**Only for:** Signed-in users

#### **Step 0: Research Retrieval** (2-4s)
- Query RGRS vector database
- Retrieve 3-5 relevant research chunks
- Format citations
- **Can be deferred?** ✅ YES - Research adds credibility but not critical for initial draft

#### **Step 1: Framework Generation** (10-15s)
- Model: GPT-4o
- Input: User responses + research context (if found)
- Output: Full framework JSON
  - Vision (1 paragraph)
  - Strategy (3-5 pillars)
  - Operating Principles (3-5 items)
  - Near-term Bets (3-5 items)
  - Metrics (5-8 items)
  - Tensions (2-3 items)
- Tokens: ~1500 input, ~800 output
- **Can be deferred?** ❌ NO - This is the core output

#### **Step 2: Validation** (<1s)
- Zod schema validation
- Structural checks only
- **Can be deferred?** ❌ NO - Prevents invalid data from proceeding

#### **Step 3: Executive One-Pager** (8-12s)
- Model: GPT-4o
- Input: Complete framework
- Output: Condensed one-page summary (~500 tokens)
- **Can be deferred?** ✅ YES - User might never view this tab

#### **Step 4: QA Checks** (6-10s)
- Model: GPT-4o-mini (cheaper/faster)
- Checks: Consistency, Measurability, Tensions, Actionability, Completeness
- Output: Pass/fail + issues array for each category
- **Can be deferred?** ✅ YES - User might never view QA tab

#### **Step 5: Quality Scoring** (8-12s)
- Model: GPT-4o-mini
- Scores each section: Specificity, Actionability, Alignment, Measurability
- Calculates weighted overall scores
- **Can be deferred?** ✅ YES - Quality badges are nice-to-have, not essential

6. **Save to sessionStorage** (instant)

7. **Save to Database** (0.5-1s)
   - POST to `/api/documents`
   - Saves framework + metadata

**Cost:** ~$0.08-0.15 per generation  
**Total Time:** ~30-45 seconds

---

## ⏱️ Total Generation Time

| User Type | Phase 1 | Phase 2 | Total |
|-----------|---------|---------|-------|
| **Anonymous** | 10-15s | ❌ Skipped | **10-15s** |
| **Signed-in** | 10-15s | 30-45s | **40-60s** |

---

## 🚀 Optimization Opportunities

### **Strategy 1: Defer Non-Critical Work** (Recommended)
**Impact:** Reduce generation time by ~50% (from 40-60s to 20-30s)

**What to defer:**
1. ✅ **Research Retrieval** (save 2-4s)
   - Show initial framework without research
   - Add "Enhancing with research..." background job
   - Update UI when complete

2. ✅ **Executive One-Pager** (save 8-12s)
   - Generate on-demand when user clicks "Executive One-Pager" tab
   - Show "Generating..." spinner first time
   - Cache result in sessionStorage

3. ✅ **QA Checks** (save 6-10s)
   - Generate on-demand when user clicks "QA Results" tab
   - Show "Running quality checks..." spinner
   - Cache result

4. ✅ **Quality Scoring** (save 8-12s)
   - Generate on-demand when user requests it
   - Or run as background job and show when ready

**New Flow:**
```
Wizard Submit → Vision Statement (10-15s) → Framework Core (10-15s) → DONE
                                                                     ↓
                                          [Background: Research, One-Pager, QA, Scoring]
```

**User Experience:**
- See framework in 20-30s instead of 40-60s
- Other tabs show "Generating..." on first click
- Research citations appear after 2-3s (subtle update)

---

### **Strategy 2: Parallel Processing**
**Impact:** Reduce generation time by ~30% (from 40-60s to 28-42s)

**What to parallelize:**
1. Executive One-Pager + QA Checks (currently sequential)
2. Quality Scoring + Executive One-Pager (currently sequential)

**New Flow:**
```
Research → Framework → Validation → [One-Pager] → DONE
                                 ↘ [QA Checks]  ↗
                                 ↘ [Scoring]    ↗
```

**Limitation:** More complex error handling, higher API concurrency

---

### **Strategy 3: Progressive Enhancement**
**Impact:** Show value immediately, enhance over time

**Approach:**
1. Generate framework core (10-15s) → Show immediately
2. Add research citations (2-3s) → Update UI subtly
3. Add quality badges (8-12s) → Fade in when ready
4. One-Pager & QA → On-demand only

**User Experience:**
- "Your framework is ready!" message at 20s
- "Adding research-backed insights..." subtle indicator
- Quality badges fade in when scoring completes
- Other tabs lazy-load

---

### **Strategy 4: Reduce Model Calls**
**Impact:** Reduce costs by ~40%, speed by ~20%

**Options:**
1. **Combine QA + Scoring into one call**
   - Current: 2 separate GPT-4o-mini calls
   - New: 1 combined call
   - Saves: 6-8s

2. **Use GPT-4o-mini for Executive One-Pager**
   - Current: GPT-4o (expensive, slower)
   - New: GPT-4o-mini
   - Saves: 3-5s, ~50% cost reduction for this step
   - Risk: Slightly lower quality

---

## 📋 Recommended Implementation Plan

### **Phase 1: Quick Wins** (Immediate)
1. ✅ Defer Executive One-Pager to on-demand
2. ✅ Defer QA Checks to on-demand
3. ✅ Combine QA + Scoring into single call

**Impact:** 40-60s → 20-28s (50% faster)

### **Phase 2: Progressive Enhancement** (Week 2)
1. ✅ Research retrieval as background job
2. ✅ Quality scoring as background job
3. ✅ Subtle UI updates when ready

**Impact:** Better perceived performance, "instant" results

### **Phase 3: Advanced Optimization** (Future)
1. ✅ Parallel processing for remaining steps
2. ✅ Evaluate GPT-4o-mini for one-pager
3. ✅ Pre-warm database connections

---

## 💰 Cost Analysis

| Component | Model | Tokens (avg) | Cost | Deferrable? |
|-----------|-------|--------------|------|-------------|
| Founder Brief | GPT-4o | 1500 → 800 | $0.015 | ❌ No |
| VC Summary | GPT-4o | 1200 → 600 | $0.012 | ❌ No |
| Research Retrieval | N/A | N/A | $0.00 | ✅ Yes |
| Framework | GPT-4o | 2000 → 1000 | $0.020 | ❌ No |
| One-Pager | GPT-4o | 1500 → 500 | $0.013 | ✅ Yes |
| QA Checks | GPT-4o-mini | 1200 → 400 | $0.001 | ✅ Yes |
| Scoring | GPT-4o-mini | 1500 → 500 | $0.001 | ✅ Yes |
| **Total** | | | **~$0.062** | |

**If we defer deferrable items:**
- Immediate cost: $0.047 (24% reduction)
- On-demand cost: $0.015 (only if user requests)

---

## 🎯 Recommended Next Step

**Implement Strategy 1 (Defer Non-Critical Work):**

1. Update `/api/vision-framework-v2/generate-stream`:
   - Stop after Step 2 (Validation)
   - Return framework immediately
   - Skip One-Pager, QA, Scoring

2. Create new on-demand endpoints:
   - `POST /api/vision-framework-v2/generate-onepager` (called when tab clicked)
   - `POST /api/vision-framework-v2/qa-and-score` (combined QA + Scoring)

3. Update UI:
   - Show framework at 20-30s
   - One-Pager tab: "Generate One-Pager" button on first view
   - QA tab: "Run Quality Checks" button on first view
   - Research: Background job with subtle "Enhancing..." indicator

**Expected Results:**
- Generation time: 40-60s → 20-30s (50% faster)
- User happiness: ↑↑↑ (instant gratification)
- Conversion rate: ↑ (less waiting = less abandonment)
- Costs: Same or lower (only generate what user needs)

---

## 📊 Success Metrics

Track these to measure optimization impact:

1. **Time to First Result:** Target <25s (currently 40-60s)
2. **Abandonment Rate:** Track users who leave during generation
3. **Tab Click Rate:** % who view One-Pager/QA tabs (inform future decisions)
4. **Cost per Generation:** Target <$0.05 (currently ~$0.06)
5. **User Satisfaction:** Survey "How satisfied are you with generation speed?"

---

**Status:** Ready for implementation  
**Effort:** Medium (2-3 days)  
**Impact:** High (50% faster, better UX)

