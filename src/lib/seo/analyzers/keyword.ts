/**
 * Keyword Analyzer
 *
 * Analyzes keywords using SEMrush API for search volume, difficulty, CPC,
 * and identifies opportunities.
 */

import { KeywordAnalysis, KeywordMetrics, KeywordOpportunity } from '../types';

interface SemrushKeywordData {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  trends: number[];
}

export class KeywordAnalyzer {
  private semrushApiKey: string | undefined;
  private semrushApiUrl = 'https://api.semrush.com/';

  constructor() {
    this.semrushApiKey = process.env.SEMRUSH_API_KEY;
  }

  /**
   * Analyze keywords with SEMrush data
   */
  async analyze(url: string, keywords: string[], targetKeyword?: string): Promise<KeywordAnalysis> {
    const primaryKeyword = targetKeyword || keywords[0];

    // Fetch keyword metrics from SEMrush
    const keywordMetrics = await this.getKeywordMetrics(keywords);

    // Extract semantic keywords (related keywords)
    const semanticKeywords = await this.getSemanticKeywords(primaryKeyword);

    // LSI keywords (simplified - would use more advanced NLP in production)
    const lsiKeywords = this.generateLSIKeywords(primaryKeyword);

    // Find opportunities
    const opportunities = this.findOpportunities(keywordMetrics);

    // Calculate overall keyword score
    const score = this.calculateKeywordScore(keywordMetrics, primaryKeyword);

    return {
      primaryKeyword,
      keywords: keywordMetrics,
      semanticKeywords,
      lsiKeywords,
      score,
      opportunities,
    };
  }

  /**
   * Get keyword metrics from SEMrush API
   */
  private async getKeywordMetrics(keywords: string[]): Promise<KeywordMetrics[]> {
    if (!this.semrushApiKey) {
      return this.getMockKeywordMetrics(keywords);
    }

    const metrics: KeywordMetrics[] = [];

    for (const keyword of keywords) {
      try {
        const data = await this.fetchSemrushData(keyword);
        if (data) {
          metrics.push({
            keyword,
            volume: data.search_volume || 0,
            difficulty: this.calculateDifficulty(data),
            cpc: data.cpc || 0,
            competition: data.competition || 0,
            trend: this.determineTrend(data.trends),
            inContent: false, // Will be set by main analyzer
            density: 0, // Will be set by content analyzer
            prominence: 0, // Will be set by content analyzer
          });
        }
      } catch (error) {
        console.error(`[KeywordAnalyzer] Error fetching data for "${keyword}":`, error);
        // Add placeholder data
        metrics.push(this.getMockKeywordMetric(keyword));
      }
    }

    return metrics;
  }

