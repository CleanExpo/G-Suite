/**
 * Web Intelligence Skills Tests
 * 
 * Tests for the enterprise web data collection skills.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    web_unlocker,
    serp_collector,
    web_crawler,
    structured_scraper,
    data_archive,
    deep_lookup
} from '@/tools/webIntelligenceSkills';

// Mock external dependencies
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            entityType: 'company',
                            enrichedData: { industry: 'tech', employees: 500 }
                        }),
                        usageMetadata: { totalTokenCount: 50 }
                    }
                })
            };
        }
    }
}));

describe('Web Intelligence Skills', () => {
    const testUserId = 'test_user';

    describe('web_unlocker', () => {
        it('should fetch URL with anti-block measures', async () => {
            const result = await web_unlocker(testUserId, 'https://example.com');

            expect(result.success).toBe(true);
            expect(result.url).toBe('https://example.com');
            expect(result.statusCode).toBe(200);
            expect(result.responseTime).toBeGreaterThan(0);
        });

        it('should support proxy options', async () => {
            const result = await web_unlocker(testUserId, 'https://example.com', {
                proxyType: 'residential',
                country: 'US'
            });

            expect(result.success).toBe(true);
        });
    });

    describe('serp_collector', () => {
        it('should collect search results', async () => {
            const result = await serp_collector(testUserId, 'best programming languages');

            expect(result.success).toBe(true);
            expect(result.query).toBe('best programming languages');
            expect(result.results.length).toBeGreaterThan(0);
        });

        it('should support multiple search engines', async () => {
            const googleResult = await serp_collector(testUserId, 'test query', { engine: 'google' });
            const bingResult = await serp_collector(testUserId, 'test query', { engine: 'bing' });

            expect(googleResult.engine).toBe('google');
            expect(bingResult.engine).toBe('bing');
        });
    });

    describe('web_crawler', () => {
        it('should crawl and discover URLs', async () => {
            const result = await web_crawler(testUserId, 'https://example.com');

            expect(result.success).toBe(true);
            expect(result.startUrl).toBe('https://example.com');
            expect(result.discoveredUrls.length).toBeGreaterThan(0);
            expect(result.crawledPages).toBeGreaterThan(0);
        });

        it('should respect max pages limit', async () => {
            const result = await web_crawler(testUserId, 'https://example.com', {
                maxPages: 5
            });

            expect(result.crawledPages).toBeLessThanOrEqual(5);
        });
    });

    describe('structured_scraper', () => {
        it('should extract structured data', async () => {
            const result = await structured_scraper(testUserId, 'example.com', {
                fields: ['title', 'price', 'description']
            });

            expect(result.success).toBe(true);
            expect(result.domain).toBe('example.com');
            expect(result.items.length).toBeGreaterThan(0);
        });

        it('should use specified selectors', async () => {
            const result = await structured_scraper(testUserId, 'example.com', {
                selectors: {
                    title: 'h1.product-name',
                    price: '.price'
                }
            });

            expect(result.success).toBe(true);
        });
    });

    describe('data_archive', () => {
        it('should archive data to storage', async () => {
            const testData = [
                { id: 1, name: 'Test Item' },
                { id: 2, name: 'Another Item' }
            ];

            const result = await data_archive(testUserId, testData);

            expect(result.success).toBe(true);
            expect(result.archiveId).toBeDefined();
            expect(result.itemCount).toBe(2);
        });

        it('should support different formats', async () => {
            const jsonResult = await data_archive(testUserId, [{ test: true }], { format: 'json' });
            const csvResult = await data_archive(testUserId, [{ test: true }], { format: 'csv' });

            expect(jsonResult.format).toBe('json');
            expect(csvResult.format).toBe('csv');
        });
    });

    describe('deep_lookup', () => {
        it('should enrich entity data', async () => {
            const result = await deep_lookup(testUserId, 'company:acme-corp');

            expect(result.success).toBe(true);
            expect(result.entityId).toBe('company:acme-corp');
            expect(result.enrichedData).toBeDefined();
        });

        it('should detect entity type', async () => {
            const companyResult = await deep_lookup(testUserId, 'acme-corp', { entityType: 'company' });

            expect(['company', 'person', 'product', 'place', 'unknown']).toContain(companyResult.entityType);
        });
    });
});
