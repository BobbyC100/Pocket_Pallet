export type Stage = "idea" | "early_traction" | "angel" | "seed_ready";

export interface PromptInput {
  stage: Stage;
  vision_audience_timing: string;
  hard_decisions: string;
  success_definition: string;
  core_principles: string;
  required_capabilities: string;
  current_state: string;
}

export interface BriefOutput {
  founderBriefMd: string;
  vcSummaryMd: string;
  runwayMonths: number | null;
}

export interface BriefData {
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

export interface PromptStep {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  field: keyof BriefData['responses'];
}

export interface SampleBriefData {
  id: string;
  name: string;
  stage: Stage;
  responses: BriefData['responses'];
  founderBrief: string;
  vcSummary: string;
}
