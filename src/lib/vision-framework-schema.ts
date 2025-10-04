import { z } from 'zod';

/**
 * Zod schema for VisionFramework validation
 */
export const VisionFrameworkSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
  updatedAt: z.string().datetime("Invalid date format"),

  vision: z.object({
    purpose: z.string().max(200, "Purpose must be ≤200 characters"),
    endState: z.string().max(500, "End state must be ≤500 characters"),
  }),

  mission: z.object({
    whatWeDo: z.string().min(1, "Mission statement is required").max(300, "Mission must be ≤300 characters"),
    whoFor: z.string().min(1, "Target audience is required").max(300, "Audience must be ≤300 characters"),
    howWeWin: z.string().min(1, "How we win is required").max(300, "How we win must be ≤300 characters"),
    successSignals: z.array(z.string().min(1, "Success signal cannot be empty")).min(3, "At least 3 success signals required").max(7, "Maximum 7 success signals allowed"),
  }),

  operatingPrinciples: z.array(z.object({
    name: z.string().min(1, "Principle name is required").max(100, "Name must be ≤100 characters"),
    description: z.string().min(1, "Principle description is required").max(300, "Description must be ≤300 characters"),
    behaviors: z.array(z.string().min(1, "Behavior cannot be empty")).min(2, "At least 2 behaviors required").max(5, "Maximum 5 behaviors allowed"),
    antiBehaviors: z.array(z.string().min(1, "Anti-behavior cannot be empty")).min(1, "At least 1 anti-behavior required").max(3, "Maximum 3 anti-behaviors allowed"),
  })).min(3, "At least 3 operating principles required").max(10, "Maximum 10 operating principles allowed"),

  objectives: z.array(z.object({
    id: z.string().min(1, "Objective ID is required"),
    timespan: z.enum(["Q1", "Q2", "Q3", "Q4", "Annual"]),
    statement: z.string().min(1, "Objective statement is required").max(400, "Statement must be ≤400 characters"),
    keyResults: z.array(z.object({
      metric: z.string().min(1, "Metric is required").max(100, "Metric must be ≤100 characters"),
      target: z.string().min(1, "Target is required").max(100, "Target must be ≤100 characters"),
    })).min(2, "At least 2 key results required").max(5, "Maximum 5 key results allowed"),
    owner: z.string().min(1, "Owner is required").max(100, "Owner must be ≤100 characters"),
  })).min(2, "At least 2 objectives required").max(8, "Maximum 8 objectives allowed"),

  brandBrief: z.object({
    oneLiner: z.string().min(1, "One liner is required").max(150, "One liner must be ≤150 characters"),
    positioning: z.string().min(1, "Positioning is required").max(400, "Positioning must be ≤400 characters"),
    audience: z.string().min(1, "Audience is required").max(300, "Audience must be ≤300 characters"),
    tone: z.array(z.string().min(1, "Tone word cannot be empty")).min(3, "At least 3 tone words required").max(7, "Maximum 7 tone words allowed"),
    story: z.string().min(1, "Brand story is required").max(800, "Story must be ≤800 characters"),
    visualCues: z.array(z.string().min(1, "Visual cue cannot be empty")).min(3, "At least 3 visual cues required").max(7, "Maximum 7 visual cues allowed"),
  }),
});

export type VisionFramework = z.infer<typeof VisionFrameworkSchema>;

/**
 * Validate a vision framework object
 */
