/**
 * Geographic Ranking Predictor
 *
 * Predicts local search rankings based on Google's local pack algorithm factors:
 * - Distance (proximity to searcher)
 * - Relevance (keyword match, business categories)
 * - Prominence (reviews, ratings, citations, backlinks)
 * - Optimization (on-page SEO, schema markup)
 */

import type {
    RankingPrediction,
    RankingFactors,
    FactorScore,
    RankingImprovement,
    GoogleBusinessProfile,
    NAPAnalysis,
    CitationAnalysis,
    LocalSchemaAnalysis,
    CompetitorRanking
} from './types';

export interface RankingPredictorInput {
    keyword: string;
    location: string;
    businessName: string;
    address: string;
    phone: string;
    website?: string;
    categories: string[];

    // GBP data
    gbpProfile?: GoogleBusinessProfile;

    // SEO analysis results
    napAnalysis?: NAPAnalysis;
    citationAnalysis?: CitationAnalysis;
    localSchemaAnalysis?: LocalSchemaAnalysis;

    // Competitor data
    competitors?: CompetitorRanking[];

    // Geographic data
    lat?: number;
    lng?: number;
    searcherLat?: number;
    searcherLng?: number;
}

export class RankingPredictor {
    /**
     * Predict local search ranking for a business
     */
    async predictRanking(input: RankingPredictorInput): Promise<RankingPrediction> {
        // Analyze all ranking factors
        const factors = this.analyzeRankingFactors(input);

        // Calculate overall score (weighted average)
        const overallScore = this.calculateOverallScore(factors);

        // Predict position based on score and competitors
        const predictedPosition = this.calculatePredictedPosition(
            overallScore,
            input.competitors || []
        );

        // Calculate confidence based on data availability
        const confidence = this.calculateConfidence(input);

        // Generate improvement recommendations
        const improvements = this.generateImprovements(factors, input);

        return {
            keyword: input.keyword,
            location: input.location,
            predictedPosition,
            confidence,
            factors,
            improvements,
            competitorComparison: input.competitors
        };
    }

    /**
     * Analyze all ranking factors
     */
    private analyzeRankingFactors(input: RankingPredictorInput): RankingFactors {
        const distance = this.analyzeDistance(input);
        const relevance = this.analyzeRelevance(input);
        const prominence = this.analyzeProminence(input);
        const optimization = this.analyzeOptimization(input);

        // Calculate weighted overall score
        const overall = Math.round(
            distance.score * distance.weight +
            relevance.score * relevance.weight +
            prominence.score * prominence.weight +
            optimization.score * optimization.weight
        );

        return {
            distance,
            relevance,
            prominence,
            optimization,
            overall
        };
    }

    /**
     * Analyze distance factor (proximity to searcher)
     */
    private analyzeDistance(input: RankingPredictorInput): FactorScore {
        const details: string[] = [];
        let score = 50; // Default: medium distance

        // If we have lat/lng for both business and searcher
        if (input.lat && input.lng && input.searcherLat && input.searcherLng) {
            const distance = this.calculateDistance(
                input.lat,
                input.lng,
                input.searcherLat,
                input.searcherLng
            );

            details.push(`Distance from searcher: ${distance.toFixed(1)} miles`);

            // Scoring based on distance
            if (distance < 1) {
                score = 95;
                details.push('Excellent proximity (< 1 mile)');
            } else if (distance < 5) {
                score = 85;
                details.push('Very good proximity (1-5 miles)');
            } else if (distance < 10) {
                score = 70;
                details.push('Good proximity (5-10 miles)');
            } else if (distance < 25) {
                score = 50;
                details.push('Medium proximity (10-25 miles)');
            } else {
                score = 30;
                details.push('Far from searcher (> 25 miles)');
            }
        } else {
            details.push('Geographic coordinates not provided');
            details.push('Using location name match as proxy');

            // Check if business location matches search location
            const businessLocation = input.address.toLowerCase();
            const searchLocation = input.location.toLowerCase();

            if (businessLocation.includes(searchLocation)) {
                score = 75;
                details.push('Business location matches search location');
            } else {
                score = 50;
                details.push('Unable to determine exact distance');
            }
        }

        return {
            score,
            weight: 0.30, // Distance is ~30% of local ranking
            details
        };
    }

