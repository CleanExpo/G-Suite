/**
 * Local Competitor Analyzer
 *
 * Identifies and analyzes local competitors to:
 * - Compare Google Business Profiles
 * - Identify citation gaps
 * - Compare reviews and ratings
 * - Find keyword opportunities
 * - Benchmark business performance
 */

import type {
  CompetitorComparison,
  CompetitorProfile,
  CompetitiveGap,
  CompetitiveOpportunity,
  CompetitorSummary,
  GoogleBusinessProfile,
} from './types';

export interface CompetitorAnalysisInput {
  businessName: string;
  address: string;
  categories: string[];
  lat?: number;
  lng?: number;
  radius?: number; // Search radius in miles (default: 10)

  // Your business data
  yourProfile: {
    rating: number;
    reviewCount: number;
    citationCount: number;
    photoCount: number;
    postCount: number;
    completenessScore: number;
  };

  // Optional: manually provide competitor data
  knownCompetitors?: CompetitorProfile[];
}

export class LocalCompetitorAnalyzer {
  /**
   * Perform comprehensive competitor analysis
   */
  async analyze(input: CompetitorAnalysisInput): Promise<CompetitorComparison> {
    // Find local competitors
    const competitors = await this.findLocalCompetitors(input);

    // Calculate gaps
    const gaps = this.identifyGaps(competitors, input.yourProfile);

    // Identify opportunities
    const opportunities = this.identifyOpportunities(competitors, gaps, input);

    // Generate summary
    const summary = this.generateSummary(competitors, input.yourProfile);

    return {
      competitors,
      gaps,
      opportunities,
      summary,
    };
  }

  /**
   * Find local competitors in the same area
   */
  private async findLocalCompetitors(input: CompetitorAnalysisInput): Promise<CompetitorProfile[]> {
    // If competitors manually provided, use those
    if (input.knownCompetitors && input.knownCompetitors.length > 0) {
      return input.knownCompetitors;
    }

    // In production, this would:
    // 1. Use Google Places API to search for businesses in same categories
    // 2. Filter by radius (default 10 miles)
    // 3. Fetch detailed profile data for each competitor
    // 4. Calculate strengths and weaknesses

    // For now, return mock competitor data
    return this.getMockCompetitors(input);
  }

  /**
   * Compare GBP profiles with competitors
   */
  compareGBPProfiles(
    yourProfile: GoogleBusinessProfile,
    competitorProfiles: GoogleBusinessProfile[],
  ): {
    comparison: { metric: string; yours: number; average: number; best: number }[];
    insights: string[];
  } {
    const comparison: { metric: string; yours: number; average: number; best: number }[] = [];
    const insights: string[] = [];

    if (competitorProfiles.length === 0) {
      return { comparison, insights: ['No competitor data available for comparison'] };
    }

    // Review count comparison
    const competitorReviewCounts = competitorProfiles.map((p) => p.reviewCount);
    const avgReviews =
      competitorReviewCounts.reduce((a, b) => a + b, 0) / competitorReviewCounts.length;
    const bestReviews = Math.max(...competitorReviewCounts);

    comparison.push({
      metric: 'Review Count',
      yours: yourProfile.reviewCount,
      average: Math.round(avgReviews),
      best: bestReviews,
    });

    if (yourProfile.reviewCount < avgReviews * 0.7) {
      insights.push(
        `You have ${Math.round(avgReviews - yourProfile.reviewCount)} fewer reviews than average`,
      );
    } else if (yourProfile.reviewCount > avgReviews * 1.3) {
      insights.push('You have significantly more reviews than competitors');
    }

    // Rating comparison
    const competitorRatings = competitorProfiles.map((p) => p.rating);
    const avgRating = competitorRatings.reduce((a, b) => a + b, 0) / competitorRatings.length;
    const bestRating = Math.max(...competitorRatings);

    comparison.push({
      metric: 'Average Rating',
      yours: yourProfile.rating,
      average: Number(avgRating.toFixed(1)),
      best: bestRating,
    });

    if (yourProfile.rating < avgRating - 0.3) {
      insights.push('Your rating is below the local average');
    } else if (yourProfile.rating >= 4.5) {
      insights.push('You have an excellent rating compared to competitors');
    }

    // Photo count comparison
    const competitorPhotoCounts = competitorProfiles.map((p) => p.photos.length);
    const avgPhotos =
      competitorPhotoCounts.reduce((a, b) => a + b, 0) / competitorPhotoCounts.length;
    const bestPhotos = Math.max(...competitorPhotoCounts);

    comparison.push({
      metric: 'Photo Count',
      yours: yourProfile.photos.length,
      average: Math.round(avgPhotos),
      best: bestPhotos,
    });

    if (yourProfile.photos.length < avgPhotos * 0.5) {
      insights.push('Add more photos - you have fewer than most competitors');
    }

    // Post count comparison
    const competitorPostCounts = competitorProfiles.map((p) => p.posts.length);
    const avgPosts = competitorPostCounts.reduce((a, b) => a + b, 0) / competitorPostCounts.length;
    const bestPosts = Math.max(...competitorPostCounts);

    comparison.push({
      metric: 'Post Count',
      yours: yourProfile.posts.length,
      average: Math.round(avgPosts),
      best: bestPosts,
    });

    if (yourProfile.posts.length === 0 && avgPosts > 0) {
      insights.push('Start posting on your GBP - competitors are actively posting');
    }

    // Completeness comparison
    const competitorCompleteness = competitorProfiles.map((p) => p.completenessScore);
    const avgCompleteness =
      competitorCompleteness.reduce((a, b) => a + b, 0) / competitorCompleteness.length;
    const bestCompleteness = Math.max(...competitorCompleteness);

    comparison.push({
      metric: 'Profile Completeness (%)',
      yours: yourProfile.completenessScore,
      average: Math.round(avgCompleteness),
      best: bestCompleteness,
    });

    if (yourProfile.completenessScore < avgCompleteness - 10) {
      insights.push("Complete your profile - it's less complete than competitors");
    }

    return { comparison, insights };
  }

