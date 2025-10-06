# Streaming Generation Test Guide

## Overview
The Vision Framework generation now uses **Server-Sent Events (SSE)** to stream real-time progress updates to the user. This provides a much better user experience during the ~70-second generation process.

---

## 🎯 What's New

### Before (Blocking)
- User clicks "Generate Brief"
- Loading spinner appears
- **70 seconds of silence** 🤷
- Results appear

### After (Streaming)
- User clicks "Generate Brief"
- Progress modal appears with 6 steps:
  1. ✅ **Generate Brief & VC Summary** (~10s)
  2. 🔄 **Generate Strategic Framework** (~25s)
  3. 🔄 **Validate Framework Structure** (~1s)
  4. 🔄 **Create Executive Summary** (~15s)
  5. 🔄 **Run Quality Checks** (~10s)
  6. 🔄 **Score Section Quality** (~10s)
- Each step shows:
  - Real-time status (pending → in progress → complete)
  - Spinner while active
  - Checkmark when done
  - Duration in seconds
  - Progress messages

---

## 🧪 How to Test

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Open the App
Navigate to: http://localhost:3000/new

### 3. Test Streaming Generation

#### Option A: Use Test Data (Fastest)
1. Click **"Load Test Data"** button
2. Scroll to bottom and click **"Generate Brief"**
3. **Watch the progress modal**:
   - Steps should update in real-time
   - Each step shows a spinner → checkmark
   - Duration appears after completion
   - Overall progress bar at bottom

#### Option B: Manual Entry
1. Fill out all 6 wizard prompts manually
2. Click **"Generate Brief"**
3. Observe the streaming progress

### 4. What to Watch For

✅ **Expected Behavior:**
- Progress modal opens immediately
- "Generate Brief & VC Summary" completes first (~10s)
- Framework steps stream in sequentially
- Each step shows its own duration
- Overall progress percentage updates
- Modal closes automatically when complete
- Results appear on the page

❌ **Potential Issues:**
- Modal doesn't open → Check console for errors
- Steps stuck on "pending" → Streaming not working
- Error message → Check server logs
- Modal doesn't close → Check onComplete logic

---

## 🔍 How It Works

### Backend (`/api/vision-framework-v2/generate-stream/route.ts`)
```typescript
// Creates an SSE stream
const transformer = createSSETransformer();
const writer = transformer.writable.getWriter();

// Send progress events
await sendStreamEvent(writer, {
  type: 'step_start',
  step: 'framework',
  message: 'Analyzing your responses...'
});

// ... do work ...

await sendStreamEvent(writer, {
  type: 'step_complete',
  step: 'framework',
  message: 'Framework complete',
  duration: 25000,
  data: completeFramework
});
```

### Frontend (`PromptWizard.tsx`)
```typescript
// Consume the stream
for await (const event of consumeSSEStream(frameworkResponse)) {
  if (event.type === 'step_start') {
    updateStepStatus(event.step!, 'in_progress', event.message);
  } else if (event.type === 'step_complete') {
    updateStepStatus(event.step!, 'complete', event.message, event.duration);
  }
}
```

### Progress Modal (`GenerationProgressModal.tsx`)
- Displays all steps with their current status
- Shows spinners for in-progress steps
- Shows checkmarks for completed steps
- Displays duration for each step
- Overall progress bar at bottom

---

## 📊 Performance Comparison

| Metric | Before (Blocking) | After (Streaming) |
|--------|------------------|-------------------|
| **Total Time** | ~70 seconds | ~70 seconds (same) |
| **Perceived Wait** | 70 seconds 😴 | 0 seconds (always seeing progress) ✨ |
| **User Anxiety** | High (is it working?) | Low (clear feedback) |
| **Abandonment Risk** | High | Low |

---

## 🐛 Debugging

### Check Server Logs
```bash
# Look for these log messages:
[uuid] 🚀 Starting Vision Framework V2 streaming generation
[uuid] Step 1: Analyzing responses...
[uuid] ✅ Framework structure complete
[uuid] 💰 Total Cost: $0.0551 (3377 tokens)
[uuid] ⏱️  Total Duration: 69.839s
```

### Check Browser Console
```javascript
// Should see streaming events:
📡 Stream event: { type: 'step_start', step: 'framework', message: '...' }
📡 Stream event: { type: 'step_complete', step: 'framework', duration: 25000 }
✅ Framework generation complete!
```

### Check Network Tab
1. Open DevTools → Network
2. Find request to `/api/vision-framework-v2/generate-stream`
3. Look for:
   - Response type: `text/event-stream`
   - Status: `200`
   - Data streaming in real-time

---

## 💡 Tips

### Test Different Scenarios

1. **Normal Flow** (as described above)
2. **Error Handling**:
   - Stop server mid-generation → Should show error
   - Invalid API key → Should show error at QA step
3. **Rate Limiting**:
   - Generate 11 times in a row → 11th should fail with 429
4. **Network Issues**:
   - Throttle network in DevTools → Should still work, just slower

### Performance Testing

```bash
# Time the entire generation
time curl -X POST http://localhost:3000/api/vision-framework-v2/generate-stream \
  -H "Content-Type: application/json" \
  -d '{"companyId": "test", "responses": {...}}'
```

---

## 🎓 Key Learnings

### Why Streaming Matters
- **Engagement**: Users see progress, not a black box
- **Trust**: Clear feedback = confidence in the system
- **Debugging**: Can see exactly which step failed
- **UX**: 70 seconds feels like 10 when you see progress

### Technical Benefits
- **Incremental data**: Can show partial results
- **Error isolation**: Know exactly which step failed
- **Cost tracking**: Per-step duration helps optimize
- **Analytics**: Track which steps take longest

---

## 🚀 Next Steps

### Future Enhancements
1. **Progress Bars**: Add 0-100% progress for long steps
2. **Cancellation**: Allow user to cancel mid-generation
3. **Retry**: Retry individual failed steps
4. **Caching**: Cache partial results to resume
5. **WebSockets**: Upgrade from SSE to WebSocket for bi-directional communication

### Production Monitoring
- Track average step durations
- Alert if any step takes >2x normal time
- Monitor stream connection failures
- Track user abandonment rates

---

## ✅ Success Criteria

You'll know streaming is working when:
1. Modal appears immediately on "Generate Brief" click
2. Steps update in real-time (not all at once)
3. Duration shows for each completed step
4. Overall progress bar moves smoothly
5. Users comment: "Wow, that felt fast!" (even though it's 70s)

---

**Test Status:** 🟡 Ready for Testing  
**Last Updated:** October 5, 2025  
**Estimated Test Time:** 2 minutes  

---

## 🎉 You Did It!

Streaming responses are a **massive UX upgrade**. Users will love seeing the AI "think" in real-time rather than staring at a static spinner. This is the difference between a prototype and a polished product. 🚀