    /**
     * Analyze relevance factor (keyword match, categories)
     */
    private analyzeRelevance(input: RankingPredictorInput): FactorScore {
        const details: string[] = [];
        let score = 0;

        const keyword = input.keyword.toLowerCase();
        const businessName = input.businessName.toLowerCase();
        const categories = input.categories.map(c => c.toLowerCase());

        // 1. Business name keyword match (30 points)
        if (businessName.includes(keyword)) {
            score += 30;
            details.push('Keyword appears in business name (high relevance)');
        } else {
            // Check for partial match
            const keywordParts = keyword.split(' ');
            const matchingParts = keywordParts.filter(part =>
                part.length > 3 && businessName.includes(part)
            );

            if (matchingParts.length > 0) {
                score += 15;
                details.push(`Partial keyword match in name (${matchingParts.length} terms)`);
            } else {
                details.push('Keyword not in business name');
            }
        }

        // 2. Category relevance (40 points)
        let categoryScore = 0;
        let categoryMatches = 0;

        for (const category of categories) {
            if (category.includes(keyword)) {
                categoryScore += 20;
                categoryMatches++;
            } else {
                // Check for related terms
                const keywordParts = keyword.split(' ');
                if (keywordParts.some(part => part.length > 3 && category.includes(part))) {
                    categoryScore += 10;
                    categoryMatches++;
                }
            }
        }

        categoryScore = Math.min(categoryScore, 40); // Cap at 40
        score += categoryScore;

        if (categoryMatches > 0) {
            details.push(`${categoryMatches} relevant categories match keyword`);
        } else {
            details.push('Categories do not closely match keyword');
        }

        // 3. GBP category (primary category bonus - 15 points)
        if (input.gbpProfile?.categories && input.gbpProfile.categories.length > 0) {
            const primaryCategory = input.gbpProfile.categories.find(c => c.primary);
            if (primaryCategory) {
                const primaryCategoryName = primaryCategory.name.toLowerCase();
                if (primaryCategoryName.includes(keyword)) {
                    score += 15;
                    details.push('Primary GBP category matches keyword');
                } else {
                    score += 5;
                    details.push('GBP primary category set');
                }
            }
        }

        // 4. Description/content match (15 points)
        // In production, this would analyze website content
        // For now, give partial credit
        score += 10;
        details.push('Content relevance assumed (website analysis not included)');

        return {
            score: Math.min(score, 100),
            weight: 0.25, // Relevance is ~25% of local ranking
            details
        };
    }

    /**
     * Analyze prominence factor (reviews, ratings, citations)
     */
    private analyzeProminence(input: RankingPredictorInput): FactorScore {
        const details: string[] = [];
        let score = 0;

        // 1. Review count (30 points)
        const reviewCount = input.gbpProfile?.reviewCount || 0;

        if (reviewCount >= 100) {
            score += 30;
            details.push(`Excellent review count (${reviewCount})`);
        } else if (reviewCount >= 50) {
            score += 25;
            details.push(`Very good review count (${reviewCount})`);
        } else if (reviewCount >= 25) {
            score += 20;
            details.push(`Good review count (${reviewCount})`);
        } else if (reviewCount >= 10) {
            score += 15;
            details.push(`Moderate review count (${reviewCount})`);
        } else if (reviewCount > 0) {
            score += 8;
            details.push(`Low review count (${reviewCount})`);
        } else {
            details.push('No reviews found');
        }

        // 2. Average rating (25 points)
        const rating = input.gbpProfile?.rating || 0;

        if (rating >= 4.5) {
            score += 25;
            details.push(`Excellent rating (${rating.toFixed(1)} stars)`);
        } else if (rating >= 4.0) {
            score += 20;
            details.push(`Good rating (${rating.toFixed(1)} stars)`);
        } else if (rating >= 3.5) {
            score += 15;
            details.push(`Average rating (${rating.toFixed(1)} stars)`);
        } else if (rating >= 3.0) {
            score += 10;
            details.push(`Below average rating (${rating.toFixed(1)} stars)`);
        } else if (rating > 0) {
            score += 5;
            details.push(`Poor rating (${rating.toFixed(1)} stars)`);
        } else {
            details.push('No rating available');
        }

        // 3. Citation consistency (20 points)
        if (input.citationAnalysis) {
            const citationScore = input.citationAnalysis.score;
            const citationPoints = Math.round(citationScore * 0.20);
            score += citationPoints;

            details.push(
                `${input.citationAnalysis.total} citations found ` +
                `(${input.citationAnalysis.consistent} consistent)`
            );
        }

        // 4. GBP completeness (15 points)
        if (input.gbpProfile) {
            const completeness = input.gbpProfile.completenessScore;
            const completenessPoints = Math.round(completeness * 0.15);
            score += completenessPoints;

            details.push(`GBP profile ${completeness}% complete`);
        }

        // 5. Recent activity (10 points)
        if (input.gbpProfile?.posts && input.gbpProfile.posts.length > 0) {
            const recentPosts = input.gbpProfile.posts.filter(post => {
                const daysSince = Math.floor(
                    (Date.now() - post.createTime.getTime()) / (1000 * 60 * 60 * 24)
                );
                return daysSince <= 30;
            });

            if (recentPosts.length >= 4) {
                score += 10;
                details.push('Excellent posting activity (4+ recent posts)');
            } else if (recentPosts.length > 0) {
                score += 5;
                details.push(`${recentPosts.length} recent posts (last 30 days)`);
            } else {
                details.push('No recent posts');
            }
        }

        return {
            score: Math.min(score, 100),
            weight: 0.30, // Prominence is ~30% of local ranking
            details
        };
    }

