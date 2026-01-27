/**
 * SEO Analyst Agent
 * 
 * Specialized agent for search optimization and web mastery auditing.
 * Enhanced with Gemini 3 Flash, Deep Research, and Document AI.
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

export class SEOAnalystAgent extends BaseAgent {
    readonly name = 'seo-analyst';
    readonly description = 'Search optimization agent with Gemini 3 and comprehensive audit capabilities';
    readonly capabilities = [
        'technical_seo_audit',
        'keyword_strategy',
        'content_optimization',
        'search_console_integration',
        'competitor_deep_research',   // NEW
        'document_analysis',          // NEW: PDF/report parsing
        'ai_content_audit'            // NEW: Gemini 3 content analysis
    ];
    readonly requiredSkills = [
        'web_mastery_audit',
        'search_console_audit',
        'web_intel',
        'deep_research',          // NEW
        'document_ai_extract',    // NEW
        'gemini_3_flash'          // NEW
    ];

    // Gemini 3 Flash for advanced SEO analysis
    private readonly model = genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        systemInstruction: 'You are an elite SEO specialist with 15+ years of experience. You understand technical SEO, content strategy, and algorithmic patterns deeply. Provide actionable insights.'
    });

    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('🔍 Gemini 3: Planning comprehensive SEO audit...', context.mission);

        // Extract URL from mission if present
        const urlMatch = context.mission.match(/https?:\/\/[^\s]+/);
        const targetUrl = urlMatch ? urlMatch[0] : '';

        // Use Gemini 3 to create intelligent audit plan
        const prompt = `
          You are an SEO Analyst with Gemini 3's advanced reasoning.
          Create a comprehensive SEO audit plan for: "${context.mission}"
          Target URL: ${targetUrl || 'Not specified'}
          
          Available enhanced tools:
          - web_mastery_audit: Technical SEO crawl (meta, speed, structure)
          - search_console_audit: GSC data (clicks, impressions, CTR)
          - web_intel: Web research and competitor analysis
          - deep_research: In-depth market/keyword research with sources
          - document_ai_extract: Parse competitor PDFs/reports
          - gemini_3_flash: AI-powered content and gap analysis
          
          Return JSON:
          {
            "steps": [{ "id": "...", "action": "...", "tool": "...", "payload": {} }],
            "estimatedCost": 100,
            "requiredSkills": [...],
            "reasoning": "Strategic SEO rationale"
          }
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/gi, '').trim();
            return JSON.parse(text);
        } catch {
            // Fallback to comprehensive plan
            return this.createComprehensivePlan(targetUrl, context.mission);
        }
    }

    private createComprehensivePlan(url: string, mission: string): AgentPlan {
        return {
            steps: [
                { id: 'technical', action: 'Technical SEO audit', tool: 'web_mastery_audit', payload: { url } },
                { id: 'gsc_data', action: 'Search Console analysis', tool: 'search_console_audit', payload: { siteUrl: url } },
                { id: 'competitors', action: 'Deep competitor research', tool: 'deep_research', payload: { topic: `SEO competitors for ${url}`, depth: 'deep' } },
                { id: 'keywords', action: 'Keyword opportunity analysis', tool: 'gemini_3_flash', payload: { prompt: `Identify top 20 keyword opportunities for: ${mission}` } },
                { id: 'content', action: 'Content gap analysis', tool: 'gemini_3_flash', payload: { prompt: `Analyze content gaps and opportunities for: ${url}` } }
            ],
            estimatedCost: 125,
            requiredSkills: this.requiredSkills,
            reasoning: 'Comprehensive SEO audit with Gemini 3 intelligent analysis'
        };
    }

    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('⚡ Executing SEO audit with Gemini 3...', plan.steps.length + ' steps');

        const startTime = Date.now();
        const artifacts: AgentResult['artifacts'] = [];
        const seoFindings: Record<string, unknown> = {};

        try {
            for (const step of plan.steps) {
                this.log(`Running: ${step.action}`);

                let result: unknown = null;

                // Try bound skills first
                if (this.boundSkills.has(step.tool)) {
                    result = await this.invokeSkill(step.tool, context.userId, step.payload);
                } else {
                    // Try enhanced Google API skills
                    result = await this.executeEnhancedSkill(step.tool, context.userId, step.payload);
                }

                if (result) {
                    seoFindings[step.id] = result;
                    artifacts.push({
                        type: 'data',
                        name: step.id,
                        value: result as Record<string, unknown>
                    });
                }
            }

            // Generate Gemini 3 powered summary
            const summary = await this.generateSEOSummary(seoFindings);

            return {
                success: true,
                data: {
                    message: 'SEO audit complete with Gemini 3 analysis',
                    findings: artifacts.length,
                    summary,
                    recommendations: 'See detailed report below'
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

    private async executeEnhancedSkill(tool: string, userId: string, payload: Record<string, unknown>): Promise<unknown> {
        try {
            const skills = await import('../tools/googleAPISkills');

            switch (tool) {
                case 'deep_research':
                    return skills.deepResearch(userId, payload.topic as string, payload as any);
                case 'document_ai_extract':
                    return skills.documentAIExtract(userId, payload.documentUrl as string, payload as any);
                case 'gemini_3_flash':
                    return skills.gemini3Flash(userId, payload.prompt as string, payload as any);
                default:
                    return null;
            }
        } catch {
            return null;
        }
    }

    private async generateSEOSummary(findings: Record<string, unknown>): Promise<string> {
        try {
            const result = await this.model.generateContent(`
                Summarize these SEO audit findings into key insights and priority actions:
                ${JSON.stringify(findings, null, 2)}
                
                Provide: Top 5 findings, Top 3 priority fixes, Estimated impact.
            `);
            return result.response.text();
        } catch {
            return 'Summary generation failed. Review individual findings.';
        }
    }

    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        this.log('✅ Validating SEO audit with Gemini 3...');

        return {
            passed: result.success,
            checks: [
                {
                    name: 'Technical Audit',
                    passed: result.success,
                    message: result.success ? 'Technical SEO analyzed' : result.error
                },
                {
                    name: 'Data Sources',
                    passed: (result.artifacts?.length ?? 0) >= 3,
                    message: `${result.artifacts?.length ?? 0} data sources analyzed`
                },
                {
                    name: 'Deep Research',
                    passed: result.artifacts?.some(a => a.name.includes('competitors') || a.name.includes('keywords')) ?? false,
                    message: 'Competitor and keyword research completed'
                },
                {
                    name: 'AI Analysis',
                    passed: result.artifacts?.some(a => a.name.includes('content')) ?? false,
                    message: 'Gemini 3 content analysis completed'
                }
            ],
            recommendations: result.success
                ? ['Implement priority fixes within 7 days', 'Monitor rankings weekly', 'Re-audit in 30 days']
                : ['Check site accessibility and retry', 'Verify Search Console connection']
        };
    }
}

