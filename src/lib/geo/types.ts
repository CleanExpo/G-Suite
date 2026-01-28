/**
 * GEO Framework Types
 *
 * Comprehensive types for local SEO, Google Business Profile, and geographic ranking
 */

// ============================================================================
// Core GEO Analysis Types
// ============================================================================

export interface GEOAnalysisRequest {
    url: string;
    businessName: string;
    address: string;
    phone: string;
    targetKeywords: string[];
    targetLocation: string; // City, State or "City, State, ZIP"
    categories?: string[]; // Business categories
    serviceArea?: string[]; // Service areas if not just one location
}

export interface GEOAnalysisResult {
    businessInfo: BusinessInfo;
    napAnalysis: NAPAnalysis;
    citationAnalysis: CitationAnalysis;
    localSchema: LocalSchemaAnalysis;
    mapsIntegration: MapsIntegrationAnalysis;
    rankingPrediction: RankingPrediction;
    competitorAnalysis?: CompetitorComparison;
    recommendations: GEORecommendation[];
    score: number; // Overall GEO score 0-100
    analyzedAt: Date;
}

export interface BusinessInfo {
    name: string;
    address: string;
    phone: string;
    website: string;
    categories: string[];
    serviceArea: string[];
    location: GeographicLocation;
}

export interface GeographicLocation {
    city: string;
    state: string;
    country: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
}

// ============================================================================
// NAP (Name, Address, Phone) Analysis
// ============================================================================

export interface NAPAnalysis {
    score: number; // 0-100
    consistency: NAPConsistency;
    issues: string[];
    recommendations: string[];
}

export interface NAPConsistency {
    nameConsistent: boolean;
    addressConsistent: boolean;
    phoneConsistent: boolean;
    foundInstances: NAPInstance[];
    inconsistencies: NAPInconsistency[];
}

export interface NAPInstance {
    source: 'schema' | 'header' | 'footer' | 'contact_page' | 'other';
    name?: string;
    address?: string;
    phone?: string;
    confidence: number; // 0-1
}

export interface NAPInconsistency {
    field: 'name' | 'address' | 'phone';
    expected: string;
    found: string;
    location: string;
}

// ============================================================================
// Citation Analysis
// ============================================================================

export interface CitationAnalysis {
    total: number;
    consistent: number;
    inconsistent: number;
    missing: number;
    score: number; // 0-100
    citations: Citation[];
    missingDirectories: string[];
}

export interface Citation {
    directory: string;
    url?: string;
    name?: string;
    address?: string;
    phone?: string;
    consistent: boolean;
    verified: boolean;
    issues: string[];
}

export const MAJOR_DIRECTORIES = [
    'Google Business Profile',
    'Yelp',
    'Facebook',
    'Apple Maps',
    'Bing Places',
    'Yellow Pages',
    'Better Business Bureau',
    'Foursquare'
] as const;

// ============================================================================
// Local Schema Markup
// ============================================================================

export interface LocalSchemaAnalysis {
    score: number; // 0-100
    hasLocalBusiness: boolean;
    schemaTypes: string[];
    completeness: SchemaCompleteness;
    issues: string[];
    recommendations: string[];
}

export interface SchemaCompleteness {
    hasName: boolean;
    hasAddress: boolean;
    hasPhone: boolean;
    hasUrl: boolean;
    hasGeo: boolean;
    hasOpeningHours: boolean;
    hasImage: boolean;
    hasPriceRange: boolean;
    hasAggregateRating: boolean;
    hasReview: boolean;
    completenessPercentage: number; // 0-100
}

// ============================================================================
// Google Maps Integration
// ============================================================================

export interface MapsIntegrationAnalysis {
    score: number; // 0-100
    hasEmbeddedMap: boolean;
    hasDirectionsLink: boolean;
    hasStoreLocator: boolean;
    mapImplementation?: MapImplementation;
    issues: string[];
    recommendations: string[];
}

export interface MapImplementation {
    type: 'google_maps_embed' | 'google_maps_api' | 'other';
    apiKey?: string;
    features: string[];
}

// ============================================================================
// Google Business Profile
// ============================================================================

export interface GoogleBusinessProfile {
    locationId: string;
    name: string;
    address: GBPAddress;
    phone: string;
    website?: string;
    categories: GBPCategory[];
    attributes: GBPAttribute[];
    hours: GBPHours[];
    photos: GBPPhoto[];
    reviews: GBPReview[];
    rating: number;
    reviewCount: number;
    posts: GBPPost[];
    insights: GBPInsights;
    completenessScore: number; // 0-100
}

export interface GBPAddress {
    addressLines: string[];
    locality: string; // City
    administrativeArea: string; // State
    postalCode: string;
    regionCode: string; // Country code
}

export interface GBPCategory {
    name: string;
    primary: boolean;
}

export interface GBPAttribute {
    name: string;
    value: string | boolean;
}

export interface GBPHours {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}

export interface GBPPhoto {
    url: string;
    description?: string;
    category: 'profile' | 'cover' | 'interior' | 'exterior' | 'product' | 'team' | 'other';
}

export interface GBPReview {
    reviewId: string;
    reviewer: string;
    rating: number; // 1-5
    comment: string;
    createTime: Date;
    updateTime?: Date;
    reviewReply?: GBPReviewReply;
}

export interface GBPReviewReply {
    comment: string;
    updateTime: Date;
}

export interface GBPPost {
    postId: string;
    summary: string;
    callToAction?: {
        actionType: string;
        url?: string;
    };
    media?: {
        mediaFormat: string;
        sourceUrl: string;
    }[];
    createTime: Date;
    updateTime?: Date;
}

export interface GBPInsights {
    views: number;
    searches: number;
    actions: GBPActions;
    direction_requests: number;
    call_clicks: number;
    website_clicks: number;
}