    /**
     * Analyze optimization factor (on-page SEO, schema)
     */
    private analyzeOptimization(input: RankingPredictorInput): FactorScore {
        const details: string[] = [];
        let score = 0;

        // 1. NAP consistency (30 points)
        if (input.napAnalysis) {
            const napScore = input.napAnalysis.score;
            const napPoints = Math.round(napScore * 0.30);
            score += napPoints;

            if (input.napAnalysis.consistency.nameConsistent &&
                input.napAnalysis.consistency.addressConsistent &&
                input.napAnalysis.consistency.phoneConsistent) {
                details.push('NAP perfectly consistent across site');
            } else {
                const issues = input.napAnalysis.consistency.inconsistencies.length;
                details.push(`NAP has ${issues} inconsistencies`);
            }
        }

        // 2. Local schema markup (35 points)
        if (input.localSchemaAnalysis) {
            const schemaScore = input.localSchemaAnalysis.score;
            const schemaPoints = Math.round(schemaScore * 0.35);
            score += schemaPoints;

            if (input.localSchemaAnalysis.hasLocalBusiness) {
                const completeness = input.localSchemaAnalysis.completeness.completenessPercentage;
                details.push(`LocalBusiness schema present (${completeness}% complete)`);
            } else {
                details.push('No LocalBusiness schema found');
            }
        }

        // 3. Website optimization (20 points)
        if (input.website) {
            score += 10;
            details.push('Business website present');

            // Check if website uses HTTPS
            if (input.website.startsWith('https://')) {
                score += 5;
                details.push('Website uses HTTPS (secure)');
            }

            // Assume basic optimization (in production, would analyze actual site)
            score += 5;
            details.push('Basic on-page optimization assumed');
        } else {
            details.push('No website URL provided');
        }

        // 4. Mobile optimization (15 points)
        // In production, would test mobile-friendliness
        // For now, give partial credit if website exists
        if (input.website) {
            score += 10;
            details.push('Mobile optimization assumed (not tested)');
        }

        return {
            score: Math.min(score, 100),
            weight: 0.15, // Optimization is ~15% of local ranking
            details
        };
    }

    /**
     * Calculate overall weighted score
     */
    private calculateOverallScore(factors: RankingFactors): number {
        return Math.round(
            factors.distance.score * factors.distance.weight +
            factors.relevance.score * factors.relevance.weight +
            factors.prominence.score * factors.prominence.weight +
            factors.optimization.score * factors.optimization.weight
        );
    }

