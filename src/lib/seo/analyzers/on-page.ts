/**
 * On-Page SEO Analyzer
 *
 * Analyzes on-page SEO elements including title, meta description,
 * headings, images, links, and social meta tags.
 */

import { parseHTML } from 'linkedom';
import {
    OnPageAnalysis,
    TitleAnalysis,
    MetaDescriptionAnalysis,
    HeadingAnalysis,
    HeadingTag,
    HeadingStructure,
    ImageAnalysis,
    ImageDetail,
    LinkAnalysis,
    LinkDetail,
    OpenGraphAnalysis,
    TwitterCardAnalysis
} from '../types';

export class OnPageAnalyzer {
    /**
     * Analyze all on-page SEO elements
     */
    async analyze(html: string, url: string, targetKeywords: string[] = []): Promise<OnPageAnalysis> {
        const { document: doc } = parseHTML(html);

        const primaryKeyword = targetKeywords[0] || '';

        return {
            title: this.analyzeTitle(doc, primaryKeyword),
            metaDescription: this.analyzeMetaDescription(doc, primaryKeyword),
            headings: this.analyzeHeadings(doc, primaryKeyword),
            images: this.analyzeImages(doc, url),
            links: this.analyzeLinks(doc, url),
            canonicalUrl: this.getCanonicalUrl(doc),
            robots: this.getRobotsDirective(doc),
            openGraph: this.analyzeOpenGraph(doc),
            twitterCard: this.analyzeTwitterCard(doc)
        };
    }

    /**
     * Analyze title tag
     */
    private analyzeTitle(doc: Document, keyword: string): TitleAnalysis {
        const titleElement = doc.querySelector('title');
        const content = titleElement?.textContent?.trim() || '';
        const length = content.length;

        const issues: string[] = [];
        const recommendations: string[] = [];
        let score = 100;

        // Check if title exists
        if (!content) {
            issues.push('No title tag found');
            score -= 50;
        }

        // Check length (optimal: 50-60 characters)
        if (length < 30) {
            issues.push('Title is too short (< 30 characters)');
            recommendations.push(`Expand title to 50-60 characters for better visibility`);
            score -= 20;
        } else if (length > 60) {
            issues.push(`Title is too long (${length} characters, optimal: 50-60)`);
            recommendations.push(`Shorten title to 50-60 characters to avoid truncation in search results`);
            score -= 15;
        }

        // Check keyword presence
        const hasKeyword = Boolean(keyword && content.toLowerCase().includes(keyword.toLowerCase()));
        let keywordPosition: number | undefined;

        if (keyword) {
            if (hasKeyword) {
                keywordPosition = content.toLowerCase().indexOf(keyword.toLowerCase());
                if (keywordPosition > 30) {
                    recommendations.push(`Move keyword "${keyword}" closer to the beginning of title`);
                    score -= 10;
                }
            } else {
                issues.push(`Target keyword "${keyword}" not found in title`);
                recommendations.push(`Include primary keyword "${keyword}" in title tag`);
                score -= 25;
            }
        }

        // Check for duplicate words
        const words = content.toLowerCase().split(/\s+/);
        const duplicates = words.filter((word, index) => words.indexOf(word) !== index && word.length > 3);
        if (duplicates.length > 0) {
            recommendations.push('Avoid repeating words in title for better readability');
            score -= 5;
        }

        return {
            content,
            length,
            score: Math.max(0, score),
            issues,
            recommendations,
            hasKeyword,
            keywordPosition
        };
    }

