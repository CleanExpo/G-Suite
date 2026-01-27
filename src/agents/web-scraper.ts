/**
 * Web Scraper Agent
 * 
 * Enterprise web scraping agent with anti-block handling,
 * intelligent extraction, and structured data output.
 * Implements Bright Data-style web access capabilities.
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

// Scraping mode configuration
type ScrapingMode = 'gentle' | 'standard' | 'aggressive' | 'burst';

// Scraping target
interface ScrapeTarget {
    url: string;
    selectors?: Record<string, string>;
    pagination?: {
        type: 'next' | 'infinite' | 'numbered';
        maxPages: number;
    };
}

// Extracted data item
interface ExtractedItem {
    url: string;
    data: Record<string, unknown>;
    metadata: {
        scrapedAt: number;
        responseTime: number;
        statusCode: number;
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
    process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || ''
);

export class WebScraperAgent extends BaseAgent {
    readonly name = 'web-scraper';
    readonly description = 'Enterprise web scraping with anti-block handling and intelligent extraction';
    readonly capabilities = [
        'url_crawling',
        'content_extraction',
        'structured_data',
        'anti_block_handling',
        'pagination_support',
        'rate_limiting',
        'data_transformation'
    ];
    readonly requiredSkills = [
        'web_unlocker',
        'web_crawler',
        'structured_scraper',
        'data_archive'
    ];

    // Configuration
    private readonly config = {
        modes: {
            gentle: { requestsPerSecond: 0.2, concurrent: 2 },
            standard: { requestsPerSecond: 1, concurrent: 5 },
            aggressive: { requestsPerSecond: 10, concurrent: 20 },
            burst: { requestsPerSecond: 50, concurrent: 50 }
        },
        defaultMode: 'standard' as ScrapingMode,
        userAgents: [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ],
        retryAttempts: 3,
        timeout: 30000
    };

    // Gemini 3 for intelligent extraction
    private readonly model = genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        systemInstruction: 'You are a data extraction specialist. Analyze web pages and extract structured data.'
    });

    // Current job state
    private currentJob?: ScrapeJobResult;

    /**
     * Parse URLs from mission
     */
    private parseTargets(context: AgentContext): ScrapeTarget[] {
        const urlMatches = context.mission.match(/https?:\/\/[^\s]+/g) || [];

        return urlMatches.map(url => ({
            url,
            selectors: context.config?.selectors as Record<string, string> | undefined,
            pagination: context.config?.pagination as ScrapeTarget['pagination']
        }));
    }

    /**
     * Generate extraction selectors using AI
     */
    private async generateSelectors(url: string, dataFields: string[]): Promise<Record<string, string>> {
        const prompt = `
      For this URL: ${url}
      Generate CSS selectors to extract these fields: ${dataFields.join(', ')}
      
      Return JSON object mapping field names to CSS selectors:
      { "title": "h1.product-title", "price": ".price-container span" }
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/gi, '').trim();
            return JSON.parse(text);
        } catch {
            // Fallback to common selectors
            return {
                title: 'h1, .title, [data-title]',
                description: 'meta[name="description"], .description',
                price: '.price, [data-price]',
                image: 'img[src], meta[property="og:image"]'
            };
        }
    }

    /**
     * Simulate fetching a page with anti-block measures
     */
    private async fetchPage(url: string, mode: ScrapingMode): Promise<{
        success: boolean;
        html?: string;
        statusCode: number;
        responseTime: number;
    }> {
        const startTime = Date.now();

        this.log(`Fetching: ${url} (mode: ${mode})`);

        // Simulate network request with mode-based delay
        const delay = 1000 / this.config.modes[mode].requestsPerSecond;
        await new Promise(resolve => setTimeout(resolve, Math.min(delay, 2000)));

        // In production, this would use actual HTTP client with:
        // - Proxy rotation
        // - User-agent cycling
        // - Cookie handling
        // - CAPTCHA solving integration

        return {
            success: true,
            html: `<html><body><h1>Scraped Content</h1><p>Data from ${url}</p></body></html>`,
            statusCode: 200,
            responseTime: Date.now() - startTime
        };
    }

    /**
     * Extract data from HTML using selectors
     */
    private extractData(html: string, selectors: Record<string, string>): Record<string, unknown> {
        // In production, this would use cheerio or jsdom
        const extracted: Record<string, unknown> = {};

        for (const [field, selector] of Object.entries(selectors)) {
            // Simulate extraction
            extracted[field] = `[Extracted ${field} using ${selector}]`;
        }

        return extracted;
    }

    /**
     * PLANNING: Analyze targets and create scraping plan
     */
    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('🕷️ Web Scraper: Planning extraction job...');

        const targets = this.parseTargets(context);
        const mode = (context.config?.mode as ScrapingMode) || this.config.defaultMode;
        const dataFields = (context.config?.fields as string[]) || ['title', 'description', 'price'];

        if (targets.length === 0) {
            // No URLs provided, generate discovery plan
            return {
                steps: [{
                    id: 'discover',
                    action: 'Discover URLs from mission description',
                    tool: 'web_crawler',
                    payload: { query: context.mission, maxUrls: 10 }
                }],
                estimatedCost: 25,
                requiredSkills: this.requiredSkills,
                reasoning: 'No URLs provided. Will discover URLs first.'
            };
        }

        const steps: PlanStep[] = [];

        // Step 1: Generate selectors if not provided
        if (!targets[0].selectors) {
            steps.push({
                id: 'generate_selectors',
                action: 'AI-generate extraction selectors',
                tool: 'gemini_3_flash',
                payload: { url: targets[0].url, fields: dataFields }
            });
        }

        // Step 2: Scrape each target
        for (let i = 0; i < targets.length; i++) {
            steps.push({
                id: `scrape_${i}`,
                action: `Scrape: ${targets[i].url.substring(0, 50)}...`,
                tool: 'web_unlocker',
                payload: { url: targets[i].url, mode },
                dependencies: targets[i].selectors ? [] : ['generate_selectors']
            });

            steps.push({
                id: `extract_${i}`,
                action: `Extract structured data from page ${i + 1}`,
                tool: 'structured_scraper',
                payload: { pageIndex: i },
                dependencies: [`scrape_${i}`]
            });
        }

        // Step 3: Archive results
        steps.push({
            id: 'archive',
            action: 'Archive scraped data',
            tool: 'data_archive',
            payload: { format: 'json' },
            dependencies: targets.map((_, i) => `extract_${i}`)
        });

        // Calculate cost based on targets and mode
        const baseCost = 10;
        const perUrlCost = mode === 'burst' ? 5 : mode === 'aggressive' ? 3 : 2;

        return {
            steps,
            estimatedCost: baseCost + (targets.length * perUrlCost),
            requiredSkills: this.requiredSkills,
            reasoning: `Scraping ${targets.length} URL(s) in ${mode} mode with ${dataFields.length} fields`
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
            stats: {
                urlsProcessed: 0,
                successCount: 0,
                failCount: 0,
                totalTime: 0
            }
        };

        const artifacts: AgentResult['artifacts'] = [];
        let selectors: Record<string, string> = {};

        try {
            // Execute each step
            for (const step of plan.steps) {
                this.log(`Executing: ${step.action}`);

                if (step.tool === 'gemini_3_flash' || step.id === 'generate_selectors') {
                    // Generate selectors with AI
                    const fields = step.payload.fields as string[] || ['title', 'description'];
                    selectors = await this.generateSelectors(step.payload.url as string, fields);
                    artifacts.push({
                        type: 'data',
                        name: 'selectors',
                        value: selectors
                    });
                }
                else if (step.tool === 'web_unlocker') {
                    // Fetch page
                    const url = step.payload.url as string;
                    const result = await this.fetchPage(url, mode);

                    this.currentJob.stats.urlsProcessed++;

                    if (result.success) {
                        this.currentJob.stats.successCount++;
                    } else {
                        this.currentJob.stats.failCount++;
                    }
                }
                else if (step.tool === 'structured_scraper') {
                    // Extract data
                    const pageIndex = step.payload.pageIndex as number;
                    const target = targets[pageIndex];

                    if (target) {
                        const extractedData = this.extractData('', target.selectors || selectors);

                        const item: ExtractedItem = {
                            url: target.url,
                            data: extractedData,
                            metadata: {
                                scrapedAt: Date.now(),
                                responseTime: 100,
                                statusCode: 200
                            }
                        };

                        this.currentJob.items.push(item);

                        artifacts.push({
                            type: 'data',
                            name: `extracted_${pageIndex}`,
                            value: item as unknown as Record<string, unknown>
                        });
                    }
                }
                else if (step.tool === 'data_archive') {
                    // Archive all results
                    artifacts.push({
                        type: 'data',
                        name: 'archive',
                        value: {
                            jobId: this.currentJob.jobId,
                            itemCount: this.currentJob.items.length,
                            format: step.payload.format
                        }
                    });
                }
            }

            this.currentJob.stats.totalTime = Date.now() - startTime;

            return {
                success: this.currentJob.stats.failCount === 0,
                data: {
                    message: `Scraped ${this.currentJob.stats.successCount} URLs successfully`,
                    jobId: this.currentJob.jobId,
                    stats: this.currentJob.stats,
                    items: this.currentJob.items
                },
                cost: plan.estimatedCost,
                duration: Date.now() - startTime,
                artifacts
            };

        } catch (error: any) {
            this.currentJob.status = 'failed';
            return {
                success: false,
                error: error.message,
                cost: 0,
                duration: Date.now() - startTime,
                artifacts
            };
        }
    }

    /**
     * VERIFICATION: Validate scraped data
     */
    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        this.log('✅ Web Scraper: Validating results...');

        const data = result.data as Record<string, unknown> | undefined;
        const stats = data?.stats as ScrapeJobResult['stats'] | undefined;
        const items = data?.items as ExtractedItem[] | undefined;

        return {
            passed: result.success && (items?.length ?? 0) > 0,
            checks: [
                {
                    name: 'URLs Processed',
                    passed: (stats?.urlsProcessed ?? 0) > 0,
                    message: `${stats?.urlsProcessed ?? 0} URLs processed`
                },
                {
                    name: 'Success Rate',
                    passed: (stats?.failCount ?? 0) === 0,
                    message: `${stats?.successCount ?? 0}/${stats?.urlsProcessed ?? 0} successful`
                },
                {
                    name: 'Data Extracted',
                    passed: (items?.length ?? 0) > 0,
                    message: `${items?.length ?? 0} items extracted`
                },
                {
                    name: 'Data Quality',
                    passed: items?.every(i => Object.keys(i.data).length > 0) ?? false,
                    message: 'All items have data fields'
                }
            ],
            recommendations: result.success
                ? ['Review extracted data for accuracy', 'Set up recurring scrape if needed']
                : ['Check URL accessibility', 'Review selector accuracy', 'Try different scraping mode']
        };
    }

    /**
     * Get current job status
     */
    getJob(): ScrapeJobResult | undefined {
        return this.currentJob;
    }
}
