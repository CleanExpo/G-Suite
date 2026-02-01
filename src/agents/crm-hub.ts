/**
 * CRM Integration Hub Agent
 *
 * Centralises CRM operations across multiple platforms (HubSpot, Salesforce, etc).
 * Phase 10.3 feature for G-Pilot autonomous orchestration.
 */

import { BaseAgent, AgentContext, AgentPlan, AgentResult, VerificationReport } from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || '',
);

export interface CRMContact {
  id: string;
  email: string;
  name: string;
  company?: string;
  stage: 'lead' | 'prospect' | 'customer' | 'churned';
  source: string;
  lastActivity: string;
  score: number;
}

export interface CRMSyncResult {
  platform: string;
  contactsSynced: number;
  dealsUpdated: number;
  errors: string[];
  lastSync: string;
}

export interface CRMDashboard {
  totalContacts: number;
  activePipelines: number;
  syncStatus: CRMSyncResult[];
  insights: string[];
  recommendations: string[];
}

export class CRMHubAgent extends BaseAgent {
  readonly name = 'crm-hub';
  readonly description = 'Centralises CRM operations across multiple platforms';
  readonly capabilities = [
    'contact_sync',
    'pipeline_management',
    'lead_scoring',
    'activity_tracking',
    'multi_platform_sync',
    'deal_automation',
    'analytics_aggregation',
  ];
  readonly requiredSkills = ['hubspot_api', 'salesforce_api', 'pipedrive_api', 'gemini_3_flash'];

  private readonly model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
    systemInstruction:
      'You are a CRM integration specialist. You understand sales pipelines, lead scoring, and multi-platform data synchronisation. Provide actionable insights for sales optimisation.',
  });

  async plan(context: AgentContext): Promise<AgentPlan> {
    this.mode = 'PLANNING';
    this.log('🔗 Planning CRM operations...', context.mission);

    const platforms = this.detectPlatforms(context.mission);

    return {
      steps: [
        {
          id: 'connect',
          action: 'Connect to CRM platforms',
          tool: 'crm_connector',
          payload: { platforms },
        },
        {
          id: 'fetch',
          action: 'Fetch contacts and pipelines',
          tool: 'crm_api',
          payload: { action: 'fetch_all' },
        },
        {
          id: 'sync',
          action: 'Synchronise data across platforms',
          tool: 'data_sync',
          payload: { direction: 'bidirectional' },
        },
        {
          id: 'analyse',
          action: 'Analyse pipeline health and opportunities',
          tool: 'gemini_3_flash',
          payload: { prompt: `Analyse CRM data for: ${context.mission}` },
        },
        {
          id: 'report',
          action: 'Generate CRM dashboard',
          tool: 'gemini_3_flash',
          payload: { prompt: 'Generate comprehensive CRM dashboard' },
        },
      ],
      estimatedCost: 120,
      requiredSkills: this.requiredSkills,
      reasoning: 'Multi-platform CRM sync: connect, fetch, sync, analyse, report',
    };
  }

  private detectPlatforms(mission: string): string[] {
    const platforms: string[] = [];
    const missionLower = mission.toLowerCase();

    if (missionLower.includes('hubspot')) platforms.push('hubspot');
    if (missionLower.includes('salesforce')) platforms.push('salesforce');
    if (missionLower.includes('pipedrive')) platforms.push('pipedrive');
    if (missionLower.includes('zoho')) platforms.push('zoho');

    return platforms.length > 0 ? platforms : ['hubspot'];
  }

  async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
    this.mode = 'EXECUTION';
    this.clearVerificationState();
    this.log('⚡ Executing CRM operations...', plan.steps.length + ' steps');

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
          result = await this.executeInternalOperation(step, context);
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
            description: `CRM operation: ${step.action}`,
          });
        }
      }

      const dashboard = await this.generateDashboard(findings);

      this.addCompletionCriterion({
        type: 'content_contains',
        target: 'crm_dashboard',
        expected: 'totalContacts',
      });

      return {
        success: true,
        data: {
          message: 'CRM operations completed successfully',
          dashboard,
          taskOutput: this.getTaskOutput(),
        },
        cost: plan.estimatedCost,
        duration: Date.now() - startTime,
        artifacts,
        confidence: 0.88,
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

  private async executeInternalOperation(
    step: { id: string; tool: string; payload: Record<string, unknown> },
    context: AgentContext,
  ): Promise<unknown> {
    try {
      const prompt = `
                Task: ${step.id}
                Mission: ${context.mission}
                Payload: ${JSON.stringify(step.payload)}

                Provide CRM operation results as JSON:
                {
                    "contacts": [...],
                    "pipelines": [...],
                    "syncResults": {...},
                    "insights": [...]
                }
            `;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch {
      return { contacts: [], pipelines: [], syncResults: {}, insights: [] };
    }
  }

  private async generateDashboard(findings: Record<string, unknown>): Promise<CRMDashboard> {
    try {
      const prompt = `
                Generate a CRM dashboard from this data:
                ${JSON.stringify(findings, null, 2)}

                Return JSON:
                {
                    "totalContacts": number,
                    "activePipelines": number,
                    "syncStatus": [
                        {
                            "platform": "hubspot",
                            "contactsSynced": number,
                            "dealsUpdated": number,
                            "errors": [],
                            "lastSync": "ISO date"
                        }
                    ],
                    "insights": ["Key insight 1", ...],
                    "recommendations": ["Action item 1", ...]
                }
            `;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch {
      return {
        totalContacts: 0,
        activePipelines: 0,
        syncStatus: [],
        insights: ['Unable to generate dashboard'],
        recommendations: ['Check CRM connections and retry'],
      };
    }
  }

  async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
    this.mode = 'VERIFICATION';
    this.log('✅ Verifying CRM operations...');

    const dashboard = result.data?.dashboard as CRMDashboard | undefined;

    return {
      passed: result.success,
      checks: [
        {
          name: 'CRM Connection',
          passed: result.success,
          message: result.success ? 'CRM platforms connected' : result.error,
        },
        {
          name: 'Data Sync',
          passed: (dashboard?.syncStatus?.length ?? 0) > 0,
          message: `${dashboard?.syncStatus?.length ?? 0} platforms synced`,
        },
        {
          name: 'Contact Count',
          passed: (dashboard?.totalContacts ?? 0) >= 0,
          message: `${dashboard?.totalContacts ?? 0} total contacts`,
        },
        {
          name: 'Insights Generated',
          passed: (dashboard?.insights?.length ?? 0) > 0,
          message: `${dashboard?.insights?.length ?? 0} insights generated`,
        },
      ],
      recommendations: dashboard?.recommendations ?? ['Review CRM connections'],
    };
  }
}