    /**
     * Analyze meta description
     */
    private analyzeMetaDescription(doc: Document, keyword: string): MetaDescriptionAnalysis {
        const metaElement = doc.querySelector('meta[name="description"]');
        const content = metaElement?.getAttribute('content')?.trim() || '';
        const length = content.length;

        const issues: string[] = [];
        const recommendations: string[] = [];
        let score = 100;

        // Check if meta description exists
        if (!content) {
            issues.push('No meta description found');
            recommendations.push('Add a compelling meta description (150-160 characters)');
            score -= 50;
        }

        // Check length (optimal: 150-160 characters)
        if (content && length < 120) {
            issues.push('Meta description is too short (< 120 characters)');
            recommendations.push('Expand meta description to 150-160 characters');
            score -= 20;
        } else if (length > 160) {
            issues.push(`Meta description is too long (${length} characters, optimal: 150-160)`);
            recommendations.push('Shorten meta description to avoid truncation in search results');
            score -= 15;
        }

        // Check keyword presence
        const hasKeyword = Boolean(keyword && content.toLowerCase().includes(keyword.toLowerCase()));
        if (keyword && !hasKeyword) {
            issues.push(`Target keyword "${keyword}" not found in meta description`);
            recommendations.push(`Include primary keyword "${keyword}" naturally in meta description`);
            score -= 20;
        }

        // Check for call-to-action
        const hasCallToAction = /\b(learn|discover|find|get|try|start|explore|see|read|download|subscribe|buy|shop|order|book)\b/i.test(content);
        if (content && !hasCallToAction) {
            recommendations.push('Consider adding a call-to-action to improve click-through rate');
            score -= 5;
        }

        return {
            content,
            length,
            score: Math.max(0, score),
            issues,
            recommendations,
            hasKeyword
        };
    }

    /**
     * Analyze heading structure (H1-H6)
     */
    private analyzeHeadings(doc: Document, keyword: string): HeadingAnalysis {
        const headings: { [key: string]: HeadingTag[] } = {
            h1: [],
            h2: [],
            h3: [],
            h4: [],
            h5: [],
            h6: []
        };

        // Extract all headings
        for (let level = 1; level <= 6; level++) {
            const elements = doc.querySelectorAll(`h${level}`);
            elements.forEach(element => {
                const text = element.textContent?.trim() || '';
                if (text) {
                    headings[`h${level}`].push({
                        text,
                        level,
                        hasKeyword: keyword ? text.toLowerCase().includes(keyword.toLowerCase()) : false
                    });
                }
            });
        }

        // Analyze structure
        const h1Count = headings.h1.length;
        const hasH1 = h1Count > 0;
        const issues: string[] = [];
        let score = 100;

        // Check H1
        if (!hasH1) {
            issues.push('No H1 heading found - every page should have exactly one H1');
            score -= 30;
        } else if (h1Count > 1) {
            issues.push(`Multiple H1 headings found (${h1Count}) - use only one H1 per page`);
            score -= 20;
        } else if (keyword && !headings.h1[0].hasKeyword) {
            issues.push(`H1 heading does not contain target keyword "${keyword}"`);
            score -= 15;
        }

        // Check hierarchy
        const missingLevels: number[] = [];
        let previousLevel = 1;
        for (let level = 2; level <= 6; level++) {
            if (headings[`h${level}`].length > 0) {
                if (level - previousLevel > 1) {
                    missingLevels.push(...Array.from({ length: level - previousLevel - 1 }, (_, i) => previousLevel + i + 1));
                }
                previousLevel = level;
            }
        }

        const hasProperHierarchy = missingLevels.length === 0;
        if (!hasProperHierarchy) {
            issues.push(`Heading hierarchy has gaps: missing levels ${missingLevels.join(', ')}`);
            score -= 10;
        }

        // Check H2 presence
        if (headings.h2.length === 0) {
            issues.push('No H2 headings found - add subheadings for better content structure');
            score -= 15;
        }

        // Check if any headings have keyword
        const headingsWithKeyword = Object.values(headings)
            .flat()
            .filter(h => h.hasKeyword).length;

        if (keyword && headingsWithKeyword === 0) {
            issues.push(`No headings contain target keyword "${keyword}"`);
            score -= 15;
        }

        const structure: HeadingStructure = {
            hasH1,
            h1Count,
            hasProperHierarchy,
            missingLevels
        };

        return {
            h1: headings.h1,
            h2: headings.h2,
            h3: headings.h3,
            h4: headings.h4,
            h5: headings.h5,
            h6: headings.h6,
            score: Math.max(0, score),
            issues,
            structure
        };
    }

