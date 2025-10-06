# Comprehensive Test Plan - All Improvements
**Date:** October 5, 2025  
**Features to Test:** Request IDs, Rate Limiting, Health Check, Cost Tracking, Auto-Save, Keyboard Shortcuts

---

## 🎯 Test Environment Setup

### Prerequisites
```bash
# 1. Make sure dev server is NOT running
# Stop any existing processes

# 2. Check your .env.local has these settings
DISABLE_RATE_LIMIT=false  # We want to test rate limiting!
OPENAI_API_KEY=sk-...     # Your actual key
DATABASE_URL=...          # Your database

# 3. Start fresh dev server
npm run dev

# 4. Open browser console (F12 or Cmd+Option+I)
# 5. Open terminal to watch server logs
```

---

## 📋 Test Checklist

### ✅ Test 1: Health Check Endpoint (2 minutes)

**Purpose:** Verify monitoring infrastructure works

**Steps:**
```bash
# In a new terminal window:
curl http://localhost:3000/api/health | jq
```

**Expected Output:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-05T...",
  "version": "1.0.0",
  "uptime": 123,
  "environment": "development",
  "checks": {
    "database": "ok",
    "openai": "ok"
  }
}
```

**✅ Pass Criteria:**
- Returns HTTP 200
- `status` is "ok"
- `checks.database` is "ok"
- `checks.openai` is "ok"

**❌ If Failed:**
- Database "error" → Check DATABASE_URL in .env.local
- OpenAI "error" → Check OPENAI_API_KEY exists
- 503 error → Something is seriously wrong

**Manual Verification:**
- [ ] Health check returns 200 OK
- [ ] All checks pass
- [ ] Uptime is a positive number

---

### ✅ Test 2: Request ID Tracking (3 minutes)

**Purpose:** Verify every request gets a unique ID for debugging

**Steps:**
1. Go to http://localhost:3000/new
2. Open browser DevTools (F12)
3. Go to Network tab
4. Click "Load Test Data" button
5. Look at any API request

**Expected Output:**
- Every request has `X-Request-ID` header
- Server logs show: `[abc-123-def] GET /api/...`
- Same ID appears in multiple log lines

**Manual Verification:**
1. Open any API request in Network tab
2. Click "Headers"
3. Scroll down to "Response Headers"
4. Look for: `X-Request-ID: <some-uuid>`

**✅ Pass Criteria:**
- Every request has X-Request-ID header
- ID is a valid UUID format
- Same ID appears in server logs

**Screenshot Location:**
Check: Network tab → Any request → Headers → X-Request-ID

**Manual Checklist:**
- [ ] X-Request-ID header exists
- [ ] ID is UUID format (abc-123-def-456...)
- [ ] Server logs show same ID

---

### ✅ Test 3: Auto-Save with Debouncing (5 minutes)

**Purpose:** Verify drafts save automatically with visual feedback

**Steps:**
1. Go to http://localhost:3000/new
2. Click "Load Test Data" (fills all 6 wizard steps)
3. Click "Generate Brief" button
4. Wait ~20 seconds for generation
5. **Watch the status indicator** (where it used to say "Draft auto-saved locally")

**Expected Behavior Timeline:**
```
0s:   Generation completes, result rendered
0-3s: No status indicator visible
3s:   "Saving..." appears with spinner
5s:   "Saved just now" appears with checkmark ✓
```

**In Browser Console:**
```
💾 Auto-saved draft to localStorage...
✅ Draft saved: draft_abc-123-def
```

**In Server Logs:**
```
[abc-123] POST /api/generate-brief
[abc-123] 🚀 Brief generation started
[abc-123] ✓ Rate limit check passed (9 remaining)
[abc-123] ✅ Briefs generated
[abc-123] 💰 Cost: $0.1234 (7153 tokens)
[abc-123] Completed in 18450ms
```

**✅ Pass Criteria:**
- Visual indicator appears after 3 seconds
- Shows "Saving..." first
- Changes to "Saved just now" with checkmark
- Console logs confirm save

**Manual Checklist:**
- [ ] "Saving..." appears with spinner
- [ ] Changes to "Saved just now" with green checkmark
- [ ] Console shows "Auto-saved draft"
- [ ] No error messages

---

### ✅ Test 4: Keyboard Shortcut (Cmd+S) (2 minutes)

**Purpose:** Verify manual save works instantly

**Steps:**
1. From previous test (with brief already generated)
2. Press **Cmd+S** (Mac) or **Ctrl+S** (Windows/Linux)
3. Watch status indicator
4. Check console

**Expected Output:**
- Status immediately shows "Saving..."
- No 3-second wait (instant save)
- Console logs: `💾 Manual save triggered via keyboard shortcut`
- Status changes to "Saved just now"

**✅ Pass Criteria:**
- Save happens immediately (no 3s debounce)
- Console confirms manual save
- Visual indicator updates

**Manual Checklist:**
- [ ] Cmd+S triggers save
- [ ] No 3-second delay
- [ ] Console shows "Manual save triggered"
- [ ] Status indicator updates

---

### ✅ Test 5: Rate Limiting - Success Case (3 minutes)

**Purpose:** Verify rate limiting allows normal usage

**Steps:**
1. Make sure `DISABLE_RATE_LIMIT=false` in .env.local
2. Go to http://localhost:3000/new
3. Click "Load Test Data"
4. Click "Generate Brief" 
5. Wait for completion

**Expected Server Logs:**
```
[abc-123] POST /api/generate-brief
[abc-123] ✓ Rate limit check passed (9 remaining)
[abc-123] 🚀 Brief generation started
```

**✅ Pass Criteria:**
- Request succeeds (200 OK)
- Logs show "Rate limit check passed"
- Shows remaining count (e.g., "9 remaining")

**Manual Checklist:**
- [ ] Request completes successfully
- [ ] Server logs show rate limit check
- [ ] Remaining count is 9 (first request)

---

### ✅ Test 6: Rate Limiting - Exceeded (5 minutes)

**Purpose:** Verify rate limiting blocks excessive requests

**⚠️ Warning:** This will use your OpenAI credits! Skip if you want to conserve API calls.

**Steps:**
```bash
# In a new terminal, run this script:
for i in {1..11}; do
  echo "Request $i..."
  curl -s -X POST http://localhost:3000/api/generate-brief \
    -H "Content-Type: application/json" \
    -d '{
      "responses": {
        "vision_audience_timing": "Test",
        "hard_decisions": "Test",
        "success_definition": "Test",
        "core_principles": "Test",
        "required_capabilities": "Test",
        "current_state": "Test",
        "vision_purpose": "Test",
        "vision_endstate": "Test"
      },
      "anonymousId": "test-rate-limit-123"
    }' | jq -r '.error // "SUCCESS"'
  sleep 2