export interface GBPActions {
    website: number;
    phone: number;
    directions: number;
}

// ============================================================================
// Geographic Ranking Prediction
// ============================================================================

export interface RankingPrediction {
    keyword: string;
    location: string;
    predictedPosition: number; // 1-20 (local pack + organic)
    confidence: number; // 0-100
    factors: RankingFactors;
    improvements: RankingImprovement[];
    competitorComparison?: CompetitorRanking[];
}

export interface RankingFactors {
    distance: FactorScore; // Proximity to searcher
    relevance: FactorScore; // Keyword match, categories
    prominence: FactorScore; // Reviews, ratings, citations
    optimization: FactorScore; // On-page SEO, schema
    overall: number; // Weighted average 0-100
}

export interface FactorScore {
    score: number; // 0-100
    weight: number; // 0-1
    details: string[];
}

export interface RankingImprovement {
    factor: 'distance' | 'relevance' | 'prominence' | 'optimization';
    currentScore: number;
    potentialScore: number;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    recommendation: string;
    estimatedRankingGain: number; // Positions
}

// ============================================================================
// Competitor Analysis
// ============================================================================

export interface CompetitorComparison {
    competitors: CompetitorProfile[];
    gaps: CompetitiveGap[];
    opportunities: CompetitiveOpportunity[];
    summary: CompetitorSummary;
}

export interface CompetitorProfile {
    name: string;
    address: string;
    distance: number; // Miles from your location
    rating: number;
    reviewCount: number;
    citationCount: number;
    categories: string[];
    strengths: string[];
    weaknesses: string[];
    rankingScore: number; // 0-100
}

export interface CompetitiveGap {
    type: 'reviews' | 'citations' | 'schema' | 'content' | 'photos';
    description: string;
    yourValue: number;
    competitorAverage: number;
    topCompetitorValue: number;
    priority: 'high' | 'medium' | 'low';
}

export interface CompetitiveOpportunity {
    opportunity: string;
    potentialImpact: number; // Expected ranking improvement
    effort: 'low' | 'medium' | 'high';
    priority: 'high' | 'medium' | 'low';
    actionItems: string[];
}

export interface CompetitorSummary {
    totalCompetitors: number;
    averageRating: number;
    averageReviewCount: number;
    averageCitationCount: number;
    yourRanking: number; // Where you rank among competitors (1 = best)
}

export interface CompetitorRanking {
    businessName: string;
    position: number;
    distance: number;
    rating: number;
    reviewCount: number;
}

// ============================================================================
// GEO Recommendations
// ============================================================================

export interface GEORecommendation {
    category: GEOCategory;
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: number; // 0-100 (potential score improvement)
    effort: 'low' | 'medium' | 'high';
    implementation: string;
    estimatedTime: string; // e.g., "30 minutes", "2 hours", "1 week"
}

export type GEOCategory =
    | 'nap'
    | 'citations'
    | 'schema'
    | 'maps'
    | 'gbp'
    | 'reviews'
    | 'content'
    | 'photos'
    | 'keywords';

// ============================================================================
// Multi-Location Support
// ============================================================================

export interface MultiLocationAnalysis {
    locations: LocationAnalysis[];
    summary: MultiLocationSummary;
    recommendations: MultiLocationRecommendation[];
}

export interface LocationAnalysis {
    locationId: string;
    name: string;
    address: string;
    analysis: GEOAnalysisResult;
    performance: LocationPerformance;
}

export interface LocationPerformance {
    views: number;
    searches: number;
    calls: number;
    directions: number;
    websiteClicks: number;
}

export interface MultiLocationSummary {
    totalLocations: number;
    averageScore: number;
    bestPerforming: string; // Location ID
    worstPerforming: string; // Location ID
    consistencyScore: number; // NAP consistency across locations 0-100
}

export interface MultiLocationRecommendation {
    affectedLocations: string[]; // Location IDs
    recommendation: GEORecommendation;
    bulkAction: boolean; // Can be applied to all at once
}

// ============================================================================
// Search & Query
// ============================================================================

export interface GEOSearchQuery {
    keyword: string;
    location: string;
    radius?: number; // Miles
    categories?: string[];
}

export interface GEOSearchResult {
    query: GEOSearchQuery;
    results: LocalSearchResult[];
    yourRanking?: number;
    localPackPositions: LocalPackResult[];
}

export interface LocalSearchResult {
    name: string;
    address: string;
    rating: number;
    reviewCount: number;
    distance: number;
    position: number;
    source: 'local_pack' | 'organic' | 'maps';
}

export interface LocalPackResult {
    position: number; // 1-3 (local pack)
    businessName: string;
    distance: number;
    rating: number;
    reviewCount: number;
}

// ============================================================================
// Analytics & Reporting
// ============================================================================

export interface GEOAnalytics {
    businessId: string;
    dateRange: DateRange;
    metrics: GEOMetrics;
    trends: GEOTrend[];
    topQueries: QueryMetric[];
    competitorMovement: CompetitorMovement[];
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export interface GEOMetrics {
    geoScore: number; // Current overall score
    rankingPosition: number; // Average position for target keywords
    visibility: number; // 0-100 (how often you appear)
    engagement: number; // Clicks, calls, directions
    reputation: number; // Reviews, ratings
}

export interface GEOTrend {
    date: Date;
    geoScore: number;
    rankingPosition: number;
    visibility: number;
}

export interface QueryMetric {
    query: string;
    impressions: number;
    clicks: number;
    position: number;
    ctr: number;
}

export interface CompetitorMovement {
    competitorName: string;
    previousPosition: number;
    currentPosition: number;
    change: number; // Positive = moved up, Negative = moved down
}
