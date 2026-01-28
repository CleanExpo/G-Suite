/**
 * SEO Analysis Types
 *
 * Comprehensive types for SEO analysis, scoring, and recommendations
 */

// ============================================================================
// Core SEO Analysis Types
// ============================================================================

export interface SEOAnalysisRequest {
    url: string;
    html?: string; // Optional: provide HTML content directly
    keywords?: string[]; // Target keywords to analyze
    competitors?: string[]; // Competitor URLs for comparison
    includePerformance?: boolean; // Include page speed metrics
    includeBacklinks?: boolean; // Include backlink analysis
}

export interface SEOAnalysisResult {
    url: string;
    analyzedAt: Date;
    overallScore: number; // 0-100
    scores: {
        onPage: number;
        technical: number;
        content: number;
        mobile: number;
        performance: number;
    };
    onPageSEO: OnPageAnalysis;
    technicalSEO: TechnicalAnalysis;
    contentAnalysis: ContentAnalysis;
    keywordAnalysis: KeywordAnalysis;
    recommendations: SEORecommendation[];
    issues: SEOIssue[];
    searchConsoleData?: SearchConsoleData;
}

// ============================================================================
// On-Page SEO Analysis
// ============================================================================

export interface OnPageAnalysis {
    title: TitleAnalysis;
    metaDescription: MetaDescriptionAnalysis;
    headings: HeadingAnalysis;
    images: ImageAnalysis;
    links: LinkAnalysis;
    canonicalUrl?: string;
    robots?: string;
    openGraph: OpenGraphAnalysis;
    twitterCard: TwitterCardAnalysis;
}

export interface TitleAnalysis {
    content: string;
    length: number;
    score: number; // 0-100
    issues: string[];
    recommendations: string[];
    hasKeyword: boolean;
    keywordPosition?: number;
}

export interface MetaDescriptionAnalysis {
    content: string;
    length: number;
    score: number;
    issues: string[];
    recommendations: string[];
    hasKeyword: boolean;
}

export interface HeadingAnalysis {
    h1: HeadingTag[];
    h2: HeadingTag[];
    h3: HeadingTag[];
    h4: HeadingTag[];
    h5: HeadingTag[];
    h6: HeadingTag[];
    score: number;
    issues: string[];
    structure: HeadingStructure;
}

export interface HeadingTag {
    text: string;
    level: number;
    hasKeyword: boolean;
}

export interface HeadingStructure {
    hasH1: boolean;
    h1Count: number;
    hasProperHierarchy: boolean;
    missingLevels: number[];
}

export interface ImageAnalysis {
    total: number;
    withAlt: number;
    withoutAlt: number;
    withTitle: number;
    optimized: number;
    score: number;
    issues: string[];
    images: ImageDetail[];
}

export interface ImageDetail {
    src: string;
    alt?: string;
    title?: string;
    width?: number;
    height?: number;
    size?: number;
    optimized: boolean;
}

export interface LinkAnalysis {
    internal: number;
    external: number;
    nofollow: number;
    broken: number;
    score: number;
    issues: string[];
    internalLinks: LinkDetail[];
    externalLinks: LinkDetail[];
}

export interface LinkDetail {
    href: string;
    text: string;
    rel?: string;
    title?: string;
    isBroken: boolean;
}

export interface OpenGraphAnalysis {
    hasOgTags: boolean;
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    score: number;
    missingTags: string[];
}

export interface TwitterCardAnalysis {
    hasTwitterCard: boolean;
    card?: string;
    title?: string;
    description?: string;
    image?: string;
    score: number;
    missingTags: string[];
}

// ============================================================================
// Technical SEO Analysis
// ============================================================================

export interface TechnicalAnalysis {
    performance: PerformanceMetrics;
    mobile: MobileAnalysis;
    security: SecurityAnalysis;
    structured: StructuredDataAnalysis;
    crawlability: CrawlabilityAnalysis;
    score: number;
}

export interface PerformanceMetrics {
    loadTime: number; // milliseconds
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    timeToInteractive: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
    score: number; // Lighthouse score 0-100
    issues: string[];
}

export interface MobileAnalysis {
    isMobileFriendly: boolean;
    viewport: string;
    touchElements: TouchElementsAnalysis;
    fontSizes: FontSizeAnalysis;
    score: number;
    issues: string[];
}

export interface TouchElementsAnalysis {
    total: number;
    tooClose: number;
    properSpacing: number;
}

export interface FontSizeAnalysis {
    readable: number;
    tooSmall: number;
    minSize: number;
}

export interface SecurityAnalysis {
    hasHTTPS: boolean;
    hasHSTS: boolean;
    mixedContent: boolean;
    score: number;
    issues: string[];
}

export interface StructuredDataAnalysis {
    hasStructuredData: boolean;
    schemas: SchemaType[];
    errors: number;
    warnings: number;
    score: number;
}

export interface SchemaType {
    type: string;
    count: number;
    valid: boolean;
    errors: string[];
}

export interface CrawlabilityAnalysis {
    hasRobotsTxt: boolean;
    hasSitemap: boolean;
    robotsTxtUrl?: string;
    sitemapUrl?: string;
    indexable: boolean;
    crawlable: boolean;
    score: number;
    issues: string[];
}

// ============================================================================
// Content Analysis
// ============================================================================

export interface ContentAnalysis {
    wordCount: number;
    readingLevel: ReadingLevel;
    readingTime: number; // minutes
    keywordDensity: KeywordDensity[];
    contentQuality: ContentQuality;
    uniqueness: number; // 0-100 (% unique content)
    score: number;
}

