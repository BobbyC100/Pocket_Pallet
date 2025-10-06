# Banyan User Flow - One Pager

**Version:** 1.0  
**Date:** October 2025  
**Product:** Vision Framework Generation with Research-Grounded Reasoning

---

## 🎯 Overview

Banyan transforms founder insights into research-backed strategic frameworks through an 8-step wizard, followed by AI-powered generation with real-time progress tracking.

**Key Innovation:** Every framework is grounded in peer-reviewed organizational science research via the RGRS system.

---

## 🚀 Complete User Journey

```
Landing Page → Wizard (8 Steps) → Generation (7 Stages) → Results (3 Outputs)
   ↓               ↓                     ↓                    ↓
Homepage     User Input            AI Processing         Deliverables
```

---

## Stage 1: Landing & Discovery

### Entry Point: `/` (Homepage)

**What Users See:**
- Hero headline: *"From first draft to focused strategy"*
- Subheadline: *"Build plans that align your team and investors"*
- Primary CTA: **"Start Building"** button
- Three value propositions:
  - **Polished Drafts** - Refine rough notes into structured documents
  - **Actionable Docs** - Turn ideas into usable frameworks
  - **Strategic Outputs** - Communicate and plan effectively

**User Action:** Click "Start Building" → Navigate to `/new`

**Duration:** ~30 seconds

---

## Stage 2: Input Wizard

### Journey Begins: `/new` (Wizard Page)

**Format:** 8-step sequential wizard with progress indicator

### Step-by-Step Questions

| Step | Question | Purpose | Example Response |
|------|----------|---------|------------------|
| **1** | What are you building, for whom, and why now? | Vision, audience, timing | "Performance management for mid-market companies where employees lack goal clarity..." |
| **2** | What decisions feel hardest right now? | Surface tensions | "Should we focus on engagement or performance metrics first?" |
| **3** | What does success look like — financially and culturally? | Dual horizons | "Financially: $50M+ ARR. Culturally: Everyone understands how their work matters." |
| **4** | What beliefs should your company never compromise on? | Core principles | "Clarity over complexity. Alignment over activity." |
| **5** | What capabilities do you need to make this real? | Infrastructure | "Real-time goal tracking, simple UI, misalignment analytics." |
| **6** | Where are you now — team, traction, stage, runway? | Current reality | "2 co-founders, 5 beta customers, 400 users, 75% weekly engagement." |
| **7** | Vision: Why does your company exist? | Purpose statement | "Ensure every employee understands how their work contributes." |
| **8** | Vision: What does the end state look like? | Future state | "A world where goal alignment is the norm, not the exception." |

### Features
- ✅ **Test Data Button** - Pre-fill with example aligned to research corpus
- ✅ **Progress Indicator** - Shows step 1-8 with completion status
- ✅ **Back/Next Navigation** - Iterate on responses before submitting
- ✅ **Auto-Save** - Preserves work in browser (3-second debounce)
- ✅ **Input Validation** - Ensures quality responses before proceeding

**User Action:** Complete all 8 steps → Click "Generate Framework"

**Duration:** ~10-15 minutes (thoughtful responses)

---

## Stage 3: Generation Pipeline

### Real-Time Processing: 7-Stage AI Pipeline

**Visual:** Progress modal with live status updates

```
┌─────────────────────────────────────────────┐
│    Generating Your Strategic Framework     │
├─────────────────────────────────────────────┤
│ ✓ Generate Vision Statement (0.8s)         │
│ ⟳ Retrieve Research Insights (in progress) │
│   Found 3 relevant research insights        │
│ ○ Generate Strategic Framework (pending)    │
│ ○ Validate Framework Structure (pending)    │
│ ○ Create Executive Summary (pending)        │
│ ○ Run Quality Checks (pending)              │
│ ○ Score Section Quality (pending)           │
└─────────────────────────────────────────────┘
```

### Stage-by-Stage Breakdown