  /**
   * Fetch keyword data from SEMrush API
   */
  private async fetchSemrushData(keyword: string): Promise<SemrushKeywordData | null> {
    if (!this.semrushApiKey) {
      return null;
    }

    try {
      // SEMrush API endpoint for keyword overview
      const params = new URLSearchParams({
        type: 'phrase_this',
        key: this.semrushApiKey,
        phrase: keyword,
        database: 'us', // US database
        export_columns: 'Ph,Nq,Cp,Co',
      });

      const response = await fetch(`${this.semrushApiUrl}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`SEMrush API error: ${response.status}`);
      }

      const text = await response.text();
      const lines = text.trim().split('\n');

      // Skip header, parse data
      if (lines.length < 2) {
        return null;
      }

      const dataLine = lines[1].split(';');
      if (dataLine.length < 4) {
        return null;
      }

      return {
        keyword: dataLine[0] || keyword,
        search_volume: parseInt(dataLine[1]) || 0,
        cpc: parseFloat(dataLine[2]) || 0,
        competition: parseFloat(dataLine[3]) || 0,
        trends: [], // Would need additional API call for trends
      };
    } catch (error) {
      console.error('[KeywordAnalyzer] SEMrush API error:', error);
      return null;
    }
  }

  /**
   * Calculate keyword difficulty (0-100)
   */
  private calculateDifficulty(data: SemrushKeywordData): number {
    // SEMrush competition is 0-1, convert to 0-100
    const competition = data.competition * 100;

    // Keyword difficulty heuristic based on volume and competition
    const volume = data.search_volume;

    let difficulty = competition;

    // High volume + high competition = very difficult
    if (volume > 10000 && competition > 70) {
      difficulty = Math.min(100, competition + 10);
    }

    // Low volume + low competition = easier
    if (volume < 1000 && competition < 30) {
      difficulty = Math.max(0, competition - 10);
    }

    return Math.round(Math.max(0, Math.min(100, difficulty)));
  }

  /**
   * Determine trend direction from historical data
   */
  private determineTrend(trends: number[]): 'rising' | 'stable' | 'declining' {
    if (!trends || trends.length < 3) {
      return 'stable';
    }

    // Compare average of first half vs second half
    const midpoint = Math.floor(trends.length / 2);
    const firstHalf = trends.slice(0, midpoint);
    const secondHalf = trends.slice(midpoint);

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) {
      return 'rising';
    } else if (change < -10) {
      return 'declining';
    } else {
      return 'stable';
    }
  }

  /**
   * Get semantic (related) keywords using SEMrush API
   */
  private async getSemanticKeywords(keyword: string): Promise<string[]> {
    if (!this.semrushApiKey) {
      return this.getMockSemanticKeywords(keyword);
    }

    try {
      // SEMrush API endpoint for related keywords
      const params = new URLSearchParams({
        type: 'phrase_related',
        key: this.semrushApiKey,
        phrase: keyword,
        database: 'us',
        export_columns: 'Ph,Nq',
        display_limit: '10',
      });

      const response = await fetch(`${this.semrushApiUrl}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`SEMrush API error: ${response.status}`);
      }

      const text = await response.text();
      const lines = text.trim().split('\n');

      // Skip header, extract keywords
      const relatedKeywords = lines
        .slice(1)
        .map((line) => line.split(';')[0])
        .filter((kw) => kw && kw !== keyword)
        .slice(0, 10);

      return relatedKeywords.length > 0 ? relatedKeywords : this.getMockSemanticKeywords(keyword);
    } catch (error) {
      console.error('[KeywordAnalyzer] Error fetching semantic keywords:', error);
      return this.getMockSemanticKeywords(keyword);
    }
  }

  /**
   * Generate LSI (Latent Semantic Indexing) keywords
   * Simplified version - in production would use NLP/embeddings
   */
  private generateLSIKeywords(keyword: string): string[] {
    const words = keyword.toLowerCase().split(/\s+/);

    // Common LSI variations (simplified)
    const lsiPatterns = [
      'best',
      'top',
      'how to',
      'guide',
      'tips',
      'review',
      'vs',
      'near me',
      'online',
      'free',
    ];

    const lsiKeywords: string[] = [];

    // Generate variations
    lsiPatterns.forEach((pattern) => {
      lsiKeywords.push(`${pattern} ${keyword}`);
      lsiKeywords.push(`${keyword} ${pattern}`);
    });

    // Return top 10 unique
    return [...new Set(lsiKeywords)].slice(0, 10);
  }

  /**
   * Find keyword opportunities (low difficulty, decent volume)
   */
  private findOpportunities(metrics: KeywordMetrics[]): KeywordOpportunity[] {
    const opportunities: KeywordOpportunity[] = [];

    metrics.forEach((metric) => {
      // Opportunity criteria:
      // 1. Low-medium difficulty (< 60)
      // 2. Decent volume (> 100)
      // 3. Rising trend
      const isLowDifficulty = metric.difficulty < 60;
      const hasVolume = metric.volume > 100;
      const isRising = metric.trend === 'rising';

      if (isLowDifficulty && hasVolume) {
        let priority: 'high' | 'medium' | 'low' = 'medium';

        // High priority: low difficulty + rising + good volume
        if (isRising && metric.volume > 1000 && metric.difficulty < 40) {
          priority = 'high';
        }

        // Low priority: declining or very low volume
        if (metric.trend === 'declining' || metric.volume < 500) {
          priority = 'low';
        }

        opportunities.push({
          keyword: metric.keyword,
          reason: this.generateOpportunityReason(metric, isRising),
          potentialTraffic: Math.round(metric.volume * 0.3), // Estimate 30% CTR
          difficulty: metric.difficulty,
          priority,
        });
      }
    });

    // Sort by priority and potential traffic
    opportunities.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.potentialTraffic - a.potentialTraffic;
    });

    return opportunities;
  }

  /**
   * Generate reason text for opportunity
   */
  private generateOpportunityReason(metric: KeywordMetrics, isRising: boolean): string {
    const reasons: string[] = [];

    if (metric.difficulty < 30) {
      reasons.push('very low difficulty');
    } else if (metric.difficulty < 50) {
      reasons.push('low difficulty');
    }

    if (metric.volume > 5000) {
      reasons.push('high search volume');
    } else if (metric.volume > 1000) {
      reasons.push('good search volume');
    }

    if (isRising) {
      reasons.push('trending upward');
    }

    return reasons.join(', ') || 'potential opportunity';
  }

  /**
   * Calculate overall keyword score
   */
  private calculateKeywordScore(metrics: KeywordMetrics[], primaryKeyword: string): number {
    if (metrics.length === 0) {
      return 0;
    }

    const primaryMetric = metrics.find((m) => m.keyword === primaryKeyword) || metrics[0];

    let score = 50; // Base score

    // Volume score (0-30 points)
    if (primaryMetric.volume > 5000) {
      score += 30;
    } else if (primaryMetric.volume > 1000) {
      score += 20;
    } else if (primaryMetric.volume > 100) {
      score += 10;
    }

    // Difficulty score (0-20 points) - lower is better
    if (primaryMetric.difficulty < 30) {
      score += 20;
    } else if (primaryMetric.difficulty < 50) {
      score += 15;
    } else if (primaryMetric.difficulty < 70) {
      score += 10;
    }

    // Trend score (0-10 points)
    if (primaryMetric.trend === 'rising') {
      score += 10;
    } else if (primaryMetric.trend === 'stable') {
      score += 5;
    }

    // Number of related keywords (0-10 points)
    if (metrics.length > 5) {
      score += 10;
    } else if (metrics.length > 2) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Mock keyword metrics when API is unavailable
   */
  private getMockKeywordMetrics(keywords: string[]): KeywordMetrics[] {
    return keywords.map((keyword) => this.getMockKeywordMetric(keyword));
  }

  private getMockKeywordMetric(keyword: string): KeywordMetrics {
    return {
      keyword,
      volume: 1000,
      difficulty: 50,
      cpc: 1.5,
      competition: 0.5,
      trend: 'stable',
      inContent: false,
      density: 0,
      prominence: 0,
    };
  }

  /**
   * Mock semantic keywords when API is unavailable
   */
  private getMockSemanticKeywords(keyword: string): string[] {
    const baseWords = keyword.split(/\s+/);
    return [
      `best ${keyword}`,
      `${keyword} guide`,
      `how to ${keyword}`,
      `${keyword} tips`,
      `${keyword} review`,
    ];
  }
}

/**
 * Create and export singleton instance
 */
let analyzerInstance: KeywordAnalyzer | null = null;

export function getKeywordAnalyzer(): KeywordAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new KeywordAnalyzer();
  }
  return analyzerInstance;
}
