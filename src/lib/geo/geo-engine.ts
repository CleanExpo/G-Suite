/**
 * GEO Engine
 *
 * Main orchestration engine for local SEO analysis.
 * Coordinates all analyzers and generates comprehensive reports:
 * - Local SEO Analyzer (NAP, citations, schema, maps)
 * - Google Business Profile integration
 * - Geographic ranking predictions
 * - Local competitor analysis
 */

import { LocalSEOAnalyzer, getLocalSEOAnalyzer } from './local-seo-analyzer';
import { GoogleBusinessClient, getGoogleBusinessClient } from './google-business-client';
import { RankingPredictor, getRankingPredictor } from './ranking-predictor';
import { LocalCompetitorAnalyzer, getLocalCompetitorAnalyzer } from './local-competitor-analyzer';

import type {
    GEOAnalysisRequest,
    GEOAnalysisResult,
    BusinessInfo,
    GeographicLocation,
    GEORecommendation,
    GEOCategory
} from './types';

export class GEOEngine {
    private localSEOAnalyzer: LocalSEOAnalyzer;
    private gbpClient: GoogleBusinessClient;
    private rankingPredictor: RankingPredictor;
    private competitorAnalyzer: LocalCompetitorAnalyzer;

    constructor() {
        this.localSEOAnalyzer = getLocalSEOAnalyzer();
        this.gbpClient = getGoogleBusinessClient();
        this.rankingPredictor = getRankingPredictor();
        this.competitorAnalyzer = getLocalCompetitorAnalyzer();
    }

    /**
     * Perform comprehensive GEO analysis
     */
    async analyze(request: GEOAnalysisRequest): Promise<GEOAnalysisResult> {
        console.log('[GEOEngine] Starting analysis for:', request.businessName);

        // 1. Parse location information
        const location = this.parseLocation(request.targetLocation);

        // 2. Fetch website HTML for analysis (in production, would use WebFetch)
        let html = '';
        try {
            // In production: const html = await fetch(request.url).then(r => r.text());
            html = '<html></html>'; // Placeholder for now
        } catch (error: any) {
            console.warn('[GEOEngine] Failed to fetch website HTML:', error.message);
        }

        // 3. Analyze NAP consistency
        console.log('[GEOEngine] Analyzing NAP consistency...');
        const napAnalysis = this.localSEOAnalyzer.analyzeNAP(
            html,
            request.businessName,
            request.address,
            request.phone
        );

        // 4. Analyze local citations
        console.log('[GEOEngine] Analyzing citations...');
        const citationAnalysis = await this.localSEOAnalyzer.analyzeCitations(
            request.businessName,
            request.address,
            request.phone
        );

        // 5. Analyze local schema markup
        console.log('[GEOEngine] Analyzing local schema...');
        const localSchema = this.localSEOAnalyzer.analyzeLocalSchema(html);

        // 6. Analyze Google Maps integration
        console.log('[GEOEngine] Analyzing maps integration...');
        const mapsIntegration = this.localSEOAnalyzer.analyzeMapsIntegration(html);

        // 7. Fetch Google Business Profile data (if configured)
        console.log('[GEOEngine] Fetching Google Business Profile...');
        let gbpProfile;
        try {
            if (this.gbpClient.configured()) {
                // In production, would use actual location ID
                gbpProfile = await this.gbpClient.getProfile('mock-location-id');

                // Calculate completeness score
                gbpProfile.completenessScore = this.gbpClient.calculateCompletenessScore(gbpProfile);
            }
        } catch (error: any) {
            console.warn('[GEOEngine] Failed to fetch GBP data:', error.message);
        }

        // 8. Predict local search rankings
        console.log('[GEOEngine] Predicting rankings...');
        const rankingPrediction = await this.rankingPredictor.predictRanking({
            keyword: request.targetKeywords[0] || 'business near me',
            location: request.targetLocation,
            businessName: request.businessName,
            address: request.address,
            phone: request.phone,
            website: request.url,
            categories: request.categories || [],
            gbpProfile,
            napAnalysis,
            citationAnalysis,
            localSchemaAnalysis: localSchema
        });

        // 9. Analyze local competitors
        console.log('[GEOEngine] Analyzing competitors...');
        const competitorAnalysis = await this.competitorAnalyzer.analyze({
            businessName: request.businessName,
            address: request.address,
            categories: request.categories || [],
            yourProfile: {
                rating: gbpProfile?.rating || 0,
                reviewCount: gbpProfile?.reviewCount || 0,
                citationCount: citationAnalysis.total,
                photoCount: gbpProfile?.photos.length || 0,
                postCount: gbpProfile?.posts.length || 0,
                completenessScore: gbpProfile?.completenessScore || 0
            }
        });

        // 10. Generate consolidated recommendations
        console.log('[GEOEngine] Generating recommendations...');
        const recommendations = this.generateRecommendations({
            napAnalysis,
            citationAnalysis,
            localSchema,
            mapsIntegration,
            rankingPrediction,
            competitorAnalysis,
            gbpProfile
        });

        // 11. Calculate overall GEO score
        const score = this.calculateOverallScore({
            napAnalysis,
            citationAnalysis,
            localSchema,
            mapsIntegration,
            rankingPrediction,
            gbpProfile
        });

        // 12. Prepare business info
        const businessInfo: BusinessInfo = {
            name: request.businessName,
            address: request.address,
            phone: request.phone,
            website: request.url,
            categories: request.categories || [],
            serviceArea: request.serviceArea || [],
            location
        };

        console.log('[GEOEngine] Analysis complete. Overall score:', score);

        return {
            businessInfo,
            napAnalysis,
            citationAnalysis,
            localSchema,
            mapsIntegration,
            rankingPrediction,
            competitorAnalysis,
            recommendations,
            score,
            analyzedAt: new Date()
        };
    }

