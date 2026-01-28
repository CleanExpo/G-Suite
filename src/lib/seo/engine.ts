/**
 * SEO Analysis Engine
 *
 * Main orchestration engine that coordinates all SEO analyzers and
 * generates comprehensive SEO audit reports.
 */

import { getOnPageAnalyzer } from './analyzers/on-page';
import { getTechnicalAnalyzer } from './analyzers/technical';
import { getContentAnalyzer } from './analyzers/content';
import { getKeywordAnalyzer } from './analyzers/keyword';
import {
    SEOAnalysisRequest,
    SEOAnalysisResult,
    SEORecommendation,
    SEOIssue,
    SEOCategory
} from './types';

export class SEOEngine {
    /**
     * Perform comprehensive SEO analysis
     */
    async analyze(request: SEOAnalysisRequest): Promise<SEOAnalysisResult> {
        const { url, html, keywords = [], includePerformance = false } = request;

        // Fetch HTML if not provided
        let pageHtml = html;
        if (!pageHtml) {
            pageHtml = await this.fetchHtml(url);
        }

        if (!pageHtml) {
            throw new Error(`Failed to fetch HTML from ${url}`);
        }

        // Initialize analyzers
        const onPageAnalyzer = getOnPageAnalyzer();
        const technicalAnalyzer = getTechnicalAnalyzer();
        const contentAnalyzer = getContentAnalyzer();
        const keywordAnalyzer = getKeywordAnalyzer();

        // Run all analyzers in parallel
        const [onPageSEO, technicalSEO, contentAnalysis, keywordAnalysis] = await Promise.all([
            onPageAnalyzer.analyze(pageHtml, url, keywords),
            technicalAnalyzer.analyze(pageHtml, url, includePerformance),
            contentAnalyzer.analyze(pageHtml, keywords),
            keywordAnalyzer.analyze(url, keywords, keywords[0])
        ]);

        // Calculate individual scores
        const scores = {
            onPage: this.calculateOnPageScore(onPageSEO),
            technical: technicalSEO.score,
            content: contentAnalysis.score,
            mobile: technicalSEO.mobile.score,
            performance: technicalSEO.performance.score
        };

        // Calculate overall score (weighted average)
        const overallScore = Math.round(
            scores.onPage * 0.25 +
            scores.technical * 0.25 +
            scores.content * 0.20 +
            scores.mobile * 0.15 +
            scores.performance * 0.15
        );

        // Generate recommendations
        const recommendations = this.generateRecommendations({
            onPageSEO,
            technicalSEO,
            contentAnalysis,
            keywordAnalysis
        });

        // Generate issues list
        const issues = this.generateIssues({
            onPageSEO,
            technicalSEO,
            contentAnalysis
        });

        return {
            url,
            analyzedAt: new Date(),
            overallScore: Math.max(0, Math.min(100, overallScore)),
            scores,
            onPageSEO,
            technicalSEO,
            contentAnalysis,
            keywordAnalysis,
            recommendations,
            issues
        };
    }

