/**
 * Marketing Strategist Agent
 * 
 * Specialized agent for campaign planning and growth strategy.
 */

import {
    BaseAgent,
    AgentContext,
    AgentPlan,
    AgentResult,
    VerificationReport,
    PlanStep
} from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || ''
);

export class MarketingStrategistAgent extends BaseAgent {
    readonly name = 'marketing-strategist';
    readonly description = 'Campaign planning and growth strategy agent for market dominance';
    readonly capabilities = [
        'campaign_planning',
        'content_strategy',
        'competitive_analysis',
        'growth_metrics'
    ];
    readonly requiredSkills = ['web_intel', 'image_generation', 'social_blast'];

    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('Analyzing marketing mission...', context.mission);

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      You are a Marketing Strategist. Create a detailed campaign plan for:
      Mission: "${context.mission}"
      
      Return a JSON object with:
      {
        "steps": [
          { "id": "step_1", "action": "description", "tool": "tool_name", "payload": {} }
        ],
        "estimatedCost": 100,
        "requiredSkills": ["skill1", "skill2"],
        "reasoning": "Why this approach works"
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/gi, '').trim();
            const plan = JSON.parse(text);

            this.log('Campaign plan created', plan);
            return plan;
        } catch (error: any) {
            this.log('Planning failed', error.message);
            return {
                steps: [],
                estimatedCost: 0,
                requiredSkills: this.requiredSkills,
                reasoning: `Planning failed: ${error.message}`
            };
        }
    }

    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('Executing marketing campaign...', plan.steps.length + ' steps');

        const startTime = Date.now();
        const artifacts: AgentResult['artifacts'] = [];

        try {
            for (const step of plan.steps) {
                this.log(`Executing step: ${step.action}`);

                // Execute bound skills
                if (this.boundSkills.has(step.tool)) {
                    const result = await this.invokeSkill(step.tool, context.userId, step.payload);
                    artifacts.push({
                        type: 'data',
                        name: step.id,
                        value: result as Record<string, unknown>
                    });
                }
            }

            return {
                success: true,
                data: { message: 'Campaign executed successfully', steps: plan.steps.length },
                cost: plan.estimatedCost,
                duration: Date.now() - startTime,
                artifacts
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                cost: 0,
                duration: Date.now() - startTime
            };
        }
    }

    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        this.log('Verifying campaign results...');

        const checks = [
            {
                name: 'Execution Success',
                passed: result.success,
                message: result.success ? 'All steps completed' : result.error
            },
            {
                name: 'Artifacts Generated',
                passed: (result.artifacts?.length ?? 0) > 0,
                message: `${result.artifacts?.length ?? 0} artifacts created`
            },
            {
                name: 'Cost Within Budget',
                passed: result.cost <= 300,
                message: `Cost: ${result.cost} PTS`
            }
        ];

        return {
            passed: checks.every(c => c.passed),
            checks,
            recommendations: result.success ? [] : ['Review failed steps and retry']
        };
    }
}
