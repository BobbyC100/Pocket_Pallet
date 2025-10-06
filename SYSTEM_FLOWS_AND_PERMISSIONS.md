# Banyan UX v2 - System Flows & Permissions

**Version:** 2.0  
**Date:** October 2025  
**Status:** Implementation Complete

---

## 📋 Table of Contents

1. [URL Schema & Flows](#url-schema--flows)
2. [Core Value Gating Strategy](#core-value-gating-strategy)
3. [User Types & Permissions](#user-types--permissions)
4. [Anonymous User Flow](#anonymous-user-flow)
5. [Authenticated User Flow](#authenticated-user-flow)
6. [Conversion Touchpoints](#conversion-touchpoints)
7. [Page-by-Page Access Control](#page-by-page-access-control)
8. [Data Persistence Strategy](#data-persistence-strategy)
9. [Navigation & Browser History](#navigation--browser-history)

---

## URL Schema & Flows

### Current Routes

```
PUBLIC (No Auth Required)
├── /                           → Landing page
├── /new                        → Wizard (8 steps)
├── /results                    → Vision Statement results (partial for anonymous)
│
AUTHENTICATED (Signup Required)
├── /vision-framework-v2        → Full Vision Framework
├── /founders-lens              → Founder's Lens (future)
├── /strategic-brief            → Strategic Brief (future)
├── /dashboard                  → User dashboard
│
ADMIN/UTILITY
├── /sign-in                    → Clerk auth
├── /sign-up                    → Clerk auth
├── /settings                   → User settings
└── /sos                        → Legacy SOS page
```

### URL Flow Examples

**Anonymous:**  
`/ → /new → /results (partial) → [Sign Up] → /results (full)`

**Authenticated:**  
`/ → /new → /vision-framework-v2 → [Strategic Tools] → Generate`

---

## Core Value Gating Strategy

- **Value Lock:** Full Vision Statement (anonymous users see 1–2 sections; rest blurred).
- **Protection Gate:** Mid-wizard **Soft Signup** to protect work and enable cloud sync.
- **Monetization Trigger:** Access to **Strategic Tools** (Framework, Lens, Brief) + advanced scoring.
- **Free Tier Definition:**
  - Unlimited wizard runs and partial Vision Statement preview (anonymous).
  - Full Vision Statement unlocked upon signup (free).
  - Up to **3 Vision Framework generations per month**.
  - **Basic** quality scoring; research citations visible.
  - Cloud storage & multi-device access.
  - No collaboration, Lens, or Strategic Brief (Pro only).

---

## User Types & Permissions

### 1. Anonymous User

✅ **Can Access:**
- Wizard (8 steps)
- Partial Vision Statement (1-2 sections)
- PDF partial export
- Local auto-save

❌ **Cannot Access:**
- Full Vision Statement
- Framework generation
- Cloud storage
- Quality scoring
- Research citations (full)
- Collaboration

**Storage:** `localStorage` (auto-save) + `sessionStorage` (latest brief)  
**Conversion Gates:** Soft signup (step 4-5 / 5 min) → Pre-generation → Results unlock → Strategic tools

---

### 2. Authenticated User (Free Tier)

✅ **Can Access:**
- Full Vision Statement
- Vision Framework (3/month)
- Research citations
- Cloud sync (Supabase)
- Multi-device access
- Basic quality scoring

❌ **Cannot Access (Pro Only):**
- Advanced scoring
- Collaboration
- Lens / Brief tools
- Priority support
- Unlimited generations

**Storage:** Supabase (DB) + local/session cache  
**Upgrade Triggers:** >3 frameworks/month OR Pro-only feature access

---

### 3. Pro User (Paid Tier)

✅ **Full Access:**
- Unlimited generations
- Advanced quality & alignment scoring
- Collaborative editing
- All strategic tools (Framework, Lens, Brief)
- Priority support
- Early access to new features
- Custom research corpus (future)

**Pricing:** $29/month or $290/year (14-day trial, no card required)

---

## Anonymous User Flow

### Step Sequence

1. **Landing** → Wizard (`/new`)
2. **Soft Signup Modal** (step 4-5 or 5 min) → Non-blocking, dismissible
3. **Pre-Generation Signup** (on Generate) → Blocking but skippable
4. **Generate** → Partial Results (`/results`)
5. **Blur Overlay + Unlock CTA** → Signup Modal
6. **Unlock** → Full Vision Statement (after auth)

**Key Storage:** `sessionStorage.lastGeneratedBrief`

```mermaid
graph TD
    A[Landing /] --> B[Wizard /new]
    B --> C{Step 4-5 or 5 min?}
    C -->|Yes| D[Soft Signup Modal]
    D -->|Dismiss| E[Continue]
    D -->|Sign Up| F[Auth]
    C -->|No| E
    E --> G[Complete Wizard]
    G --> H[Pre-Generation Modal]
    H -->|Skip| I[Generate]
    H -->|Sign Up| F
    I --> J[/results - Partial]
    J --> K[Unlock CTA]
    K --> L[Signup Modal]
    L --> F
    F --> M[/results - Full]
```

### Key Interactions

**1. Wizard Entry (/ → /new)**
- No authentication required
- Auto-save banner shows "Your answers are saved locally"
- Load Example button available

**2. During Wizard**
- Progress bar (Step X of 7)
- Soft signup modal appears at step 4-5 OR 5 minutes
  - Non-blocking
  - Dismissible
  - Tracks: `soft_signup_shown`, `soft_signup_dismissed`

**3. Pre-Generation**
- Click "Generate Vision Statement"
- Pre-generation signup modal appears
  - Shows benefits (permanent save, multi-device, etc.)
  - CTA: "Sign up and generate"
  - Alt: "Continue without signing up"
  - Tracks: `pre_generation_signup_shown`, `pre_generation_signup_skipped`

**4. Generation**
- Only Vision Statement generated (not full framework)
- Progress modal shows:
  - ✓ Generate Vision Statement (complete)
  - 🔒 Retrieve Research Insights (locked)
  - 🔒 Generate Strategic Framework (locked)
  - 🔒 Validate Framework Structure (locked)
  - 🔒 Create Executive Summary (locked)
  - 🔒 Run Quality Checks (locked)
  - 🔒 Score Section Quality (locked)

**5. Results Page (/results)**
- Shows first 1-2 sections only
- Blur overlay on remaining content
- Unlock CTA with signup modal
  - Title: "See your full Vision Statement"
  - CTA: "Sign up to unlock"
  - Trust signals: Free forever, No credit card
  - Tracks: `vision_statement_partial_shown`, `unlock_vision_statement_clicked`

**6. Strategic Tools Section**
- "Unlock Strategic Tools" button
- Click → Shows signup modal
- Cannot proceed without authentication

---

## Authenticated User Flow

### Step Sequence

1. **Sign in** → `/new` or `/dashboard`
2. **Run full generation pipeline:**
   - Vision Statement
   - Research Retrieval (RGRS)
   - Framework Generation (7 sections)
   - Validation
   - Executive One-Pager
   - Quality Checks
   - Section Scoring
3. **Redirect** → `/vision-framework-v2`
4. **View:**
   - Research citations panel
   - Section quality scores
   - Export options (PDF, etc.)
5. **Strategic Tools Modal** → Select Lens/Brief → Usage limit check → Upgrade if needed
   - Acts as **Modular Generation Hub** to orchestrate compute-heavy tasks and manage usage limits

```mermaid
graph TD
    A[Sign In] --> B[/new or /dashboard]
    B --> C[Complete Wizard]
    C --> D[Full Generation Pipeline]
    D --> E[Vision]
    E --> F[Research RGRS]
    F --> G[Framework 7 sections]
    G --> H[Validation]
    H --> I[One-Pager]
    I --> J[QA Checks]
    J --> K[Scoring]
    K --> L[/vision-framework-v2]
    L --> M{Strategic Tools?}
    M -->|Yes| N[Modal: Framework/Lens/Brief]
    N --> O{Usage Limit?}
    O -->|Under 3| P[Generate]
    O -->|Over 3| Q[Pro Upgrade Modal]
```

### Key Interactions

**1. Post-Signin Landing**
- Can go to `/new` (fresh wizard) or `/dashboard` (saved docs)
- Auto-save banner shows "Signed in as [email]"
- Cloud icon indicates syncing status

**2. Full Generation Pipeline**
- All 7 steps execute:
  1. Vision Statement
  2. Research Retrieval (RGRS)
  3. Framework Generation (7 sections)
  4. Structure Validation
  5. Executive One-Pager
  6. Quality Checks
  7. Section Scoring

**3. Framework View (/vision-framework-v2)**
- Full 7-section framework visible
- Research Citations panel at top
  - Shows 3-8 sources with confidence scores
  - Color-coded: Green (≥80%), Blue (≥60%), Gray (<60%)
- Quality scores per section
  - Clarity (0-100)
  - Specificity (0-100)
  - Actionability (0-100)
- Actions available:
  - Edit inline
  - Export PDF
  - Save to cloud
  - Share (future)

**4. Strategic Tools Modal**
- Appears when clicking "Unlock Strategic Tools"
- 3 options:
  - Vision Framework (recommended)
  - Founder's Lens
  - Strategic Brief
- Each shows:
  - Icon
  - Description
  - 4 key features
  - "Generate" CTA

**5. Usage Limits (Free Tier)**
- 3 framework generations/month
- After 3rd generation → Pro Upgrade Modal
- Pro Modal shows:
  - 6 premium features
  - Pricing ($29/mo or $290/yr)
  - 14-day free trial
  - Trust signals

---

## Conversion Touchpoints

| Touchpoint | Trigger | Type | Goal | Target CR |
|------------|---------|------|------|-----------|
| **Soft Signup** | Step 4-5 or 5 min | Non-blocking modal | Protect progress | ≥25% |
| **Pre-Generation** | Click "Generate" | Blocking (skippable) | Convert before generation | ≥40% |
| **Results Unlock** | View `/results` anonymous | Inline CTA + blur | Convert after value shown | ≥60% |
| **Strategic Tools Unlock** | Click "Unlock Tools" | Modal | Upsell advanced features | ≥30% |
| **Pro Upgrade** | Usage limit OR Pro feature | Full-screen modal | Paid conversion | ≥15% |

### Modal Details

**1. Soft Signup (Step 4-5 / 5 min)**
- Title: "Save your progress to the cloud"
- CTA: "Sign up to protect my work" / "Continue without signing up"
- Analytics: `soft_signup_shown`, `soft_signup_accepted`, `soft_signup_dismissed`

**2. Pre-Generation**
- Title: "Sign up to permanently save your Vision Statement"
- Benefits: Permanent save, multi-device access, unlock tools
- CTA: "Sign up and generate" / "Continue without signing up"
- Analytics: `pre_generation_signup_shown`, `pre_generation_signup_accepted`, `pre_generation_signup_skipped`

**3. Results Unlock**
- Display: 1-2 sections visible, rest blurred with gradient
- Unlock card with lock icon
- CTA: "Sign up to unlock"
- Analytics: `vision_statement_partial_shown`, `unlock_vision_statement_clicked`

**4. Strategic Tools**
- Anonymous → Signup modal
- Authenticated → Tools modal (Framework/Lens/Brief)
- Usage limit check → Pro upgrade if needed
- Analytics: `strategic_tools_modal_shown`, `strategic_tool_selected`

**5. Pro Upgrade**
- 6 premium features + pricing ($29/mo or $290/yr)
- 14-day trial, no card required
- CTA: "Start 14-day free trial" / "Maybe later"
- Analytics: `pro_upgrade_modal_shown`, `pro_upgrade_started`, `pro_upgrade_dismissed`

---

## Page-by-Page Access Control

| Page | Access | Auth Required | Redirect | Notes |
|------|--------|---------------|----------|-------|
| **/** (Landing) | Public | No | – | CTA → `/new` |
| **/new** (Wizard) | Public | No | – | Soft/Pre-gen modals. Post-submit: Anonymous→`/results`, Auth→`/vision-framework-v2` |
| **/results** | Partial public | No → partial | – | Anonymous: 1-2 sections + unlock CTA. Auth: full content |
| **/vision-framework-v2** | Private | Yes | `/new` or `/sign-in` | Full framework with research citations + scores |
| **/dashboard** | Private | Yes | `/sign-in` | Saved documents, activity, quick actions |
| **/sign-in**, **/sign-up** | Public | No | Origin or `/dashboard` | Clerk auth UI |

### Data Sources

- `/new` → Auto-saves to `localStorage.drafts_anonymous[]`
- `/results` → Loads from `sessionStorage.lastGeneratedBrief`
- `/vision-framework-v2` → Loads from `sessionStorage.visionFrameworkV2Draft` + Supabase fallback

---

## Data Persistence Strategy

### Anonymous Users

**localStorage:**
```js
{
  "banyan_analytics_events": [...],      // Analytics tracking
  "drafts_anonymous": [                   // Auto-saved drafts
    {
      id: "draft-123",
      type: "vision_statement",
      contentJson: {...},
      createdAt: "2025-10-06T12:00:00Z",
      updatedAt: "2025-10-06T12:05:00Z"
    }
  ]
}
```

**sessionStorage:**
```js
{
  "lastGeneratedBrief": {                 // Latest Vision Statement
    founderBriefMd: "...",
    vcSummaryMd: "...",
    runwayMonths: 12,
    responses: {...},
    isAnonymous: true
  },
  "banyan_session_start": "1696598400000", // Analytics session
  "visionFrameworkV2Draft": {...}          // Framework cache (auth only)
}
```

**Retention:** 30 days or until browser cache cleared

---

### Authenticated Users

**Supabase (Primary Storage):**
```sql
documents
  - id (uuid)
  - user_id (text, from Clerk)
  - type (vision_statement | framework | lens | brief)
  - title (text)
  - content_json (jsonb)
  - metadata (jsonb)
    - quality_scores
    - research_citations
    - generation_timestamp
  - created_at (timestamp)
  - updated_at (timestamp)
```

**Hybrid Strategy:**
- **Primary:** Supabase (source of truth)
- **Cache:** localStorage + sessionStorage (performance)
- **Sync:** On save, on load, every 5 minutes

**Migration on Signup:**
- Anonymous drafts → Uploaded to Supabase
- Associated with `user_id`
- Local drafts cleared (optional)

---

## Navigation & Browser History

### Back Button Behavior

**Current Implementation:**

```
/                           → Browser back works
  ↓
/new (step 1)              → Browser back → /
  ↓
/new (step 2)              → Browser back → step 1 (future: URL params)
  ↓
/results                   → Browser back → /new
  ↓
/vision-framework-v2       → Browser back → /results
```

**Future Enhancement (URL Parameters):**

```
/new?step=1                → Each step in history
/new?step=2                → Can navigate with back/forward
/new?step=3
...
/results                   → Proper back navigation
```

### Page Refresh Behavior

**Current State:**

| Page | Anonymous | Authenticated |
|------|-----------|---------------|
| `/new` | ✅ Wizard reloads (responses lost unless auto-saved) | ✅ Same |
| `/results` | ✅ Loads from sessionStorage | ✅ Same (with DB fallback) |
| `/vision-framework-v2` | ❌ Redirects to `/new` | ✅ Loads from sessionStorage or DB |

**Improvements Needed:**
- [ ] Persist wizard step in URL (`/new?step=3`)
- [ ] Add document ID to URLs (`/results/:id`)
- [ ] Implement DB fallback for all pages

---

## Permission Matrix

| Feature | Anonymous | Free | Pro |
|---------|-----------|------|-----|
| **Wizard Access** | ✅ | ✅ | ✅ |
| **Vision Statement (Partial)** | ✅ | ✅ | ✅ |
| **Vision Statement (Full)** | ❌ | ✅ | ✅ |
| **Vision Framework** | ❌ | ✅ (3/mo) | ✅ (unlimited) |
| **Founder's Lens** | ❌ | ❌ | ✅ |
| **Strategic Brief** | ❌ | ❌ | ✅ |
| **Research Citations** | Preview only | ✅ | ✅ |
| **Quality Scoring** | ❌ | Basic | Advanced |
| **Cloud Storage** | ❌ | ✅ | ✅ |
| **Collaborative Editing** | ❌ | ❌ | ✅ |
| **Priority Support** | ❌ | ❌ | ✅ |
| **Custom Research Corpus** | ❌ | ❌ | ✅ |

---

## Security & Rate Limiting

### API Rate Limits

**Anonymous (by IP):**
- Vision Statement generation: 3/day
- PDF export: 10/day

**Authenticated Free:**
- Vision Statement: Unlimited
- Framework generation: 3/month
- PDF export: 50/month

**Authenticated Pro:**
- All endpoints: Unlimited (fair use)

### Data Access Rules

**Anonymous:**
- Can only access own localStorage data
- No cross-session data access
- No API data reading (only writes)

**Authenticated:**
- Can only access own documents (WHERE user_id = auth.uid())
- Row-level security enforced (Supabase RLS)
- Collaborative docs require explicit permission

---

## Analytics & Tracking

### Key Events Tracked

**Wizard:**
- `wizard_started`
- `wizard_step_completed` (each step)
- `wizard_completed`
- `load_example_clicked`

**Signup Touchpoints:**
- `soft_signup_shown`
- `soft_signup_accepted` / `soft_signup_dismissed`
- `pre_generation_signup_shown`
- `pre_generation_signup_accepted` / `pre_generation_signup_skipped`
- `vision_statement_partial_shown`
- `unlock_vision_statement_clicked`
- `strategic_tools_modal_shown`
- `unlock_strategic_tools_clicked`

**Generation:**
- `vision_statement_generated` (+ isAnonymous flag)
- `framework_generated`
- `strategic_tool_selected`

**Conversions:**
- `signup_completed`
- `pro_upgrade_modal_shown`
- `pro_upgrade_started`
- `pro_upgrade_dismissed`

**Actions:**
- `pdf_exported`
- `cloud_save_clicked`

### Conversion Funnel Metrics

```javascript
// Calculate conversion rates
const metrics = calculateConversionMetrics();

// Example output:
{
  counts: {
    wizard_started: 100,
    wizard_completed: 85,
    soft_signup_shown: 60,
    soft_signup_accepted: 18,
    pre_gen_signup_shown: 67,
    pre_gen_signup_accepted: 30,
    vision_statement_generated: 85,
    unlock_clicked: 45,
    signups_completed: 55,
    pro_upgrade_started: 8
  },
  rates: {
    wizard_completion_rate: "85.0%",
    soft_signup_conversion: "30.0%",
    pre_gen_signup_conversion: "44.8%",
    overall_signup_rate: "64.7%"
  }
}
```

---

## Future Enhancements

### Phase 2 (Q4 2025)
- [ ] Add document IDs to URLs (`/results/:id`, `/framework/:id`)
- [ ] Implement wizard step persistence in URL (`/new?step=3`)
- [ ] Add collaborative editing (Pro feature)
- [ ] Build Founder's Lens & Strategic Brief generators
- [ ] Implement usage tracking dashboard for Free users

### Phase 3 (Q1 2026)
- [ ] Multi-tenant support (team accounts)
- [ ] Custom research corpus upload (Pro)
- [ ] Version history and rollback
- [ ] API access for integrations
- [ ] Mobile app (React Native)

---

## Testing Checklist

### Anonymous User Flow
- [ ] Can complete wizard without signup
- [ ] Soft signup modal appears at step 4-5 or 5 min
- [ ] Pre-generation modal appears and is dismissible
- [ ] Vision Statement generates successfully
- [ ] Results page shows partial content
- [ ] Unlock CTA appears and triggers signup
- [ ] Browser back button works correctly

### Authenticated User Flow
- [ ] Signup flow completes successfully
- [ ] Anonymous data migrates to user account
- [ ] Full framework generation works
- [ ] Research citations display correctly
- [ ] Quality scores appear per section
- [ ] Strategic Tools modal functions
- [ ] Cloud save works
- [ ] Browser back button works correctly

### Pro Upgrade Flow
- [ ] Free tier usage limit enforced (3 frameworks/mo)
- [ ] Pro upgrade modal appears at limit
- [ ] Trial signup process works
- [ ] Pro features unlock after payment
- [ ] Unlimited generation works

---

**Last Updated:** October 6, 2025  
**Maintained By:** Banyan Engineering Team  
**Questions:** Check `USER_FLOW_ONE_PAGER.md` or `BANYAN_ARCHITECTURE.md`

