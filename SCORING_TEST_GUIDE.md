# Vision Framework Scoring Test Guide

## Problem
Testing the scoring API required generating entire frameworks through the full document creation flow, which was:
- **Time consuming**: 6+ wizard steps
- **Expensive**: Multiple OpenAI API calls ($0.50-1.00 per test)
- **Slow iteration**: Hard to quickly test scoring prompt changes

## Solution
Two new testing tools that let you test scoring directly:

### 1. Web-Based Test Tool (Recommended)
**Location**: `http://localhost:3000/test-scoring.html`

**Features**:
- ✅ Visual interface with side-by-side input/results
- ✅ Built-in example frameworks (good, poor, mixed quality)
- ✅ Real-time JSON validation
- ✅ Detailed score breakdowns with issues/suggestions/strengths
- ✅ Copy results to clipboard

**How to use**:
1. Start your dev server: `npm run dev`
2. Open: `http://localhost:3000/test-scoring.html`
3. Click a preset button (or paste your own framework JSON)
4. Click "Run Scoring Test"
5. Review detailed quality assessment

**Perfect for**:
- Interactive testing
- Comparing different frameworks
- Debugging scoring logic
- Sharing results with team

### 2. Command-Line Test Script
**Location**: `./test-scoring.sh`

**How to use**:
```bash
# Test with good quality framework
./test-scoring.sh good

# Test with poor quality framework
./test-scoring.sh poor

# Test with mixed quality framework
./test-scoring.sh mixed
```

**Perfect for**:
- Quick iteration on scoring prompts
- CI/CD testing
- Automated quality checks
- Terminal-based workflows

## Cost Comparison

### Before (Full Flow):
```
1. Generate Framework: $0.40 (GPT-4 Turbo)
2. Generate Brief: $0.30 (GPT-4 Turbo)
3. Score Framework: $0.05 (GPT-4 Turbo)
Total: ~$0.75 per test
```

### After (Direct Scoring):
```
1. Score Framework: $0.05 (GPT-4 Turbo)
Total: ~$0.05 per test
```

**Savings**: ~93% cost reduction + 90% time savings

## Editing the Scoring Prompt

The scoring logic lives in: `src/app/api/vision-framework-v2/score/route.ts`

To iterate on scoring:
1. Edit the `scoringPrompt` in `route.ts`
2. Save the file (Next.js hot-reloads)
3. Run test: `./test-scoring.sh good` or refresh browser
4. Review results
5. Repeat

No need to regenerate full frameworks!

## Example Frameworks

### Good Quality
- Specific vision with concrete details
- Strategic pillars with named advantages
- Measurable bets with clear owners
- Real tensions (not generic)

### Poor Quality  
- Generic language ("revolutionize", "great products")
- Vague measures ("more revenue", "growth")
- Theoretical tensions ("quality vs speed")
- No specificity

### Mixed Quality
- Some good elements (specific integrations)
- Some poor elements (generic principles)
- Useful for testing edge cases

## What Gets Scored

Each section receives scores (1-10) for:
- **Specificity**: Generic (1) vs Concrete (10)
- **Actionability**: Vague (1) vs Clear next steps (10)
- **Alignment**: Off-brand (1) vs On-brand (10)
- **Measurability**: Unmeasurable (1) vs Clear metrics (10) *[bets/metrics only]*

Plus:
- **Issues**: Specific problems found
- **Suggestions**: Concrete improvements
- **Strengths**: What's working well

## Tips

1. **Test both extremes**: Run `good` and `poor` examples to ensure scoring differentiates quality
2. **Validate alignment**: Pass `originalResponses` to test if framework matches founder's intent
3. **Watch for bias**: Make sure scoring isn't too harsh or too lenient (7-8 should be "good")
4. **Check consistency**: Same framework should score similarly each time (within 0.5 points)
5. **Use mixed examples**: Test edge cases where some sections are great and others need work

## Troubleshooting

**"Connection refused" error**:
- Make sure dev server is running: `npm run dev`

**Invalid JSON error**:
- Use the "Validate JSON" button in the web tool
- Check for trailing commas, missing quotes

**Scoring returns all 7s**:
- This is the fallback if scoring fails
- Check API logs for errors
- Verify OpenAI API key is set

**Scores seem wrong**:
- Review the `scoringPrompt` in `route.ts`
- Adjust scoring criteria or examples
- Test with known good/bad frameworks

## Next Steps

Once you're happy with scoring:
1. Document scoring criteria in design docs
2. Consider exposing scores in the UI (quality badges)
3. Add automated tests that assert score ranges
4. Track scoring performance over time

