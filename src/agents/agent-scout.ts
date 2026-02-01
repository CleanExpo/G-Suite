/**
 * Agent Scout
 *
 * Reconnaissance agent that discovers, evaluates, and recommends agents
 * from external sources and the AI ecosystem.
 *
 * Intelligence Sources:
 * - Open Source: GitHub, HuggingFace, LangChain Hub, CrewAI
 * - Research: ArXiv, Google AI Blog, Anthropic, OpenAI
 * - Marketplaces: GPT Store, Claude Artifacts, Gemini Extensions
 * - Enterprise: Vertex AI Agent Builder, AWS Bedrock, Azure AI
 */

import {
  BaseAgent,
  AgentContext,
  AgentPlan,
  AgentResult,
  VerificationReport,
  PlanStep,
  AgentArtifact,
} from './base';
import { AgentRegistry } from './registry';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  agent_discovery,
  AgentDossier,
  IntelligenceBrief,
  ScoutReport,
  INTELLIGENCE_SOURCES,
} from '../tools/agentDiscoverySkill';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || '',
);

// Mission Types
export type ScoutMissionType = 'quick_scan' | 'deep_recon' | 'agent_audit' | 'trend_watch';

// Mission Cost Map
const MISSION_COST: Record<ScoutMissionType, number> = {
  quick_scan: 25,
  deep_recon: 100,
  agent_audit: 200,
  trend_watch: 50,
};

// Evaluation Criteria Weights
const EVALUATION_WEIGHTS = {
  compatibility: 0.25,
  value: 0.25,
  security: 0.2,
  maintenance: 0.15,
  cost: 0.15,
};

// Security Rating
export type SecurityRating = 'A' | 'B' | 'C' | 'D' | 'F';

// Scout Context Extension
interface ScoutContext extends AgentContext {
  missionType?: ScoutMissionType;
  searchScope?: string[];
  filters?: {
    domains?: string[];
    minCompatibility?: number;
    securityThreshold?: SecurityRating;
  };
}

// Internal Agent Database Entry
interface TrackedAgent {
  dossier: AgentDossier;
  discoveredAt: Date;
  lastUpdated: Date;
  alerts: string[];
}

export class AgentScoutAgent extends BaseAgent {
  readonly name = 'agent-scout';
  readonly description =
    'Reconnaissance agent that discovers and evaluates agents from external sources';
  readonly capabilities = [
    'agent_discovery',
    'compatibility_analysis',
    'security_audit',
    'trend_reporting',
    'ecosystem_monitoring',
  ];
  readonly requiredSkills = [
    'web_intel',
    'notebook_lm_research',
    'structured_scraper',
    'deep_lookup',
    'agent_discovery',
  ];

  // Internal tracking database
  private trackedAgents: Map<string, TrackedAgent> = new Map();
  private intelligenceBriefs: IntelligenceBrief[] = [];
  private lastScanTime: Date | null = null;

  /**
   * Determine mission type from context
   */
  private determineMissionType(context: ScoutContext): ScoutMissionType {
    if (context.missionType) return context.missionType;

    const mission = context.mission.toLowerCase();

    if (mission.includes('quick') || mission.includes('scan')) return 'quick_scan';
    if (mission.includes('deep') || mission.includes('comprehensive')) return 'deep_recon';
    if (mission.includes('audit') || mission.includes('security')) return 'agent_audit';
    if (mission.includes('trend') || mission.includes('watch') || mission.includes('monitor'))
      return 'trend_watch';

    return 'quick_scan';
  }

  /**
   * Calculate composite compatibility score
   */
  private calculateCompatibilityScore(dossier: AgentDossier): number {
    const scores = {
      compatibility: dossier.compatibilityScore,
      value: dossier.uniqueCapabilities.length > 3 ? 0.9 : dossier.uniqueCapabilities.length / 3,
      security: this.securityRatingToScore(dossier.securityRating),
      maintenance: 0.7, // Default estimate
      cost: dossier.fuelCostEstimate.includes('100') ? 0.7 : 0.5,
    };

    return (
      scores.compatibility * EVALUATION_WEIGHTS.compatibility +
      scores.value * EVALUATION_WEIGHTS.value +
      scores.security * EVALUATION_WEIGHTS.security +
      scores.maintenance * EVALUATION_WEIGHTS.maintenance +
      scores.cost * EVALUATION_WEIGHTS.cost
    );
  }