    /**
     * Calculate predicted position based on overall score and competitors
     */
    private calculatePredictedPosition(
        overallScore: number,
        competitors: CompetitorRanking[]
    ): number {
        if (competitors.length === 0) {
            // No competitor data - estimate position based on score alone
            if (overallScore >= 90) return 1;
            if (overallScore >= 80) return 2;
            if (overallScore >= 70) return 3;
            if (overallScore >= 60) return 5;
            if (overallScore >= 50) return 8;
            if (overallScore >= 40) return 12;
            return 15;
        }

        // Sort competitors by rating and review count (proxy for strength)
        const sortedCompetitors = [...competitors].sort((a, b) => {
            const scoreA = a.rating * Math.log10(a.reviewCount + 1);
            const scoreB = b.rating * Math.log10(b.reviewCount + 1);
            return scoreB - scoreA;
        });

        // Estimate position: count how many competitors are likely stronger
        let position = 1;
        for (const competitor of sortedCompetitors) {
            // Simple scoring based on available data
            const competitorScore =
                competitor.rating * 20 +
                Math.min(competitor.reviewCount / 5, 30);

            if (competitorScore > overallScore * 0.7) {
                position++;
            }
        }

        return Math.min(position, 20); // Cap at position 20
    }

    /**
     * Calculate confidence score based on data availability
     */
    private calculateConfidence(input: RankingPredictorInput): number {
        let confidence = 0;
        let maxConfidence = 0;

        // GBP profile data (30 points)
        maxConfidence += 30;
        if (input.gbpProfile) {
            confidence += 30;
        } else {
            confidence += 5; // Partial credit for basic business info
        }

        // Geographic coordinates (20 points)
        maxConfidence += 20;
        if (input.lat && input.lng && input.searcherLat && input.searcherLng) {
            confidence += 20;
        } else if (input.lat && input.lng) {
            confidence += 10;
        }

        // NAP analysis (15 points)
        maxConfidence += 15;
        if (input.napAnalysis) {
            confidence += 15;
        }

        // Citation analysis (15 points)
        maxConfidence += 15;
        if (input.citationAnalysis) {
            confidence += 15;
        }

        // Schema analysis (10 points)
        maxConfidence += 10;
        if (input.localSchemaAnalysis) {
            confidence += 10;
        }

        // Competitor data (10 points)
        maxConfidence += 10;
        if (input.competitors && input.competitors.length > 0) {
            confidence += 10;
        }

        return Math.round((confidence / maxConfidence) * 100);
    }