done
```

**Expected Output:**
```
Request 1... SUCCESS
Request 2... SUCCESS
...
Request 10... SUCCESS
Request 11... Rate limit exceeded
```

**Server Logs for Request 11:**
```
[def-456] ⚠️  Rate limit exceeded for test-rate-limit-123
```

**Response for Request 11:**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 3600,
  "message": "Too many requests. Please try again in 3600 seconds."
}
```

**✅ Pass Criteria:**
- First 10 requests succeed
- 11th request returns 429 status
- Error message includes retryAfter
- Server logs warning

**Manual Checklist:**
- [ ] First 10 requests succeed
- [ ] 11th request returns 429
- [ ] Error has retryAfter field
- [ ] Logs show rate limit warning

**To Reset Rate Limit:**
```bash
# Restart dev server (rate limits are in-memory)
# Press Ctrl+C in dev server terminal
npm run dev
```

---

### ✅ Test 7: Cost Tracking - Brief Generation (3 minutes)

**Purpose:** Verify AI costs are logged accurately

**Steps:**
1. Fresh generation (or use previous test)
2. Check server logs carefully

**Expected Server Logs:**
```
[abc-123] POST /api/generate-brief
[abc-123] 🚀 Brief generation started
[abc-123] ✓ Rate limit check passed (8 remaining)
[abc-123] ✅ Briefs generated
[abc-123] 💰 Cost: $0.1234 (7153 tokens)
[abc-123] Completed in 18450ms
```

**Also Check for JSON Log:**
```json
{
  "type": "ai_cost",
  "operation": "generate-brief",
  "cost": {
    "total": "0.1234",
    "input": "0.0456",
    "output": "0.0778"
  },
  "tokens": {
    "input": 4560,
    "output": 2593,
    "total": 7153
  },
  "model": "gpt-4-turbo-preview",
  "requestId": "abc-123",
  "duration": 18450,
  "timestamp": "2025-10-05T..."
}
```

**✅ Pass Criteria:**
- Cost log appears with 💰 emoji
- Shows total cost in dollars
- Shows total tokens
- JSON log has all fields
- Cost matches expected range ($0.08 - $0.20)

**Manual Checklist:**
- [ ] 💰 Cost log appears
- [ ] Cost is between $0.08 - $0.20
- [ ] Token count shown
- [ ] JSON log is well-formed

---

### ✅ Test 8: Cost Tracking - Vision Framework (5 minutes)

