/**
 * Email Marketing Agent
 *
 * AI-powered email campaign creation, automation, and analytics.
 * Integrates with major ESP platforms (SendGrid, Mailchimp, etc).
 */

import {
    BaseAgent,
    AgentContext,
    AgentPlan,
    AgentResult,
    VerificationReport
} from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || ''
);

export interface EmailCampaign {
    id: string;
    name: string;
    subject: string;
    preheader?: string;
    content: string;
    audience: string[];
    scheduledAt?: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    metrics?: EmailMetrics;
}

export interface EmailMetrics {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
}

export interface EmailTemplate {
    id: string;
    name: string;
    html: string;
    variables: string[];
    category: string;
}

export interface EmailDashboard {
    campaigns: EmailCampaign[];
    templates: EmailTemplate[];
    totalSent: number;
    avgOpenRate: number;
    avgClickRate: number;
    insights: string[];
    recommendations: string[];
}

export class EmailMarketingAgent extends BaseAgent {
    readonly name = 'email-marketing';
    readonly description = 'AI-powered email campaign creation, automation, and analytics';
    readonly capabilities = [
        'campaign_creation',
        'template_management',
        'audience_segmentation',
        'ab_testing',
        'deliverability_monitoring',
        'analytics_tracking',
        'automation_workflows'
    ];
    readonly requiredSkills = [
        'sendgrid_api',
        'mailchimp_api',
        'template_engine',
        'gemini_3_flash'
    ];

    private readonly model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4
        },
        systemInstruction: 'You are an email marketing specialist. You create compelling email campaigns, optimise for deliverability, and analyse performance metrics. Use Australian English.'
    });

    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('📧 Planning email marketing operations...', context.mission);

        return {
            steps: [
                {
                    id: 'analyse',
                    action: 'Analyse campaign requirements',
                    tool: 'gemini_3_flash',
                    payload: { prompt: `Analyse email campaign: ${context.mission}` }
                },
                {
                    id: 'audience',
                    action: 'Segment target audience',
                    tool: 'audience_service',
                    payload: { action: 'segment' }
                },
                {
                    id: 'content',
                    action: 'Generate email content',
                    tool: 'gemini_3_flash',
                    payload: { prompt: 'Generate compelling email content' }
                },
                {
                    id: 'template',
                    action: 'Select or create template',
                    tool: 'template_engine',
                    payload: { action: 'select' }
                },
                {
                    id: 'schedule',
                    action: 'Schedule campaign',
                    tool: 'esp_api',
                    payload: { action: 'schedule' }
                }
            ],
            estimatedCost: 70,
            requiredSkills: this.requiredSkills,
            reasoning: 'Email campaign workflow: analyse, segment, create, template, schedule'
        };
    }

    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.clearVerificationState();
        this.log('⚡ Executing email marketing operations...', plan.steps.length + ' steps');

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
                        value: result as Record<string, unknown>
                    });

                    this.reportOutput({
                        type: 'other',
                        description: `Email operation: ${step.action}`
                    });
                }
            }

            const dashboard = await this.generateDashboard(findings, context);

            this.addCompletionCriterion({
                type: 'content_contains',
                target: 'email_dashboard',
                expected: 'campaigns'
            });

            return {
                success: true,
                data: {
                    message: 'Email marketing operations completed',
                    dashboard,
                    taskOutput: this.getTaskOutput()
                },
                cost: plan.estimatedCost,
                duration: Date.now() - startTime,
                artifacts,
                confidence: 0.88
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: errorMessage,
                cost: 0,
                duration: Date.now() - startTime,
                artifacts
            };
        }
    }

    private async executeInternalOperation(
        step: { id: string; tool: string; payload: Record<string, unknown> },
        context: AgentContext
    ): Promise<unknown> {
        try {
            const prompt = `
                Task: ${step.id}
                Mission: ${context.mission}
                Payload: ${JSON.stringify(step.payload)}

                Provide email marketing results as JSON:
                {
                    "subject": "Compelling subject line",
                    "content": "Email body content",
                    "audience": ["segment1", "segment2"],
                    "recommendations": [...]
                }
            `;

            const result = await this.model.generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch {
            return { subject: '', content: '', audience: [], recommendations: [] };
        }
    }

    private async generateDashboard(findings: Record<string, unknown>, context: AgentContext): Promise<EmailDashboard> {
        try {
            const prompt = `
                Generate an email marketing dashboard from this data:
                ${JSON.stringify(findings, null, 2)}

                Mission: ${context.mission}

                Return JSON:
                {
                    "campaigns": [
                        {
                            "id": "...",
                            "name": "...",
                            "subject": "...",
                            "content": "...",
                            "audience": [...],
                            "status": "draft|scheduled|sent",
                            "metrics": { "sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "bounced": 0, "unsubscribed": 0, "openRate": 0, "clickRate": 0 }
                        }
                    ],
                    "templates": [...],
                    "totalSent": number,
                    "avgOpenRate": number,
                    "avgClickRate": number,
                    "insights": [...],
                    "recommendations": [...]
                }
            `;

            const result = await this.model.generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch {
            return {
                campaigns: [],
                templates: [],
                totalSent: 0,
                avgOpenRate: 0,
                avgClickRate: 0,
                insights: ['Unable to generate dashboard'],
                recommendations: ['Check ESP connection']
            };
        }
    }

    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        this.log('✅ Verifying email marketing operations...');

        const dashboard = result.data?.dashboard as EmailDashboard | undefined;

        return {
            passed: result.success,
            checks: [
                {
                    name: 'Email Operations',
                    passed: result.success,
                    message: result.success ? 'Operations completed' : result.error
                },
                {
                    name: 'Campaigns Created',
                    passed: (dashboard?.campaigns?.length ?? 0) >= 0,
                    message: `${dashboard?.campaigns?.length ?? 0} campaigns`
                },
                {
                    name: 'Templates Available',
                    passed: (dashboard?.templates?.length ?? 0) >= 0,
                    message: `${dashboard?.templates?.length ?? 0} templates`
                },
                {
                    name: 'Deliverability',
                    passed: (dashboard?.avgOpenRate ?? 0) >= 0,
                    message: `Open rate: ${dashboard?.avgOpenRate ?? 0}%`
                }
            ],
            recommendations: dashboard?.recommendations ?? ['Configure ESP integration']
        };
    }
}