  /**
   * Analyze citation gaps between you and competitors
   */
  analyzeCitationGap(
    yourCitations: number,
    competitorCitations: number[],
  ): {
    gap: number;
    percentile: number;
    recommendation: string;
  } {
    if (competitorCitations.length === 0) {
      return {
        gap: 0,
        percentile: 50,
        recommendation: 'No competitor citation data available',
      };
    }

    const avgCitations =
      competitorCitations.reduce((a, b) => a + b, 0) / competitorCitations.length;
    const gap = Math.round(avgCitations - yourCitations);

    // Calculate percentile (how you rank among competitors)
    const allCitations = [...competitorCitations, yourCitations].sort((a, b) => a - b);
    const yourRank = allCitations.indexOf(yourCitations) + 1;
    const percentile = Math.round((yourRank / allCitations.length) * 100);

    let recommendation = '';
    if (gap > 20) {
      recommendation = `Build ${gap} more citations to match the average. Focus on major directories first.`;
    } else if (gap > 10) {
      recommendation = `Build ${gap} more citations to improve your local presence.`;
    } else if (gap > 0) {
      recommendation = `You're close to average. Build ${gap} more citations to surpass competitors.`;
    } else {
      recommendation = 'You have more citations than average - maintain your advantage!';
    }

    return { gap, percentile, recommendation };
  }

  /**
   * Compare review strategies
   */
  compareReviews(
    yourReviews: { rating: number; count: number; replyRate: number },
    competitorReviews: { rating: number; count: number; replyRate: number }[],
  ): {
    insights: string[];
    recommendations: string[];
  } {
    const insights: string[] = [];
    const recommendations: string[] = [];

    if (competitorReviews.length === 0) {
      return {
        insights: ['No competitor review data available'],
        recommendations: [],
      };
    }

    // Average competitor metrics
    const avgCount = competitorReviews.reduce((a, b) => a + b.count, 0) / competitorReviews.length;
    const avgRating =
      competitorReviews.reduce((a, b) => a + b.rating, 0) / competitorReviews.length;
    const avgReplyRate =
      competitorReviews.reduce((a, b) => a + b.replyRate, 0) / competitorReviews.length;

    // Review count analysis
    if (yourReviews.count < avgCount * 0.5) {
      insights.push(
        `You have ${Math.round(avgCount - yourReviews.count)} fewer reviews than average`,
      );
      recommendations.push(
        'Implement a review generation campaign - ask satisfied customers for reviews',
      );
    } else if (yourReviews.count > avgCount * 1.5) {
      insights.push('You have significantly more reviews than competitors - great job!');
    }

    // Rating analysis
    if (yourReviews.rating < avgRating - 0.3) {
      insights.push('Your rating is below the local average');
      recommendations.push('Focus on service quality and address negative reviews promptly');
    } else if (yourReviews.rating >= 4.5 && avgRating < 4.3) {
      insights.push('Your rating is excellent compared to competitors');
    }

    // Reply rate analysis
    if (yourReviews.replyRate < avgReplyRate - 10) {
      insights.push('You reply to reviews less often than competitors');
      recommendations.push(
        'Respond to all reviews, especially negative ones, to show customer engagement',
      );
    } else if (yourReviews.replyRate > 80 && avgReplyRate < 60) {
      insights.push('You respond to reviews more consistently than competitors');
    }

    // Review velocity (reviews per month)
    const yourVelocity = yourReviews.count / 12; // Assuming annual count
    const avgVelocity = avgCount / 12;

    if (yourVelocity < avgVelocity * 0.5) {
      recommendations.push(
        'Increase review frequency - competitors are getting more reviews per month',
      );
    }

    return { insights, recommendations };
  }

