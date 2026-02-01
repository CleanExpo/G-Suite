/**
 * Attribution Engine
 *
 * Multi-touch attribution modeling for marketing campaigns.
 * Supports Last-click, First-click, Linear, Time-decay, and Position-based models.
 */

import type {
  AttributionModel,
  AttributionResult,
  AttributionReport,
  TouchPoint,
  ConversionPath,
  DateRange,
} from './types';

export class AttributionEngine {
  /**
   * Calculate attribution based on the specified model
   */
  calculateAttribution(paths: ConversionPath[], model: AttributionModel): AttributionReport {
    const results = new Map<string, AttributionResult>();

    for (const path of paths) {
      const credits = this.distributeCredit(path.touchPoints, path.conversionValue, model);

      for (const [key, credit] of Object.entries(credits)) {
        const existing = results.get(key);
        if (existing) {
          existing.conversions += credit.conversions;
          existing.attributedRevenue += credit.revenue;
        } else {
          const touchPoint =
            path.touchPoints.find((t) => `${t.source}/${t.medium}` === key) || path.touchPoints[0];

          results.set(key, {
            model,
            channel: touchPoint.channel,
            source: touchPoint.source,
            medium: touchPoint.medium,
            conversions: credit.conversions,
            attributedRevenue: credit.revenue,
            contributionPercentage: 0,
          });
        }
      }
    }

    // Calculate percentages
    const totalRevenue = Array.from(results.values()).reduce(
      (sum, r) => sum + r.attributedRevenue,
      0,
    );

    for (const result of results.values()) {
      result.contributionPercentage =
        totalRevenue > 0 ? (result.attributedRevenue / totalRevenue) * 100 : 0;
    }

    const resultsArray = Array.from(results.values()).sort(
      (a, b) => b.attributedRevenue - a.attributedRevenue,
    );

    return {
      dateRange: { startDate: '', endDate: '' },
      model,
      results: resultsArray,
      conversionPaths: paths,
      summary: {
        totalConversions: paths.length,
        totalRevenue,
        avgPathLength: this.calculateAvgPathLength(paths),
        avgTimeToConversion: this.calculateAvgTimeToConversion(paths),
      },
    };
  }

  /**
   * Distribute credit based on attribution model
   */
  private distributeCredit(
    touchPoints: TouchPoint[],
    conversionValue: number,
    model: AttributionModel,
  ): Record<string, { conversions: number; revenue: number }> {
    const credits: Record<string, { conversions: number; revenue: number }> = {};

    if (touchPoints.length === 0) return credits;

    switch (model) {
      case 'last_click':
        return this.lastClickAttribution(touchPoints, conversionValue);

      case 'first_click':
        return this.firstClickAttribution(touchPoints, conversionValue);

      case 'linear':
        return this.linearAttribution(touchPoints, conversionValue);

      case 'time_decay':
        return this.timeDecayAttribution(touchPoints, conversionValue);

      case 'position_based':
        return this.positionBasedAttribution(touchPoints, conversionValue);

      default:
        return this.lastClickAttribution(touchPoints, conversionValue);
    }
  }

  /**
   * Last-Click: 100% credit to last touchpoint
   */
  private lastClickAttribution(
    touchPoints: TouchPoint[],
    conversionValue: number,
  ): Record<string, { conversions: number; revenue: number }> {
    const last = touchPoints[touchPoints.length - 1];
    const key = `${last.source}/${last.medium}`;
    return { [key]: { conversions: 1, revenue: conversionValue } };
  }

  /**
   * First-Click: 100% credit to first touchpoint
   */
  private firstClickAttribution(
    touchPoints: TouchPoint[],
    conversionValue: number,
  ): Record<string, { conversions: number; revenue: number }> {
    const first = touchPoints[0];
    const key = `${first.source}/${first.medium}`;
    return { [key]: { conversions: 1, revenue: conversionValue } };
  }

  /**
   * Linear: Equal credit to all touchpoints
   */
  private linearAttribution(
    touchPoints: TouchPoint[],
    conversionValue: number,
  ): Record<string, { conversions: number; revenue: number }> {
    const credits: Record<string, { conversions: number; revenue: number }> = {};
    const creditPerTouch = conversionValue / touchPoints.length;
    const conversionPerTouch = 1 / touchPoints.length;

    for (const tp of touchPoints) {
      const key = `${tp.source}/${tp.medium}`;
      if (credits[key]) {
        credits[key].conversions += conversionPerTouch;
        credits[key].revenue += creditPerTouch;
      } else {
        credits[key] = { conversions: conversionPerTouch, revenue: creditPerTouch };
      }
    }

    return credits;
  }

