/**
 * Geographic Ranking Predictor
 * 
 * Predicts local pack ranking probability based on:
 * - Distance from search epicenter
 * - Category relevance
 * - Citation authority
 * - Review velocity & sentiment
 */

export interface RankingFactors {
    distanceKm: number;
    authorityScore: number; // 0-100
    reviewScore: number;    // 0-100
    categoryRelevance: number; // 0-1 (e.g. 1.0 for exact match)
}

export class RankingPredictor {
    /**
     * Calculate probability of appearing in the Local Top 3
     */
    predictRank(factors: RankingFactors): { probability: number; estimatedPosition: number; factors: string[] } {
        // Simple decay-based ranking model
        // Rank = (Authority * Relevance * ReviewScore) / (Distance^2)

        const baseScore = (factors.authorityScore * 0.4) + (factors.reviewScore * 0.3) + (factors.categoryRelevance * 30);

        // Distance decay: Inverse square law is too aggressive for local SEO, 
        // using power of 1.5 instead.
        const distanceImpact = 1 / Math.pow(factors.distanceKm + 1, 1.5);

        const finalScore = baseScore * distanceImpact;

        // Probability map (0-100)
        const probability = Math.min(100, Math.max(0, (finalScore / 50) * 100));

        // Estimated Position
        let position = 1;
        if (probability < 20) position = 10;
        else if (probability < 40) position = 5;
        else if (probability < 60) position = 3;
        else if (probability < 80) position = 2;
        else position = 1;

        const insights = [];
        if (factors.distanceKm > 5) insights.push('Proximity is a major bottleneck');
        if (factors.authorityScore < 50) insights.push('Domain authority needs enhancement');
        if (factors.categoryRelevance < 0.8) insights.push('Primary GBP category mismatch');

        return {
            probability,
            estimatedPosition: position,
            factors: insights
        };
    }

    /**
     * Generate a heatmap grid of ranking probabilities
     */
    generateRankingGrid(centerLat: number, centerLng: number, radiusKm: number, stepKm: number, baseFactors: Omit<RankingFactors, 'distanceKm'>) {
        const grid = [];
        for (let x = -radiusKm; x <= radiusKm; x += stepKm) {
            for (let y = -radiusKm; y <= radiusKm; y += stepKm) {
                const dist = Math.sqrt(x * x + y * y);
                const prediction = this.predictRank({ ...baseFactors, distanceKm: dist });
                grid.push({
                    offset: { x, y },
                    lat: centerLat + (y / 111), // Rough km to deg
                    lng: centerLng + (x / (111 * Math.cos(centerLat))),
                    ...prediction
                });
            }
        }
        return grid;
    }
}

let predictorInstance: RankingPredictor | null = null;

export function getRankingPredictor(): RankingPredictor {
    if (!predictorInstance) {
        predictorInstance = new RankingPredictor();
    }
    return predictorInstance;
}

// Legacy export for backward compatibility
export const rankingPredictor = getRankingPredictor();
