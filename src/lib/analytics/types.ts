/**
 * Analytics Types
 *
 * Type definitions for Google Analytics 4 integration
 * and attribution modeling.
 */

// =============================================================================
// CORE METRICS
// =============================================================================

export interface AnalyticsOverview {
  dateRange: DateRange;
  sessions: number;
  users: number;
  newUsers: number;
  bounceRate: number;
  avgSessionDuration: number;
  pageviews: number;
  conversions: number;
  revenue: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

// =============================================================================
// CAMPAIGN PERFORMANCE
// =============================================================================

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  source: string;
  medium: string;
  sessions: number;
  users: number;
  conversions: number;
  revenue: number;
  cost?: number;
  roas?: number; // Return on Ad Spend
  cpa?: number; // Cost per Acquisition
}

export interface CampaignReport {
  dateRange: DateRange;
  campaigns: CampaignMetrics[];
  totals: {
    sessions: number;
    users: number;
    conversions: number;
    revenue: number;
    cost: number;
  };
}

// =============================================================================
// ATTRIBUTION
// =============================================================================

export type AttributionModel =
  | 'last_click'
  | 'first_click'
  | 'linear'
  | 'time_decay'
  | 'position_based';

export interface TouchPoint {
  timestamp: Date;
  source: string;
  medium: string;
  campaign?: string;
  channel: string;
}

export interface AttributionResult {
  model: AttributionModel;
  channel: string;
  source: string;
  medium: string;
  conversions: number;
  attributedRevenue: number;
  contributionPercentage: number;
}

export interface AttributionReport {
  dateRange: DateRange;
  model: AttributionModel;
  results: AttributionResult[];
  conversionPaths: ConversionPath[];
  summary: {
    totalConversions: number;
    totalRevenue: number;
    avgPathLength: number;
    avgTimeToConversion: number;
  };
}

export interface ConversionPath {
  pathId: string;
  touchPoints: TouchPoint[];
  conversionValue: number;
  timeToConversion: number; // in hours
}

// =============================================================================
// CHANNEL GROUPINGS
// =============================================================================

export type ChannelGroup =
  | 'direct'
  | 'organic_search'
  | 'paid_search'
  | 'social'
  | 'email'
  | 'referral'
  | 'display'
  | 'affiliate'
  | 'other';

export interface ChannelPerformance {
  channel: ChannelGroup;
  sessions: number;
  users: number;
  conversions: number;
  revenue: number;
  assistedConversions: number;
  lastClickConversions: number;
}

// =============================================================================
// CONVERSION GOALS
// =============================================================================

export interface ConversionGoal {
  goalId: string;
  goalName: string;
  completions: number;
  value: number;
  conversionRate: number;
}

export interface ConversionReport {
  dateRange: DateRange;
  goals: ConversionGoal[];
  totalConversions: number;
  totalValue: number;
  overallConversionRate: number;
}

// =============================================================================
// REAL-TIME DATA
// =============================================================================

export interface RealTimeMetrics {
  activeUsers: number;
  activeUsersByPage: { page: string; users: number }[];
  activeUsersBySource: { source: string; users: number }[];
  eventsPerMinute: number;
  conversionsToday: number;
  timestamp: Date;
}

// =============================================================================
// API RESPONSES
// =============================================================================

export interface AnalyticsAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    propertyId: string;
    samplingLevel?: string;
    isDataGolden?: boolean;
  };
}
