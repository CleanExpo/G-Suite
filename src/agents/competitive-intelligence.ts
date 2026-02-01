/**
 * Competitive Intelligence Agent
 *
 * Monitors competitors, tracks market changes, and provides strategic insights.
 * Phase 10.1 feature for G-Pilot autonomous orchestration.
 */

import { BaseAgent, AgentContext, AgentPlan, AgentResult, VerificationReport } from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || '',
);

export interface CompetitorProfile {
  name: string;
  domain: string;
  strengths: string[];
  weaknesses: string[];
  recentChanges: string[];
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
}

export interface MarketIntelligence {
  competitors: CompetitorProfile[];
  marketTrends: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
}

export class CompetitiveIntelligenceAgent extends BaseAgent {
  readonly name = 'competitive-intelligence';
  readonly description =
    'Monitors competitors, tracks market changes, and provides strategic intelligence';
  readonly capabilities = [
    'competitor_monitoring',
    'market_analysis',
    'trend_detection',
    'swot_analysis',
    'pricing_intelligence',
    'feature_comparison',
    'alert_generation',
  ];
  readonly requiredSkills = ['web_intel', 'deep_research', 'web_scraper', 'gemini_3_flash'];

  private readonly model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
    systemInstruction:
      'You are a competitive intelligence analyst with expertise in market research, competitor analysis, and strategic planning. Provide actionable insights based on data.',
  });

  async plan(context: AgentContext): Promise<AgentPlan> {
    this.mode = 'PLANNING';
    this.log('🔍 Planning competitive intelligence gathering...', context.mission);

    const competitorMatch = context.mission.match(/competitors?:\s*([^,]+(?:,\s*[^,]+)*)/i);
    const competitors = competitorMatch ? competitorMatch[1].split(',').map((c) => c.trim()) : [];

    const domainMatch = context.mission.match(/https?:\/\/[^\s]+|[\w-]+\.(?:com|io|co|net|org)/gi);
    const domains = domainMatch || [];

    return {
      steps: [
        {
          id: 'discover',
          action: 'Discover and identify competitors',
          tool: 'deep_research',
          payload: {
            topic: context.mission,
            competitors,
            domains,
          },
        },
        {
          id: 'scrape',
          action: 'Scrape competitor websites for data',
          tool: 'web_scraper',
          payload: { domains },
        },
        {
          id: 'analyse',
          action: 'Analyse competitor positioning and features',
          tool: 'gemini_3_flash',
          payload: {
            prompt: `Analyse competitive landscape for: ${context.mission}`,
          },
        },
        {
          id: 'trends',
          action: 'Identify market trends and shifts',
          tool: 'web_intel',
          payload: { query: `market trends ${context.mission}` },
        },
        {
          id: 'synthesise',
          action: 'Synthesise intelligence report',
          tool: 'gemini_3_flash',
          payload: {
            prompt: 'Generate comprehensive competitive intelligence report',
          },
        },
      ],
      estimatedCost: 150,
      requiredSkills: this.requiredSkills,
      reasoning:
        'Multi-phase competitive analysis: discovery, data collection, analysis, trend detection, synthesis',
    };
  }

  async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
    this.mode = 'EXECUTION';
    this.clearVerificationState();
    this.log('⚡ Executing competitive intelligence gathering...', plan.steps.length + ' steps');

    const startTime = Date.now();
    const artifacts: AgentResult['artifacts'] = [];
    const findings: Record<string, unknown> = {};

    try {
      for (const step of plan.steps) {
        this.log(`Running: ${step.action}`);

        let result: unknown = null;

        if (this.boundSkills.has(step.tool)) {
          result = await this.invokeSkill(step.tool, context.userId, step.payload);
        } else {
          result = await this.executeInternalAnalysis(step, context);
        }

        if (result) {
          findings[step.id] = result;
          artifacts.push({
            type: 'data',
            name: step.id,
            value: result as Record<string, unknown>,
          });

          this.reportOutput({
            type: 'other',
            description: `Competitive intelligence: ${step.action}`,
          });
        }
      }

      const intelligence = await this.synthesiseIntelligence(findings);

      this.addCompletionCriterion({
        type: 'content_contains',
        target: 'intelligence_report',
        expected: 'competitors',
      });

      return {
        success: true,
        data: {
          message: 'Competitive intelligence gathered successfully',
          intelligence,
          taskOutput: this.getTaskOutput(),
        },
        cost: plan.estimatedCost,
        duration: Date.now() - startTime,
        artifacts,
        confidence: 0.85,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        cost: 0,
        duration: Date.now() - startTime,
        artifacts,
      };
    }
  }

  private async executeInternalAnalysis(
    step: { id: string; tool: string; payload: Record<string, unknown> },
    context: AgentContext,
  ): Promise<unknown> {
    try {
      const prompt = `
                Task: ${step.id}
                Mission: ${context.mission}
                Payload: ${JSON.stringify(step.payload)}

                Provide competitive intelligence analysis as JSON:
                {
                    "findings": [...],
                    "insights": [...],
                    "confidence": 0.0-1.0
                }
            `;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch {
      return { findings: [], insights: [], confidence: 0.5 };
    }
  }

  private async synthesiseIntelligence(
    findings: Record<string, unknown>,
  ): Promise<MarketIntelligence> {
    try {
      const prompt = `
                Synthesise this competitive intelligence data into a structured report:
                ${JSON.stringify(findings, null, 2)}

                Return JSON:
                {
                    "competitors": [
                        {
                            "name": "...",
                            "domain": "...",
                            "strengths": [...],
                            "weaknesses": [...],
                            "recentChanges": [...],
                            "marketPosition": "leader|challenger|follower|niche"
                        }
                    ],
                    "marketTrends": [...],
                    "opportunities": [...],
                    "threats": [...],
                    "recommendations": [...]
                }
            `;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch {
      return {
        competitors: [],
        marketTrends: [],
        opportunities: [],
        threats: [],
        recommendations: ['Unable to synthesise - review raw findings'],
      };
    }
  }

  async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
    this.mode = 'VERIFICATION';
    this.log('✅ Verifying competitive intelligence...');

    const intelligence = result.data?.intelligence as MarketIntelligence | undefined;

    return {
      passed: result.success && (intelligence?.competitors?.length ?? 0) > 0,
      checks: [
        {
          name: 'Data Collection',
          passed: result.success,
          message: result.success ? 'Intelligence gathered' : result.error,
        },
        {
          name: 'Competitor Profiles',
          passed: (intelligence?.competitors?.length ?? 0) > 0,
          message: `${intelligence?.competitors?.length ?? 0} competitors profiled`,
        },
        {
          name: 'Market Trends',
          passed: (intelligence?.marketTrends?.length ?? 0) > 0,
          message: `${intelligence?.marketTrends?.length ?? 0} trends identified`,
        },
        {
          name: 'Actionable Insights',
          passed: (intelligence?.recommendations?.length ?? 0) > 0,
          message: `${intelligence?.recommendations?.length ?? 0} recommendations provided`,
        },
      ],
      recommendations: intelligence?.recommendations ?? [
        'Re-run analysis with more specific targets',
      ],
    };
  }
}
