/**
 * Google Analytics 4 Data API Client
 *
 * Fetches analytics data from GA4 for campaign performance,
 * user acquisition, and conversion tracking.
 */

import { google } from 'googleapis';
import type {
  AnalyticsOverview,
  CampaignReport,
  CampaignMetrics,
  ConversionReport,
  ConversionGoal,
  ChannelPerformance,
  ChannelGroup,
  DateRange,
} from '../analytics/types';

export class GA4Client {
  private analyticsData: any;
  private propertyId: string;

  constructor() {
    // Initialize Google Auth
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    this.propertyId = process.env.GA4_PROPERTY_ID || '';

    if (clientEmail && privateKey) {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      });

      this.analyticsData = google.analyticsdata({
        version: 'v1beta',
        auth,
      });
    }
  }

  /**
   * Check if GA4 is configured
   */
  isConfigured(): boolean {
    return !!(this.analyticsData && this.propertyId);
  }

  /**
   * Get overview metrics for the dashboard
   */
  async getOverviewMetrics(startDate: string, endDate: string): Promise<AnalyticsOverview> {
    if (!this.isConfigured()) {
      return this.getMockOverview(startDate, endDate);
    }

    try {
      const response = await this.analyticsData.properties.runReport({
        property: `properties/${this.propertyId}`,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'newUsers' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
            { name: 'screenPageViews' },
            { name: 'conversions' },
            { name: 'totalRevenue' },
          ],
        },
      });

      const row = response.data.rows?.[0]?.metricValues || [];

      return {
        dateRange: { startDate, endDate },
        sessions: parseInt(row[0]?.value || '0'),
        users: parseInt(row[1]?.value || '0'),
        newUsers: parseInt(row[2]?.value || '0'),
        bounceRate: parseFloat(row[3]?.value || '0'),
        avgSessionDuration: parseFloat(row[4]?.value || '0'),
        pageviews: parseInt(row[5]?.value || '0'),
        conversions: parseInt(row[6]?.value || '0'),
        revenue: parseFloat(row[7]?.value || '0'),
      };
    } catch (error: any) {
      console.error('[GA4Client] Error fetching overview:', error.message);
      return this.getMockOverview(startDate, endDate);
    }
  }

  /**
   * Get campaign performance data
   */
  async getCampaignPerformance(
    startDate: string,
    endDate: string,
    limit: number = 25,
  ): Promise<CampaignReport> {
    if (!this.isConfigured()) {
      return this.getMockCampaignReport(startDate, endDate);
    }

    try {
      const response = await this.analyticsData.properties.runReport({
        property: `properties/${this.propertyId}`,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [
            { name: 'sessionCampaignId' },
            { name: 'sessionCampaignName' },
            { name: 'sessionSource' },
            { name: 'sessionMedium' },
          ],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'conversions' },
            { name: 'totalRevenue' },
          ],
          limit,
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        },
      });

      const campaigns: CampaignMetrics[] = (response.data.rows || []).map((row: any) => ({
        campaignId: row.dimensionValues[0]?.value || '',
        campaignName: row.dimensionValues[1]?.value || '(not set)',
        source: row.dimensionValues[2]?.value || '(direct)',
        medium: row.dimensionValues[3]?.value || '(none)',
        sessions: parseInt(row.metricValues[0]?.value || '0'),
        users: parseInt(row.metricValues[1]?.value || '0'),
        conversions: parseInt(row.metricValues[2]?.value || '0'),
        revenue: parseFloat(row.metricValues[3]?.value || '0'),
      }));

      const totals = campaigns.reduce(
        (acc, c) => ({
          sessions: acc.sessions + c.sessions,
          users: acc.users + c.users,
          conversions: acc.conversions + c.conversions,
          revenue: acc.revenue + c.revenue,
          cost: 0,
        }),
        { sessions: 0, users: 0, conversions: 0, revenue: 0, cost: 0 },
      );

      return {
        dateRange: { startDate, endDate },
        campaigns,
        totals,
      };
    } catch (error: any) {
      console.error('[GA4Client] Error fetching campaigns:', error.message);
      return this.getMockCampaignReport(startDate, endDate);
    }
  }

  /**
   * Get channel performance breakdown
   */
  async getChannelPerformance(startDate: string, endDate: string): Promise<ChannelPerformance[]> {
    if (!this.isConfigured()) {
      return this.getMockChannelPerformance();
    }

    try {
      const response = await this.analyticsData.properties.runReport({
        property: `properties/${this.propertyId}`,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'conversions' },
            { name: 'totalRevenue' },
          ],
        },
      });

      return (response.data.rows || []).map((row: any) => ({
        channel: this.mapChannel(row.dimensionValues[0]?.value || 'other'),
        sessions: parseInt(row.metricValues[0]?.value || '0'),
        users: parseInt(row.metricValues[1]?.value || '0'),
        conversions: parseInt(row.metricValues[2]?.value || '0'),
        revenue: parseFloat(row.metricValues[3]?.value || '0'),
        assistedConversions: 0,
        lastClickConversions: parseInt(row.metricValues[2]?.value || '0'),
      }));
    } catch (error: any) {
      console.error('[GA4Client] Error fetching channels:', error.message);
      return this.getMockChannelPerformance();
    }
  }

  /**
   * Get conversion goals
   */
  async getConversions(startDate: string, endDate: string): Promise<ConversionReport> {
    if (!this.isConfigured()) {
      return this.getMockConversionReport(startDate, endDate);
    }

    try {
      const response = await this.analyticsData.properties.runReport({
        property: `properties/${this.propertyId}`,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }, { name: 'eventValue' }],
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              inListFilter: {
                values: ['purchase', 'sign_up', 'generate_lead', 'add_to_cart', 'begin_checkout'],
              },
            },
          },
        },
      });

      const goals: ConversionGoal[] = (response.data.rows || []).map((row: any) => ({
        goalId: row.dimensionValues[0]?.value || '',
        goalName: this.formatGoalName(row.dimensionValues[0]?.value || ''),
        completions: parseInt(row.metricValues[0]?.value || '0'),
        value: parseFloat(row.metricValues[1]?.value || '0'),
        conversionRate: 0, // Calculate based on sessions
      }));

      const totalConversions = goals.reduce((sum, g) => sum + g.completions, 0);
      const totalValue = goals.reduce((sum, g) => sum + g.value, 0);

      return {
        dateRange: { startDate, endDate },
        goals,
        totalConversions,
        totalValue,
        overallConversionRate: 0,
      };
    } catch (error: any) {
      console.error('[GA4Client] Error fetching conversions:', error.message);
      return this.getMockConversionReport(startDate, endDate);
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private mapChannel(channelName: string): ChannelGroup {
    const mapping: Record<string, ChannelGroup> = {
      Direct: 'direct',
      'Organic Search': 'organic_search',
      'Paid Search': 'paid_search',
      Social: 'social',
      Email: 'email',
      Referral: 'referral',
      Display: 'display',
      Affiliates: 'affiliate',
    };
    return mapping[channelName] || 'other';
  }

  private formatGoalName(eventName: string): string {
    return eventName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Get date range for last N days
   */
  getDateRange(days: number): DateRange {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  // ==========================================================================
  // MOCK DATA (for development without GA4)
  // ==========================================================================

  private getMockOverview(startDate: string, endDate: string): AnalyticsOverview {
    return {
      dateRange: { startDate, endDate },
      sessions: 12450,
      users: 8920,
      newUsers: 5670,
      bounceRate: 42.5,
      avgSessionDuration: 185,
      pageviews: 34560,
      conversions: 342,
      revenue: 28450.0,
    };
  }

  private getMockCampaignReport(startDate: string, endDate: string): CampaignReport {
    const campaigns: CampaignMetrics[] = [
      {
        campaignId: '1',
        campaignName: 'Brand Awareness Q1',
        source: 'google',
        medium: 'cpc',
        sessions: 3420,
        users: 2890,
        conversions: 89,
        revenue: 7890.0,
      },
      {
        campaignId: '2',
        campaignName: 'Product Launch',
        source: 'facebook',
        medium: 'paid_social',
        sessions: 2100,
        users: 1890,
        conversions: 67,
        revenue: 5670.0,
      },
      {
        campaignId: '3',
        campaignName: 'Newsletter',
        source: 'mailchimp',
        medium: 'email',
        sessions: 1560,
        users: 1340,
        conversions: 45,
        revenue: 3890.0,
      },
      {
        campaignId: '4',
        campaignName: 'Organic Traffic',
        source: 'google',
        medium: 'organic',
        sessions: 4200,
        users: 3560,
        conversions: 112,
        revenue: 8900.0,
      },
    ];

    return {
      dateRange: { startDate, endDate },
      campaigns,
      totals: {
        sessions: campaigns.reduce((s, c) => s + c.sessions, 0),
        users: campaigns.reduce((s, c) => s + c.users, 0),
        conversions: campaigns.reduce((s, c) => s + c.conversions, 0),
        revenue: campaigns.reduce((s, c) => s + c.revenue, 0),
        cost: 4500,
      },
    };
  }

  private getMockChannelPerformance(): ChannelPerformance[] {
    return [
      {
        channel: 'organic_search',
        sessions: 4200,
        users: 3560,
        conversions: 112,
        revenue: 8900,
        assistedConversions: 45,
        lastClickConversions: 112,
      },
      {
        channel: 'paid_search',
        sessions: 3420,
        users: 2890,
        conversions: 89,
        revenue: 7890,
        assistedConversions: 34,
        lastClickConversions: 89,
      },
      {
        channel: 'social',
        sessions: 2100,
        users: 1890,
        conversions: 67,
        revenue: 5670,
        assistedConversions: 28,
        lastClickConversions: 67,
      },
      {
        channel: 'email',
        sessions: 1560,
        users: 1340,
        conversions: 45,
        revenue: 3890,
        assistedConversions: 12,
        lastClickConversions: 45,
      },
      {
        channel: 'direct',
        sessions: 890,
        users: 780,
        conversions: 23,
        revenue: 1890,
        assistedConversions: 8,
        lastClickConversions: 23,
      },
      {
        channel: 'referral',
        sessions: 280,
        users: 260,
        conversions: 6,
        revenue: 210,
        assistedConversions: 3,
        lastClickConversions: 6,
      },
    ];
  }

  private getMockConversionReport(startDate: string, endDate: string): ConversionReport {
    return {
      dateRange: { startDate, endDate },
      goals: [
        {
          goalId: 'purchase',
          goalName: 'Purchase',
          completions: 234,
          value: 23400,
          conversionRate: 2.8,
        },
        { goalId: 'sign_up', goalName: 'Sign Up', completions: 567, value: 0, conversionRate: 6.8 },
        {
          goalId: 'generate_lead',
          goalName: 'Generate Lead',
          completions: 123,
          value: 1230,
          conversionRate: 1.5,
        },
        {
          goalId: 'add_to_cart',
          goalName: 'Add To Cart',
          completions: 890,
          value: 0,
          conversionRate: 10.7,
        },
      ],
      totalConversions: 1814,
      totalValue: 24630,
      overallConversionRate: 4.2,
    };
  }
}

// Singleton
let clientInstance: GA4Client | null = null;

export function getGA4Client(): GA4Client {
  if (!clientInstance) {
    clientInstance = new GA4Client();
  }
  return clientInstance;
}
