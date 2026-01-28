/**
 * Technical SEO Analyzer
 *
 * Analyzes technical SEO elements including performance, mobile friendliness,
 * security, structured data, and crawlability.
 */

import { parseHTML } from 'linkedom';
import {
    TechnicalAnalysis,
    PerformanceMetrics,
    MobileAnalysis,
    TouchElementsAnalysis,
    FontSizeAnalysis,
    SecurityAnalysis,
    StructuredDataAnalysis,
    SchemaType,
    CrawlabilityAnalysis
} from '../types';

export class TechnicalAnalyzer {
    private googleApiKey: string | undefined;

    constructor() {
        this.googleApiKey = process.env.GOOGLE_API_KEY;
    }

    /**
     * Analyze all technical SEO elements
     */
    async analyze(html: string, url: string, includePerformance: boolean = false): Promise<TechnicalAnalysis> {
        const { document: doc } = parseHTML(html);

        const [performance, mobile, security, structured, crawlability] = await Promise.all([
            includePerformance && this.googleApiKey
                ? this.analyzePerformance(url)
                : this.getDefaultPerformanceMetrics(),
            this.analyzeMobile(doc),
            this.analyzeSecurity(url, doc),
            this.analyzeStructuredData(doc),
            this.analyzeCrawlability(url, doc)
        ]);

        // Calculate overall technical score
        const score = Math.round(
            (performance.score * 0.3 +
                mobile.score * 0.2 +
                security.score * 0.2 +
                structured.score * 0.15 +
                crawlability.score * 0.15)
        );

        return {
            performance,
            mobile,
            security,
            structured,
            crawlability,
            score: Math.max(0, Math.min(100, score))
        };
    }