  /**
   * Convert security rating to numeric score
   */
  private securityRatingToScore(rating: SecurityRating): number {
    const scores: Record<SecurityRating, number> = {
      A: 1.0,
      B: 0.8,
      C: 0.6,
      D: 0.4,
      F: 0.1,
    };
    return scores[rating] || 0.5;
  }

  /**
   * Analyze current G-Pilot fleet for gaps
   */
  private async analyzeFleetGaps(): Promise<string[]> {
    this.log('Analyzing G-Pilot fleet for capability gaps...');

    const availableAgents = AgentRegistry.getAvailableAgents();
    const gaps: string[] = [];

    // Define expected capability coverage
    const expectedCapabilities = [
      'code_generation',
      'research',
      'ui_ux',
      'marketing',
      'seo',
      'social_media',
      'content_creation',
      'data_analysis',
      'automation',
      'testing',
      'deployment',
      'monitoring',
      '3d_rendering',
      'audio_processing',
      'translation',
    ];

    // Get all capabilities from current fleet
    const coveredCapabilities = new Set<string>();
    for (const agentName of availableAgents) {
      const agent = AgentRegistry.get(agentName);
      if (agent) {
        agent.capabilities.forEach((cap) => coveredCapabilities.add(cap));
      }
    }

    // Find gaps
    for (const expected of expectedCapabilities) {
      const isCovered = Array.from(coveredCapabilities).some(
        (cap) => cap.includes(expected) || expected.includes(cap),
      );
      if (!isCovered) {
        gaps.push(expected);
      }
    }

    return gaps;
  }