export const validateVisionFramework = (framework: unknown): { success: boolean; data?: VisionFramework; errors?: string[] } => {
  try {
    const validatedFramework = VisionFrameworkSchema.parse(framework);
    return { success: true, data: validatedFramework };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
};

/**
 * Create empty vision framework (no validation for empty state)
 */
export const createEmptyVisionFramework = (companyId: string): Partial<VisionFramework> => {
  return {
    companyId,
    updatedAt: new Date().toISOString(),
    
    vision: {
      purpose: "",
      endState: ""
    },
    
    mission: {
      whatWeDo: "",
      whoFor: "",
      howWeWin: "",
      successSignals: []
    },
    
    operatingPrinciples: [],
    
    objectives: [],
    
    brandBrief: {
      oneLiner: "",
      positioning: "",
      audience: "",
      tone: [],
      story: "",
      visualCues: []
    }
  };
};

/**
 * Intelligently extract vision framework from wizard responses
 * Uses AI inference and smart parsing to minimize redundancy
 */
export const extractVisionFrameworkFromBrief = (
  companyId: string,
  briefData: {
    vision_audience_timing: string;
    hard_decisions?: string;
    success_definition?: string;
    core_principles?: string;
    required_capabilities?: string;
    current_state?: string;
  }
): Partial<VisionFramework> => {
  // Parse vision/audience/timing to extract mission components
  const parseVisionStatement = (vision: string) => {
    // Extract what they're building
    const buildingMatch = vision.match(/(?:building|creating|developing)\s+(?:a\s+)?([^.]+?)(?:\s+for)/i);
    const whatWeDo = buildingMatch ? buildingMatch[1].trim() : vision.substring(0, 100);
    
    // Extract who it's for
    const forMatch = vision.match(/for\s+([^.]+?)(?:\s+who|\s+that|\s+in|\.|$)/i);
    const whoFor = forMatch ? forMatch[1].trim() : "Target customers";
    
    // Extract competitive advantage from capabilities or timing
    const whyNowMatch = vision.match(/(?:now|right now|today)[,:]?\s+([^.]+)/i);
    const howWeWin = whyNowMatch ? 
      `Through timing: ${whyNowMatch[1].trim()}` : 
      "Through superior execution and timing";
    
    return { whatWeDo, whoFor, howWeWin };
  };


  // Parse core principles into operating principles
  const parsePrinciples = (principlesText: string) => {
    const principles = principlesText.split(/[.\n]/).filter(p => p.trim().length > 10);
    return principles.slice(0, 5).map((principle, index) => ({
      name: principle.substring(0, 30).trim() + (principle.length > 30 ? '...' : ''),
      description: principle.trim(),
      behaviors: ["Act on this principle", "Make it visible", "Measure adherence"],
      antiBehaviors: ["Ignore this principle", "Make exceptions without discussion"]
    }));
  };

  // Extract success signals from current state
  const extractSuccessSignals = (currentState: string): string[] => {
    const signals = currentState.split(/[.,;]/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && /\d/.test(s)) // Contains numbers
      .slice(0, 5);
    
    if (signals.length < 3) {
      return [
        "Customer satisfaction >90%",
        "Revenue growth >50% YoY",
        "Market share expansion",
        ...signals
      ].slice(0, 5);
    }
    return signals;
  };

  // Infer tone from success definition
  const inferTone = (successDef: string): string[] => {
    const tones: string[] = [];
    if (successDef.toLowerCase().includes('transparent')) tones.push('Transparent');
    if (successDef.toLowerCase().includes('fast') || successDef.toLowerCase().includes('speed')) tones.push('Fast');
    if (successDef.toLowerCase().includes('safe')) tones.push('Safety-focused');
    if (successDef.toLowerCase().includes('owner')) tones.push('Ownership-driven');
    
    if (tones.length < 3) {
      return [...tones, 'Professional', 'Confident', 'Clear'].slice(0, 3);
    }
    return tones.slice(0, 3);
  };

  // Extract vision purpose from the problem/why statement
  const extractVisionPurpose = (visionStatement: string): string => {
    // Extract the core problem/pain point being solved
    const lowerStatement = visionStatement.toLowerCase();
    
    // Look for patterns indicating the problem
    if (lowerStatement.includes('who lose') || lowerStatement.includes('who waste')) {
      const problemMatch = visionStatement.match(/who (lose|waste|struggle with|face|experience) ([^.]+)/i);
      if (problemMatch) {
        return `Eliminate ${problemMatch[2].trim()}`;
      }
    }
    
    // Try to extract from "building X for Y who Z" pattern
    const buildingMatch = visionStatement.match(/building ([^,]+) for ([^,]+)/i);
    if (buildingMatch) {
      return `Transform ${buildingMatch[2].trim()} through ${buildingMatch[1].trim()}`;
    }
    
    // Default: use first sentence
    const firstSentence = visionStatement.split(/[.!?]/)[0].trim();
    return firstSentence || "Transform the industry through innovation";
  };

  // Extract end state from success definition
  const extractEndState = (successDef: string, visionStatement: string): string => {
    if (successDef) {
      // Clean up and combine financial and cultural goals
      let cleaned = successDef.replace(/^financially[,:]\s*/i, '').trim();
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      
      // If it mentions culture, include both dimensions
      if (successDef.toLowerCase().includes('culturally')) {
        return cleaned;
      }
      
      return cleaned;
    }
    // Fallback: derive aspirational end state from vision statement
    return `A world where every organization has access to best-in-class solutions that eliminate inefficiency and drive success`;
  };

  // Parse the new data structure
  const mission = parseVisionStatement(briefData.vision_audience_timing);
  const successSignals = extractSuccessSignals(briefData.current_state || "");
  const corePrinciples = briefData.core_principles ? 
    parsePrinciples(briefData.core_principles) : [];
  const inferredTone = briefData.success_definition ? 
    inferTone(briefData.success_definition) : 
    ['Professional', 'Confident', 'Clear'];

  return {
    companyId,
    updatedAt: new Date().toISOString(),
    
    vision: {
      // Use the explicit vision fields from wizard if provided, otherwise extract
      purpose: briefData.vision_purpose || extractVisionPurpose(briefData.vision_audience_timing),
      endState: briefData.vision_endstate || extractEndState(briefData.success_definition, briefData.vision_audience_timing)
    },
    
    mission: {
      whatWeDo: mission.whatWeDo,
      whoFor: mission.whoFor,
      howWeWin: mission.howWeWin,
      successSignals: successSignals.length >= 3 ? successSignals : [
        "Customer satisfaction >90%",
        "Revenue growth >50% YoY", 
        "Market share expansion"
      ]
    },
    
    operatingPrinciples: corePrinciples.length >= 3 ? corePrinciples : [
      {
        name: "Customer First",
        description: "Every decision prioritizes customer value and experience.",
        behaviors: ["Listen to customer feedback", "Iterate based on user needs", "Measure customer satisfaction"],
        antiBehaviors: ["Ignore user feedback", "Build features without validation"]
      },
      {
        name: "Move Fast",
        description: "Speed of execution is our competitive advantage.",
        behaviors: ["Ship early and often", "Make decisions quickly", "Learn from failures"],
        antiBehaviors: ["Perfect before shipping", "Analysis paralysis"]
      },
      {
        name: "Data-Driven",
        description: "Use metrics and evidence to guide decisions.",
        behaviors: ["Track key metrics", "A/B test changes", "Make evidence-based decisions"],
        antiBehaviors: ["Gut-feeling decisions", "Ignore data"]
      }
    ],
    
    objectives: [
      {
        id: "q1-primary",
        timespan: "Q1",
        statement: briefData.success_definition ? 
          briefData.success_definition.split('.')[0].substring(0, 400) || "Achieve key business milestones" : 
          "Achieve key business milestones",
        keyResults: [
          { metric: "Revenue", target: "TBD" },
          { metric: "Customers", target: "TBD" }
        ],
        owner: "Founder"
      },
      {
        id: "q1-secondary",
        timespan: "Q1",
        statement: briefData.required_capabilities ? 
          briefData.required_capabilities.split('.')[0].substring(0, 400) || "Build core product features" : 
          "Build core product features and achieve product-market fit",
        keyResults: [
          { metric: "Key capabilities delivered", target: "100%" },
          { metric: "Team readiness", target: ">90%" }
        ],
        owner: "CTO"
      }
    ],
    
    brandBrief: {
      oneLiner: (briefData.vision_audience_timing.split('.')[0] || briefData.vision_audience_timing).substring(0, 150),
      positioning: (mission.whoFor + " - " + mission.howWeWin).substring(0, 400),
      audience: mission.whoFor.substring(0, 300),
      tone: inferredTone,
      story: briefData.vision_audience_timing.substring(0, 800),
      visualCues: ["Clean", "Modern", "Professional"] // Default visual cues
    }
  };
};
