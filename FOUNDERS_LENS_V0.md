# Founder's Lens V0 - Testing & Feedback Guide

## 🎯 What You're Testing

**Founder's Lens** helps Banyan understand how you think and adapt its reasoning over time. V0 implements the **Base Lens** - three non-negotiable principles that define quality before personalization kicks in.

### Base Lens Criteria

1. **Clarity** - Plain language, specific examples, unambiguous intent
2. **Alignment** - Consistency with your stated vision and strategy
3. **Actionability** - Concrete next steps, clear calls-to-action

Every document gets scored 1-10 on each dimension, producing an overall score and badge:
- **Gold**: 8+ (Excellent - publish ready)
- **Silver**: 7-8 (Good - minor improvements)
- **Bronze**: <7 (Needs work)

---

## 🧪 Testing Checklist

### 1. Vision Framework Scoring

**Steps:**
1. Go to `/new` and generate a Vision Framework (use test data button)
2. Once generated, you'll land on the Vision Framework page
3. Click **"Score with Lens"** button (top right)
4. Wait ~3-5 seconds for scoring
5. Expandable badge appears showing overall score + badge color
6. Click the badge to expand and see individual subscores

**What to Check:**
- [ ] Button appears and is clickable
- [ ] "Scoring..." state shows during loading
- [ ] Badge appears after scoring completes
- [ ] Badge shows overall score (e.g., "Lens Score 7.8 • SILVER")
- [ ] Clicking badge expands to show clarity/alignment/actionability
- [ ] Feedback text appears for any subscore below 8
- [ ] Badge persists on page reload

**Expected Scores (Test Data):**
- Clarity: 7-9 (test data is fairly clear)
- Alignment: 7 (no vision embedding yet, so neutral)
- Actionability: 7-9 (frameworks have concrete bets/metrics)

### 2. VC Summary Scoring

**Steps:**
1. From SOS page (`/sos`), click "VC Summary" in sidebar
2. Click **"Score with Lens"** button (top right)
3. Badge appears below title
4. Expand to see subscores

**What to Check:**
- [ ] Button appears on VC Summary page
- [ ] Scoring works independently from Vision Framework
- [ ] Badge displays correctly
- [ ] Scores are different from Vision Framework (different content)
- [ ] Scores persist on page reload

**Expected Scores:**
- Clarity: 7-9 (VC summaries are concise)
- Alignment: 7 (neutral without vision embedding)
- Actionability: 6-8 (depends on specificity of ask/KPIs)

### 3. Dashboard Widget

**Steps:**
1. Score both Vision Framework and VC Summary
2. Go to SOS page (`/sos`)
3. Look at the top of the page (above document list)

**What to Check:**
- [ ] "Founder's Lens" widget appears at top
- [ ] Shows average score across scored documents
- [ ] Displays individual subscores for each document
- [ ] Explanation text at bottom explains Base Lens
- [ ] Widget only appears after at least one document is scored

**Expected Behavior:**
- If only Vision Framework scored → shows Vision scores
- If both scored → shows average + breakdown for each
- Badge color matches overall average

### 4. Session Storage Persistence

**Steps:**
1. Score a document
2. Refresh the page
3. Check if scores are still visible
4. Close browser and reopen
5. Check again

**What to Check:**
- [ ] Scores persist across page refreshes
- [ ] Scores persist across browser close/reopen
- [ ] Clearing browser data removes scores (expected)

---

## 🐛 Known Limitations (V0)

These are **intentional** - not bugs:

1. **Alignment Always Shows ~7**: No vision embeddings are created yet, so alignment defaults to neutral. V1 will capture and compare to your actual vision.

2. **Manual Scoring Only**: You must click "Score with Lens" - it doesn't auto-score during generation. V1 will auto-score.

3. **No Pattern Detection**: V0 doesn't learn from your edits or detect preferences. V1 adds this.

4. **No Reflections**: The "first reflection" feature is V1 scope.

5. **Event Logging Requires DB Migration**: Scoring works without the database, but events won't be logged until you run the migration (see below).

---

## 🔧 Setup: Database Migration

**To enable event logging** (optional for V0 testing):

```bash
# Option 1: Direct SQL
psql $DATABASE_URL < drizzle/0001_add_founders_lens_tables.sql

# Option 2: Verify connection first
psql $DATABASE_URL -c "SELECT 1;"

# Check if tables exist
psql $DATABASE_URL -c "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'lens%';"
```

**If migration fails:**
- Scoring still works (events just won't be logged)
- You can run migration later without impact
- V1 requires it for pattern detection

---

## 📝 Feedback to Gather

### Usability Questions

1. **Discovery**: Did you notice the "Score with Lens" button? Was it obvious what it does?

2. **Timing**: Does ~3-5 seconds feel reasonable for scoring? Too slow?

3. **Badge Clarity**: Is the badge/score immediately understandable? Or confusing?

4. **Feedback Quality**: When you expand the badge, is the feedback helpful? Too vague?

5. **Dashboard Widget**: Does the widget add value? Or just clutter?

### Scoring Accuracy Questions

6. **Clarity Scores**: Do the clarity scores match your intuition about readability?

7. **Actionability Scores**: For frameworks/summaries with clear next steps, are actionability scores higher?

8. **Overall Usefulness**: Would you use this to iterate on documents? Or ignore it?

### V1 Feature Priority

9. **Most Valuable Next**: Which would help most?
   - Auto-scoring during generation (no button needed)
   - Vision embedding for better alignment scoring
   - First reflection ("Your Lens Snapshot")
   - Pattern detection from edits

10. **Nice to Have**: What's missing that would make this more useful?

---

## 🚀 V1 Planning (Next Phase)

Based on your feedback, V1 will add:

### High Priority
- **Auto-scoring on generation**: No manual button needed
- **Vision embedding creation**: Better alignment scores
- **Pattern capture**: Track edits, word choices, structure preferences

### Medium Priority
- **First reflection**: "Your top 3 docs average 8.4/10. You emphasize concrete next steps."
- **Trigger system**: Show reflection after 5-10 docs OR clear pattern detected
- **Lens validation**: Review and confirm detected patterns

### Low Priority (V2)
- **Adaptive prompting**: Generation uses your lens preferences
- **Team lens comparison**: See co-founder alignment/tensions
- **Lens scenarios**: "Here's your strategy through an operational lens"

---

## 📊 Success Metrics (What We'll Track in V1)

Once event logging is active, we'll measure:

1. **Adoption**: % of users who click "Score with Lens"
2. **Engagement**: % who re-score after edits
3. **Behavior Change**: Do scores improve over time?
4. **Reflection Interest**: % who view first reflection

---

## 🔗 Quick Links

- **Test the Lens**: Generate framework → `/sos` → Score both docs → See widget
- **Scoring API**: `/api/lens/score` (POST with `{content, documentId, documentType}`)
- **Database Schema**: `drizzle/0001_add_founders_lens_tables.sql`
- **Main Spec**: See conversation history for full V0-V2 roadmap

---

## 💬 Questions or Issues?

**Common Issues:**

**Q: Badge not appearing after scoring**
A: Check browser console for errors. Likely API timeout or network issue.

**Q: Scores seem random**
A: V0 uses GPT-4 for clarity/actionability. Some variance is expected. Alignment is fixed at ~7 until vision embeddings are added.

**Q: Button greyed out / not working**
A: Make sure framework is loaded. Check console for session storage errors.

**Q: Widget not showing on SOS**
A: Widget only appears after you've scored at least one document. Score Vision Framework or VC Summary first.

---

**Ready to test!** Generate a framework, score it, and let me know what you think.