    /**
     * Analyze images
     */
    private analyzeImages(doc: Document, baseUrl: string): ImageAnalysis {
        const images: ImageDetail[] = [];
        const imageElements = doc.querySelectorAll('img');

        imageElements.forEach(img => {
            const src = img.getAttribute('src') || '';
            const alt = img.getAttribute('alt') || undefined;
            const title = img.getAttribute('title') || undefined;
            const width = img.getAttribute('width') ? parseInt(img.getAttribute('width')!) : undefined;
            const height = img.getAttribute('height') ? parseInt(img.getAttribute('height')!) : undefined;

            // Resolve relative URLs
            let fullSrc = src;
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                try {
                    fullSrc = new URL(src, baseUrl).href;
                } catch {
                    fullSrc = src;
                }
            }

            // Check if optimized (modern format or has width/height)
            const isModernFormat = /\.(webp|avif)$/i.test(src);
            const hasDimensions = width !== undefined && height !== undefined;
            const optimized = isModernFormat || hasDimensions;

            images.push({
                src: fullSrc,
                alt,
                title,
                width,
                height,
                optimized
            });
        });

        const total = images.length;
        const withAlt = images.filter(img => img.alt !== undefined && img.alt.length > 0).length;
        const withoutAlt = total - withAlt;
        const withTitle = images.filter(img => img.title !== undefined && img.title.length > 0).length;
        const optimized = images.filter(img => img.optimized).length;

        const issues: string[] = [];
        let score = 100;

        if (withoutAlt > 0) {
            issues.push(`${withoutAlt} image${withoutAlt > 1 ? 's' : ''} missing alt text`);
            score -= Math.min(40, withoutAlt * 10);
        }

        if (optimized < total * 0.5) {
            issues.push(`Only ${optimized}/${total} images optimized (use WebP/AVIF or specify dimensions)`);
            score -= 20;
        }

        // Check for large images without dimensions
        const missingDimensions = images.filter(img => !img.width || !img.height).length;
        if (missingDimensions > 0) {
            issues.push(`${missingDimensions} image${missingDimensions > 1 ? 's' : ''} missing width/height attributes (causes layout shift)`);
            score -= 15;
        }