    /**
     * Generate improvement recommendations
     */
    private generateImprovements(
        factors: RankingFactors,
        input: RankingPredictorInput
    ): RankingImprovement[] {
        const improvements: RankingImprovement[] = [];

        // Analyze each factor and suggest improvements

        // 1. Distance improvements (limited - can't change location)
        if (factors.distance.score < 70 && input.categories.length < 3) {
            improvements.push({
                factor: 'distance',
                currentScore: factors.distance.score,
                potentialScore: factors.distance.score + 5,
                impact: 'low',
                effort: 'low',
                recommendation: 'Add service area keywords to improve relevance for nearby searches',
                estimatedRankingGain: 1
            });
        }

        // 2. Relevance improvements
        if (factors.relevance.score < 80) {
            const businessName = input.businessName.toLowerCase();
            const keyword = input.keyword.toLowerCase();

            if (!businessName.includes(keyword)) {
                improvements.push({
                    factor: 'relevance',
                    currentScore: factors.relevance.score,
                    potentialScore: Math.min(factors.relevance.score + 20, 100),
                    impact: 'high',
                    effort: 'medium',
                    recommendation: `Consider adding "${input.keyword}" to your business description or categories`,
                    estimatedRankingGain: 2
                });
            }

            if (input.categories.length < 2) {
                improvements.push({
                    factor: 'relevance',
                    currentScore: factors.relevance.score,
                    potentialScore: Math.min(factors.relevance.score + 15, 100),
                    impact: 'medium',
                    effort: 'low',
                    recommendation: 'Add more relevant business categories to your GBP profile',
                    estimatedRankingGain: 1
                });
            }
        }

        // 3. Prominence improvements
        if (factors.prominence.score < 80) {
            const reviewCount = input.gbpProfile?.reviewCount || 0;
            const rating = input.gbpProfile?.rating || 0;

            if (reviewCount < 25) {
                improvements.push({
                    factor: 'prominence',
                    currentScore: factors.prominence.score,
                    potentialScore: Math.min(factors.prominence.score + 25, 100),
                    impact: 'high',
                    effort: 'high',
                    recommendation: `Get more customer reviews (currently ${reviewCount}, target 25+)`,
                    estimatedRankingGain: 3
                });
            }

            if (rating < 4.5 && rating > 0) {
                improvements.push({
                    factor: 'prominence',
                    currentScore: factors.prominence.score,
                    potentialScore: Math.min(factors.prominence.score + 15, 100),
                    impact: 'medium',
                    effort: 'medium',
                    recommendation: 'Improve average rating by addressing negative reviews and providing better service',
                    estimatedRankingGain: 2
                });
            }

            if (input.citationAnalysis && input.citationAnalysis.score < 70) {
                improvements.push({
                    factor: 'prominence',
                    currentScore: factors.prominence.score,
                    potentialScore: Math.min(factors.prominence.score + 20, 100),
                    impact: 'high',
                    effort: 'medium',
                    recommendation: `Build ${input.citationAnalysis.missing} missing citations on major directories`,
                    estimatedRankingGain: 2
                });
            }

            if (!input.gbpProfile?.posts || input.gbpProfile.posts.length === 0) {
                improvements.push({
                    factor: 'prominence',
                    currentScore: factors.prominence.score,
                    potentialScore: Math.min(factors.prominence.score + 10, 100),
                    impact: 'medium',
                    effort: 'low',
                    recommendation: 'Post regularly on your Google Business Profile (weekly updates recommended)',
                    estimatedRankingGain: 1
                });
            }
        }

        // 4. Optimization improvements
        if (factors.optimization.score < 80) {
            if (input.napAnalysis && input.napAnalysis.score < 90) {
                improvements.push({
                    factor: 'optimization',
                    currentScore: factors.optimization.score,
                    potentialScore: Math.min(factors.optimization.score + 20, 100),
                    impact: 'high',
                    effort: 'low',
                    recommendation: 'Fix NAP inconsistencies across your website',
                    estimatedRankingGain: 2
                });
            }

            if (input.localSchemaAnalysis && !input.localSchemaAnalysis.hasLocalBusiness) {
                improvements.push({
                    factor: 'optimization',
                    currentScore: factors.optimization.score,
                    potentialScore: Math.min(factors.optimization.score + 30, 100),
                    impact: 'high',
                    effort: 'medium',
                    recommendation: 'Add LocalBusiness schema markup to your website',
                    estimatedRankingGain: 2
                });
            } else if (input.localSchemaAnalysis) {
                const completeness = input.localSchemaAnalysis.completeness.completenessPercentage;
                if (completeness < 80) {
                    improvements.push({
                        factor: 'optimization',
                        currentScore: factors.optimization.score,
                        potentialScore: Math.min(factors.optimization.score + 15, 100),
                        impact: 'medium',
                        effort: 'low',
                        recommendation: `Complete your LocalBusiness schema (currently ${completeness}% complete)`,
                        estimatedRankingGain: 1
                    });
                }
            }

            if (!input.website) {
                improvements.push({
                    factor: 'optimization',
                    currentScore: factors.optimization.score,
                    potentialScore: Math.min(factors.optimization.score + 20, 100),
                    impact: 'high',
                    effort: 'high',
                    recommendation: 'Create a business website with NAP information and location details',
                    estimatedRankingGain: 3
                });
            }
        }

        // Sort by impact and estimated ranking gain
        improvements.sort((a, b) => {
            const impactOrder = { high: 3, medium: 2, low: 1 };
            const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
            if (impactDiff !== 0) return impactDiff;
            return b.estimatedRankingGain - a.estimatedRankingGain;
        });

        // Return top 10 improvements
        return improvements.slice(0, 10);
    }

    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    private calculateDistance(
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number
    ): number {
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
            Math.cos(this.toRadians(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Convert degrees to radians
     */
    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}

/**
 * Singleton instance
 */
let predictorInstance: RankingPredictor | null = null;

export function getRankingPredictor(): RankingPredictor {
    if (!predictorInstance) {
        predictorInstance = new RankingPredictor();
    }
    return predictorInstance;
}
