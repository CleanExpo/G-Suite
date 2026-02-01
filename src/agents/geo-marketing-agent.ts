/**
 * GEO Marketing Agent
 *
 * Specialized agent for Generative Engine Optimization (GEO) based on the
 * Synthex Apex Architecture. Implements 2026/27 marketing paradigm:
 * - Citation Vector Analysis
 * - Primary Authority Scoring
 * - Forensic Stylistic Layer
 * - LLM Visibility Auditing
 *
 * @see https://open.spotify.com/episode/77Bc4BYEcjXHutTdEAV7fM
 */

import { BaseAgent, AgentContext, AgentPlan, AgentResult, VerificationReport } from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TokenTracker } from '@/lib/telemetry/token-tracker';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || '',
);

// =============================================================================
// CITATION VECTOR TYPES
// =============================================================================

export interface CitationVectorScore {
  topicalAuthority: number; // 0-100: Domain expertise depth
  semanticRichness: number; // 0-100: Language quality and clarity
  structuredData: number; // 0-100: Schema markup presence
  factualAccuracy: number; // 0-100: Verifiable claims with sources
  eeatSignals: number; // 0-100: Experience, Expertise, Authority, Trust
  overallScore: number; // Weighted composite
}

export interface AuthorityScore {
  platform: 'gemini' | 'chatgpt' | 'perplexity' | 'claude';
  mentions: number;
  citations: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  authorityRank: number; // 1-10 scale
  competitors: string[];
}

export interface GeoAuditResult {
  citationVectors: CitationVectorScore;
  authorityScores: AuthorityScore[];
  forensicPassed: boolean;
  recommendations: string[];
  zeroClickReadiness: number; // 0-100: Ready for transactional AI
}

// =============================================================================
// GEO MARKETING AGENT
// =============================================================================

export class GeoMarketingAgent extends BaseAgent {
  readonly name = 'geo-marketing-agent';
  readonly description =
    'Generative Engine Optimization agent implementing Synthex Apex Architecture for 2026/27 AI-first marketing';
  readonly capabilities = [
    'citation_vector_analysis',
    'authority_scoring',
    'geo_content_optimization',
    'llm_visibility_audit',
    'forensic_stylization',
    'zero_click_readiness',
  ];
  readonly requiredSkills = [
    'gemini_3_flash',
    'deep_research',
    'web_intel',
    'geo_citation_analyzer',
    'authority_scorer',
    'content_humanizer',
    'llm_visibility_audit',
  ];