        return {
            total,
            withAlt,
            withoutAlt,
            withTitle,
            optimized,
            score: Math.max(0, score),
            issues,
            images
        };
    }

    /**
     * Analyze internal and external links
     */
    private analyzeLinks(doc: Document, baseUrl: string): LinkAnalysis {
        const internalLinks: LinkDetail[] = [];
        const externalLinks: LinkDetail[] = [];
        const linkElements = doc.querySelectorAll('a[href]');

        const baseDomain = new URL(baseUrl).hostname;

        linkElements.forEach(link => {
            const href = link.getAttribute('href') || '';
            const text = link.textContent?.trim() || '';
            const rel = link.getAttribute('rel') || undefined;
            const title = link.getAttribute('title') || undefined;

            // Skip empty links, anchors, and javascript
            if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }

            // Determine if internal or external
            let isInternal = false;
            let fullHref = href;

            try {
                if (href.startsWith('http')) {
                    const linkUrl = new URL(href);
                    isInternal = linkUrl.hostname === baseDomain;
                    fullHref = href;
                } else {
                    // Relative URL = internal
                    isInternal = true;
                    fullHref = new URL(href, baseUrl).href;
                }
            } catch {
                // Invalid URL, treat as internal
                isInternal = true;
            }

            const linkDetail: LinkDetail = {
                href: fullHref,
                text,
                rel,
                title,
                isBroken: false // Would need to actually fetch to determine
            };

            if (isInternal) {
                internalLinks.push(linkDetail);
            } else {
                externalLinks.push(linkDetail);
            }
        });

        const internal = internalLinks.length;
        const external = externalLinks.length;
        const nofollow = [...internalLinks, ...externalLinks].filter(link => link.rel?.includes('nofollow')).length;
        const broken = 0; // Would need actual link checking

        const issues: string[] = [];
        let score = 100;

        // Check internal linking
        if (internal === 0) {
            issues.push('No internal links found - add links to related content');
            score -= 25;
        } else if (internal < 3) {
            issues.push(`Only ${internal} internal link${internal > 1 ? 's' : ''} - add more for better site structure`);
            score -= 10;
        }

        // Check for links without anchor text
        const emptyText = [...internalLinks, ...externalLinks].filter(link => !link.text || link.text.length === 0).length;
        if (emptyText > 0) {
            issues.push(`${emptyText} link${emptyText > 1 ? 's' : ''} without anchor text`);
            score -= 15;
        }

        // Check for generic anchor text
        const genericText = [...internalLinks, ...externalLinks].filter(link =>
            /^(click here|read more|learn more|here|link|page)$/i.test(link.text)
        ).length;
        if (genericText > 0) {
            issues.push(`${genericText} link${genericText > 1 ? 's' : ''} with generic anchor text ("click here", etc.)`);
            score -= 10;
        }

        // Check external links without rel attributes
        const externalWithoutRel = externalLinks.filter(link => !link.rel).length;
        if (externalWithoutRel > 0) {
            issues.push(`${externalWithoutRel} external link${externalWithoutRel > 1 ? 's' : ''} without rel="noopener" or rel="nofollow"`);
            score -= 10;
        }

        return {
            internal,
            external,
            nofollow,
            broken,
            score: Math.max(0, score),
            issues,
            internalLinks,
            externalLinks
        };
    }

    /**
     * Get canonical URL
     */
    private getCanonicalUrl(doc: Document): string | undefined {
        const canonical = doc.querySelector('link[rel="canonical"]');
        return canonical?.getAttribute('href') || undefined;
    }

    /**
     * Get robots meta directive
     */
    private getRobotsDirective(doc: Document): string | undefined {
        const robots = doc.querySelector('meta[name="robots"]');
        return robots?.getAttribute('content') || undefined;
    }

    /**
     * Analyze Open Graph tags
     */
    private analyzeOpenGraph(doc: Document): OpenGraphAnalysis {
        const ogTags = {
            title: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || undefined,
            description: doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || undefined,
            image: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || undefined,
            url: doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || undefined,
            type: doc.querySelector('meta[property="og:type"]')?.getAttribute('content') || undefined
        };

        const hasOgTags = Object.values(ogTags).some(value => value !== undefined);
        const missingTags: string[] = [];

        if (!ogTags.title) missingTags.push('og:title');
        if (!ogTags.description) missingTags.push('og:description');
        if (!ogTags.image) missingTags.push('og:image');
        if (!ogTags.url) missingTags.push('og:url');

        let score = 100;
        if (missingTags.length > 0) {
            score -= missingTags.length * 20;
        }

        return {
            hasOgTags,
            title: ogTags.title,
            description: ogTags.description,
            image: ogTags.image,
            url: ogTags.url,
            type: ogTags.type,
            score: Math.max(0, score),
            missingTags
        };
    }

    /**
     * Analyze Twitter Card tags
     */
    private analyzeTwitterCard(doc: Document): TwitterCardAnalysis {
        const twitterTags = {
            card: doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || undefined,
            title: doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || undefined,
            description: doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || undefined,
            image: doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || undefined
        };

        const hasTwitterCard = Object.values(twitterTags).some(value => value !== undefined);
        const missingTags: string[] = [];

        if (!twitterTags.card) missingTags.push('twitter:card');
        if (!twitterTags.title) missingTags.push('twitter:title');
        if (!twitterTags.description) missingTags.push('twitter:description');
        if (!twitterTags.image) missingTags.push('twitter:image');

        let score = 100;
        if (missingTags.length > 0) {
            score -= missingTags.length * 20;
        }

        return {
            hasTwitterCard,
            card: twitterTags.card,
            title: twitterTags.title,
            description: twitterTags.description,
            image: twitterTags.image,
            score: Math.max(0, score),
            missingTags
        };
    }
}

/**
 * Create and export singleton instance
 */
let analyzerInstance: OnPageAnalyzer | null = null;

export function getOnPageAnalyzer(): OnPageAnalyzer {
    if (!analyzerInstance) {
        analyzerInstance = new OnPageAnalyzer();
    }
    return analyzerInstance;
}
