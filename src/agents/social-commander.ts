/**
 * Social Commander Agent
 * 
 * Specialized agent for multi-platform social media orchestration.
 * Enhanced with Gemini 3 Flash for AI-powered content creation.
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

export class SocialCommanderAgent extends BaseAgent {
    readonly name = 'social-commander';
    readonly description = 'Multi-platform social media orchestration with Gemini 3 content AI';
    readonly capabilities = [
        'multi_platform_posting',
        'swarm_distribution',
        'engagement_tracking',
        'thread_building',
        'ai_copywriting',         // NEW
        'trend_analysis',         // NEW
        'video_shorts'            // NEW: Veo 3.1 shorts
    ];
    readonly requiredSkills = [
        'social_blast',
        'web_intel',
        'image_generation',
        'gemini_3_flash',         // NEW
        'deep_research',          // NEW
        'veo_31_generate'         // NEW
    ];

    private readonly platforms = ['x', 'linkedin', 'reddit', 'instagram', 'tiktok'] as const;

    // Gemini 3 Flash for social content
    private readonly model = genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        systemInstruction: 'You are a viral social media strategist. Create engaging, platform-optimized content that drives engagement.'
    });

    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('📱 Gemini 3: Planning social campaign...', context.mission);

        // Determine which platforms to target
        const configPlatforms = context.config?.platforms as string[] | undefined;
        const targetPlatforms = this.platforms.filter(p =>
            context.mission.toLowerCase().includes(p) ||
            configPlatforms?.includes(p)
        );

        const platforms = targetPlatforms.length > 0 ? targetPlatforms : ['x', 'linkedin'];
        const wantsVideo = /video|reel|short|tiktok/i.test(context.mission);

        const steps: PlanStep[] = [
            // Deep research on trends first
            {
                id: 'trend_research',
                action: 'Research trending topics and hashtags',
                tool: 'deep_research',
                payload: { topic: `trending ${platforms.join(' ')} topics for: ${context.mission}`, depth: 'moderate' }
            },
            // Generate platform-specific copy with Gemini 3
            {
                id: 'content_gen',
                action: 'Generate AI-optimized social content',
                tool: 'gemini_3_flash',
                payload: {
                    prompt: `Create engaging social media posts for ${platforms.join(', ')} about: ${context.mission}. Include hashtags, hooks, and CTAs optimized for each platform.`
                },
                dependencies: ['trend_research']
            },
            // Generate visuals
            {
                id: 'visuals',
                action: 'Generate social media visuals',
                tool: 'image_generation',
                payload: { prompt: `Social media graphic for: ${context.mission}` },
                dependencies: ['content_gen']
            }
        ];

        // Add video if requested
        if (wantsVideo) {
            steps.push({
                id: 'video_short',
                action: 'Generate video short with Veo 3.1',
                tool: 'veo_31_generate',
                payload: {
                    prompt: `Engaging social video for: ${context.mission}`,
                    duration: 4,
                    aspectRatio: '9:16'
                },
                dependencies: ['content_gen']
            });
        }

        // Platform-specific posts
        platforms.forEach(platform => {
            steps.push({
                id: `post_${platform}`,
                action: `Schedule ${platform} content`,
                tool: 'social_blast',
                payload: { platform, content: context.mission },
                dependencies: ['visuals', ...(wantsVideo ? ['video_short'] : [])]
            });
        });

        return {
            steps,
            estimatedCost: 50 + (25 * platforms.length) + (wantsVideo ? 100 : 0),
            requiredSkills: this.requiredSkills,
            reasoning: `Gemini 3 social campaign: Trends → AI Copy → Visuals${wantsVideo ? ' + Video' : ''} → ${platforms.join(', ')}`
        };
    }

    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('Deploying social content...', plan.steps.length + ' operations');

        const startTime = Date.now();
        const artifacts: AgentResult['artifacts'] = [];
        const postResults: Record<string, boolean> = {};

        try {
            for (const step of plan.steps) {
                this.log(`Executing: ${step.action}`);

                if (this.boundSkills.has(step.tool)) {
                    const result = await this.invokeSkill(step.tool, context.userId, step.payload);

                    artifacts.push({
                        type: 'data',
                        name: step.id,
                        value: result as Record<string, unknown>
                    });

                    if (step.id.startsWith('post_')) {
                        postResults[step.id] = true;
                    }
                }
            }

            return {
                success: true,
                data: {
                    message: 'Social campaign deployed',
                    platforms: Object.keys(postResults).length,
                    posts: postResults
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
        this.log('Verifying social deployment...');

        const data = result.data as Record<string, unknown> | undefined;
        const platformCount = (data?.platforms as number) ?? 0;

        return {
            passed: result.success && platformCount > 0,
            checks: [
                {
                    name: 'Deployment Success',
                    passed: result.success,
                    message: result.success ? 'All posts scheduled' : result.error
                },
                {
                    name: 'Platform Coverage',
                    passed: platformCount > 0,
                    message: `Posted to ${platformCount} platform(s)`
                },
                {
                    name: 'Content Generated',
                    passed: (result.artifacts?.length ?? 0) > 0,
                    message: `${result.artifacts?.length ?? 0} content pieces created`
                }
            ],
            recommendations: [
                'Monitor engagement metrics in 24-48 hours',
                'Respond to comments and mentions promptly'
            ]
        };
    }
}