    /**
     * Parse location string into structured format
     */
    private parseLocation(locationString: string): GeographicLocation {
        // Simple parsing - in production, would use geocoding API
        const parts = locationString.split(',').map(p => p.trim());

        return {
            city: parts[0] || '',
            state: parts[1] || '',
            country: parts[2] || 'US',
            zipCode: parts.find(p => /^\d{5}(-\d{4})?$/.test(p))
        };
    }

    /**
     * Generate consolidated recommendations from all analyses
     */
    private generateRecommendations(data: {
        napAnalysis: any;
        citationAnalysis: any;
        localSchema: any;
        mapsIntegration: any;
        rankingPrediction: any;
        competitorAnalysis: any;
        gbpProfile?: any;
    }): GEORecommendation[] {
        const recommendations: GEORecommendation[] = [];

        // NAP recommendations
        if (data.napAnalysis.score < 90) {
            for (const issue of data.napAnalysis.issues) {
                recommendations.push({
                    category: 'nap',
                    priority: data.napAnalysis.score < 70 ? 'critical' : 'high',
                    title: 'Fix NAP Inconsistencies',
                    description: issue,
                    impact: 30 - data.napAnalysis.score,
                    effort: 'low',
                    implementation: 'Ensure your business name, address, and phone are identical everywhere on your website',
                    estimatedTime: '1 hour'
                });
            }
        }

        // Citation recommendations
        if (data.citationAnalysis.score < 70) {
            recommendations.push({
                category: 'citations',
                priority: data.citationAnalysis.missing > 5 ? 'high' : 'medium',
                title: 'Build Missing Citations',
                description: `${data.citationAnalysis.missing} citations missing from major directories`,
                impact: Math.min((70 - data.citationAnalysis.score) * 1.5, 30),
                effort: 'medium',
                implementation: `Claim your business on ${data.citationAnalysis.missingDirectories.slice(0, 3).join(', ')}`,
                estimatedTime: '2-3 hours'
            });
        }

        if (data.citationAnalysis.inconsistent > 0) {
            recommendations.push({
                category: 'citations',
                priority: 'high',
                title: 'Fix Inconsistent Citations',
                description: `${data.citationAnalysis.inconsistent} citations have inconsistent information`,
                impact: 20,
                effort: 'medium',
                implementation: 'Update all citations to match your exact NAP information',
                estimatedTime: '1-2 hours'
            });
        }

        // Schema recommendations
        if (!data.localSchema.hasLocalBusiness) {
            recommendations.push({
                category: 'schema',
                priority: 'critical',
                title: 'Add LocalBusiness Schema',
                description: 'Your website is missing LocalBusiness structured data',
                impact: 35,
                effort: 'medium',
                implementation: 'Add JSON-LD LocalBusiness schema to your website with complete business information',
                estimatedTime: '30 minutes'
            });
        } else if (data.localSchema.completeness.completenessPercentage < 80) {
            recommendations.push({
                category: 'schema',
                priority: 'medium',
                title: 'Complete LocalBusiness Schema',
                description: `Your schema is only ${data.localSchema.completeness.completenessPercentage}% complete`,
                impact: 15,
                effort: 'low',
                implementation: 'Add missing fields like geo coordinates, opening hours, and aggregate rating',
                estimatedTime: '20 minutes'
            });
        }

        // Maps integration recommendations
        if (!data.mapsIntegration.hasEmbeddedMap) {
            recommendations.push({
                category: 'maps',
                priority: 'high',
                title: 'Add Google Maps Embed',
                description: 'No embedded map found on your website',
                impact: 15,
                effort: 'low',
                implementation: 'Embed Google Map on your contact or location page',
                estimatedTime: '15 minutes'
            });
        }

        if (!data.mapsIntegration.hasDirectionsLink) {
            recommendations.push({
                category: 'maps',
                priority: 'medium',
                title: 'Add Directions Link',
                description: 'Add a "Get Directions" link to Google Maps',
                impact: 10,
                effort: 'low',
                implementation: 'Add button/link that opens Google Maps directions',
                estimatedTime: '10 minutes'
            });
        }

        // GBP recommendations
        if (data.gbpProfile) {
            if (data.gbpProfile.completenessScore < 80) {
                recommendations.push({
                    category: 'gbp',
                    priority: 'high',
                    title: 'Complete Google Business Profile',
                    description: `Your GBP is only ${data.gbpProfile.completenessScore}% complete`,
                    impact: 25,
                    effort: 'low',
                    implementation: 'Add missing information like hours, attributes, photos, and description',
                    estimatedTime: '30 minutes'
                });
            }

            if (data.gbpProfile.reviewCount < 25) {
                recommendations.push({
                    category: 'reviews',
                    priority: 'critical',
                    title: 'Generate More Reviews',
                    description: `You need more reviews (current: ${data.gbpProfile.reviewCount})`,
                    impact: 30,
                    effort: 'high',
                    implementation: 'Implement a review request campaign - email customers after service',
                    estimatedTime: '2-3 months'
                });
            }

            if (data.gbpProfile.posts.length === 0) {
                recommendations.push({
                    category: 'gbp',
                    priority: 'medium',
                    title: 'Start Posting on GBP',
                    description: 'No recent posts on your Google Business Profile',
                    impact: 15,
                    effort: 'low',
                    implementation: 'Post weekly updates, offers, or news on your GBP',
                    estimatedTime: '30 minutes per week'
                });
            }

            if (data.gbpProfile.photos.length < 10) {
                recommendations.push({
                    category: 'photos',
                    priority: 'medium',
                    title: 'Add More Photos',
                    description: `Add more photos to your profile (current: ${data.gbpProfile.photos.length})`,
                    impact: 12,
                    effort: 'low',
                    implementation: 'Upload high-quality photos of your business, products, and team',
                    estimatedTime: '1 hour'
                });
            }
        }

        // Ranking improvement recommendations
        for (const improvement of data.rankingPrediction.improvements.slice(0, 3)) {
            recommendations.push({
                category: this.mapRankingFactorToCategory(improvement.factor),
                priority: improvement.impact === 'high' ? 'high' : 'medium',
                title: improvement.recommendation.substring(0, 60),
                description: improvement.recommendation,
                impact: improvement.estimatedRankingGain * 10,
                effort: improvement.effort,
                implementation: improvement.recommendation,
                estimatedTime: this.estimateTimeForEffort(improvement.effort)
            });
        }

        // Competitor-based recommendations
        if (data.competitorAnalysis?.opportunities) {
            for (const opp of data.competitorAnalysis.opportunities.slice(0, 2)) {
                recommendations.push({
                    category: 'keywords',
                    priority: opp.priority,
                    title: opp.opportunity,
                    description: opp.actionItems[0] || opp.opportunity,
                    impact: opp.potentialImpact * 10,
                    effort: opp.effort,
                    implementation: opp.actionItems.join('. '),
                    estimatedTime: this.estimateTimeForEffort(opp.effort)
                });
            }
        }

        // Sort by priority and impact
        recommendations.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return b.impact - a.impact;
        });

        // Remove duplicates and return top 15
        const seen = new Set<string>();
        return recommendations.filter(rec => {
            const key = rec.title;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }).slice(0, 15);
    }

    /**
     * Calculate overall GEO score (0-100)
     */
    private calculateOverallScore(data: {
        napAnalysis: any;
        citationAnalysis: any;
        localSchema: any;
        mapsIntegration: any;
        rankingPrediction: any;
        gbpProfile?: any;
    }): number {
        // Weighted scoring
        let score = 0;
        let totalWeight = 0;

        // NAP consistency (20%)
        score += data.napAnalysis.score * 0.20;
        totalWeight += 0.20;

        // Citations (15%)
        score += data.citationAnalysis.score * 0.15;
        totalWeight += 0.15;

        // Local schema (15%)
        score += data.localSchema.score * 0.15;
        totalWeight += 0.15;

        // Maps integration (10%)
        score += data.mapsIntegration.score * 0.10;
        totalWeight += 0.10;

        // GBP completeness (20%)
        if (data.gbpProfile) {
            score += data.gbpProfile.completenessScore * 0.20;
            totalWeight += 0.20;
        }

        // Ranking factors (20%)
        score += data.rankingPrediction.factors.overall * 0.20;
        totalWeight += 0.20;

        // Normalize if GBP data missing
        if (totalWeight < 1.0) {
            score = score / totalWeight;
        }

        return Math.round(score);
    }

    /**
     * Map ranking factor to GEO category
     */
    private mapRankingFactorToCategory(factor: string): GEOCategory {
        switch (factor) {
            case 'distance':
                return 'content';
            case 'relevance':
                return 'keywords';
            case 'prominence':
                return 'reviews';
            case 'optimization':
                return 'schema';
            default:
                return 'gbp';
        }
    }

    /**
     * Estimate time based on effort level
     */
    private estimateTimeForEffort(effort: 'low' | 'medium' | 'high'): string {
        switch (effort) {
            case 'low':
                return '30 minutes';
            case 'medium':
                return '2 hours';
            case 'high':
                return '1 week';
        }
    }
}

/**
 * Singleton instance
 */
let engineInstance: GEOEngine | null = null;

export function getGEOEngine(): GEOEngine {
    if (!engineInstance) {
        engineInstance = new GEOEngine();
    }
    return engineInstance;
}
