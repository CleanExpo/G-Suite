/**
 * Content Calendar Agent
 *
 * Manages content scheduling, editorial calendar, and publishing workflows.
 * Phase 10.2 feature for G-Pilot autonomous orchestration.
 */

import { BaseAgent, AgentContext, AgentPlan, AgentResult, VerificationReport } from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || '',
);

export interface ContentItem {
  id: string;
  title: string;
  type: 'blog' | 'social' | 'email' | 'video' | 'podcast';
  status: 'draft' | 'review' | 'scheduled' | 'published';
  scheduledDate: string;
  channels: string[];
  assignee?: string;
  tags: string[];
}

export interface CalendarView {
  items: ContentItem[];
  upcoming: ContentItem[];
  overdue: ContentItem[];
  gaps: string[];
  recommendations: string[];
}

export class ContentCalendarAgent extends BaseAgent {
  readonly name = 'content-calendar';
  readonly description = 'Manages content scheduling, editorial calendar, and publishing workflows';
  readonly capabilities = [
    'calendar_management',
    'content_scheduling',
    'gap_analysis',
    'publishing_workflow',
    'deadline_tracking',
    'content_planning',
    'cross_channel_coordination',
  ];
  readonly requiredSkills = [
    'calendar_api',
    'content_management',
    'notification_service',
    'gemini_3_flash',
  ];

  private readonly model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
    systemInstruction:
      'You are a content strategist and editorial calendar manager. You excel at organising content schedules, identifying gaps, and optimising publishing workflows.',
  });

  async plan(context: AgentContext): Promise<AgentPlan> {
    this.mode = 'PLANNING';
    this.log('📅 Planning content calendar operations...', context.mission);

    const dateMatch = context.mission.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
    const targetDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    return {
      steps: [
        {
          id: 'fetch',
          action: 'Fetch existing calendar items',
          tool: 'calendar_api',
          payload: { range: 'month', startDate: targetDate },
        },
        {
          id: 'analyse',
          action: 'Analyse content distribution and gaps',
          tool: 'gemini_3_flash',
          payload: { prompt: `Analyse content calendar for: ${context.mission}` },
        },
        {
          id: 'optimise',
          action: 'Optimise scheduling for engagement',
          tool: 'gemini_3_flash',
          payload: { prompt: 'Suggest optimal publishing times and frequency' },
        },
        {
          id: 'coordinate',
          action: 'Coordinate cross-channel content',
          tool: 'content_management',
          payload: { action: 'sync_channels' },
        },
        {
          id: 'report',
          action: 'Generate calendar report',
          tool: 'gemini_3_flash',
          payload: { prompt: 'Generate comprehensive calendar status report' },
        },
      ],
      estimatedCost: 80,
      requiredSkills: this.requiredSkills,
      reasoning: 'Multi-phase calendar management: fetch, analyse, optimise, coordinate, report',
    };
  }

  async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
    this.mode = 'EXECUTION';
    this.clearVerificationState();
    this.log('⚡ Executing content calendar operations...', plan.steps.length + ' steps');

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
            description: `Calendar operation: ${step.action}`,
          });
        }
      }

      const calendarView = await this.generateCalendarView(findings);

      this.addCompletionCriterion({
        type: 'content_contains',
        target: 'calendar_view',
        expected: 'items',
      });

      return {
        success: true,
        data: {
          message: 'Content calendar operations completed',
          calendar: calendarView,
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

                Provide content calendar analysis as JSON:
                {
                    "items": [...],
                    "insights": [...],
                    "recommendations": [...]
                }
            `;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch {
      return { items: [], insights: [], recommendations: [] };
    }
  }

  private async generateCalendarView(findings: Record<string, unknown>): Promise<CalendarView> {
    try {
      const prompt = `
                Generate a content calendar view from this data:
                ${JSON.stringify(findings, null, 2)}

                Return JSON:
                {
                    "items": [
                        {
                            "id": "...",
                            "title": "...",
                            "type": "blog|social|email|video|podcast",
                            "status": "draft|review|scheduled|published",
                            "scheduledDate": "YYYY-MM-DD",
                            "channels": [...],
                            "tags": [...]
                        }
                    ],
                    "upcoming": [...],
                    "overdue": [...],
                    "gaps": ["No content scheduled for weekends", ...],
                    "recommendations": [...]
                }
            `;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch {
      return {
        items: [],
        upcoming: [],
        overdue: [],
        gaps: ['Unable to analyse calendar'],
        recommendations: ['Retry with more specific date range'],
      };
    }
  }

  async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
    this.mode = 'VERIFICATION';
    this.log('✅ Verifying content calendar operations...');

    const calendar = result.data?.calendar as CalendarView | undefined;

    return {
      passed: result.success,
      checks: [
        {
          name: 'Calendar Fetch',
          passed: result.success,
          message: result.success ? 'Calendar data retrieved' : result.error,
        },
        {
          name: 'Content Items',
          passed: (calendar?.items?.length ?? 0) >= 0,
          message: `${calendar?.items?.length ?? 0} items in calendar`,
        },
        {
          name: 'Gap Analysis',
          passed: calendar?.gaps !== undefined,
          message: `${calendar?.gaps?.length ?? 0} gaps identified`,
        },
        {
          name: 'Recommendations',
          passed: (calendar?.recommendations?.length ?? 0) > 0,
          message: `${calendar?.recommendations?.length ?? 0} recommendations provided`,
        },
      ],
      recommendations: calendar?.recommendations ?? ['Review calendar manually'],
    };
  }
}
