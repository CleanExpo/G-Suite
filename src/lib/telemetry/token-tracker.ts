/**
 * Phase 9.2: Token Tracking Utility
 *
 * Accumulates token usage across multiple LLM calls within an agent execution.
 * Supports Gemini, OpenAI-compatible, and other LLM providers.
 */

import type { TokenUsage } from '@/agents/base';

/**
 * TokenTracker accumulates token usage across multiple API calls.
 * Create one instance per agent execution, then call `getUsage()` at the end.
 */
export class TokenTracker {
  private promptTokens = 0;
  private completionTokens = 0;
  private model: string | undefined;

  /**
   * Record token usage from a Gemini API response.
   * Accepts either:
   * - GenerateContentResult (has .response.usageMetadata)
   * - EnhancedGenerateContentResponse (has .usageMetadata directly)
   */
  recordGemini(
    result:
      | {
          response?: {
            usageMetadata?: {
              promptTokenCount?: number;
              candidatesTokenCount?: number;
              totalTokenCount?: number;
            };
          };
          usageMetadata?: {
            promptTokenCount?: number;
            candidatesTokenCount?: number;
            totalTokenCount?: number;
          };
        }
      | any, // Allow any for flexibility with different SDK versions
    modelName?: string,
  ): void {
    // Try to get usageMetadata from either location
    const meta = result?.response?.usageMetadata ?? result?.usageMetadata;
    if (meta) {
      this.promptTokens += meta.promptTokenCount ?? 0;
      this.completionTokens += meta.candidatesTokenCount ?? 0;
    }
    if (modelName) {
      this.model = modelName;
    }
  }

  /**
   * Record token usage from an OpenAI-compatible API response.
   * OpenAI returns `response.usage` with prompt_tokens, completion_tokens, total_tokens.
   */
  recordOpenAI(
    response: {
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    },
    modelName?: string,
  ): void {
    const usage = response.usage;
    if (usage) {
      this.promptTokens += usage.prompt_tokens ?? 0;
      this.completionTokens += usage.completion_tokens ?? 0;
    }
    if (modelName) {
      this.model = modelName;
    }
  }

  /**
   * Manually record token usage (for providers without structured responses).
   */
  record(promptTokens: number, completionTokens: number, modelName?: string): void {
    this.promptTokens += promptTokens;
    this.completionTokens += completionTokens;
    if (modelName) {
      this.model = modelName;
    }
  }

  /**
   * Get accumulated token usage for embedding in AgentResult.
   */
  getUsage(): TokenUsage {
    return {
      promptTokens: this.promptTokens,
      completionTokens: this.completionTokens,
      totalTokens: this.promptTokens + this.completionTokens,
      model: this.model,
    };
  }

  /**
   * Estimate cost based on token usage (rough estimates).
   * Returns cost in credits (1 credit ≈ $0.01).
   */
  estimateCost(): number {
    // Rough pricing: $0.01 per 1K tokens average
    // Adjust based on actual model pricing
    const tokensPerCredit = 1000;
    return Math.ceil((this.promptTokens + this.completionTokens) / tokensPerCredit);
  }

  /**
   * Reset tracker for reuse.
   */
  reset(): void {
    this.promptTokens = 0;
    this.completionTokens = 0;
    this.model = undefined;
  }
}

/**
 * Wrap a Gemini model to automatically track token usage.
 * Usage:
 * ```ts
 * const tracker = new TokenTracker();
 * const trackedModel = wrapGeminiModel(model, tracker);
 * const result = await trackedModel.generateContent(prompt);
 * // tracker now has accumulated token usage
 * ```
 */
export function wrapGeminiModel<
  T extends {
    generateContent: (...args: any[]) => Promise<any>;
  },
>(model: T, tracker: TokenTracker, modelName?: string): T {
  const originalGenerate = model.generateContent.bind(model);

  const wrappedGenerate = async (...args: any[]) => {
    const result = await originalGenerate(...args);
    tracker.recordGemini(result.response, modelName);
    return result;
  };

  return {
    ...model,
    generateContent: wrappedGenerate,
  } as T;
}

/**
 * Helper to extract and record token usage from Gemini generateContent result.
 */
export function recordGeminiTokens(
  tracker: TokenTracker,
  result: { response: { usageMetadata?: any } },
  modelName?: string,
): void {
  tracker.recordGemini(result.response, modelName);
}