**Purpose:** Verify framework generation costs are tracked

**Steps:**
1. From brief generation, click "Create Vision Framework"
2. Wait ~35-40 seconds
3. Check server logs

**Expected Server Logs:**
```
[def-456] POST /api/vision-framework-v2/generate
[def-456] ✓ Rate limit check passed (8 remaining)
[def-456] 🚀 Starting Vision Framework V2 generation with GPT-4
[def-456] Step 1: GPT-4 mapping sections...
[def-456] ✅ Framework validated
[def-456] Step 5: Scoring section quality...
[def-456] 💰 Total Cost: $0.2456 (14133 tokens)
[def-456] ⏱️  Total Duration: 35.4s
```

**JSON Log:**
```json
{
  "type": "ai_cost",
  "operation": "generate-vision-framework-v2",
  "cost": {
    "total": "0.2456",
    "input": "0.0892",
    "output": "0.1564"
  },
  "tokens": {
    "input": 8920,
    "output": 5213,
    "total": 14133
  },
  "model": "gpt-4-turbo-preview",
  "requestId": "def-456",
  "companyId": "...",
  "sectionsGenerated": 6,
  "duration": 35402
}
```

**✅ Pass Criteria:**
- Cost log appears
- Cost is between $0.15 - $0.35
- Duration logged
- All sections generated

**Manual Checklist:**
- [ ] Cost between $0.15 - $0.35
- [ ] Duration ~30-40 seconds
- [ ] All 6 sections generated
- [ ] JSON log complete

---

### ✅ Test 9: Cost Tracking - Refinement (Smart Model Selection) (5 minutes)

**Purpose:** Verify refinements use cheaper models when appropriate

**Steps:**
1. After framework generation, find a section
2. Click "Quick Actions" → "🎯 More Specific"
3. Wait ~5-10 seconds
4. Check server logs

**Expected for Simple Refinement (More Specific):**
```
[ghi-789] 🔄 Starting refinement for section: vision
[ghi-789] ✓ Rate limit check passed (28 remaining)
[ghi-789] ⚡ Using gpt-3.5-turbo for fast refinement
[ghi-789] ✅ Refinement complete
[ghi-789] 💰 Cost: $0.0123 (456 tokens)
[ghi-789] ⏱️  Duration: 5.2s
```

**Expected for Complex Refinement (Different Angle):**
```
[jkl-012] ⚡ Using gpt-4-turbo-preview for complex refinement
[jkl-012] 💰 Cost: $0.0789 (2345 tokens)
```

**Test Both Types:**
1. **Simple**: "More Specific" or "More Concise"
   - Should use GPT-3.5 (~$0.01-0.02)
   - Should be faster (~5s)

2. **Complex**: "Different Angle" or "Regenerate"
   - Should use GPT-4 (~$0.05-0.15)
   - Should be slower (~8-12s)

**✅ Pass Criteria:**
- Simple refinements use GPT-3.5
- Complex refinements use GPT-4
- Costs match model used
- Both complete successfully

**Manual Checklist:**
- [ ] Simple refinement uses gpt-3.5-turbo
- [ ] Simple refinement costs < $0.03
- [ ] Complex refinement uses gpt-4
- [ ] Complex refinement costs > $0.05

---

### ✅ Test 10: Request ID Correlation (5 minutes)

**Purpose:** Verify request IDs help trace full request lifecycle

**Steps:**
1. Generate a brief or framework
2. Copy the Request ID from browser Network tab
3. Search server logs for that ID

**Example Request ID:** `abc-123-def-456`

**Search Command:**
```bash
# In terminal with server logs:
# Mac/Linux:
grep "abc-123-def-456" <dev-server-output>

# Or just watch logs as request happens
```

**Expected: All Lifecycle Events:**
```
[abc-123-def-456] POST /api/generate-brief
[abc-123-def-456] ✓ Rate limit check passed (9 remaining)
[abc-123-def-456] 🚀 Brief generation started
[abc-123-def-456] ✅ Briefs generated
[abc-123-def-456] 💰 Cost: $0.1234 (7153 tokens)
[abc-123-def-456] Completed in 18450ms
```

**✅ Pass Criteria:**
- Same ID appears in multiple log lines
- Can trace entire request lifecycle
- Request ID in response headers matches logs

**Manual Checklist:**
- [ ] Request ID appears in 5+ log lines
- [ ] Can see full lifecycle (start → rate limit → generation → cost → completion)
- [ ] Browser header matches server logs

---

## 🐛 Troubleshooting Guide

### Problem: Health Check Returns "degraded" or "down"

