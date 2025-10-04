import { z } from "zod";

/**
 * Strict VC Summary Schema - enforces agreed structure
 * One page, strict order, no drift
 */
export const VcSummarySchema = z.object({
  whatWhyNow: z.string().min(20, "What & Why Now must be at least 20 characters"),
  market: z.string().min(20, "Market section must be at least 20 characters"),
  solutionDiff: z.array(z.string()).min(3, "Need at least 3 solution points").max(5, "Max 5 solution points"),
  traction: z.array(z.object({
    metric: z.string().min(1, "Metric name required"),
    value: z.string().min(1, "Metric value required"),
    timeframe: z.string().min(1, "Timeframe required")
  })).min(3, "Need at least 3 traction metrics").max(5, "Max 5 traction metrics"),
  businessModel: z.string().min(20, "Business model must be at least 20 characters"),
  gtm: z.string().min(20, "Go-to-market must be at least 20 characters"),
  team: z.string().min(10, "Team section must be at least 10 characters"),
  ask: z.object({
    amount: z.string().min(1, "Funding amount required"),
    useOfFunds: z.array(z.string()).min(3, "Need at least 3 use of funds items").max(5, "Max 5 use of funds items")
  }),
  risks: z.array(z.object({
    risk: z.string().min(1, "Risk description required"),
    mitigation: z.string().min(1, "Mitigation strategy required")
  })).min(2, "Need at least 2 risks").max(3, "Max 3 risks"),
  kpis6mo: z.array(z.string()).min(3, "Need at least 3 KPIs").max(5, "Max 5 KPIs"),
});

export type VcSummary = z.infer<typeof VcSummarySchema>;

/**
 * Validate a VC Summary
 */
export function validateVcSummary(data: unknown): { success: boolean; data?: VcSummary; errors?: string[] } {
  const result = VcSummarySchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map(err => {
      const path = err.path.join('.') || 'root';
      return `${path}: ${err.message}`;
    });
    return { success: false, errors };
  }
  
  return { success: true, data: result.data };
}

/**
 * Create prompt for GPT-4 to generate structured VC Summary
 */
export function createStructuredVcSummaryPrompt(responses: any): string {
  return `You are a VC analyst creating a concise investment summary.

**Founder's Strategic Responses:**

**Opportunity (What, Who, Why Now):**
${responses.vision_audience_timing || 'Not specified'}

**Strategic Position & Open Questions:**
${responses.hard_decisions || 'Not specified'}

**Ambition & Culture:**
${responses.success_definition || 'Not specified'}

**Values & Decision Filters:**
${responses.core_principles || 'Not specified'}

**Execution Requirements:**
${responses.required_capabilities || 'Not specified'}

**Current State:**
${responses.current_state || 'Not specified'}

---

**CRITICAL: Return ONLY valid JSON matching this exact structure:**

\`\`\`json
{
  "whatWhyNow": "1-2 sentence pitch: What problem, who experiences it, why now is the moment",
  "market": "Market size, TAM/SAM, underserved segment - 1 short paragraph",
  "solutionDiff": [
    "Key differentiator 1",
    "Key differentiator 2",
    "Key differentiator 3"
  ],
  "traction": [
    {"metric": "Users/Customers", "value": "X active", "timeframe": "as of MM/YY"},
    {"metric": "Revenue/ARR", "value": "$X", "timeframe": "current"},
    {"metric": "Growth Rate", "value": "X% MoM", "timeframe": "last 3mo"}
  ],
  "businessModel": "Pricing model, unit economics (CAC, LTV if known), expansion motion - 2-3 sentences",
  "gtm": "Customer acquisition channels, sales motion, near-term experiments - 2-3 sentences",
  "team": "Founder backgrounds with 1-line credibility hooks (ex-company, domain expertise)",
  "ask": {
    "amount": "$XM seed/series A",
    "useOfFunds": [
      "Engineering (X people)",
      "Sales & Marketing (X people)",
      "Runway extension to 18mo"
    ]
  },
  "risks": [
    {"risk": "Competitive landscape intensifying", "mitigation": "Deep integrations create switching costs"},
    {"risk": "Vendor compliance dependency", "mitigation": "Carrot (better windows) + stick (chargebacks)"}
  ],
  "kpis6mo": [
    "10 paying customers",
    ">90% on-time delivery rate",
    "120%+ NRR"
  ]
}
\`\`\`

**Quality Standards:**
- Be specific with numbers from their responses
- solutionDiff: 3-5 bullet points, each 5-15 words
- traction: 3-5 metrics with actual numbers and timeframes
- risks: 2-3 pairs, each risk paired with its mitigation
- kpis6mo: 3-5 concrete, measurable milestones
- Use data from their responses; if missing, use realistic placeholders like "X" or "TBD"

Return ONLY the JSON object, no markdown formatting, no extra text.`;
}