    /**
     * Fetch HTML from URL
     */
    private async fetchHtml(url: string): Promise<string> {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'G-Pilot SEO Analyzer Bot/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.text();
        } catch (error: any) {
            console.error(`[SEOEngine] Error fetching ${url}:`, error);
            throw error;
        }
    }

    /**
     * Calculate on-page score from all on-page elements
     */
    private calculateOnPageScore(onPageSEO: SEOAnalysisResult['onPageSEO']): number {
        const weights = {
            title: 0.25,
            metaDescription: 0.20,
            headings: 0.15,
            images: 0.15,
            links: 0.10,
            openGraph: 0.075,
            twitterCard: 0.075
        };

        const score =
            onPageSEO.title.score * weights.title +
            onPageSEO.metaDescription.score * weights.metaDescription +
            onPageSEO.headings.score * weights.headings +
            onPageSEO.images.score * weights.images +
            onPageSEO.links.score * weights.links +
            onPageSEO.openGraph.score * weights.openGraph +
            onPageSEO.twitterCard.score * weights.twitterCard;

        return Math.round(score);
    }

    /**
     * Generate prioritized recommendations
     */
    private generateRecommendations(analysis: {
        onPageSEO: SEOAnalysisResult['onPageSEO'];
        technicalSEO: SEOAnalysisResult['technicalSEO'];
        contentAnalysis: SEOAnalysisResult['contentAnalysis'];
        keywordAnalysis: SEOAnalysisResult['keywordAnalysis'];
    }): SEORecommendation[] {
        const recommendations: SEORecommendation[] = [];

        // Title recommendations
        if (analysis.onPageSEO.title.issues.length > 0) {
            recommendations.push({
                category: 'title',
                priority: 'critical',
                title: 'Optimize Title Tag',
                description: analysis.onPageSEO.title.issues.join('. '),
                impact: 25,
                effort: 'low',
                implementation: analysis.onPageSEO.title.recommendations.join('. '),
                beforeAfter: analysis.onPageSEO.title.content
                    ? {
                          before: analysis.onPageSEO.title.content,
                          after: 'Optimized title with target keyword at the beginning (50-60 characters)'
                      }
                    : undefined
            });
        }

        // Meta description recommendations
        if (analysis.onPageSEO.metaDescription.issues.length > 0) {
            recommendations.push({
                category: 'meta-description',
                priority: 'high',
                title: 'Improve Meta Description',
                description: analysis.onPageSEO.metaDescription.issues.join('. '),
                impact: 20,
                effort: 'low',
                implementation: analysis.onPageSEO.metaDescription.recommendations.join('. ')
            });
        }

        // Heading recommendations
        if (analysis.onPageSEO.headings.issues.length > 0) {
            recommendations.push({
                category: 'headings',
                priority: 'high',
                title: 'Fix Heading Structure',
                description: analysis.onPageSEO.headings.issues.join('. '),
                impact: 15,
                effort: 'medium',
                implementation: 'Ensure proper heading hierarchy (one H1, multiple H2s for subheadings) and include target keywords.'
            });
        }

        // Image recommendations
        if (analysis.onPageSEO.images.issues.length > 0) {
            recommendations.push({
                category: 'images',
                priority: 'medium',
                title: 'Optimize Images',
                description: analysis.onPageSEO.images.issues.join('. '),
                impact: 15,
                effort: 'medium',
                implementation: 'Add descriptive alt text to all images and specify width/height attributes to prevent layout shift.'
            });
        }

        // Link recommendations
        if (analysis.onPageSEO.links.issues.length > 0) {
            recommendations.push({
                category: 'links',
                priority: 'medium',
                title: 'Improve Internal Linking',
                description: analysis.onPageSEO.links.issues.join('. '),
                impact: 12,
                effort: 'low',
                implementation: 'Add more internal links to related content with descriptive anchor text.'
            });
        }

        // Performance recommendations
        if (analysis.technicalSEO.performance.issues.length > 0) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'Improve Page Performance',
                description: analysis.technicalSEO.performance.issues.join('. '),
                impact: 20,
                effort: 'high',
                implementation: 'Optimize images, minimize JavaScript, enable compression, and use browser caching.'
            });
        }

        // Mobile recommendations
        if (analysis.technicalSEO.mobile.issues.length > 0) {
            recommendations.push({
                category: 'mobile',
                priority: 'high',
                title: 'Improve Mobile Experience',
                description: analysis.technicalSEO.mobile.issues.join('. '),
                impact: 18,
                effort: 'medium',
                implementation: 'Add viewport meta tag, increase touch target sizes, and use legible font sizes.'
            });
        }

        // Security recommendations
        if (analysis.technicalSEO.security.issues.length > 0) {
            recommendations.push({
                category: 'security',
                priority: 'critical',
                title: 'Fix Security Issues',
                description: analysis.technicalSEO.security.issues.join('. '),
                impact: 30,
                effort: 'medium',
                implementation: 'Implement HTTPS, enable HSTS header, and fix mixed content warnings.'
            });
        }

        // Structured data recommendations
        if (!analysis.technicalSEO.structured.hasStructuredData) {
            recommendations.push({
                category: 'structured-data',
                priority: 'medium',
                title: 'Add Structured Data',
                description: 'No structured data found. Adding schema markup improves rich snippets in search results.',
                impact: 15,
                effort: 'medium',
                implementation: 'Add JSON-LD structured data for Organization, WebSite, and WebPage schemas.'
            });
        }

        // Crawlability recommendations
        if (analysis.technicalSEO.crawlability.issues.length > 0) {
            recommendations.push({
                category: 'crawlability',
                priority: 'high',
                title: 'Improve Crawlability',
                description: analysis.technicalSEO.crawlability.issues.join('. '),
                impact: 20,
                effort: 'medium',
                implementation: 'Create robots.txt and XML sitemap. Ensure pages are indexable.'
            });
        }

        // Content recommendations
        if (analysis.contentAnalysis.contentQuality.issues.length > 0) {
            recommendations.push({
                category: 'content',
                priority: 'high',
                title: 'Improve Content Quality',
                description: analysis.contentAnalysis.contentQuality.issues.join('. '),
                impact: 18,
                effort: 'high',
                implementation: 'Expand content length, improve content-to-code ratio, and remove duplicate paragraphs.'
            });
        }

        // Keyword recommendations
        if (analysis.keywordAnalysis.opportunities.length > 0) {
            const topOpportunity = analysis.keywordAnalysis.opportunities[0];
            recommendations.push({
                category: 'keywords',
                priority: topOpportunity.priority === 'high' ? 'high' : 'medium',
                title: 'Target Keyword Opportunities',
                description: `Consider targeting "${topOpportunity.keyword}" (${topOpportunity.reason})`,
                impact: 15,
                effort: 'medium',
                implementation: `Create content optimized for "${topOpportunity.keyword}" with potential for ${topOpportunity.potentialTraffic} monthly visits.`
            });
        }

        // Social meta recommendations
        if (analysis.onPageSEO.openGraph.missingTags.length > 0) {
            recommendations.push({
                category: 'social',
                priority: 'low',
                title: 'Add Open Graph Tags',
                description: `Missing Open Graph tags: ${analysis.onPageSEO.openGraph.missingTags.join(', ')}`,
                impact: 8,
                effort: 'low',
                implementation: 'Add og:title, og:description, og:image, and og:url for better social media sharing.'
            });
        }

        // Sort by priority and impact
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        recommendations.sort((a, b) => {
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return b.impact - a.impact;
        });

        return recommendations;
    }

    /**
     * Generate issues list
     */
    private generateIssues(analysis: {
        onPageSEO: SEOAnalysisResult['onPageSEO'];
        technicalSEO: SEOAnalysisResult['technicalSEO'];
        contentAnalysis: SEOAnalysisResult['contentAnalysis'];
    }): SEOIssue[] {
        const issues: SEOIssue[] = [];

        // Critical issues
        if (!analysis.technicalSEO.security.hasHTTPS) {
            issues.push({
                severity: 'critical',
                category: 'security',
                title: 'Site Not Using HTTPS',
                description: 'Your site is not using a secure HTTPS connection. This is a ranking factor and affects user trust.',
                affectedElements: [analysis.onPageSEO.title.content],
                fixInstructions: 'Install an SSL certificate and redirect all HTTP traffic to HTTPS.',
                impact: 'High negative impact on rankings and user trust'
            });
        }

        if (!analysis.technicalSEO.crawlability.indexable) {
            issues.push({
                severity: 'critical',
                category: 'crawlability',
                title: 'Page Has noindex Directive',
                description: 'This page has a noindex meta tag, preventing it from appearing in search results.',
                fixInstructions: 'Remove the noindex directive from the robots meta tag.',
                impact: 'Page will not appear in search engine results'
            });
        }

        // Warnings
        if (analysis.onPageSEO.title.score < 70) {
            issues.push({
                severity: 'warning',
                category: 'title',
                title: 'Title Tag Needs Optimization',
                description: analysis.onPageSEO.title.issues.join('. '),
                affectedElements: [analysis.onPageSEO.title.content],
                fixInstructions: analysis.onPageSEO.title.recommendations.join('. '),
                impact: 'Reduced click-through rate and keyword relevance'
            });
        }

        if (analysis.onPageSEO.metaDescription.score < 70) {
            issues.push({
                severity: 'warning',
                category: 'meta-description',
                title: 'Meta Description Needs Improvement',
                description: analysis.onPageSEO.metaDescription.issues.join('. '),
                affectedElements: [analysis.onPageSEO.metaDescription.content],
                fixInstructions: analysis.onPageSEO.metaDescription.recommendations.join('. '),
                impact: 'Lower click-through rate from search results'
            });
        }

        if (analysis.contentAnalysis.wordCount < 300) {
            issues.push({
                severity: 'warning',
                category: 'content',
                title: 'Insufficient Content Length',
                description: `Page has only ${analysis.contentAnalysis.wordCount} words. Longer content tends to rank better.`,
                fixInstructions: 'Expand content to at least 600-1000 words with valuable, in-depth information.',
                impact: 'Difficulty ranking for competitive keywords'
            });
        }

        // Info
        if (analysis.onPageSEO.images.withoutAlt > 0) {
            issues.push({
                severity: 'info',
                category: 'images',
                title: 'Images Missing Alt Text',
                description: `${analysis.onPageSEO.images.withoutAlt} images are missing alt text.`,
                affectedElements: analysis.onPageSEO.images.images
                    .filter(img => !img.alt)
                    .map(img => img.src)
                    .slice(0, 5),
                fixInstructions: 'Add descriptive alt text to all images for accessibility and SEO.',
                impact: 'Missed opportunity for image search traffic and accessibility issues'
            });
        }

        return issues;
    }
}

/**
 * Create and export singleton instance
 */
let engineInstance: SEOEngine | null = null;

export function getSEOEngine(): SEOEngine {
    if (!engineInstance) {
        engineInstance = new SEOEngine();
    }
    return engineInstance;
}
