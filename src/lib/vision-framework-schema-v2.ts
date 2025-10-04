import { z } from 'zod';

/**
 * Vision Framework V2 - Document Recipe Schema
 * 
 * Simplified, action-oriented structure:
 * - Vision: The aspirational end state
 * - Strategy: How we'll get there (principles, not tactics)
 * - Operating Principles: Cultural DNA and decision filters
 * - Near-term Bets: Concrete commitments with owners and measures
 * - Metrics: What we track to know we're winning
 * - Tensions: Known contradictions to watch
 */

// Near-term Bet: A concrete commitment with accountability
const NearTermBetSchema = z.object({
  bet: z.string().min(10).max(300).describe("The specific commitment (what we're betting on)"),
  owner: z.string().min(1).max(100).describe("Who owns this bet"),
  horizon: z.enum(['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', '6mo', '12mo']).describe("When we'll know if it worked"),
  measure: z.string().min(5).max(200).describe("How we'll measure success")
});

// Metric: A number we track
const MetricSchema = z.object({
  name: z.string().min(1).max(100).describe("What we're measuring"),
  target: z.string().min(1).max(100).describe("The goal (can be qualitative)"),
  cadence: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'milestone']).describe("How often we check it")
});

// Main Vision Framework Schema
export const VisionFrameworkV2Schema = z.object({
  companyId: z.string(),
  updatedAt: z.string(),
  
  // Core Identity
  vision: z.string().min(20).max(500).describe("The aspirational end state (2-3 sentences)"),
  
  // Strategic Direction  
  strategy: z.array(z.string().min(10).max(300)).min(2).max(5).describe("How we'll win (2-5 strategic pillars)"),
  
  // Cultural DNA
  operating_principles: z.array(z.string().min(10).max(200)).min(3).max(7).describe("Decision filters and cultural norms"),
  
  // Tactical Execution
  near_term_bets: z.array(NearTermBetSchema).min(2).max(8).describe("Concrete commitments for next 6-12 months"),
  
  // Success Indicators
  metrics: z.array(MetricSchema).min(3).max(12).describe("What we track to know we're winning"),
  
  // Known Contradictions
  tensions: z.array(z.string().min(10).max(300)).max(10).describe("Contradictions to watch (e.g., speed vs quality)")
});

export type VisionFrameworkV2 = z.infer<typeof VisionFrameworkV2Schema>;
export type NearTermBet = z.infer<typeof NearTermBetSchema>;
export type Metric = z.infer<typeof MetricSchema>;

/**
 * Validate a Vision Framework V2
 */