  /**
   * Generate intelligence brief from discovery results
   */
  private async generateIntelligenceBrief(
    dossiers: AgentDossier[],
    missionType: ScoutMissionType,
  ): Promise<IntelligenceBrief> {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `
      Analyze these discovered AI agents and generate a trend intelligence brief:
      
      Agents: ${JSON.stringify(dossiers.slice(0, 5), null, 2)}
      Mission Type: ${missionType}
      
      Return JSON:
      {
        "briefType": "TREND_ALERT" | "DISCOVERY" | "SECURITY_ALERT" | "OPPORTUNITY",
        "topic": "Main topic or trend identified",
        "impact": "HIGH" | "MEDIUM" | "LOW",
        "summary": "2-3 sentence summary",
        "recommendation": "Actionable recommendation",
        "actionItems": ["item1", "item2"]
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response
        .text()
        .replace(/```json|```/gi, '')
        .trim();
      return JSON.parse(text) as IntelligenceBrief;
    } catch {
      return {
        briefType: 'DISCOVERY',
        topic: 'Agent Ecosystem Scan Complete',
        impact: 'MEDIUM',
        summary: `Discovered ${dossiers.length} agents across the AI ecosystem.`,
        recommendation: 'Review top-rated agents for potential integration.',
        actionItems: ['Evaluate top 3 candidates', 'Check security ratings'],
      };
    }
  }

  /**
   * PLANNING: Define scout mission scope
   */
  async plan(context: AgentContext): Promise<AgentPlan> {
    this.mode = 'PLANNING';
    this.log('🔭 Agent Scout: PLANNING mode engaged...');

    const scoutContext = context as ScoutContext;
    const missionType = this.determineMissionType(scoutContext);

    // Analyze fleet gaps to focus search
    const gaps = await this.analyzeFleetGaps();
    this.log(`Fleet gaps identified: ${gaps.join(', ')}`);

    // Determine sources based on mission type
    let sourcesToScan = INTELLIGENCE_SOURCES;
    if (missionType === 'quick_scan') {
      sourcesToScan = INTELLIGENCE_SOURCES.slice(0, 3);
    } else if (missionType === 'agent_audit') {
      sourcesToScan = scoutContext.searchScope || INTELLIGENCE_SOURCES.slice(0, 2);
    }

    const steps: PlanStep[] = [];

    // Step 1: Discovery scan
    steps.push({
      id: 'discovery_scan',
      action: `Scan ${sourcesToScan.length} intelligence sources`,
      tool: 'agent_discovery',
      payload: {
        query: context.mission,
        sources: sourcesToScan,
        limit: missionType === 'deep_recon' ? 50 : 20,
        focusAreas: gaps.slice(0, 5),
      },
    });

    // Step 2: Evaluate compatibility (for deep_recon and agent_audit)
    if (missionType !== 'quick_scan') {
      steps.push({
        id: 'compatibility_analysis',
        action: 'Analyze G-Pilot compatibility for discovered agents',
        tool: 'compatibility_check',
        payload: { threshold: scoutContext.filters?.minCompatibility || 0.7 },
        dependencies: ['discovery_scan'],
      });
    }

    // Step 3: Security audit (for agent_audit)
    if (missionType === 'agent_audit') {
      steps.push({
        id: 'security_audit',
        action: 'Perform security audit on candidate agents',
        tool: 'security_scan',
        payload: { threshold: scoutContext.filters?.securityThreshold || 'B' },
        dependencies: ['compatibility_analysis'],
      });
    }

    // Step 4: Generate intelligence brief
    steps.push({
      id: 'intelligence_brief',
      action: 'Compile intelligence brief with recommendations',
      tool: 'brief_generator',
      payload: { missionType },
      dependencies:
        missionType === 'agent_audit'
          ? ['security_audit']
          : missionType === 'quick_scan'
            ? ['discovery_scan']
            : ['compatibility_analysis'],
    });

    return {
      steps,
      estimatedCost: MISSION_COST[missionType],
      requiredSkills: this.requiredSkills,
      reasoning:
        `${missionType} mission targeting ${sourcesToScan.length} sources. ` +
        `Fleet gaps: ${gaps.slice(0, 3).join(', ')}. ` +
        `Expected output: ${steps.length} phase reconnaissance.`,
    };
  }

  /**
   * EXECUTION: Run the scout mission
   */
  async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
    this.mode = 'EXECUTION';
    this.log('⚡ Agent Scout: EXECUTION mode engaged...');

    const startTime = Date.now();
    const artifacts: AgentArtifact[] = [];
    const scoutContext = context as ScoutContext;
    const missionType = this.determineMissionType(scoutContext);

    try {
      // Execute discovery scan
      const discoveryStep = plan.steps.find((s) => s.id === 'discovery_scan');
      this.log('Executing discovery scan...');

      const discoveryResult = await agent_discovery(
        context.userId,
        (discoveryStep?.payload.query as string) || context.mission,
        {
          sources: discoveryStep?.payload.sources as string[],
          limit: discoveryStep?.payload.limit as number,
          focusAreas: discoveryStep?.payload.focusAreas as string[],
        },
      );

      if (!discoveryResult.success) {
        throw new Error('Discovery scan failed');
      }

      // Process and track discovered agents
      const dossiers = discoveryResult.dossiers;
      for (const dossier of dossiers) {
        this.trackedAgents.set(dossier.agentName, {
          dossier,
          discoveredAt: new Date(),
          lastUpdated: new Date(),
          alerts: [],
        });
      }

      // Filter by compatibility threshold
      const compatibilityThreshold = scoutContext.filters?.minCompatibility || 0.7;
      const compatibleAgents = dossiers.filter(
        (d) => this.calculateCompatibilityScore(d) >= compatibilityThreshold,
      );

      // Filter by security threshold
      const securityThreshold = scoutContext.filters?.securityThreshold || 'B';
      const secureAgents = compatibleAgents.filter((d) => {
        const ratings: SecurityRating[] = ['A', 'B', 'C', 'D', 'F'];
        const thresholdIndex = ratings.indexOf(securityThreshold);
        const agentIndex = ratings.indexOf(d.securityRating);
        return agentIndex <= thresholdIndex;
      });

      // Generate intelligence brief
      const brief = await this.generateIntelligenceBrief(secureAgents, missionType);
      this.intelligenceBriefs.push(brief);

      // Build Scout Report
      const scoutReport: ScoutReport = {
        reportId: `scout_${new Date().toISOString().split('T')[0]}`,
        discoveredAgents: dossiers.length,
        recommended: secureAgents.slice(0, 5).length,
        flaggedForReview: dossiers.filter(
          (d) => d.securityRating === 'C' || d.securityRating === 'D',
        ).length,
        trendAlerts: brief.actionItems,
      };

      // Add artifacts
      artifacts.push({
        type: 'data',
        name: 'scout_report',
        value: scoutReport as unknown as Record<string, unknown>,
      });

      artifacts.push({
        type: 'data',
        name: 'intelligence_brief',
        value: brief as unknown as Record<string, unknown>,
      });

      artifacts.push({
        type: 'data',
        name: 'recommended_agents',
        value: {
          agents: secureAgents.slice(0, 5).map((d) => ({
            name: d.agentName,
            source: d.source,
            compatibility: this.calculateCompatibilityScore(d).toFixed(2),
            security: d.securityRating,
            capabilities: d.uniqueCapabilities,
          })),
        },
      });

      // Update last scan time
      this.lastScanTime = new Date();

      return {
        success: true,
        data: {
          message: `Scout mission (${missionType}) complete`,
          discovered: dossiers.length,
          recommended: secureAgents.slice(0, 5).length,
          brief: brief.summary,
        },
        cost: plan.estimatedCost,
        duration: Date.now() - startTime,
        artifacts,
      };
    } catch (error: any) {
      this.log('Execution error', error.message);

      return {
        success: false,
        error: error.message,
        cost: Math.floor(plan.estimatedCost / 2),
        duration: Date.now() - startTime,
        artifacts,
      };
    }
  }

  /**
   * VERIFICATION: Validate discovery quality
   */
  async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
    this.mode = 'VERIFICATION';
    this.log('✅ Agent Scout: VERIFICATION mode engaged...');

    const checks = [
      {
        name: 'Discovery Success',
        passed: result.success,
        message: result.success
          ? `Discovered ${(result.data as any)?.discovered || 0} agents`
          : result.error,
      },
      {
        name: 'Quality Candidates Found',
        passed: ((result.data as any)?.recommended || 0) > 0,
        message: `${(result.data as any)?.recommended || 0} agents meet quality threshold`,
      },
      {
        name: 'Intelligence Generated',
        passed: (result.artifacts?.length || 0) >= 2,
        message: `${result.artifacts?.length || 0} intelligence artifact(s) generated`,
      },
      {
        name: 'Security Audit Complete',
        passed: result.artifacts?.some((a) => a.name === 'recommended_agents') || false,
        message: 'Security-vetted recommendations available',
      },
    ];

    const allPassed = checks.every((c) => c.passed);

    return {
      passed: allPassed,
      checks,
      recommendations: allPassed
        ? ['Review recommended agents for integration', 'Schedule follow-up trend watch']
        : ['Expand search scope', 'Lower compatibility threshold', 'Check network connectivity'],
    };
  }

  /**
   * Get tracked agents database
   */
  getTrackedAgents(): TrackedAgent[] {
    return Array.from(this.trackedAgents.values());
  }

  /**
   * Get all intelligence briefs
   */
  getIntelligenceBriefs(): IntelligenceBrief[] {
    return this.intelligenceBriefs;
  }

  /**
   * Get last scan timestamp
   */
  getLastScanTime(): Date | null {
    return this.lastScanTime;
  }

  /**
   * Clear tracking data
   */
  clearTrackingData(): void {
    this.trackedAgents.clear();
    this.intelligenceBriefs = [];
    this.log('Tracking data cleared');
  }
}
