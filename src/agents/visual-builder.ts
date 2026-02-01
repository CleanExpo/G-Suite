/**
 * Visual Agent Builder
 *
 * No-code interface for building and configuring AI agents.
 * Phase 11 feature for G-Pilot autonomous orchestration.
 */

import { BaseAgent, AgentContext, AgentPlan, AgentResult, VerificationReport } from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || '',
);

export interface AgentBlock {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'output';
  name: string;
  config: Record<string, unknown>;
  connections: string[];
}

export interface AgentBlueprint {
  id: string;
  name: string;
  description: string;
  blocks: AgentBlock[];
  version: string;
  createdAt: string;
  valid: boolean;
}

export interface BuilderResult {
  blueprint: AgentBlueprint;
  validation: { valid: boolean; errors: string[] };
  preview: string;
}

export class VisualBuilderAgent extends BaseAgent {
  readonly name = 'visual-builder';
  readonly description = 'No-code interface for building and configuring AI agents';
  readonly capabilities = [
    'agent_design',
    'workflow_builder',
    'block_composition',
    'validation',
    'code_generation',
    'template_library',
    'live_preview',
  ];
  readonly requiredSkills = [
    'agent_registry',
    'workflow_engine',
    'code_generator',
    'gemini_3_flash',
  ];

  private readonly model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
    systemInstruction:
      'You are an AI agent architect. You help users design agent workflows using visual building blocks. Ensure all designs are valid and follow best practices.',
  });

  async plan(context: AgentContext): Promise<AgentPlan> {
    this.mode = 'PLANNING';
    this.log('🔧 Planning agent build...', context.mission);

    return {
      steps: [
        {
          id: 'parse',
          action: 'Parse agent requirements',
          tool: 'gemini_3_flash',
          payload: { prompt: `Parse requirements: ${context.mission}` },
        },
        {
          id: 'design',
          action: 'Design agent workflow',
          tool: 'workflow_engine',
          payload: { mode: 'design' },
        },
        {
          id: 'compose',
          action: 'Compose building blocks',
          tool: 'block_composer',
          payload: { action: 'compose' },
        },
        {
          id: 'validate',
          action: 'Validate agent blueprint',
          tool: 'agent_validator',
          payload: { strict: true },
        },
        {
          id: 'generate',
          action: 'Generate agent code',
          tool: 'code_generator',
          payload: { language: 'typescript' },
        },
      ],
      estimatedCost: 100,
      requiredSkills: this.requiredSkills,
      reasoning: 'Visual agent building: parse, design, compose, validate, generate',
    };
  }

  async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
    this.mode = 'EXECUTION';
    this.clearVerificationState();
    this.log('⚡ Building agent...', plan.steps.length + ' steps');

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
            description: `Builder operation: ${step.action}`,
          });
        }
      }

      const builderResult = await this.generateBlueprint(findings, context);

      this.addCompletionCriterion({
        type: 'content_contains',
        target: 'blueprint',
        expected: 'blocks',
      });

      return {
        success: true,
        data: {
          message: 'Agent built successfully',
          result: builderResult,
          taskOutput: this.getTaskOutput(),
        },
        cost: plan.estimatedCost,
        duration: Date.now() - startTime,
        artifacts,
        confidence: 0.92,
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

                Provide agent builder results as JSON:
                {
                    "blocks": [...],
                    "connections": [...],
                    "validation": { "valid": true, "errors": [] }
                }
            `;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch {
      return { blocks: [], connections: [], validation: { valid: false, errors: ['Parse error'] } };
    }
  }

  private async generateBlueprint(
    findings: Record<string, unknown>,
    context: AgentContext,
  ): Promise<BuilderResult> {
    try {
      const prompt = `
                Generate an agent blueprint from this data:
                ${JSON.stringify(findings, null, 2)}

                Mission: ${context.mission}

                Return JSON:
                {
                    "blueprint": {
                        "id": "agent-uuid",
                        "name": "Agent Name",
                        "description": "What this agent does",
                        "blocks": [
                            {
                                "id": "block-1",
                                "type": "trigger|action|condition|output",
                                "name": "Block Name",
                                "config": {},
                                "connections": ["block-2"]
                            }
                        ],
                        "version": "1.0.0",
                        "createdAt": "ISO date",
                        "valid": true
                    },
                    "validation": { "valid": true, "errors": [] },
                    "preview": "Agent preview description"
                }
            `;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch {
      return {
        blueprint: {
          id: 'error',
          name: 'Error',
          description: 'Failed to generate',
          blocks: [],
          version: '0.0.0',
          createdAt: new Date().toISOString(),
          valid: false,
        },
        validation: { valid: false, errors: ['Generation failed'] },
        preview: 'Unable to generate preview',
      };
    }
  }

  async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
    this.mode = 'VERIFICATION';
    this.log('✅ Verifying agent build...');

    const builderResult = result.data?.result as BuilderResult | undefined;

    return {
      passed: result.success && (builderResult?.validation?.valid ?? false),
      checks: [
        {
          name: 'Build Complete',
          passed: result.success,
          message: result.success ? 'Agent built' : result.error,
        },
        {
          name: 'Blueprint Valid',
          passed: builderResult?.blueprint?.valid ?? false,
          message: builderResult?.blueprint?.valid ? 'Blueprint valid' : 'Blueprint invalid',
        },
        {
          name: 'Blocks Defined',
          passed: (builderResult?.blueprint?.blocks?.length ?? 0) > 0,
          message: `${builderResult?.blueprint?.blocks?.length ?? 0} blocks defined`,
        },
        {
          name: 'Validation Passed',
          passed: builderResult?.validation?.valid ?? false,
          message: builderResult?.validation?.errors?.join(', ') || 'No errors',
        },
      ],
      recommendations: builderResult?.validation?.errors ?? ['Review and rebuild agent'],
    };
  }
}
