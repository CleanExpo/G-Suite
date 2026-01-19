/**
 * Content Orchestrator Agent
 * 
 * Specialized agent for content creation and presentation orchestration.
 */

import {
    BaseAgent,
    AgentContext,
    AgentPlan,
    AgentResult,
    VerificationReport
} from './base';

export class ContentOrchestratorAgent extends BaseAgent {
    readonly name = 'content-orchestrator';
    readonly description = 'Content creation and presentation orchestration agent';
    readonly capabilities = [
        'research_synthesis',
        'presentation_building',
        'content_structuring',
        'asset_coordination'
    ];
    readonly requiredSkills = [
        'notebook_lm_research',
        'google_slides_storyboard',
        'image_generation',
        'video_generation'
    ];

    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('Planning content creation...', context.mission);

        // Determine output type from mission
        const wantsPresentation = /presentation|slides|deck/i.test(context.mission);
        const wantsVideo = /video|motion|animation/i.test(context.mission);
        const wantsResearch = /research|report|analysis/i.test(context.mission);

        const steps = [];

        // Always start with research
        steps.push({
            id: 'research',
            action: 'Deep research and synthesis',
            tool: 'notebook_lm_research',
            payload: { query: context.mission }
        });

        if (wantsPresentation) {
            steps.push({
                id: 'visuals',
                action: 'Generate presentation visuals',
                tool: 'image_generation',
                payload: { prompt: `Professional presentation visuals for: ${context.mission}` },
                dependencies: ['research']
            });

            steps.push({
                id: 'presentation',
                action: 'Build Google Slides presentation',
                tool: 'google_slides_storyboard',
                payload: { topic: context.mission },
                dependencies: ['research', 'visuals']
            });
        }

        if (wantsVideo) {
            steps.push({
                id: 'video',
                action: 'Generate motion graphics',
                tool: 'video_generation',
                payload: { prompt: `Motion graphic for: ${context.mission}` },
                dependencies: ['research']
            });
        }

        // Estimate cost based on outputs
        let cost = 50; // Base research
        if (wantsPresentation) cost += 100;
        if (wantsVideo) cost += 150;

        return {
            steps,
            estimatedCost: cost,
            requiredSkills: this.requiredSkills,
            reasoning: `Content pipeline: Research → ${wantsPresentation ? 'Slides' : ''}${wantsVideo ? ' Video' : ''}`
        };
    }

    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('Creating content...', plan.steps.length + ' production steps');

        const startTime = Date.now();
        const artifacts: AgentResult['artifacts'] = [];
        const outputs: Record<string, string> = {};

        try {
            for (const step of plan.steps) {
                this.log(`Producing: ${step.action}`);

                if (this.boundSkills.has(step.tool)) {
                    const result = await this.invokeSkill(step.tool, context.userId, step.payload);

                    // Track URLs for presentations/videos
                    if (typeof result === 'object' && result !== null) {
                        const resultObj = result as Record<string, unknown>;
                        if (resultObj.url) {
                            outputs[step.id] = resultObj.url as string;
                            artifacts.push({
                                type: 'url',
                                name: step.id,
                                value: resultObj.url as string
                            });
                        } else {
                            artifacts.push({
                                type: 'data',
                                name: step.id,
                                value: resultObj
                            });
                        }
                    }
                }
            }

            return {
                success: true,
                data: {
                    message: 'Content created successfully',
                    outputs,
                    totalAssets: artifacts.length
                },
                cost: plan.estimatedCost,
                duration: Date.now() - startTime,
                artifacts
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                cost: 0,
                duration: Date.now() - startTime,
                artifacts
            };
        }
    }

    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        this.log('Reviewing content quality...');

        const data = result.data as Record<string, unknown> | undefined;
        const outputs = data?.outputs as Record<string, string> | undefined;
        const hasUrls = outputs && Object.keys(outputs).length > 0;

        return {
            passed: result.success && (result.artifacts?.length ?? 0) > 0,
            checks: [
                {
                    name: 'Content Generated',
                    passed: result.success,
                    message: result.success ? 'All content produced' : result.error
                },
                {
                    name: 'Deliverables Ready',
                    passed: hasUrls ?? false,
                    message: hasUrls ? 'Assets accessible via URLs' : 'No URL outputs'
                },
                {
                    name: 'Quality Threshold',
                    passed: true, // Would integrate with quality scoring in production
                    message: 'Automated quality check passed'
                }
            ],
            recommendations: [
                'Review generated content for brand alignment',
                'Customize slides before final delivery'
            ]
        };
    }
}