| Stage | Name | What Happens | Duration | API Endpoint |
|-------|------|--------------|----------|--------------|
| **1** | Generate Vision Statement | Creates brief with vision, traction, risks | ~0.8s | `/api/generate-brief` |
| **2** | Retrieve Research Insights ⭐ | **RGRS** searches corpus for relevant research | ~0.3s | Embedded in streaming |
| **3** | Generate Strategic Framework | Streams 7 sections (Vision, Strategy, Culture, etc.) | ~12-18s | `/api/vision-framework-v2/generate-stream` |
| **4** | Validate Framework Structure | Checks completeness, coherence, alignment | ~1.5s | Embedded in streaming |
| **5** | Create Executive Summary | Generates one-pager with key takeaways | ~2-3s | Embedded in streaming |
| **6** | Run Quality Checks | Tests for clarity, specificity, actionability | ~1s | Embedded in streaming |
| **7** | Score Section Quality | Rates each section (0-100) with feedback | ~1.5s | Embedded in streaming |

⭐ **RGRS Innovation:** Stage 2 retrieves peer-reviewed research that informs framework generation. Citations are displayed to user for trust and transparency.

### Technical Details

**Streaming Implementation:**
- Server-Sent Events (SSE) for real-time updates
- Chunked responses every ~50-100 tokens
- Progress indicators update per section completion

**Error Handling:**
- Graceful degradation if research retrieval fails
- Retry logic for API failures
- User-friendly error messages

**User Experience:**
- Modal overlays page during generation
- Cannot dismiss until complete (or error)
- Shows estimated time remaining
- Section-by-section progress with durations

**Total Duration:** ~20-30 seconds

---

## Stage 4: Results & Deliverables

### Output View: 3-Tab Interface

Users receive three complementary deliverables:

```
┌────────────────────────────────────────────────┐
│  [Vision Statement] [Vision Framework] [V2]    │ ← Tab Navigation
├────────────────────────────────────────────────┤
│                                                 │
│  📚 Research-Backed Insights      3 Sources    │ ← RGRS Citations
│  This framework incorporates insights from     │
│  peer-reviewed research:                       │
│                                                 │
│  ① Goal Congruence Study (85%)                 │
│  ② Strategy-Culture Alignment (78%)            │
│  ③ Organizational Performance (62%)            │
│                                                 │
│  ─────────────────────────────────────────────│
│                                                 │
│  # Vision Framework                             │ ← Generated Content
│  ## Vision                                      │
│  [Your purpose statement...]                   │
│  ...                                            │
└────────────────────────────────────────────────┘
```

### Tab 1: Vision Statement (Brief)

**Content:**
- The Problem statement
- Target Market & GTM
- Current Traction
- 6-Month Goals
- Financial Position (with calculated runway)
- Key Risks & Assumptions

**Format:** Markdown, founder-friendly language

**Use Case:** Internal planning, team alignment, investor conversations

**Actions Available:**
- 📥 **Export PDF** - Download formatted document
- ✏️ **Edit Inline** - Refine generated content
- 💾 **Auto-Save** - Changes preserved automatically

---

### Tab 2: Vision Framework (V1)

**Content:** Structured strategic framework with:
- Vision & Purpose
- Strategic Priorities
- Cultural Principles
- Success Metrics
- Key Initiatives

**Format:** Markdown with headers

**Use Case:** Strategic planning, team workshops

**Actions Available:**
- 📥 **Export PDF**
- ✏️ **Edit Inline**
- 💾 **Auto-Save**

---

### Tab 3: Vision Framework V2 ⭐ (Primary Output)

**Content:** Comprehensive 7-section framework

| Section | Purpose |
|---------|---------|
| **Vision** | Why the company exists + end state |
| **Strategy** | How you'll achieve the vision |
| **Culture** | Principles and values that guide decisions |
| **Metrics** | How you'll measure success |
| **Operations** | Key systems and processes needed |
| **Initiatives** | Priority projects for next 6-12 months |
| **Summary** | One-pager executive overview |

**Special Features:**
- **📚 Research Citations Panel** (top of page)
  - Shows 1-8 cited research papers
  - Confidence scores (color-coded: green ≥80%, blue ≥60%, gray <60%)
  - Author, section, and source links
  - Hover tooltips explaining relevance
