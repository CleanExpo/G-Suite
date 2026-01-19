/**
 * Social Commander Agent
 * 
 * Specialized agent for multi-platform social media orchestration.
 */

import {
    BaseAgent,
    AgentContext,
    AgentPlan,
    AgentResult,
    VerificationReport
} from './base';

export class SocialCommanderAgent extends BaseAgent {
    readonly name = 'social-commander';
    readonly description = 'Multi-platform social media orchestration and swarm distribution agent';
    readonly capabilities = [
        'multi_platform_posting',
        'swarm_distribution',
        'engagement_tracking',
        'thread_building'
    ];
    readonly requiredSkills = ['social_blast', 'web_intel', 'image_generation'];

    private readonly platforms = ['x', 'linkedin', 'reddit'] as const;

    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('Planning social campaign...', context.mission);

        // Determine which platforms to target
        const configPlatforms = context.config?.platforms as string[] | undefined;
        const targetPlatforms = this.platforms.filter(p =>
            context.mission.toLowerCase().includes(p) ||
            configPlatforms?.includes(p)
        );

        const platforms = targetPlatforms.length > 0 ? targetPlatforms : this.platforms;

        const steps = [
            {
                id: 'research',
                action: 'Research trending topics and hashtags',
                tool: 'web_intel',
                payload: { query: `trending topics ${platforms.join(' ')} ${context.mission}` }
            },
            ...platforms.map((platform, i) => ({
                id: `post_${platform}`,
                action: `Create and schedule ${platform} content`,
                tool: 'social_blast',
                payload: { platform, content: context.mission },
                dependencies: ['research']
            }))
        ];

        return {
            steps,
            estimatedCost: 25 * platforms.length + 25, // 25 per platform + research
            requiredSkills: this.requiredSkills,
            reasoning: `Multi-platform distribution across ${platforms.join(', ')} with optimized content for each`
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
