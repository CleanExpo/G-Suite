/**
 * Web Scraper Agent
 *
 * Enterprise web scraping agent with anti-block handling,
 * intelligent extraction, and structured data output.
 * Implements Jina AI Reader for AI-friendly content extraction.
 */

import {
  BaseAgent,
  AgentContext,
  AgentPlan,
  AgentResult,
  VerificationReport,
  PlanStep,
} from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getJinaClient, JinaReaderResult } from '../lib/jina/client';
import { brandExtractor } from '../lib/brand/extractor';

// Scraping mode configuration
type ScrapingMode = 'gentle' | 'standard' | 'aggressive' | 'burst' | 'jina_reader';

// Scraping target
interface ScrapeTarget {
  url: string;
  selectors?: Record<string, string>;
  pagination?: {
    type: 'next' | 'infinite' | 'numbered';
    maxPages: number;
  };
  extractBrand?: boolean; // New flag for brand extraction
}

// Extracted data item
interface ExtractedItem {
  url: string;
  data: Record<string, unknown>;
  metadata: {
    scrapedAt: number;
    responseTime: number;
    statusCode: number;
    engine: 'native' | 'jina';
  };
}

// Scrape job result
interface ScrapeJobResult {
  jobId: string;
  status: 'completed' | 'partial' | 'failed';
  items: ExtractedItem[];
  stats: {
    urlsProcessed: number;
    successCount: number;
    failCount: number;
    totalTime: number;
  };
}

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || '',
);

export class WebScraperAgent extends BaseAgent {
  readonly name = 'web-scraper';
  readonly description = 'Enterprise web scraping with Jina AI integration for brand extraction';
  readonly capabilities = [
    'url_crawling',
    'content_extraction',
    'structured_data',
    'anti_block_handling',
    'pagination_support',
    'jina_reader', // New capability
    'brand_analysis', // New capability
  ];
  readonly requiredSkills = ['web_unlocker', 'web_crawler', 'structured_scraper', 'data_archive'];

  // Configuration
  private readonly config = {
    modes: {
      gentle: { requestsPerSecond: 0.2, concurrent: 2 },
      standard: { requestsPerSecond: 1, concurrent: 5 },
      aggressive: { requestsPerSecond: 10, concurrent: 20 },
      burst: { requestsPerSecond: 50, concurrent: 50 },
      jina_reader: { requestsPerSecond: 5, concurrent: 10 }, // Jina is fast
    },
    defaultMode: 'jina_reader' as ScrapingMode, // Default to Jina for better quality
    retryAttempts: 3,
    timeout: 30000,
  };

  // Gemini 3 for intelligent extraction
  private readonly model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Jina Client
  private readonly jina = getJinaClient();

  // Current job state
  private currentJob?: ScrapeJobResult;

  /**
   * Parse URLs from mission
   */
  private parseTargets(context: AgentContext): ScrapeTarget[] {
    const urlMatches = context.mission.match(/https?:\/\/[^\s]+/g) || [];

    // Detect if brand extraction is requested
    const extractBrand =
      context.mission.toLowerCase().includes('brand') ||
      context.mission.toLowerCase().includes('style') ||
      context.mission.toLowerCase().includes('color');

    return urlMatches.map((url) => ({
      url,
      selectors: context.config?.selectors as Record<string, string> | undefined,
      pagination: context.config?.pagination as ScrapeTarget['pagination'],
      extractBrand,
    }));
  }