- **Quality Scores** (per section)
  - Clarity score (0-100)
  - Specificity score (0-100)
  - Actionability score (0-100)
  - AI feedback for improvement

**Format:** Rich markdown with embedded metadata

**Use Case:** Board presentations, investor decks, strategic planning sessions

**Actions Available:**
- 📥 **Export PDF** (with citations)
- ✏️ **Edit Inline** (real-time updates)
- 💾 **Auto-Save** (3-second debounce)
- 🔄 **Regenerate** (start over with same inputs)

---

## 🎨 User Experience Highlights

### Wizard Experience
- **Progressive Disclosure** - One question at a time reduces cognitive load
- **Contextual Examples** - Placeholder text shows quality responses
- **Flexible Navigation** - Can go back to revise earlier answers
- **Test Data** - One-click load for demos or exploration

### Generation Experience
- **Real-Time Progress** - See exactly what's happening (no black box)
- **Research Transparency** - Know when AI retrieves peer-reviewed studies
- **Time Estimates** - Each stage shows expected duration
- **Cannot Skip** - Modal ensures user sees full process

### Results Experience
- **Multi-Format Outputs** - Three complementary deliverables
- **Inline Editing** - Refine without leaving the page
- **Auto-Save** - Never lose work (persists to browser storage)
- **PDF Export** - Professional formatting for sharing
- **Citations Upfront** - Research backing shown prominently

---

## 🔐 Authentication & Persistence

### Anonymous Users
- ✅ Full access to wizard and generation
- ✅ Auto-save to browser localStorage
- ✅ Can export PDFs
- ⚠️ Work lost if browser cache cleared
- 💡 Prompted to sign up for permanent storage

### Authenticated Users (Clerk)
- ✅ All anonymous features
- ✅ Cloud storage (Supabase)
- ✅ Access from any device
- ✅ Version history (future)
- ✅ Share with team (future)

**Sign-In Flow:** 
- Modal appears after generation complete
- Non-blocking (can continue working)
- "Save Progress" CTA to incentivize signup

---

## 🧠 RGRS Integration Points

### Where Research Enters the Flow

```
User Input → 【RGRS Retrieval】 → AI Generation → Cited Output
              ↑
              Research Corpus
              (25+ papers)
```

**Stage 2 (Retrieve Research Insights):**
1. Convert user responses into semantic query
2. Search vector database (pgvector + HNSW)
3. Boost results with fact matching
4. Filter by section relevance (prioritize Findings)
5. Return top 8 chunks with confidence scores
6. Format citations for AI prompt
7. Pass to generation pipeline

**Result:** AI receives research context before writing framework, ensuring grounded insights.

**User Benefit:** Every strategic recommendation traceable to peer-reviewed research.

---

## 📊 Key Metrics

### User Journey Metrics

| Stage | Metric | Target | How Measured |
|-------|--------|--------|--------------|
| **Landing** | Click-through rate | ≥60% | Homepage → `/new` |
| **Wizard** | Completion rate | ≥80% | Start → Submit |
| **Wizard** | Time to complete | ~12 min avg | First step → Submit |
| **Generation** | Success rate | ≥98% | Complete without error |
| **Generation** | Time to result | ≤30s p95 | Submit → Complete |
| **Results** | Engagement | ≥70% edit | Users who modify output |
| **Results** | Export rate | ≥50% | Users who download PDF |
| **RGRS** | Citation coverage | ≥80% | Frameworks with ≥1 citation |
| **RGRS** | User trust | ≥75% | Rate citations "helpful" |

### Drop-off Analysis

**High-Risk Points:**
1. **Wizard Step 3-4** (Success/Principles questions) - Abstract concepts
2. **Generation Modal** - Users may close browser during 30s wait
3. **Results Page** - Overwhelming amount of content

**Mitigation:**
1. Better examples + tooltips for abstract questions
2. Progress bar with time estimates during generation
3. Summary section first, detail sections below fold

---

## 🚧 Future Enhancements

