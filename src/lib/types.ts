export type Stage = "idea" | "early_traction" | "angel" | "seed_ready";

export interface PromptInput {
  stage: Stage;
  vision_audience_timing: string;
  hard_decisions: string;
  success_definition: string;
  core_principles: string;
  required_capabilities: string;
  current_state: string;
  vision_purpose: string;
  vision_endstate: string;
  vision_combined?: string; // Combined vision field for wizard UI (gets parsed into vision_purpose + vision_endstate)
}

export interface VisionStatementOutput {
  founderBriefMd: string;
  vcSummaryMd: string;
  runwayMonths: number | null;
}

// Backward compatibility alias
export type BriefOutput = VisionStatementOutput;

export interface VisionStatementData {
  id: string;
  name: string;
  stage: Stage;
  createdAt: string;
  updatedAt: string;
  responses: {
    problem: string;
    customer: string;
    traction: string;
    milestone: string;
    cash: string;
    risk: string;
  };
  founderBrief?: string;
  vcSummary?: string;
}

// Backward compatibility alias
export type BriefData = VisionStatementData;

export interface PromptStep {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  field: keyof VisionStatementData['responses'];
}

export interface SampleVisionStatementData {
  id: string;
  name: string;
  stage: Stage;
  responses: VisionStatementData['responses'];
  founderBrief: string;
  vcSummary: string;
}

// Backward compatibility alias
export type SampleBriefData = SampleVisionStatementData;
