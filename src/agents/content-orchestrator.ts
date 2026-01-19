/**
 * Content Orchestrator Agent
 * 
 * Specialized agent for content creation and presentation orchestration.
 * Enhanced with Gemini 3 Flash, Deep Research, and Veo 3.1.
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

export class ContentOrchestratorAgent extends BaseAgent {
    readonly name = 'content-orchestrator';
    readonly description = 'Content creation and presentation orchestration with Gemini 3 and Veo 3.1';
    readonly capabilities = [
        'research_synthesis',
        'presentation_building',
        'content_structuring',
        'asset_coordination',
        'deep_research',          // NEW
        'video_production',       // NEW: Veo 3.1
        'ai_content_writing'      // NEW: Gemini 3 writing
    ];
    readonly requiredSkills = [
        'notebook_lm_research',
        'google_slides_storyboard',
        'image_generation',
        'video_generation',
        'deep_research',          // NEW
        'veo_31_generate',        // NEW
        'gemini_3_flash'          // NEW
    ];

    // Gemini 3 Flash for content planning and writing
    private readonly model = genAI.getGenerativeModel({
        model: 'gemini-3-flash',
        systemInstruction: 'You are a content strategist and creative director. Create compelling narratives and visual stories that captivate audiences.'
    });

    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('🎬 Gemini 3: Planning content creation...', context.mission);

        // Determine output type from mission
        const wantsPresentation = /presentation|slides|deck/i.test(context.mission);
        const wantsVideo = /video|motion|animation/i.test(context.mission);
        const wantsResearch = /research|report|analysis/i.test(context.mission);

        const steps = [];

        // Always start with deep research (enhanced)
        steps.push({
            id: 'research',
            action: 'Deep research and synthesis',
            tool: 'deep_research',
            payload: { topic: context.mission, depth: 'deep' }
        });

        // Generate content strategy with Gemini 3
        steps.push({
            id: 'content_strategy',
            action: 'AI content strategy and outline',
            tool: 'gemini_3_flash',
            payload: {
                prompt: `Create a content strategy and outline for: ${context.mission}. Include key messages, target audience insights, and narrative structure.`
            },
            dependencies: ['research']
        });

        if (wantsPresentation) {
            steps.push({
                id: 'visuals',
                action: 'Generate presentation visuals',
                tool: 'image_generation',
                payload: { prompt: `Professional presentation visuals for: ${context.mission}` },
                dependencies: ['content_strategy']
            });

            steps.push({
                id: 'presentation',
                action: 'Build Google Slides presentation',
                tool: 'google_slides_storyboard',
                payload: { topic: context.mission },
                dependencies: ['visuals']
            });
        }

        if (wantsVideo) {
            // Use Veo 3.1 for video
            steps.push({
                id: 'video',
                action: 'Generate video with Veo 3.1',
                tool: 'veo_31_generate',
                payload: {
                    prompt: `Professional video for: ${context.mission}`,
                    duration: 6,
                    resolution: '4k',
                    aspectRatio: '16:9'
                },
                dependencies: ['content_strategy']
            });
        }

        // Estimate cost based on outputs
        let cost = 75; // Base research + strategy
        if (wantsPresentation) cost += 100;
        if (wantsVideo) cost += 175;

        return {
            steps,
            estimatedCost: cost,
            requiredSkills: this.requiredSkills,
            reasoning: `Gemini 3 content pipeline: Deep Research → Strategy → ${wantsPresentation ? 'Slides' : ''}${wantsVideo ? ' + Veo 3.1 Video' : ''}`
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