**Database Error:**
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# If connection fails, check:
# - Database is running
# - Credentials are correct
# - Network access allowed
```

**OpenAI Error:**
```bash
# Check API key exists
echo $OPENAI_API_KEY

# Should start with "sk-"
# If empty, add to .env.local
```

---

### Problem: Auto-Save Not Working

**Check Console for Errors:**
```
# Look for:
- "Failed to parse draft data"
- "Auto-save failed"
- Any red error messages
```

**Verify localStorage:**
```javascript
// In browser console:
localStorage.getItem('banyan_drafts')

// Should return JSON array
// If null or invalid, clear it:
localStorage.removeItem('banyan_drafts')
```

**Check Hook Status:**
```javascript
// Add temporary logging in useAutoSave.ts:
console.log('Auto-save triggered:', data);
```

---

### Problem: Rate Limiting Not Working

**Check Environment Variable:**
```bash
# Make sure it's set to false
grep DISABLE_RATE_LIMIT .env.local

# Should show:
# DISABLE_RATE_LIMIT=false

# Or not set at all (defaults to enabled)
```

**Verify Limit Configuration:**
```typescript
// In rate-limiter.ts, check:
AI_GENERATION: {
  maxRequests: 10,  // Should be 10
  windowMs: 60 * 60 * 1000  // Should be 1 hour
}
```

---

### Problem: Cost Tracking Missing

**Check for Token Usage:**
```typescript
// OpenAI responses should include usage:
result.usage?.total_tokens

// If undefined, check:
// - OpenAI API key is valid
// - Request completed successfully
// - Model supports usage tracking
```

**Verify Logs Appear:**
```bash
# Search for cost logs:
grep "ai_cost" <server-logs>

# Should find JSON objects
# If none, check calculateCost is called
```

---

### Problem: Keyboard Shortcut Not Working

**Check Event Listener:**
```javascript
// In browser console during /new page:
window.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key, 'Meta:', e.metaKey, 'Ctrl:', e.ctrlKey);
});

// Press Cmd+S / Ctrl+S
// Should log: Key pressed: s Meta: true Ctrl: false (or vice versa)
```

**Verify Browser Doesn't Intercept:**
```
Some browsers may intercept Cmd+S
If nothing happens:
- Try in different browser
- Check if page has focus
- Try clicking on page first
```

---

## 📊 Test Results Summary

Fill this out as you test:

### Infrastructure Tests
- [ ] Health check endpoint works
- [ ] Request IDs appear in all requests
- [ ] Request IDs in logs match headers

### Auto-Save Tests
- [ ] Auto-save with 3s debounce works
- [ ] Visual indicator shows correct states
- [ ] Keyboard shortcut (Cmd+S) works
- [ ] Saves persist after page refresh

### Rate Limiting Tests
- [ ] Normal usage allowed (first 10 requests)
- [ ] Excessive use blocked (11th request)
- [ ] 429 status returned with retryAfter
- [ ] Rate limits reset after server restart

### Cost Tracking Tests
- [ ] Brief generation costs logged
- [ ] Framework generation costs logged
- [ ] Simple refinements use GPT-3.5
- [ ] Complex refinements use GPT-4
- [ ] JSON logs are well-formed

### Integration Tests
- [ ] Request IDs correlate across logs
- [ ] All features work together
- [ ] No errors in console
- [ ] No errors in server logs

---

## 🎯 Success Criteria

**All Systems Operational:**
- ✅ 10/10 tests pass
- ✅ No errors in console
- ✅ No errors in server logs
- ✅ Cost tracking shows expected ranges
- ✅ Rate limiting blocks after 10 requests
- ✅ Auto-save works smoothly

**Ready for Production If:**
- All tests pass
- Costs are within budget
- Rate limits feel reasonable
- No critical bugs found

---

## 📝 Notes & Observations

**Use this space to record:**
- Any unexpected behavior
- Performance issues
- Ideas for improvements
- Questions or concerns

```
Example:
- Auto-save seems to trigger twice sometimes → investigate debounce logic
- Cost for framework generation higher than expected → check token count
- Rate limit of 10/hour feels too restrictive → consider 20/hour for testing
```

---

## 🚀 After Testing

### If All Tests Pass:
1. ✅ Deploy to staging/production
2. Monitor health check endpoint
3. Watch cost logs for patterns
4. Gather user feedback on auto-save

### If Tests Fail:
1. Note which tests failed
2. Check troubleshooting guide
3. Fix issues
4. Re-run failed tests
5. Repeat until all pass

---

**Happy Testing! 🧪**

*Remember: These features make your app more reliable, debuggable, and cost-effective. Take your time with testing - it's worth it!*