  /**
   * Identify keyword gaps and opportunities
   */
  identifyKeywordGaps(
    yourKeywords: string[],
    competitorKeywords: string[][],
  ): {
    missingKeywords: string[];
    opportunities: string[];
  } {
    if (competitorKeywords.length === 0) {
      return {
        missingKeywords: [],
        opportunities: ['No competitor keyword data available'],
      };
    }

    // Flatten competitor keywords and count frequency
    const allCompetitorKeywords: { [key: string]: number } = {};

    for (const keywords of competitorKeywords) {
      for (const keyword of keywords) {
        const normalized = keyword.toLowerCase().trim();
        allCompetitorKeywords[normalized] = (allCompetitorKeywords[normalized] || 0) + 1;
      }
    }

    // Find keywords used by multiple competitors but not by you
    const yourKeywordsLower = yourKeywords.map((k) => k.toLowerCase().trim());
    const missingKeywords: string[] = [];

    for (const [keyword, count] of Object.entries(allCompetitorKeywords)) {
      if (count >= 2 && !yourKeywordsLower.includes(keyword)) {
        missingKeywords.push(keyword);
      }
    }

    // Sort by frequency
    missingKeywords.sort((a, b) => allCompetitorKeywords[b] - allCompetitorKeywords[a]);

    // Generate opportunities
    const opportunities: string[] = [];

    if (missingKeywords.length > 0) {
      opportunities.push(`${missingKeywords.length} keywords used by competitors but not by you`);

      // Top 3 missing keywords
      const top3 = missingKeywords.slice(0, 3);
      if (top3.length > 0) {
        opportunities.push(`Top missing keywords: ${top3.join(', ')}`);
      }
    } else {
      opportunities.push('You are targeting all major keywords used by competitors');
    }

    return { missingKeywords, opportunities };
  }

  /**
   * Identify competitive gaps (areas where competitors outperform you)
   */
  private identifyGaps(
    competitors: CompetitorProfile[],
    yourProfile: CompetitorAnalysisInput['yourProfile'],
  ): CompetitiveGap[] {
    const gaps: CompetitiveGap[] = [];

    if (competitors.length === 0) {
      return gaps;
    }

    // Calculate competitor averages
    const avgReviews = competitors.reduce((sum, c) => sum + c.reviewCount, 0) / competitors.length;
    const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
    const avgCitations =
      competitors.reduce((sum, c) => sum + c.citationCount, 0) / competitors.length;
    const topReviews = Math.max(...competitors.map((c) => c.reviewCount));
    const topCitations = Math.max(...competitors.map((c) => c.citationCount));

    // Review gap
    if (yourProfile.reviewCount < avgReviews * 0.7) {
      gaps.push({
        type: 'reviews',
        description: 'Review count significantly below competitors',
        yourValue: yourProfile.reviewCount,
        competitorAverage: Math.round(avgReviews),
        topCompetitorValue: topReviews,
        priority: yourProfile.reviewCount < avgReviews * 0.5 ? 'high' : 'medium',
      });
    }

    // Rating gap
    if (yourProfile.rating < avgRating - 0.3) {
      gaps.push({
        type: 'reviews',
        description: 'Average rating below local competitors',
        yourValue: yourProfile.rating,
        competitorAverage: Number(avgRating.toFixed(1)),
        topCompetitorValue: Math.max(...competitors.map((c) => c.rating)),
        priority: yourProfile.rating < 4.0 ? 'high' : 'medium',
      });
    }

    // Citation gap
    if (yourProfile.citationCount < avgCitations * 0.7) {
      gaps.push({
        type: 'citations',
        description: 'Citation count below competitors',
        yourValue: yourProfile.citationCount,
        competitorAverage: Math.round(avgCitations),
        topCompetitorValue: topCitations,
        priority: yourProfile.citationCount < avgCitations * 0.5 ? 'high' : 'medium',
      });
    }

    // Photo gap
    if (yourProfile.photoCount < 10) {
      const avgPhotos =
        competitors.reduce((sum, c) => sum + (c.strengths.includes('photos') ? 20 : 5), 0) /
        competitors.length;

      gaps.push({
        type: 'photos',
        description: 'Insufficient photos on profile',
        yourValue: yourProfile.photoCount,
        competitorAverage: Math.round(avgPhotos),
        topCompetitorValue: 50,
        priority: 'medium',
      });
    }

    // Content/posts gap
    if (yourProfile.postCount === 0) {
      gaps.push({
        type: 'content',
        description: 'No recent posts on Google Business Profile',
        yourValue: 0,
        competitorAverage: 5,
        topCompetitorValue: 12,
        priority: 'medium',
      });
    }

    // Sort by priority
    gaps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return gaps;
  }