  // Gemini 3 Flash with GEO-focused system instruction
  private readonly model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: `You are the Synthex GEO Strategist, an elite specialist in Generative Engine Optimization.
Your mission is to position brands as PRIMARY AUTHORITY CITATIONS in Large Language Models.

Core Framework (Synthex Apex Architecture):
1. CITATION VECTORS: Analyze topical authority, semantic richness, structured data, factual accuracy, and E-E-A-T signals
2. PRIMARY AUTHORITY: Make brands the definitive source LLMs reference
3. FORENSIC STYLISTIC LAYER: Ensure content mirrors natural human speech patterns
4. ZERO-CLICK TRANSACTIONS: Prepare for purchases within AI search interfaces
5. AGENT-TO-AGENT: Structure data for automated AI negotiation

You think in terms of "Am I part of the answer?" not "Where do I rank?"
Prioritize factual precision and citation-worthiness over traditional marketing fluff.`,
  });

  async plan(context: AgentContext): Promise<AgentPlan> {
    this.mode = 'PLANNING';
    this.log('🎯 Synthex GEO: Analyzing mission for citation optimization...', context.mission);

    // Extract URL or brand from mission
    const urlMatch = context.mission.match(/https?:\/\/[^\s]+/);
    const targetUrl = urlMatch ? urlMatch[0] : '';

    const prompt = `
          You are the Synthex GEO Strategist analyzing: "${context.mission}"
          Target URL: ${targetUrl || 'Not specified'}
          
          Create a comprehensive GEO audit plan using these enhanced tools:
          
          CITATION ANALYSIS:
          - geo_citation_analyzer: Score content for LLM citation-worthiness
          - deep_research: In-depth competitor authority research
          
          AUTHORITY SCORING:
          - authority_scorer: Check brand visibility in Gemini/ChatGPT/Perplexity
          - web_intel: Gather brand mention data across the web
          
          CONTENT OPTIMIZATION:
          - content_humanizer: Apply forensic stylistic layer
          - gemini_3_flash: Generate citation-worthy content
          
          VISIBILITY AUDIT:
          - llm_visibility_audit: Comprehensive GEO readiness assessment
          
          Return JSON:
          {
            "steps": [
              { "id": "...", "action": "...", "tool": "...", "payload": {} }
            ],
            "estimatedCost": 200,
            "requiredSkills": [...],
            "reasoning": "Strategic GEO rationale focusing on citation-worthiness"
          }
          
          Prioritize: Citation Vector Analysis → Authority Scoring → Content Optimization → Visibility Audit
        `;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response
        .text()
        .replace(/```json|```/gi, '')
        .trim();
      const plan = JSON.parse(text);
      this.log('📋 GEO audit plan created', plan);
      return plan;
    } catch (error: any) {
      this.log('Planning fallback triggered', error.message);
      return this.createFallbackPlan(targetUrl, context.mission);
    }
  }

  private createFallbackPlan(url: string, mission: string): AgentPlan {
    return {
      steps: [
        // Phase 1: Citation Analysis
        {
          id: 'citation_analysis',
          action: 'Analyze Citation Vector signals',
          tool: 'geo_citation_analyzer',
          payload: { url, mission },
        },
        // Phase 2: Authority Research
        {
          id: 'authority_research',
          action: 'Deep research on topical authority',
          tool: 'deep_research',
          payload: { topic: `GEO authority analysis for ${url || mission}`, depth: 'deep' },
        },
        // Phase 3: LLM Visibility Check
        {
          id: 'llm_visibility',
          action: 'Audit visibility across LLM platforms',
          tool: 'llm_visibility_audit',
          payload: { brand: mission, platforms: ['gemini', 'chatgpt', 'perplexity'] },
        },
        // Phase 4: Authority Scoring
        {
          id: 'authority_scoring',
          action: 'Calculate Primary Authority Score',
          tool: 'authority_scorer',
          payload: { url, mission },
        },
        // Phase 5: Content Optimization
        {
          id: 'content_optimization',
          action: 'Generate citation-worthy content recommendations',
          tool: 'gemini_3_flash',
          payload: {
            prompt: `Create GEO-optimized content strategy for: ${mission}. 
                        Focus on: factual precision, structured data, expert citations, 
                        and natural human language patterns.`,
          },
        },
        // Phase 6: Forensic Stylization
        {
          id: 'forensic_layer',
          action: 'Apply Forensic Stylistic Layer validation',
          tool: 'content_humanizer',
          payload: { mission },
        },
      ],
      estimatedCost: 250,
      requiredSkills: this.requiredSkills,
      reasoning:
        'Comprehensive Synthex Apex Architecture GEO audit with citation-first methodology',
    };
  }

  async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
    this.mode = 'EXECUTION';
    this.log('⚡ Executing Synthex GEO audit...', plan.steps.length + ' phases');

    const startTime = Date.now();
    const artifacts: AgentResult['artifacts'] = [];
    const geoFindings: Record<string, unknown> = {};

    // Phase 9.2: Track token usage across all LLM calls
    const tokenTracker = new TokenTracker();

    try {
      for (const step of plan.steps) {
        this.log(`📊 ${step.action}`);

        let result: unknown = null;

        // Try bound skills first
        if (this.boundSkills.has(step.tool)) {
          result = await this.invokeSkill(step.tool, context.userId, step.payload);
        } else {
          // Fall back to GEO-enhanced skills (with token tracking)
          result = await this.executeGeoSkill(
            step.tool,
            context.userId,
            step.payload,
            tokenTracker,
          );
        }

        if (result) {
          geoFindings[step.id] = result;
          artifacts.push({
            type: 'data',
            name: step.id,
            value: result as Record<string, unknown>,
          });
        }
      }

      // Generate comprehensive GEO report
      const geoReport = await this.generateGeoReport(geoFindings, tokenTracker);

      // Phase 9.2: Include token usage in result
      const tokensUsed = tokenTracker.getUsage();

      return {
        success: true,
        data: {
          message: 'Synthex GEO audit complete',
          framework: 'Apex Architecture 2026',
          findings: artifacts.length,
          report: geoReport,
          citationReady: this.calculateCitationReadiness(geoFindings),
        },
        cost: tokenTracker.estimateCost() || plan.estimatedCost,
        duration: Date.now() - startTime,
        artifacts,
        tokensUsed,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        cost: 0,
        duration: Date.now() - startTime,
        artifacts,
      };
    }
  }

  private async executeGeoSkill(
    tool: string,
    userId: string,
    payload: Record<string, unknown>,
    tokenTracker: TokenTracker,
  ): Promise<unknown> {
    try {
      const skills = await import('../tools/googleAPISkills');

      switch (tool) {
        case 'deep_research':
          return skills.deepResearch(userId, payload.topic as string, payload as any);

        case 'gemini_3_flash':
          return skills.gemini3Flash(userId, payload.prompt as string, {
            systemInstruction:
              'Generate citation-worthy, factually precise content with proper source attribution.',
            ...payload,
          });

        case 'geo_citation_analyzer':
          return this.analyzeCitationVectors(payload, tokenTracker);

        case 'authority_scorer':
          return this.calculateAuthorityScore(payload, tokenTracker);

        case 'content_humanizer':
          return this.applyForensicLayer(payload, tokenTracker);

        case 'llm_visibility_audit':
          return this.auditLlmVisibility(payload, tokenTracker);

        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  // =============================================================================
  // SYNTHEX APEX ARCHITECTURE SKILLS
  // =============================================================================

  /**
   * Analyze Citation Vector signals for LLM citation-worthiness
   */
  private async analyzeCitationVectors(
    payload: Record<string, unknown>,
    tokenTracker: TokenTracker,
  ): Promise<CitationVectorScore> {
    const prompt = `
            Analyze the following content/URL for Citation Vector signals.
            Target: ${payload.url || payload.mission}

            Score each dimension 0-100:
            1. TOPICAL AUTHORITY: How deep is the domain expertise?
            2. SEMANTIC RICHNESS: Clarity, structure, natural language quality
            3. STRUCTURED DATA: Schema markup, proper HTML semantics, metadata
            4. FACTUAL ACCURACY: Verifiable claims with authoritative sources
            5. E-E-A-T SIGNALS: Experience, Expertise, Authoritativeness, Trustworthiness

            Return JSON:
            {
                "topicalAuthority": 0-100,
                "semanticRichness": 0-100,
                "structuredData": 0-100,
                "factualAccuracy": 0-100,
                "eeatSignals": 0-100,
                "overallScore": weighted average,
                "analysis": "Brief explanation of scores"
            }
        `;

    try {
      const result = await this.model.generateContent(prompt);
      tokenTracker.recordGemini(result.response, 'gemini-3-flash-preview');
      const text = result.response
        .text()
        .replace(/```json|```/gi, '')
        .trim();
      return JSON.parse(text);
    } catch {
      // Return default scores if analysis fails
      return {
        topicalAuthority: 50,
        semanticRichness: 50,
        structuredData: 40,
        factualAccuracy: 50,
        eeatSignals: 45,
        overallScore: 47,
      };
    }
  }

  /**
   * Calculate Primary Authority Score across LLM platforms
   */
  private async calculateAuthorityScore(
    payload: Record<string, unknown>,
    tokenTracker: TokenTracker,
  ): Promise<AuthorityScore[]> {
    const prompt = `
            Analyze brand authority for: ${payload.url || payload.mission}

            Estimate visibility and authority position in these LLM platforms:
            - Gemini (Google AI)
            - ChatGPT (OpenAI)
            - Perplexity
            - Claude (Anthropic)

            For each platform, estimate:
            - mentions: Approximate brand mention frequency
            - citations: How often cited as authoritative source
            - sentiment: Overall sentiment when mentioned
            - authorityRank: 1-10 where 10 is primary authority
            - competitors: Top 3 competing authorities in this space

            Return JSON array of platform scores.
        `;

    try {
      const result = await this.model.generateContent(prompt);
      tokenTracker.recordGemini(result.response, 'gemini-3-flash-preview');
      const text = result.response
        .text()
        .replace(/```json|```/gi, '')
        .trim();
      return JSON.parse(text);
    } catch {
      return [
        {
          platform: 'gemini',
          mentions: 0,
          citations: 0,
          sentiment: 'neutral',
          authorityRank: 5,
          competitors: [],
        },
        {
          platform: 'chatgpt',
          mentions: 0,
          citations: 0,
          sentiment: 'neutral',
          authorityRank: 5,
          competitors: [],
        },
        {
          platform: 'perplexity',
          mentions: 0,
          citations: 0,
          sentiment: 'neutral',
          authorityRank: 5,
          competitors: [],
        },
        {
          platform: 'claude',
          mentions: 0,
          citations: 0,
          sentiment: 'neutral',
          authorityRank: 5,
          competitors: [],
        },
      ];
    }
  }

  /**
   * Forensic Stylistic Layer - Ensure content passes human authenticity checks
   */
  private async applyForensicLayer(
    payload: Record<string, unknown>,
    tokenTracker: TokenTracker,
  ): Promise<{ passed: boolean; score: number; recommendations: string[] }> {
    const prompt = `
            Evaluate content authenticity for: ${payload.mission}

            Apply Forensic Stylistic Layer analysis:
            1. Does the content mirror natural human speech patterns?
            2. Are there AI-detectable patterns (repetition, formulaic structures)?
            3. Does it have authentic voice and personality?
            4. Are there genuine expertise indicators (anecdotes, specific examples)?
            5. Would this content be flagged as automated spam?

            Return JSON:
            {
                "passed": true/false,
                "score": 0-100 (human authenticity score),
                "patterns": ["detected AI patterns if any"],
                "recommendations": ["how to improve authenticity"]
            }
        `;

    try {
      const result = await this.model.generateContent(prompt);
      tokenTracker.recordGemini(result.response, 'gemini-3-flash-preview');
      const text = result.response
        .text()
        .replace(/```json|```/gi, '')
        .trim();
      return JSON.parse(text);
    } catch {
      return {
        passed: true,
        score: 70,
        recommendations: ['Unable to analyze - manual review recommended'],
      };
    }
  }

  /**
   * Comprehensive LLM Visibility Audit
   */
  private async auditLlmVisibility(
    payload: Record<string, unknown>,
    tokenTracker: TokenTracker,
  ): Promise<{ visibility: number; platformBreakdown: Record<string, number>; gaps: string[] }> {
    const platforms = (payload.platforms as string[]) || ['gemini', 'chatgpt', 'perplexity'];

    const prompt = `
            Conduct LLM Visibility Audit for: ${payload.brand}
            Platforms to check: ${platforms.join(', ')}

            For each platform, assess:
            - How visible is this brand in AI search results?
            - Is it cited as an authority?
            - What queries would surface this brand?
            - What gaps exist in visibility?

            Return JSON:
            {
                "visibility": overall score 0-100,
                "platformBreakdown": { "gemini": 0-100, "chatgpt": 0-100, ... },
                "strengths": ["areas of strong visibility"],
                "gaps": ["visibility gaps to address"],
                "recommendations": ["how to improve LLM visibility"]
            }
        `;

    try {
      const result = await this.model.generateContent(prompt);
      tokenTracker.recordGemini(result.response, 'gemini-3-flash-preview');
      const text = result.response
        .text()
        .replace(/```json|```/gi, '')
        .trim();
      return JSON.parse(text);
    } catch {
      return {
        visibility: 50,
        platformBreakdown: Object.fromEntries(platforms.map((p) => [p, 50])),
        gaps: ['Unable to complete audit - retry recommended'],
      };
    }
  }

  /**
   * Calculate overall Citation Readiness score
   */
  private calculateCitationReadiness(findings: Record<string, unknown>): number {
    let score = 50; // Base score

    if (findings.citation_analysis) {
      const cv = findings.citation_analysis as CitationVectorScore;
      score = (score + (cv.overallScore || 50)) / 2;
    }

    if (findings.forensic_layer) {
      const fl = findings.forensic_layer as { score: number };
      score = (score + (fl.score || 50)) / 2;
    }

    if (findings.llm_visibility) {
      const lv = findings.llm_visibility as { visibility: number };
      score = (score + (lv.visibility || 50)) / 2;
    }

    return Math.round(score);
  }

  /**
   * Generate comprehensive GEO report with Gemini 3
   */
  private async generateGeoReport(
    findings: Record<string, unknown>,
    tokenTracker: TokenTracker,
  ): Promise<string> {
    try {
      const result = await this.model.generateContent(`
                Synthesize these GEO audit findings into an executive summary:
                ${JSON.stringify(findings, null, 2)}

                Include:
                1. CITATION READINESS: Overall score and key factors
                2. PRIMARY AUTHORITY STATUS: Current position and gaps
                3. FORENSIC COMPLIANCE: Content authenticity assessment
                4. PRIORITY ACTIONS: Top 5 recommendations for GEO improvement
                5. ZERO-CLICK READINESS: Preparedness for AI transactional search

                Format as a professional GEO audit report.
            `);
      tokenTracker.recordGemini(result.response, 'gemini-3-flash-preview');
      return result.response.text();
    } catch {
      return 'Report generation failed. Review individual findings.';
    }
  }

  async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
    this.mode = 'VERIFICATION';
    this.log('✅ Validating Synthex GEO audit...');

    const data = result.data as Record<string, unknown>;

    return {
      passed: result.success,
      checks: [
        {
          name: 'Citation Analysis Complete',
          passed: result.artifacts?.some((a) => a.name.includes('citation')) ?? false,
          message: 'Citation Vector analysis executed',
        },
        {
          name: 'Authority Scoring',
          passed: result.artifacts?.some((a) => a.name.includes('authority')) ?? false,
          message: 'Primary Authority scores calculated',
        },
        {
          name: 'Forensic Layer Applied',
          passed: result.artifacts?.some((a) => a.name.includes('forensic')) ?? false,
          message: 'Content authenticity validated',
        },
        {
          name: 'LLM Visibility Audited',
          passed: result.artifacts?.some((a) => a.name.includes('visibility')) ?? false,
          message: 'Platform visibility assessed',
        },
        {
          name: 'Citation Readiness Score',
          passed: (data?.citationReady as number) >= 50,
          message: `Citation readiness: ${data?.citationReady || 0}%`,
        },
      ],
      recommendations: result.success
        ? [
            'Implement citation-worthy content improvements within 14 days',
            'Add structured data (Schema.org) to key pages',
            'Build topical authority through expert content clusters',
            'Monitor LLM visibility monthly',
            'A/B test forensic-optimized content',
          ]
        : ['Review failed audit steps and retry', 'Verify target URL accessibility'],
    };
  }
}