  /**
   * Time-Decay: More credit to touchpoints closer to conversion
   */
  private timeDecayAttribution(
    touchPoints: TouchPoint[],
    conversionValue: number,
  ): Record<string, { conversions: number; revenue: number }> {
    const credits: Record<string, { conversions: number; revenue: number }> = {};
    const halfLife = 7; // Days

    // Calculate weights based on time decay
    const weights: number[] = [];
    const conversionTime = touchPoints[touchPoints.length - 1].timestamp.getTime();

    for (const tp of touchPoints) {
      const daysSince = (conversionTime - tp.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      const weight = Math.pow(0.5, daysSince / halfLife);
      weights.push(weight);
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    for (let i = 0; i < touchPoints.length; i++) {
      const tp = touchPoints[i];
      const key = `${tp.source}/${tp.medium}`;
      const creditShare = (weights[i] / totalWeight) * conversionValue;
      const conversionShare = weights[i] / totalWeight;

      if (credits[key]) {
        credits[key].conversions += conversionShare;
        credits[key].revenue += creditShare;
      } else {
        credits[key] = { conversions: conversionShare, revenue: creditShare };
      }
    }

    return credits;
  }

  /**
   * Position-Based: 40% first, 40% last, 20% distributed to middle
   */
  private positionBasedAttribution(
    touchPoints: TouchPoint[],
    conversionValue: number,
  ): Record<string, { conversions: number; revenue: number }> {
    const credits: Record<string, { conversions: number; revenue: number }> = {};

    if (touchPoints.length === 1) {
      const key = `${touchPoints[0].source}/${touchPoints[0].medium}`;
      return { [key]: { conversions: 1, revenue: conversionValue } };
    }

    if (touchPoints.length === 2) {
      const firstKey = `${touchPoints[0].source}/${touchPoints[0].medium}`;
      const lastKey = `${touchPoints[1].source}/${touchPoints[1].medium}`;
      credits[firstKey] = { conversions: 0.5, revenue: conversionValue * 0.5 };
      credits[lastKey] = { conversions: 0.5, revenue: conversionValue * 0.5 };
      return credits;
    }

    // First touchpoint: 40%
    const first = touchPoints[0];
    const firstKey = `${first.source}/${first.medium}`;
    credits[firstKey] = { conversions: 0.4, revenue: conversionValue * 0.4 };

    // Last touchpoint: 40%
    const last = touchPoints[touchPoints.length - 1];
    const lastKey = `${last.source}/${last.medium}`;
    if (credits[lastKey]) {
      credits[lastKey].conversions += 0.4;
      credits[lastKey].revenue += conversionValue * 0.4;
    } else {
      credits[lastKey] = { conversions: 0.4, revenue: conversionValue * 0.4 };
    }

    // Middle touchpoints: 20% distributed equally
    const middleCount = touchPoints.length - 2;
    const middleCredit = (conversionValue * 0.2) / middleCount;
    const middleConversion = 0.2 / middleCount;

    for (let i = 1; i < touchPoints.length - 1; i++) {
      const tp = touchPoints[i];
      const key = `${tp.source}/${tp.medium}`;
      if (credits[key]) {
        credits[key].conversions += middleConversion;
        credits[key].revenue += middleCredit;
      } else {
        credits[key] = { conversions: middleConversion, revenue: middleCredit };
      }
    }

    return credits;
  }

  /**
   * Calculate average path length
   */
  private calculateAvgPathLength(paths: ConversionPath[]): number {
    if (paths.length === 0) return 0;
    const total = paths.reduce((sum, p) => sum + p.touchPoints.length, 0);
    return total / paths.length;
  }

  /**
   * Calculate average time to conversion (in hours)
   */
  private calculateAvgTimeToConversion(paths: ConversionPath[]): number {
    if (paths.length === 0) return 0;
    const total = paths.reduce((sum, p) => sum + p.timeToConversion, 0);
    return total / paths.length;
  }
}

// Singleton
let engineInstance: AttributionEngine | null = null;

export function getAttributionEngine(): AttributionEngine {
  if (!engineInstance) {
    engineInstance = new AttributionEngine();
  }
  return engineInstance;
}