    /**
     * Analyze performance using Google PageSpeed Insights API
     */
    private async analyzePerformance(url: string): Promise<PerformanceMetrics> {
        if (!this.googleApiKey) {
            return this.getDefaultPerformanceMetrics();
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${this.googleApiKey}&strategy=mobile&category=PERFORMANCE`
            );

            if (!response.ok) {
                throw new Error(`PageSpeed API error: ${response.status}`);
            }

            const data = await response.json();
            const lighthouseResult = data.lighthouseResult;
            const metrics = lighthouseResult.audits;

            // Extract Core Web Vitals
            const lcp = metrics['largest-contentful-paint']?.numericValue || 0;
            const fcp = metrics['first-contentful-paint']?.numericValue || 0;
            const tti = metrics['interactive']?.numericValue || 0;
            const tbt = metrics['total-blocking-time']?.numericValue || 0;
            const cls = metrics['cumulative-layout-shift']?.numericValue || 0;
            const speedIndex = metrics['speed-index']?.numericValue || 0;

            const performanceScore = Math.round((lighthouseResult.categories.performance?.score || 0) * 100);

            const issues: string[] = [];

            // Evaluate each metric
            if (lcp > 2500) {
                issues.push(`LCP is slow (${(lcp / 1000).toFixed(2)}s, target: < 2.5s)`);
            }
            if (fcp > 1800) {
                issues.push(`FCP is slow (${(fcp / 1000).toFixed(2)}s, target: < 1.8s)`);
            }
            if (tti > 3800) {
                issues.push(`TTI is slow (${(tti / 1000).toFixed(2)}s, target: < 3.8s)`);
            }
            if (tbt > 200) {
                issues.push(`TBT is high (${tbt.toFixed(0)}ms, target: < 200ms)`);
            }
            if (cls > 0.1) {
                issues.push(`CLS is high (${cls.toFixed(3)}, target: < 0.1)`);
            }

            return {
                loadTime: tti,
                firstContentfulPaint: fcp,
                largestContentfulPaint: lcp,
                timeToInteractive: tti,
                totalBlockingTime: tbt,
                cumulativeLayoutShift: cls,
                speedIndex,
                score: performanceScore,
                issues
            };
        } catch (error: any) {
            console.error('[TechnicalAnalyzer] PageSpeed API error:', error);
            return this.getDefaultPerformanceMetrics();
        }
    }

    /**
     * Get default performance metrics when API is unavailable
     */
    private getDefaultPerformanceMetrics(): PerformanceMetrics {
        return {
            loadTime: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            timeToInteractive: 0,
            totalBlockingTime: 0,
            cumulativeLayoutShift: 0,
            speedIndex: 0,
            score: 50, // Neutral score
            issues: ['Performance analysis requires Google PageSpeed Insights API key']
        };
    }

    /**
     * Analyze mobile friendliness
     */
    private analyzeMobile(doc: Document): MobileAnalysis {
        const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
        const isMobileFriendly = viewport.includes('width=device-width');

        const issues: string[] = [];
        let score = 100;

        // Check viewport meta tag
        if (!viewport) {
            issues.push('Missing viewport meta tag');
            score -= 40;
        } else if (!viewport.includes('width=device-width')) {
            issues.push('Viewport does not include width=device-width');
            score -= 30;
        }

        if (!viewport.includes('initial-scale=1')) {
            issues.push('Viewport missing initial-scale=1');
            score -= 10;
        }

        // Analyze touch elements spacing (simplified heuristic)
        const touchElements = doc.querySelectorAll('button, a, input, select, textarea');
        let tooClose = 0;
        let properSpacing = 0;

        // Check if elements have sufficient tap target size (simplified)
        touchElements.forEach(element => {
            const style = element.getAttribute('style') || '';
            const hasMinSize = /min-(width|height):\s*44px|min-(width|height):\s*48px/.test(style);

            if (hasMinSize) {
                properSpacing++;
            } else {
                // Assume elements without explicit min-size might be too small
                tooClose++;
            }
        });

        if (tooClose > touchElements.length * 0.5) {
            issues.push(`${tooClose} touch targets may be too small or too close (min 44x44px recommended)`);
            score -= 20;
        }

        // Analyze font sizes (simplified)
        const textElements = doc.querySelectorAll('p, span, div, a, li, td, th');
        let tooSmall = 0;
        let readable = 0;

        textElements.forEach(element => {
            const style = element.getAttribute('style') || '';
            const fontSizeMatch = style.match(/font-size:\s*(\d+)px/);

            if (fontSizeMatch) {
                const size = parseInt(fontSizeMatch[1]);
                if (size < 16) {
                    tooSmall++;
                } else {
                    readable++;
                }
            }
        });

        const minSize = tooSmall > 0 ? 12 : 16; // Estimate minimum font size

        if (tooSmall > textElements.length * 0.3) {
            issues.push(`${tooSmall} text elements with font size < 16px (may be hard to read on mobile)`);
            score -= 15;
        }

        const touchElementsAnalysis: TouchElementsAnalysis = {
            total: touchElements.length,
            tooClose,
            properSpacing
        };

        const fontSizeAnalysis: FontSizeAnalysis = {
            readable,
            tooSmall,
            minSize
        };

        return {
            isMobileFriendly,
            viewport,
            touchElements: touchElementsAnalysis,
            fontSizes: fontSizeAnalysis,
            score: Math.max(0, score),
            issues
        };
    }

    /**
     * Analyze security (HTTPS, HSTS, mixed content)
     */
    private async analyzeSecurity(url: string, doc: Document): Promise<SecurityAnalysis> {
        const parsedUrl = new URL(url);
        const hasHTTPS = parsedUrl.protocol === 'https:';

        const issues: string[] = [];
        let score = 100;

        // Check HTTPS
        if (!hasHTTPS) {
            issues.push('Site not using HTTPS - insecure connection');
            score -= 50;
            return {
                hasHTTPS: false,
                hasHSTS: false,
                mixedContent: false,
                score: 0,
                issues
            };
        }

        // Check for mixed content (HTTP resources on HTTPS page)
        let mixedContent = false;
        const resources = [
            ...Array.from(doc.querySelectorAll('img')).map(img => img.getAttribute('src')),
            ...Array.from(doc.querySelectorAll('script')).map(script => script.getAttribute('src')),
            ...Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(link => link.getAttribute('href'))
        ].filter(Boolean);

        for (const resource of resources) {
            if (resource && resource.startsWith('http://')) {
                mixedContent = true;
                break;
            }
        }

        if (mixedContent) {
            issues.push('Mixed content detected (HTTP resources on HTTPS page)');
            score -= 30;
        }

        // Check HSTS header (requires actual fetch, so we'll skip for now)
        // In production, you'd want to fetch the headers
        const hasHSTS = false; // Placeholder - would need to check actual headers

        return {
            hasHTTPS,
            hasHSTS,
            mixedContent,
            score: Math.max(0, score),
            issues
        };
    }

    /**
     * Analyze structured data (JSON-LD, Microdata, RDFa)
     */
    private analyzeStructuredData(doc: Document): StructuredDataAnalysis {
        const schemas: SchemaType[] = [];
        let errors = 0;
        let warnings = 0;

        // Find JSON-LD scripts
        const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');

        jsonLdScripts.forEach(script => {
            try {
                const content = script.textContent || '';
                const data = JSON.parse(content);

                // Handle single schema or array of schemas
                const schemaArray = Array.isArray(data) ? data : [data];

                schemaArray.forEach(schema => {
                    const type = schema['@type'] || 'Unknown';
                    const existingSchema = schemas.find(s => s.type === type);

                    if (existingSchema) {
                        existingSchema.count++;
                    } else {
                        schemas.push({
                            type,
                            count: 1,
                            valid: true,
                            errors: []
                        });
                    }

                    // Basic validation
                    if (!schema['@context']) {
                        errors++;
                        const schemaObj = schemas.find(s => s.type === type);
                        if (schemaObj) {
                            schemaObj.valid = false;
                            schemaObj.errors.push('Missing @context property');
                        }
                    }
                });
            } catch (error: any) {
                errors++;
                schemas.push({
                    type: 'Invalid',
                    count: 1,
                    valid: false,
                    errors: [`JSON parsing error: ${error.message}`]
                });
            }
        });

        // Check for common schema types
        const hasOrganization = schemas.some(s => s.type === 'Organization');
        const hasWebSite = schemas.some(s => s.type === 'WebSite');
        const hasWebPage = schemas.some(s => s.type === 'WebPage');

        if (!hasOrganization && !hasWebSite) {
            warnings++;
        }

        const hasStructuredData = schemas.length > 0;
        let score = 100;

        if (!hasStructuredData) {
            score = 0;
        } else if (errors > 0) {
            score -= errors * 30;
        } else if (!hasWebPage && !hasWebSite) {
            score -= 20;
        }

        return {
            hasStructuredData,
            schemas,
            errors,
            warnings,
            score: Math.max(0, score)
        };
    }

    /**
     * Analyze crawlability (robots.txt, sitemap, meta robots)
     */
    private async analyzeCrawlability(url: string, doc: Document): Promise<CrawlabilityAnalysis> {
        const parsedUrl = new URL(url);
        const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

        const issues: string[] = [];
        let score = 100;

        // Check robots meta tag
        const robotsMeta = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
        const indexable = !robotsMeta.includes('noindex');
        const crawlable = !robotsMeta.includes('nofollow');

        if (!indexable) {
            issues.push('Page has noindex directive - will not appear in search results');
            score -= 50;
        }

        if (!crawlable) {
            issues.push('Page has nofollow directive - links will not be crawled');
            score -= 20;
        }

        // Check for robots.txt (would need actual fetch)
        let hasRobotsTxt = false;
        let robotsTxtUrl: string | undefined;

        try {
            const robotsUrl = `${baseUrl}/robots.txt`;
            const response = await fetch(robotsUrl, { method: 'HEAD' });
            hasRobotsTxt = response.ok;
            if (hasRobotsTxt) {
                robotsTxtUrl = robotsUrl;
            }
        } catch {
            // Robots.txt not found or error
        }

        if (!hasRobotsTxt) {
            issues.push('No robots.txt file found');
            score -= 15;
        }

        // Check for sitemap (look in HTML or robots.txt)
        const sitemapLink = doc.querySelector('link[rel="sitemap"]')?.getAttribute('href');
        let hasSitemap = !!sitemapLink;
        let sitemapUrl = sitemapLink ? new URL(sitemapLink, url).href : undefined;

        // If no sitemap link in HTML, assume it might be in robots.txt
        if (!hasSitemap) {
            sitemapUrl = `${baseUrl}/sitemap.xml`;
            try {
                const response = await fetch(sitemapUrl, { method: 'HEAD' });
                hasSitemap = response.ok;
            } catch {
                hasSitemap = false;
                sitemapUrl = undefined;
            }
        }

        if (!hasSitemap) {
            issues.push('No XML sitemap found');
            score -= 15;
        }

        // Check canonical tag
        const canonical = doc.querySelector('link[rel="canonical"]');
        if (!canonical) {
            issues.push('No canonical tag found - can cause duplicate content issues');
            score -= 10;
        }

        return {
            hasRobotsTxt,
            hasSitemap,
            robotsTxtUrl,
            sitemapUrl,
            indexable,
            crawlable,
            score: Math.max(0, score),
            issues
        };
    }
}

/**
 * Create and export singleton instance
 */
let analyzerInstance: TechnicalAnalyzer | null = null;

export function getTechnicalAnalyzer(): TechnicalAnalyzer {
    if (!analyzerInstance) {
        analyzerInstance = new TechnicalAnalyzer();
    }
    return analyzerInstance;
}