### Phase 2 (Q4 2025)
- [ ] **Claim Validation UI** - Human-in-the-loop feedback on generated statements
- [ ] **BAI Dashboard** - Visualize 5-signal alignment score
- [ ] **Inline Citations** - Tag specific sentences with [1], [2] references
- [ ] **Citation Tooltips** - Hover to see research excerpt

### Phase 3 (Q1 2026)
- [ ] **Multi-Hop Reasoning** - Answer complex strategic questions
- [ ] **Custom Research Corpus** - Upload your own studies (enterprise)
- [ ] **Collaborative Editing** - Team members co-create frameworks
- [ ] **Version History** - Track changes over time

### Phase 4 (Q2 2026)
- [ ] **Strategic Dashboard** - Track metrics from framework
- [ ] **OKR Integration** - Link goals to frameworks
- [ ] **Slack/Teams Integration** - Share and discuss in context
- [ ] **API Access** - Programmatic framework generation

---

## 🎯 Success Definition

A successful user journey means:

1. ✅ **Completes wizard** with thoughtful, specific responses
2. ✅ **Sees research citations** tied to their vision (trust signal)
3. ✅ **Engages with output** (edits, exports, or shares)
4. ✅ **Returns** to iterate or create new frameworks
5. ✅ **Signs up** for persistent storage and updates

**North Star Metric:** % of users who return to refine or create a second framework within 7 days (≥40% target)

---

## 📚 Related Documentation

- **RGRS Design Doc:** `RGRS_v0.1_DesignDoc.md`
- **RGRS Quick Start:** `RGRS_QUICK_START.md`
- **RGRS Citations Integration:** `RGRS_CITATIONS_INTEGRATION_COMPLETE.md`
- **Banyan Architecture:** `BANYAN_ARCHITECTURE.md`
- **Testing Guide:** `COMPREHENSIVE_TEST_PLAN.md`

---

## 🔗 Technical Architecture

### Frontend Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `src/app/page.tsx` | Landing page |
| `/new` | `src/app/new/page.tsx` | Wizard + Results |
| `/vision-framework-v2` | `src/app/vision-framework-v2/page.tsx` | Standalone V2 viewer |
| `/sign-in` | Clerk Auth | Sign-in flow |
| `/sign-up` | Clerk Auth | Sign-up flow |

### API Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/api/generate-brief` | Generate vision statement | JSON (brief + VC summary) |
| `/api/vision-framework-v2/generate-stream` | Full framework generation | SSE stream (7 stages) |
| `/api/vision-framework-v2/validate` | Structure validation | JSON (validation results) |
| `/api/vision-framework-v2/qa` | Quality checks | JSON (QA scores) |
| `/api/vision-framework-v2/score` | Section scoring | JSON (quality scores) |

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| **PromptWizard** | `src/components/PromptWizard.tsx` | 8-step wizard UI |
| **GenerationProgressModal** | `src/components/GenerationProgressModal.tsx` | Real-time progress display |
| **ResearchCitations** | `src/components/ResearchCitations.tsx` | Citation panel with confidence |
| **VisionFrameworkV2Page** | `src/components/VisionFrameworkV2Page.tsx` | V2 framework viewer |
| **ResultTabs** | `src/components/ResultTabs.tsx` | 3-tab output interface |

---

**Last Updated:** October 6, 2025  
**Maintained By:** Banyan Engineering Team

---

## Quick Reference Card

### User Journey in 30 Seconds

```
1. Homepage → Click "Start Building"
2. Answer 8 questions about your vision (10-15 min)
3. AI generates framework with research citations (30 sec)
4. View 3 outputs: Brief, Framework V1, Framework V2
5. Edit, export PDF, or iterate
```

### What Makes Banyan Different

❌ **Other Tools:** Generic AI suggestions with no source  
✅ **Banyan:** Every insight backed by peer-reviewed research

❌ **Other Tools:** Black-box generation (no idea what's happening)  
✅ **Banyan:** Real-time progress with transparent stages

❌ **Other Tools:** One-size-fits-all templates  
✅ **Banyan:** Context-aware frameworks grounded in your vision

---

**Need Help?** Check `RGRS_QUICK_START.md` or run `node test-rgrs.mjs` to test the pipeline.

