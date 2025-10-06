/**
 * AI Cost Tracking Utility
 * Tracks API costs for monitoring and optimization
 */

// Pricing as of October 2025 (update as needed)
export const AI_COSTS = {
  'gpt-4-turbo-preview': {
    input: 0.01 / 1000,  // $0.01 per 1K tokens
    output: 0.03 / 1000   // $0.03 per 1K tokens
  },
  'gpt-4': {
    input: 0.03 / 1000,
    output: 0.06 / 1000
  },
  'gpt-3.5-turbo': {
    input: 0.001 / 1000,
    output: 0.002 / 1000
  },
  'gemini-pro': {
    input: 0.00025 / 1000,
    output: 0.0005 / 1000
  },
  'gemini-flash': {
    input: 0.00005 / 1000,
    output: 0.0001 / 1000
  }
} as const;

export type AIModel = keyof typeof AI_COSTS;

interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  tokens: TokenUsage;
  model: AIModel;
}

/**
 * Calculate cost for AI API call
 */
export function calculateCost(
  model: AIModel,
  tokens: TokenUsage
): CostBreakdown {
  const pricing = AI_COSTS[model];
  
  if (!pricing) {
    console.warn(`Unknown model: ${model}, using default pricing`);
    return {
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
      tokens,
      model
    };
  }
  
  const inputCost = tokens.input * pricing.input;
  const outputCost = tokens.output * pricing.output;
  const totalCost = inputCost + outputCost;
  
  return {
    inputCost,
    outputCost,
    totalCost,
    tokens,
    model
  };
}

/**
 * Track cost to database and console
 */
export async function trackCost(
  operation: string,
  cost: CostBreakdown,
  metadata?: Record<string, any>
) {
  // Log to console
  console.log(JSON.stringify({
    type: 'ai_cost',
    operation,
    cost: {
      total: cost.totalCost.toFixed(4),
      input: cost.inputCost.toFixed(4),
      output: cost.outputCost.toFixed(4)
    },
    tokens: cost.tokens,
    model: cost.model,
    timestamp: new Date().toISOString(),
    ...metadata
  }));
  
  // Save to database
  try {
    const { db } = await import('./db');
    const { costEvents } = await import('./db/schema');
    
    await db.insert(costEvents).values({
      id: metadata?.requestId || `cost_${Date.now()}`,
      operation,
      model: cost.model,
      inputTokens: String(cost.tokens.input),
      outputTokens: String(cost.tokens.output),
      totalTokens: String(cost.tokens.total),
      inputCost: String(cost.inputCost),
      outputCost: String(cost.outputCost),
      totalCost: String(cost.totalCost),
      userId: metadata?.userId,
      anonymousId: metadata?.anonymousId,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to track cost to DB:', error);
    // Don't throw - tracking failure shouldn't break the app
  }
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 100).toFixed(2)}¢`;
  }
  return `$${cost.toFixed(4)}`;
}

/**
 * Estimate cost before making API call
 */
export function estimateCost(
  model: AIModel,
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): CostBreakdown {
  return calculateCost(model, {
    input: estimatedInputTokens,
    output: estimatedOutputTokens,
    total: estimatedInputTokens + estimatedOutputTokens
  });
}

/**
 * Compare costs between models
 */
export function compareCosts(
  tokens: TokenUsage
): Record<AIModel, number> {
  const comparison: Record<string, number> = {};
  
  for (const model of Object.keys(AI_COSTS) as AIModel[]) {
    const cost = calculateCost(model, tokens);
    comparison[model] = cost.totalCost;
  }
  
  return comparison as Record<AIModel, number>;
}

/**
 * Get cheapest model for operation
 */
export function getCheapestModel(
  tokens: TokenUsage,
  allowedModels?: AIModel[]
): { model: AIModel; cost: number } {
  const models = allowedModels || (Object.keys(AI_COSTS) as AIModel[]);
  const costs = compareCosts(tokens);
  
  let cheapest: { model: AIModel; cost: number } = {
    model: models[0],
    cost: costs[models[0]]
  };
  
  for (const model of models) {
    if (costs[model] < cheapest.cost) {
      cheapest = { model, cost: costs[model] };
    }
  }
  
  return cheapest;
}

