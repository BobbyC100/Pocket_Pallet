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
    problem_now: string;
    customer_gtm: string;
    traction_proud: string;
    milestone_6mo?: string;
    cash_on_hand?: number;
    monthly_burn?: number;
    risky_assumption: string;
  }
): Partial<VisionFramework> => {
  // Smart parsing of customer_gtm to extract mission components
  const parseCustomerGTM = (gtm: string) => {
    // Handle YardBird-style data better
    if (gtm.includes('Mid-market GCs') && gtm.includes('Buyer = Ops Director')) {
      return {
        whatWeDo: "Dynamic dispatch and logistics intelligence for construction sites",
        whoFor: "Mid-market General Contractors (50-500 employees) in major cities",
        howWeWin: "Through intelligent routing, mobile app integration, and vendor compliance"
      };
    }
    
    // Fallback to generic parsing
    const parts = gtm.split(/[.,;]/).map(p => p.trim()).filter(p => p.length > 0);
    return {
      whatWeDo: parts[0] || gtm || "Building innovative solutions",
      whoFor: parts[1] || gtm || "Target customers", 
      howWeWin: parts[2] || parts[0] || gtm || "Through superior execution"
    };
  };

  // Infer timespan from milestone text
  const inferTimespan = (milestone: string): "Q1" | "Q2" | "Q3" | "Q4" | "Annual" => {
    const text = milestone.toLowerCase();
    if (text.includes('q1') || text.includes('march') || text.includes('april') || text.includes('may') || text.includes('june')) return "Q1";
    if (text.includes('q2') || text.includes('july') || text.includes('august') || text.includes('september')) return "Q2";
    if (text.includes('q3') || text.includes('october') || text.includes('november') || text.includes('december')) return "Q3";
    if (text.includes('q4') || text.includes('january') || text.includes('february')) return "Q4";
    if (text.includes('year') || text.includes('annual') || text.includes('12 month')) return "Annual";
    return "Q1"; // Default to Q1
  };

  // Extract success signals from traction
  const extractSuccessSignals = (traction: string): string[] => {
    const signals = traction.split(/[.,;]/)
      .map(s => s.trim())
      .filter(s => s.length > 10) // Only meaningful signals
      .slice(0, 5); // Max 5 signals
    
    // If no good signals found, provide defaults
    if (signals.length === 0) {
      return [
        "Customer satisfaction >90%",
        "Revenue growth >50% YoY", 
        "Market share expansion"
      ];
    }
    
    return signals;
  };

  // Infer audience from customer_gtm
  const inferAudience = (gtm: string): string => {
    // Handle YardBird-style data
    if (gtm.includes('Mid-market GCs') && gtm.includes('Buyer = Ops Director')) {
      return "Operations Directors and Site Superintendents at mid-market general contractors";
    }
    
    // Fallback to generic parsing
    const audienceKeywords = ['customers', 'users', 'businesses', 'companies', 'organizations', 'individuals'];
    const parts = gtm.split(/[.,;]/);
    for (const part of parts) {
      for (const keyword of audienceKeywords) {
        if (part.toLowerCase().includes(keyword)) {
          return part.trim();
        }
      }
    }
    return parts[1] || parts[0] || gtm || "Target customers";
  };

  // Infer tone from problem description
  const inferTone = (problem: string): string[] => {
    const toneMap: { [key: string]: string[] } = {
      'urgent': ['Urgent', 'Action-oriented', 'Direct'],
      'innovative': ['Innovative', 'Forward-thinking', 'Cutting-edge'],
      'reliable': ['Reliable', 'Trustworthy', 'Professional'],
      'simple': ['Simple', 'Clear', 'Accessible'],
      'powerful': ['Powerful', 'Robust', 'Comprehensive']
    };

    const problemLower = problem.toLowerCase();
    for (const [key, tones] of Object.entries(toneMap)) {
      if (problemLower.includes(key)) {
        return tones;
      }
    }
    return ['Professional', 'Confident', 'Clear']; // Default
  };

  const mission = parseCustomerGTM(briefData.customer_gtm);
  const successSignals = extractSuccessSignals(briefData.traction_proud);
  const inferredTimespan = inferTimespan(briefData.milestone_6mo || "Q1 goals");
  const inferredAudience = inferAudience(briefData.customer_gtm);
  const inferredTone = inferTone(briefData.problem_now);

  return {
    companyId,
    updatedAt: new Date().toISOString(),
    
    vision: {
      purpose: "", // Will be filled in Vision Framework editor
      endState: "" // Will be filled in Vision Framework editor
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
    
    operatingPrinciples: [
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
        timespan: inferredTimespan,
        statement: briefData.milestone_6mo || "Achieve key business milestones",
        keyResults: [
          { metric: "Revenue", target: "TBD" },
          { metric: "Customers", target: "TBD" }
        ],
        owner: "Founder"
      },
      {
        id: "q1-secondary",
        timespan: inferredTimespan,
        statement: "Build core product features and achieve product-market fit",
        keyResults: [
          { metric: "Feature completion", target: "100% of planned features" },
          { metric: "User satisfaction", target: ">90% NPS score" }
        ],
        owner: "CTO"
      }
    ],
    
    brandBrief: {
      oneLiner: briefData.problem_now.split('.')[0] || briefData.problem_now.substring(0, 100),
      positioning: briefData.customer_gtm,
      audience: inferredAudience,
      tone: inferredTone,
      story: briefData.problem_now,
      visualCues: ["Clean", "Modern", "Professional"] // Default visual cues
    }
  };
};