  /**
   * Identify competitive opportunities
   */
  private identifyOpportunities(
    competitors: CompetitorProfile[],
    gaps: CompetitiveGap[],
    input: CompetitorAnalysisInput,
  ): CompetitiveOpportunity[] {
    const opportunities: CompetitiveOpportunity[] = [];

    // Review generation opportunity
    const reviewGap = gaps.find((g) => g.type === 'reviews' && g.description.includes('count'));
    if (reviewGap) {
      opportunities.push({
        opportunity: 'Launch review generation campaign',
        potentialImpact: 3,
        effort: 'medium',
        priority: 'high',
        actionItems: [
          'Set up automated review request emails after service',
          'Add QR codes linking to review page at checkout',
          'Train staff to ask for reviews from satisfied customers',
          `Target: Get ${Math.round(reviewGap.competitorAverage - reviewGap.yourValue)} more reviews in 90 days`,
        ],
      });
    }

    // Citation building opportunity
    const citationGap = gaps.find((g) => g.type === 'citations');
    if (citationGap) {
      opportunities.push({
        opportunity: 'Build missing citations',
        potentialImpact: 2,
        effort: 'medium',
        priority: 'high',
        actionItems: [
          'Claim profiles on major directories (Yelp, Facebook, Bing Places)',
          'Ensure NAP consistency across all listings',
          'Add business to industry-specific directories',
          `Target: Add ${Math.round(citationGap.competitorAverage - citationGap.yourValue)} new citations`,
        ],
      });
    }

    // Photo opportunity
    const photoGap = gaps.find((g) => g.type === 'photos');
    if (photoGap) {
      opportunities.push({
        opportunity: 'Add high-quality photos',
        potentialImpact: 1,
        effort: 'low',
        priority: 'medium',
        actionItems: [
          'Professional exterior and interior photos',
          'Product/service photos',
          'Team photos',
          'Customer experience photos',
          `Target: Add ${Math.round(photoGap.competitorAverage - photoGap.yourValue)} photos`,
        ],
      });
    }

    // Posting opportunity
    const postGap = gaps.find((g) => g.type === 'content');
    if (postGap) {
      opportunities.push({
        opportunity: 'Start regular GBP posting',
        potentialImpact: 1,
        effort: 'low',
        priority: 'medium',
        actionItems: [
          'Create content calendar for weekly posts',
          'Share updates, offers, and events',
          'Use high-quality images in posts',
          'Include call-to-action in each post',
        ],
      });
    }

    // Identify weak competitors
    const weakCompetitors = competitors.filter((c) => c.reviewCount < 20 || c.rating < 4.0);

    if (weakCompetitors.length > 0 && input.yourProfile.rating >= 4.0) {
      opportunities.push({
        opportunity: 'Capitalize on weak competitors',
        potentialImpact: 2,
        effort: 'low',
        priority: 'medium',
        actionItems: [
          `${weakCompetitors.length} competitors have weak profiles`,
          'Focus on keywords they target but execute better',
          'Highlight your superior ratings and reviews',
          'Capture their dissatisfied customers',
        ],
      });
    }

    // Service area expansion
    const avgDistance = competitors.reduce((sum, c) => sum + c.distance, 0) / competitors.length;
    if (avgDistance > 5) {
      opportunities.push({
        opportunity: 'Expand service area targeting',
        potentialImpact: 2,
        effort: 'low',
        priority: 'low',
        actionItems: [
          'Add service area to GBP profile',
          'Create location pages for nearby cities',
          'Target geo-modified keywords',
          'Build citations in neighboring areas',
        ],
      });
    }

    // Sort by priority and impact
    opportunities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.potentialImpact - a.potentialImpact;
    });

    return opportunities;
  }

  /**
   * Generate competitor summary
   */
  private generateSummary(
    competitors: CompetitorProfile[],
    yourProfile: CompetitorAnalysisInput['yourProfile'],
  ): CompetitorSummary {
    if (competitors.length === 0) {
      return {
        totalCompetitors: 0,
        averageRating: 0,
        averageReviewCount: 0,
        averageCitationCount: 0,
        yourRanking: 1,
      };
    }

    const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
    const avgReviews = competitors.reduce((sum, c) => sum + c.reviewCount, 0) / competitors.length;
    const avgCitations =
      competitors.reduce((sum, c) => sum + c.citationCount, 0) / competitors.length;

    // Calculate your ranking (simple scoring)
    const yourScore =
      yourProfile.rating * 20 +
      Math.min(yourProfile.reviewCount / 5, 20) +
      Math.min(yourProfile.citationCount / 2, 10);

    const competitorScores = competitors.map(
      (c) => c.rating * 20 + Math.min(c.reviewCount / 5, 20) + Math.min(c.citationCount / 2, 10),
    );

    const allScores = [...competitorScores, yourScore].sort((a, b) => b - a);
    const yourRanking = allScores.indexOf(yourScore) + 1;

    return {
      totalCompetitors: competitors.length,
      averageRating: Number(avgRating.toFixed(1)),
      averageReviewCount: Math.round(avgReviews),
      averageCitationCount: Math.round(avgCitations),
      yourRanking,
    };
  }

  /**
   * Generate mock competitor data for development
   */
  private getMockCompetitors(input: CompetitorAnalysisInput): CompetitorProfile[] {
    const mockNames = [
      'Competitor A',
      'Competitor B',
      'Competitor C',
      'Competitor D',
      'Competitor E',
    ];

    return mockNames.map((name, index) => {
      const distance = 0.5 + Math.random() * 9.5; // 0.5 to 10 miles
      const rating = 3.5 + Math.random() * 1.5; // 3.5 to 5.0
      const reviewCount = Math.floor(20 + Math.random() * 200); // 20 to 220
      const citationCount = Math.floor(10 + Math.random() * 40); // 10 to 50

      const strengths: string[] = [];
      const weaknesses: string[] = [];

      if (rating >= 4.5) strengths.push('Excellent rating');
      else if (rating < 4.0) weaknesses.push('Below average rating');

      if (reviewCount >= 100) strengths.push('High review count');
      else if (reviewCount < 30) weaknesses.push('Low review count');

      if (citationCount >= 30) strengths.push('Strong citation presence');
      else if (citationCount < 15) weaknesses.push('Weak citation presence');

      if (Math.random() > 0.5) strengths.push('Active on social media');
      if (Math.random() > 0.6) strengths.push('Regular posting activity');
      if (Math.random() > 0.7) weaknesses.push('Slow review response');

      const rankingScore = Math.round(
        rating * 15 +
          Math.min(reviewCount / 5, 25) +
          Math.min(citationCount, 20) +
          Math.random() * 10,
      );

      return {
        name,
        address: `${100 + index * 50} Main St, ${input.address.split(',')[1] || 'City'}`,
        distance: Number(distance.toFixed(1)),
        rating: Number(rating.toFixed(1)),
        reviewCount,
        citationCount,
        categories: input.categories,
        strengths,
        weaknesses,
        rankingScore,
      };
    });
  }
}

/**
 * Singleton instance
 */
let analyzerInstance: LocalCompetitorAnalyzer | null = null;

export function getLocalCompetitorAnalyzer(): LocalCompetitorAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new LocalCompetitorAnalyzer();
  }
  return analyzerInstance;
}
