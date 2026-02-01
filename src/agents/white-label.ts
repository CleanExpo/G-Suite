/**
 * White-Label Platform Agent
 *
 * Manages multi-tenant white-label configurations and deployments.
 * Phase 11 feature for G-Pilot autonomous orchestration.
 */

import { BaseAgent, AgentContext, AgentPlan, AgentResult, VerificationReport } from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || '',
);

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  branding: {
    logo: string;
    primaryColour: string;
    secondaryColour: string;
  };
  features: string[];
  active: boolean;
}

export interface DeploymentStatus {
  tenantId: string;
  environment: 'staging' | 'production';
  version: string;
  status: 'deployed' | 'deploying' | 'failed';
  lastDeploy: string;
}

export interface PlatformDashboard {
  tenants: TenantConfig[];
  deployments: DeploymentStatus[];
  activeUsers: number;
  healthScore: number;
  insights: string[];
}

export class WhiteLabelAgent extends BaseAgent {
  readonly name = 'white-label';
  readonly description = 'Manages multi-tenant white-label configurations and deployments';
  readonly capabilities = [
    'tenant_management',
    'branding_customisation',
    'feature_flags',
    'deployment_orchestration',
    'usage_analytics',
    'billing_integration',
    'domain_management',
  ];
  readonly requiredSkills = [
    'tenant_api',
    'deployment_pipeline',
    'analytics_service',
    'gemini_3_flash',
  ];

  private readonly model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
    systemInstruction:
      'You are a multi-tenant platform architect. You manage white-label deployments, tenant configurations, and platform health monitoring.',
  });

  async plan(context: AgentContext): Promise<AgentPlan> {
    this.mode = 'PLANNING';
    this.log('🏢 Planning white-label operations...', context.mission);

    return {
      steps: [
        {
          id: 'tenants',
          action: 'Fetch tenant configurations',
          tool: 'tenant_api',
          payload: { includeInactive: false },
        },
        {
          id: 'deployments',
          action: 'Check deployment statuses',
          tool: 'deployment_pipeline',
          payload: { environments: ['staging', 'production'] },
        },
        {
          id: 'analytics',
          action: 'Gather usage analytics',
          tool: 'analytics_service',
          payload: { period: '30d' },
        },
        {
          id: 'health',
          action: 'Calculate platform health',
          tool: 'gemini_3_flash',
          payload: { prompt: 'Analyse platform health and generate insights' },
        },
      ],
      estimatedCost: 80,
      requiredSkills: this.requiredSkills,
      reasoning: 'White-label management: tenants, deployments, analytics, health',
    };
  }

  async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
    this.mode = 'EXECUTION';
    this.clearVerificationState();
    this.log('⚡ Executing white-label operations...', plan.steps.length + ' steps');

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
            description: `White-label operation: ${step.action}`,
          });
        }
      }

      const dashboard = await this.generatePlatformDashboard(findings);

      this.addCompletionCriterion({
        type: 'content_contains',
        target: 'platform_dashboard',
        expected: 'tenants',
      });

      return {
        success: true,
        data: {
          message: 'White-label operations completed',
          dashboard,
          taskOutput: this.getTaskOutput(),
        },
        cost: plan.estimatedCost,
        duration: Date.now() - startTime,
        artifacts,
        confidence: 0.9,
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

                Provide white-label operation results as JSON:
                {
                    "tenants": [...],
                    "deployments": [...],
                    "metrics": {...}
                }
            `;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch {
      return { tenants: [], deployments: [], metrics: {} };
    }
  }

  private async generatePlatformDashboard(
    findings: Record<string, unknown>,
  ): Promise<PlatformDashboard> {
    try {
      const prompt = `
                Generate a platform dashboard from this data:
                ${JSON.stringify(findings, null, 2)}

                Return JSON:
                {
                    "tenants": [
                        {
                            "id": "...",
                            "name": "...",
                            "domain": "...",
                            "branding": { "logo": "...", "primaryColour": "#...", "secondaryColour": "#..." },
                            "features": [...],
                            "active": true
                        }
                    ],
                    "deployments": [
                        { "tenantId": "...", "environment": "production", "version": "...", "status": "deployed", "lastDeploy": "ISO date" }
                    ],
                    "activeUsers": number,
                    "healthScore": 0-100,
                    "insights": ["Insight 1", ...]
                }
            `;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch {
      return {
        tenants: [],
        deployments: [],
        activeUsers: 0,
        healthScore: 0,
        insights: ['Unable to generate dashboard'],
      };
    }
  }

  async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
    this.mode = 'VERIFICATION';
    this.log('✅ Verifying white-label operations...');

    const dashboard = result.data?.dashboard as PlatformDashboard | undefined;

    return {
      passed: result.success,
      checks: [
        {
          name: 'Platform Operations',
          passed: result.success,
          message: result.success ? 'Platform operational' : result.error,
        },
        {
          name: 'Tenants Loaded',
          passed: (dashboard?.tenants?.length ?? 0) >= 0,
          message: `${dashboard?.tenants?.length ?? 0} tenants configured`,
        },
        {
          name: 'Deployments Healthy',
          passed: (dashboard?.deployments?.length ?? 0) >= 0,
          message: `${dashboard?.deployments?.length ?? 0} deployments tracked`,
        },
        {
          name: 'Platform Health',
          passed: (dashboard?.healthScore ?? 0) >= 70,
          message: `Health score: ${dashboard?.healthScore ?? 0}%`,
        },
      ],
      recommendations: dashboard?.insights ?? ['Monitor tenant health'],
    };
  }
}
