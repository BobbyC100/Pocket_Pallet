# Quick Test Guide - 5 Minutes
**Get immediate feedback on all improvements**

---

## 🚀 Quick Start (Terminal)

```bash
# 1. Make sure dev server is running
npm run dev

# 2. In a NEW terminal window:
./test-improvements.sh

# This automated script tests:
# ✓ Health check endpoint
# ✓ Request ID tracking
# ✓ Rate limiting (optional - costs ~$1)
```

**Expected Output:**
```
╔════════════════════════════════════════╗
║  Banyan Improvements Test Suite       ║
╚════════════════════════════════════════╝

✓ Dev server is running

Test 1: Health Check Endpoint
→ Calling /api/health...
✓ Health check returned 'ok'
  Database: ok
  OpenAI:   ok

Test 2: Request ID Tracking
→ Checking for X-Request-ID header...
✓ Request ID found: abc-123-def-456...

Test 3: Rate Limiting (Optional)
Test rate limiting? [y/N] n
→ Skipping rate limit test

✓ Automated tests complete!
```

---

## 🌐 Quick Test (Browser) - 2 Minutes

### Test Auto-Save

1. **Go to:** http://localhost:3000/new
2. **Click:** "Load Test Data" button
3. **Click:** "Generate Brief"
4. **Wait:** ~20 seconds for generation
5. **Watch:** Status indicator (should show "Saving..." then "Saved ✓")
6. **Press:** Cmd+S (Mac) or Ctrl+S (Windows)
7. **Verify:** Save happens instantly (no 3s wait)

**✅ Success if:**
- Status shows "Saving..." with spinner
- Changes to "Saved just now" with green checkmark
- Cmd+S triggers instant save
- Browser console shows: "Manual save triggered via keyboard shortcut"

---

## 🔍 Quick Visual Checks

### Check 1: Request IDs in Network Tab
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to Network tab
3. Make any API request
4. Click on the request
5. Look for `X-Request-ID` in Response Headers

**✅ Should see:** Long UUID like `abc-123-def-456-789...`

### Check 2: Cost Tracking in Logs
1. Look at server terminal
2. After generation, find lines with 💰
3. Should see: `[abc-123] 💰 Cost: $0.1234 (7153 tokens)`

**✅ Should see:**
- Cost in dollars ($0.08 - $0.30 range)
- Token count
- Request ID in brackets

### Check 3: Rate Limiting Headers
1. In Network tab, click any API request
2. Look at Response Headers
3. Find `X-RateLimit-Remaining`

**✅ Should see:** Number like `9` (if first request)

---

## ⚡ Super Quick Test (30 seconds)

If you just want to verify it's all working:

```bash
# One-liner health check
curl http://localhost:3000/api/health | jq '.status'

# Should return: "ok"
```

Then open http://localhost:3000/new and:
1. Generate a brief
2. Watch for "Saved ✓" after 3 seconds
3. Press Cmd+S and see instant save

**If all 3 work → You're good to go!** ✅

---

## 🐛 Quick Troubleshooting

### Problem: Health check fails
```bash
# Check database connection
echo $DATABASE_URL

# Check OpenAI key
echo $OPENAI_API_KEY
```

### Problem: Auto-save not showing
```bash
# Check browser console for errors
# Press F12 → Console tab
# Look for red error messages
```

### Problem: Request IDs missing
```bash
# Restart dev server
# Press Ctrl+C in server terminal
npm run dev
```

---

## 📚 Full Testing

For comprehensive testing with detailed steps, see:
**`COMPREHENSIVE_TEST_PLAN.md`**

That guide includes:
- 10 detailed test scenarios
- Expected outputs for each test
- Troubleshooting for every issue
- Success criteria checklist

---

## 🎯 Minimal Viable Test

**Can't do all tests? Do these 3:**

1. **Health Check** (10 seconds)
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Auto-Save** (2 minutes)
   - Generate brief
   - Watch for "Saved ✓"
   - Press Cmd+S

3. **Cost Tracking** (5 seconds)
   - Check server logs
   - Look for `💰 Cost:`

**If all 3 work → Deploy with confidence!**

---

**Questions? Check `COMPREHENSIVE_TEST_PLAN.md` for detailed guidance.**