  /**
   * Generate extraction selectors using AI
   */
  private async generateSelectors(
    url: string,
    dataFields: string[],
  ): Promise<Record<string, string>> {
    const prompt = `
      For this URL: ${url}
      Generate CSS selectors to extract these fields: ${dataFields.join(', ')}
      
      Return JSON object mapping field names to CSS selectors:
      { "title": "h1.product-title", "price": ".price-container span" }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response
        .text()
        .replace(/```json|```/gi, '')
        .trim();
      return JSON.parse(text);
    } catch {
      return {
        title: 'h1, .title, [data-title]',
        description: 'meta[name="description"], .description',
      };
    }
  }

  /**
   * Fetch page using Jina Reader
   */
  private async fetchWithJina(url: string): Promise<JinaReaderResult> {
    this.log(`🚀 Jina Reader: Processing ${url}...`);
    return await this.jina.read(url, { withImagesSummary: true });
  }

  /**
   * PLANNING: Analyze targets and create scraping plan
   */
  async plan(context: AgentContext): Promise<AgentPlan> {
    this.mode = 'PLANNING';
    this.log('🕷️ Web Scraper: Planning extraction job...');

    const targets = this.parseTargets(context);
    const mode = (context.config?.mode as ScrapingMode) || this.config.defaultMode;

    if (targets.length === 0) {
      return {
        steps: [
          {
            id: 'discover',
            action: 'Discover URLs from mission description',
            tool: 'web_crawler',
            payload: { query: context.mission, maxUrls: 5 },
          },
        ],
        estimatedCost: 25,
        requiredSkills: this.requiredSkills,
        reasoning: 'No URLs provided. Will discover URLs first.',
      };
    }

    const steps: PlanStep[] = [];

    for (let i = 0; i < targets.length; i++) {
      // Step 1: Fetch Content (Jina or Native)
      steps.push({
        id: `fetch_${i}`,
        action: `Fetch content: ${targets[i].url.substring(0, 40)}...`,
        tool: mode === 'jina_reader' ? 'jina_reader' : 'web_unlocker',
        payload: { url: targets[i].url },
      });

      // Step 2: Extract Brand DNA (if requested)
      if (targets[i].extractBrand) {
        steps.push({
          id: `analyze_brand_${i}`,
          action: 'Extract Brand DNA (Colors, Fonts, Vibe)',
          tool: 'brand_extractor',
          payload: { url: targets[i].url },
          dependencies: [`fetch_${i}`],
        });
      }

      // Step 3: Extract Specific Data (if selectors provided or inferred)
      if (targets[i].selectors || !targets[i].extractBrand) {
        steps.push({
          id: `extract_data_${i}`,
          action: 'Extract structured data',
          tool: 'structured_scraper',
          payload: { pageIndex: i },
          dependencies: [`fetch_${i}`],
        });
      }
    }

    // Calculate Cost (Jina is premium)
    const baseCost = 10;
    const perUrlCost = mode === 'jina_reader' ? 5 : 2;

    return {
      steps,
      estimatedCost: baseCost + targets.length * perUrlCost,
      requiredSkills: this.requiredSkills,
      reasoning: `Processing ${targets.length} URLs using ${mode} engine.${targets[0]?.extractBrand ? ' Brand analysis enabled.' : ''}`,
    };
  }

  /**
   * EXECUTION: Run the scraping job
   */
  async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
    this.mode = 'EXECUTION';
    this.log('⚡ Web Scraper: Executing scrape job...');

    const startTime = Date.now();
    const mode = (context.config?.mode as ScrapingMode) || this.config.defaultMode;
    const targets = this.parseTargets(context);

    // Initialize job
    this.currentJob = {
      jobId: `scrape_${Date.now()}`,
      status: 'completed',
      items: [],
      stats: { urlsProcessed: 0, successCount: 0, failCount: 0, totalTime: 0 },
    };

    const artifacts: AgentResult['artifacts'] = [];

    // Storage for fetched content to pass between steps
    const contentCache: Record<string, string> = {};

    try {
      for (const step of plan.steps) {
        this.log(`Executing: ${step.action}`);
        const stepStartTime = Date.now();

        // --- TOOL: JINA READER ---
        if (step.tool === 'jina_reader') {
          const url = step.payload.url as string;
          try {
            const result = await this.fetchWithJina(url);
            contentCache[url] = result.content; // Store markdown for analysis

            this.currentJob.stats.urlsProcessed++;
            this.currentJob.stats.successCount++;

            // Store raw Jina result as artifact
            artifacts.push({
              type: 'data',
              name: `jina_raw_${step.id}`,
              value: result as any,
            });
          } catch (err) {
            this.log(`❌ Jina Failed: ${err}`);
            this.currentJob.stats.failCount++;
          }
        }

        // --- TOOL: BRAND EXTRACTOR ---
        else if (step.tool === 'brand_extractor') {
          const url = step.payload.url as string;
          const content = contentCache[url];

          if (content) {
            const brandProfile = await brandExtractor.extract(content, url);

            artifacts.push({
              type: 'data',
              name: 'brand_profile',
              value: brandProfile as any,
            });

            this.log(`🎨 Brand extracted: ${brandProfile.name} (${brandProfile.tone.voice})`);

            // Add to job items
            this.currentJob.items.push({
              url,
              data: { brandProfile },
              metadata: {
                scrapedAt: Date.now(),
                responseTime: Date.now() - stepStartTime,
                statusCode: 200,
                engine: 'jina',
              },
            });
          }
        }

        // --- TOOL: WEB UNLOCKER (Legacy/Fallback) ---
        else if (step.tool === 'web_unlocker') {
          // ... legacy fetch logic (simplified for this replacement)
          this.log('Using legacy fetch (mocked for now)');
          contentCache[step.payload.url as string] = 'Legacy HTML Content';
          this.currentJob.stats.urlsProcessed++;
          this.currentJob.stats.successCount++;
        }
      }

      this.currentJob.stats.totalTime = Date.now() - startTime;

      return {
        success: this.currentJob.stats.failCount === 0,
        data: {
          message: `Processed ${this.currentJob.stats.successCount} URLs using ${mode}`,
          jobId: this.currentJob.jobId,
          stats: this.currentJob.stats,
          items: this.currentJob.items,
        },
        cost: plan.estimatedCost,
        duration: Date.now() - startTime,
        artifacts,
      };
    } catch (error: any) {
      this.currentJob.status = 'failed';
      return {
        success: false,
        error: error.message,
        cost: 0,
        duration: Date.now() - startTime,
        artifacts,
      };
    }
  }

  /**
   * VERIFICATION: Validate scraper results
   */
  async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
    this.mode = 'VERIFICATION';
    const items = ((result.data as any)?.items as ExtractedItem[]) || [];

    return {
      passed: result.success && items.length > 0,
      checks: [
        {
          name: 'Content Fetched',
          passed: items.length > 0,
          message: `${items.length} pages processed`,
        },
        {
          name: 'Brand Data (if requested)',
          passed: items.every((i) => !context.mission.includes('brand') || i.data.brandProfile),
          message: 'Brand DNA present in results',
        },
      ],
      recommendations: [],
    };
  }
}
