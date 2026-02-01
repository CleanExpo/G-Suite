/**
 * Per-Agent Cost Telemetry Collector
 *
 * Phase 9.2: Captures token usage, API call costs, execution duration,
 * and resource consumption for each agent during mission execution.
 */

import type { AgentResult } from '@/agents/base';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AgentCostEntry {
  agentName: string;
  tokens: number; // Total tokens used (input + output)
  cost: number; // Cost in credits
  duration: number; // Duration in ms
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  success: boolean;
}

/** Per-agent cost map stored in Mission.agentCosts JSON field */
export type AgentCostsMap = Record<string, AgentCostEntry>;

// ─── Collector ──────────────────────────────────────────────────────────────

export class CostCollector {
  private entries: AgentCostEntry[] = [];

  /**
   * Begin tracking an agent's execution.
   * Returns a `stop` callback to finalize the entry when the agent completes.
   */
  startAgent(agentName: string): { stop: (result: AgentResult) => void } {
    const startTime = new Date().toISOString();
    const startMs = Date.now();

    return {
      stop: (result: AgentResult) => {
        const endTime = new Date().toISOString();
        const duration = result.duration || Date.now() - startMs;

        // Phase 9.2: Extract token count from result.tokensUsed (preferred)
        // Fall back to result.data.tokensUsed or result.data.tokens for backward compat
        let tokens = 0;
        if (result.tokensUsed) {
          tokens = result.tokensUsed.totalTokens ?? 0;
        } else {
          const data = result.data as Record<string, any> | undefined;
          tokens = data?.tokensUsed?.totalTokens ?? data?.tokensUsed ?? data?.tokens ?? 0;
        }

        this.entries.push({
          agentName,
          tokens,
          cost: result.cost || 0,
          duration,
          startTime,
          endTime,
          success: result.success,
        });
      },
    };
  }

  /** All recorded entries */
  getEntries(): AgentCostEntry[] {
    return [...this.entries];
  }

  /** Convert to a keyed map (last entry wins if duplicate agent names) */
  toMap(): AgentCostsMap {
    const map: AgentCostsMap = {};
    for (const entry of this.entries) {
      map[entry.agentName] = entry;
    }
    return map;
  }

  /** Sum of all agent costs */
  getTotalCost(): number {
    return this.entries.reduce((sum, e) => sum + e.cost, 0);
  }

  /** Sum of all tokens consumed */
  getTotalTokens(): number {
    return this.entries.reduce((sum, e) => sum + e.tokens, 0);
  }

  /** Total wall-clock duration across all agents */
  getTotalDuration(): number {
    return this.entries.reduce((sum, e) => sum + e.duration, 0);
  }
}
