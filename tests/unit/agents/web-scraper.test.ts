/**
 * Web Scraper Agent Tests
 * 
 * Tests for the enterprise web scraping agent.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebScraperAgent } from '@/agents/web-scraper';

// Mock the Google Generative AI module
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            selectors: {
                                title: 'h1.title',
                                price: '.price-tag',
                                description: '.product-description'
                            },
                            steps: [
                                { id: 'fetch', action: 'Fetch page with unlocker', tool: 'web_unlocker', payload: {} },
                                { id: 'extract', action: 'Extract structured data', tool: 'structured_scraper', payload: {} }
                            ],
                            estimatedCost: 50
                        }),
                        usageMetadata: { totalTokenCount: 50 }
                    }
                })
            };
        }
    }
}));

describe('Web Scraper Agent', () => {
    let agent: WebScraperAgent;

    beforeEach(() => {
        agent = new WebScraperAgent();
    });

    describe('Initialization', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('web-scraper');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('url_crawling');
            expect(agent.capabilities).toContain('content_extraction');
            expect(agent.capabilities).toContain('anti_block_handling');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('web_unlocker');
            expect(agent.requiredSkills).toContain('web_crawler');
            expect(agent.requiredSkills).toContain('structured_scraper');
        });
    });

    describe('Planning', () => {
        it('should parse URLs from mission', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Scrape products from https://example.com/products',
                parameters: {}
            });

            expect(plan.steps.length).toBeGreaterThan(0);
        });

        it('should detect pagination requirements', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Scrape all pages from https://example.com/listings with pagination',
                parameters: {}
            });

            expect(plan.steps.some(s => s.action?.includes('page') || s.action?.includes('crawl'))).toBe(true);
        });

        it('should estimate cost based on URL count', async () => {
            const singleUrlPlan = await agent.plan({
                userId: 'test_user',
                mission: 'Scrape https://single.com',
                parameters: {}
            });

            const multiUrlPlan = await agent.plan({
                userId: 'test_user',
                mission: 'Scrape https://first.com and https://second.com and https://third.com',
                parameters: {}
            });

            expect(multiUrlPlan.estimatedCost).toBeGreaterThanOrEqual(singleUrlPlan.estimatedCost);
        });
    });

    describe('Scraping Modes', () => {
        it('should support gentle mode', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Gently scrape https://example.com',
                parameters: { mode: 'gentle' }
            });

            expect(plan).toBeDefined();
        });

        it('should support aggressive mode', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Aggressive scrape https://example.com',
                parameters: { mode: 'aggressive' }
            });

            expect(plan).toBeDefined();
        });
    });

    describe('Verification', () => {
        it('should verify scraped data', async () => {
            const result = {
                success: true,
                data: {
                    jobId: 'test_job_123',
                    items: [
                        { url: 'https://example.com/1', data: { title: 'Product 1', price: '$10' }, metadata: { scrapedAt: Date.now(), responseTime: 100, statusCode: 200 } },
                        { url: 'https://example.com/2', data: { title: 'Product 2', price: '$20' }, metadata: { scrapedAt: Date.now(), responseTime: 100, statusCode: 200 } }
                    ],
                    stats: { urlsProcessed: 2, successCount: 2, failCount: 0, totalTime: 500 }
                },
                cost: 25,
                duration: 5000,
                artifacts: []
            };

            const report = await agent.verify(result, {
                userId: 'test_user',
                mission: 'Scrape products',
                parameters: {}
            });

            expect(report.passed).toBe(true);
        });

        it('should fail verification for empty results', async () => {
            const result = {
                success: true,
                data: {
                    jobId: 'test_job_empty',
                    items: [],
                    stats: { urlsProcessed: 1, successCount: 0, failCount: 1 }
                },
                cost: 10,
                duration: 2000,
                artifacts: []
            };

            const report = await agent.verify(result, {
                userId: 'test_user',
                mission: 'Scrape products',
                parameters: {}
            });

            expect(report.passed).toBe(false);
        });
    });
});