export interface ReadingLevel {
    fleschScore: number; // 0-100 (higher = easier)
    grade: number; // School grade level
    interpretation: string; // e.g., "College level", "Easy to read"
}

export interface KeywordDensity {
    keyword: string;
    count: number;
    density: number; // percentage
    prominence: number; // 0-100 (position in content)
    inTitle: boolean;
    inDescription: boolean;
    inH1: boolean;
}

export interface ContentQuality {
    hasDuplicateContent: boolean;
    hasBoilerplate: boolean;
    contentToCodeRatio: number; // percentage
    textLength: number;
    score: number;
    issues: string[];
}

// ============================================================================
// Keyword Analysis
// ============================================================================

export interface KeywordAnalysis {
    primaryKeyword?: string;
    keywords: KeywordMetrics[];
    semanticKeywords: string[];
    lsiKeywords: string[]; // Latent Semantic Indexing
    score: number;
    opportunities: KeywordOpportunity[];
}

export interface KeywordMetrics {
    keyword: string;
    volume: number; // Monthly search volume
    difficulty: number; // 0-100
    cpc: number; // Cost per click
    competition: number; // 0-1
    trend: 'rising' | 'stable' | 'declining';
    inContent: boolean;
    density: number;
    prominence: number;
}

export interface KeywordOpportunity {
    keyword: string;
    reason: string;
    potentialTraffic: number;
    difficulty: number;
    priority: 'high' | 'medium' | 'low';
}

// ============================================================================
// Competitor Analysis
// ============================================================================

export interface CompetitorAnalysis {
    competitors: CompetitorMetrics[];
    gaps: CompetitiveGap[];
    opportunities: CompetitiveOpportunity[];
}

export interface CompetitorMetrics {
    url: string;
    domain: string;
    domainAuthority: number;
    pageAuthority: number;
    backlinks: number;
    referringDomains: number;
    organicTraffic: number;
    organicKeywords: number;
    rankings: KeywordRanking[];
    topPages: TopPage[];
}

export interface KeywordRanking {
    keyword: string;
    position: number;
    url: string;
    traffic: number;
    difficulty: number;
}

export interface TopPage {
    url: string;
    traffic: number;
    keywords: number;
    backlinks: number;
}

export interface CompetitiveGap {
    type: 'keyword' | 'backlink' | 'content' | 'technical';
    description: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
}

export interface CompetitiveOpportunity {
    opportunity: string;
    potentialValue: number;
    effort: 'low' | 'medium' | 'high';
    priority: 'high' | 'medium' | 'low';
}

// ============================================================================
// SEO Recommendations
// ============================================================================

export interface SEORecommendation {
    category: SEOCategory;
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: number; // 0-100 (potential score improvement)
    effort: 'low' | 'medium' | 'high';
    implementation: string;
    beforeAfter?: BeforeAfter;
}

export interface BeforeAfter {
    before: string;
    after: string;
}

export type SEOCategory =
    | 'title'
    | 'meta-description'
    | 'headings'
    | 'content'
    | 'keywords'
    | 'images'
    | 'links'
    | 'performance'
    | 'mobile'
    | 'security'
    | 'structured-data'
    | 'crawlability'
    | 'social';

// ============================================================================
// SEO Issues
// ============================================================================

export interface SEOIssue {
    severity: 'critical' | 'warning' | 'info';
    category: SEOCategory;
    title: string;
    description: string;
    affectedElements?: string[];
    fixInstructions: string;
    impact: string;
}

// ============================================================================
// SEO Score Breakdown
// ============================================================================

export interface SEOScoreBreakdown {
    overall: number;
    components: {
        name: string;
        score: number;
        weight: number;
        contribution: number;
    }[];
    trending: {
        current: number;
        previous?: number;
        change?: number;
        direction?: 'up' | 'down' | 'stable';
    };
}

// ============================================================================
// Google Search Console Integration
// ============================================================================

export interface SearchConsoleData {
    property: string;
    dateRange: DateRange;
    metrics: SearchConsoleMetrics;
    queries: SearchQuery[];
    pages: PagePerformance[];
    devices: DeviceBreakdown;
    countries: CountryBreakdown[];
}

export interface DateRange {
    startDate: string;
    endDate: string;
}

export interface SearchConsoleMetrics {
    clicks: number;
    impressions: number;
    ctr: number; // Click-through rate
    position: number; // Average position
}

export interface SearchQuery {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

export interface PagePerformance {
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

export interface DeviceBreakdown {
    desktop: SearchConsoleMetrics;
    mobile: SearchConsoleMetrics;
    tablet: SearchConsoleMetrics;
}

export interface CountryBreakdown {
    country: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

// ============================================================================
// SEO Audit Report
// ============================================================================

export interface SEOAuditReport {
    url: string;
    generatedAt: Date;
    summary: AuditSummary;
    analysis: SEOAnalysisResult;
    competitorAnalysis?: CompetitorAnalysis;
    searchConsoleData?: SearchConsoleData;
    historicalTrend?: HistoricalTrend[];
    actionPlan: ActionPlan;
}

export interface AuditSummary {
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
    criticalIssues: number;
    warnings: number;
    recommendations: number;
    estimatedImpact: string;
}

export interface HistoricalTrend {
    date: Date;
    score: number;
    traffic: number;
    rankings: number;
}

export interface ActionPlan {
    quickWins: SEORecommendation[];
    shortTerm: SEORecommendation[];
    longTerm: SEORecommendation[];
    estimatedTimeline: string;
}
