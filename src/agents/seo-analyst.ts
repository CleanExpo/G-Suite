/**
 * SEO Analyst Agent
 * 
 * Specialized agent for search optimization and web mastery auditing.
 */

import {
    BaseAgent,
    AgentContext,
    AgentPlan,
    AgentResult,
    VerificationReport
} from './base';

export class SEOAnalystAgent extends BaseAgent {
    readonly name = 'seo-analyst';
    readonly description = 'Search optimization and web mastery auditing agent';
    readonly capabilities = [
        'technical_seo_audit',
        'keyword_strategy',
        'content_optimization',
        'search_console_integration'
    ];
    readonly requiredSkills = ['web_mastery_audit', 'search_console_audit', 'web_intel'];

    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('Planning SEO analysis...', context.mission);

        // Extract URL from mission if present
        const urlMatch = context.mission.match(/https?:\/\/[^\s]+/);
        const targetUrl = urlMatch ? urlMatch[0] : '';

        const steps = [
            {
                id: 'crawl',
                action: 'Crawl and analyze site structure',
                tool: 'web_mastery_audit',
                payload: { url: targetUrl }
            },
            {
                id: 'search_data',
                action: 'Fetch Search Console performance data',
                tool: 'search_console_audit',
                payload: { siteUrl: targetUrl }
            },
            {
                id: 'competitors',
                action: 'Research competitor SEO strategies',
                tool: 'web_intel',
                payload: { query: `SEO competitors for ${targetUrl}` }
            }
        ];

        return {
            steps,
            estimatedCost: 75,
            requiredSkills: this.requiredSkills,
            reasoning: 'Comprehensive SEO audit combining technical analysis, search data, and competitive research'
        };
    }

    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('Executing SEO audit...', plan.steps.length + ' steps');

        const startTime = Date.now();
        const artifacts: AgentResult['artifacts'] = [];

        try {
            for (const step of plan.steps) {
                this.log(`Running: ${step.action}`);

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
                data: {
                    message: 'SEO audit complete',
                    findings: artifacts.length,
                    recommendations: 'See detailed report'
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
                duration: Date.now() - startTime
            };
        }
    }

    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        this.log('Validating SEO audit results...');

        return {
            passed: result.success,
            checks: [
                {
                    name: 'Audit Completed',
                    passed: result.success,
                    message: result.success ? 'Full audit executed' : result.error
                },
                {
                    name: 'Data Retrieved',
                    passed: (result.artifacts?.length ?? 0) >= 2,
                    message: `${result.artifacts?.length ?? 0} data sources analyzed`
                }
            ],
            recommendations: result.success
                ? ['Review findings and implement priority fixes']
                : ['Check site accessibility and retry']
        };
    }
}