export function validateVisionFrameworkV2(framework: any): { success: boolean; errors?: string[] } {
  try {
    const result = VisionFrameworkV2Schema.safeParse(framework);
    
    if (!result.success) {
      const errors = result.error?.errors?.map(err => `${err.path.join('.')}: ${err.message}`) || ['Unknown validation error'];
      return {
        success: false,
        errors
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Validation threw an error:', error);
    return {
      success: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Extract Vision Framework V2 from brief responses using Gemini Pro
 * 
 * This is where the magic happens - Gemini Pro maps the 8 strategic questions
 * into the framework structure and detects contradictions.
 */
export function createVisionFrameworkV2Seed(briefData: any, companyId: string): Partial<VisionFrameworkV2> {
  // This creates a minimal seed - the full extraction happens via Gemini Pro in the API
  return {
    companyId,
    updatedAt: new Date().toISOString(),
    
    // Seed from wizard data
    vision: briefData.vision_endstate || "",
    strategy: [],
    operating_principles: [],
    near_term_bets: [],
    metrics: [],
    tensions: []
  };
}

/**
 * Create Gemini Pro prompt for Vision Framework generation
 */
export function createVisionFrameworkPrompt(briefData: any): string {
  return `You are a strategic advisor helping a founder create their Vision Framework - a living document that guides all company decisions.

**Founder's Strategic Responses:**

1. **Vision, Audience & Timing:**
${briefData.vision_audience_timing}

2. **Hard Decisions:**
${briefData.hard_decisions}

3. **Success Definition (Financial & Cultural):**
${briefData.success_definition}

4. **Core Principles:**
${briefData.core_principles}

5. **Required Capabilities:**
${briefData.required_capabilities}

6. **Current State:**
${briefData.current_state}

7. **Vision Purpose:**
${briefData.vision_purpose}

8. **Vision End State:**
${briefData.vision_endstate}

---

**Your Task:**

Create a complete Vision Framework in JSON format with these sections:

1. **vision** (string): Synthesize their end state into 2-3 powerful sentences. Make it aspirational but grounded.

2. **strategy** (array of 2-5 strings): Extract the strategic pillars - HOW they'll win. Each should be 10-30 words. Look for:
   - Competitive advantages mentioned
   - Market positioning
   - Execution approach
   - Resource allocation philosophy

3. **operating_principles** (array of 3-7 strings): Extract their cultural DNA and decision filters. Each should be 10-25 words. These are:
   - Non-negotiables from their "Core Principles"
   - Implicit values in their "Hard Decisions"
   - Cultural statements in their "Success Definition"

4. **near_term_bets** (array of 2-8 objects): Create concrete commitments from their responses. Each bet needs:
   - \`bet\`: What they're committing to (specific, 10-30 words)
   - \`owner\`: Role/person responsible (CEO, CTO, etc.)
   - \`horizon\`: Timeframe (Q1, Q2, H1, 6mo, 12mo)
   - \`measure\`: How success is measured (specific metric or milestone)

5. **metrics** (array of 3-12 objects): Extract what they should track. Each needs:
   - \`name\`: What to measure
   - \`target\`: The goal (can be a number or qualitative)
   - \`cadence\`: How often to check (daily, weekly, monthly, quarterly, milestone)

6. **tensions** (array of 0-10 strings): **CRITICAL** - Identify contradictions or trade-offs in their responses. Each tension should be 10-30 words. Look for:
   - Conflicting priorities (e.g., "move fast" vs "never compromise on safety")
   - Resource constraints vs ambition
   - Short-term needs vs long-term vision
   - Cultural ideals vs market realities
   - Strategic choices that create trade-offs

**Example tension:**
"Premium positioning (high-quality, high-touch) vs need for rapid user growth may create pricing tension"

---

**Output Format:**

Return ONLY valid JSON matching this structure:

\`\`\`json
{
  "vision": "string (2-3 sentences)",
  "strategy": ["string", "string", ...],
  "operating_principles": ["string", "string", ...],
  "near_term_bets": [
    {"bet": "string", "owner": "string", "horizon": "Q1", "measure": "string"},
    ...
  ],
  "metrics": [
    {"name": "string", "target": "string", "cadence": "monthly"},
    ...
  ],
  "tensions": ["string", "string", ...]
}
\`\`\`

**Quality Standards:**
- Be specific, not generic
- Use the founder's language and tone
- Every bet must have a clear measure
- Tensions should be real, not theoretical
- Metrics should be trackable (even if qualitative)
`;
}

/**
 * Create Gemini Flash prompt for executive one-pager
 */
export function createExecutiveOnePagerPrompt(framework: VisionFrameworkV2): string {
  return `Compress this Vision Framework into a tight executive one-pager (300-400 words max).

**Full Framework:**
${JSON.stringify(framework, null, 2)}

---

**Output Format:**

# [Company Name] - Vision Framework

**Vision:** [1-2 sentences]

**How We Win:** [2-3 strategic pillars, bullet points]

**Cultural DNA:** [Top 3 operating principles]

**Current Bets (Next 6-12mo):**
- [Bet 1 with owner and measure]
- [Bet 2 with owner and measure]
...

**Key Metrics:** [Top 3-5 metrics we track]

**Tensions to Watch:** [Top 2-3 tensions]

---

**Style:**
- Direct, no fluff
- Use bullets, not paragraphs
- Every word earns its place
- Reading level: 10th grade
`;
}

