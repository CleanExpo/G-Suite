/**
 * Google Search Console API Client
 *
 * Fetches search performance data, indexing status, and search appearance data
 * from Google Search Console API.
 */

import { google } from 'googleapis';
import type {
    SearchConsoleData,
    SearchConsoleMetrics,
    SearchQuery,
    PagePerformance,
    DeviceBreakdown,
    CountryBreakdown,
    DateRange
} from './types';

export class SearchConsoleClient {
    private auth: any;
    private searchconsole: any;

    constructor() {
        // Initialize Google Auth
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (clientEmail && privateKey) {
            this.auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: clientEmail,
                    private_key: privateKey
                },
                scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
            });

            this.searchconsole = google.searchconsole({
                version: 'v1',
                auth: this.auth
            });
        }
    }

    /**
     * Check if Search Console is configured
     */
    isConfigured(): boolean {
        return !!this.auth && !!this.searchconsole;
    }

    /**
     * Get search performance data for a site
     */
    async getSearchAnalytics(
        siteUrl: string,
        startDate: string,
        endDate: string
    ): Promise<SearchConsoleData | null> {
        if (!this.isConfigured()) {
            console.warn('[SearchConsoleClient] Not configured - missing credentials');
            return null;
        }

        try {
            // Normalize site URL (add sc-domain: prefix if needed)
            const propertyUrl = this.normalizeSiteUrl(siteUrl);

            const dateRange: DateRange = {
                startDate,
                endDate
            };

            // Fetch overall metrics
            const metrics = await this.getOverallMetrics(propertyUrl, startDate, endDate);

            // Fetch top queries
            const queries = await this.getTopQueries(propertyUrl, startDate, endDate);

            // Fetch top pages
            const pages = await this.getTopPages(propertyUrl, startDate, endDate);

            // Fetch device breakdown
            const devices = await this.getDeviceBreakdown(propertyUrl, startDate, endDate);

            // Fetch country breakdown
            const countries = await this.getCountryBreakdown(propertyUrl, startDate, endDate);

            return {
                property: propertyUrl,
                dateRange,
                metrics,
                queries,
                pages,
                devices,
                countries
            };
        } catch (error: any) {
            console.error('[SearchConsoleClient] Error fetching data:', error);
            return null;
        }
    }

    /**
     * Get overall search metrics
     */
    private async getOverallMetrics(
        siteUrl: string,
        startDate: string,
        endDate: string
    ): Promise<SearchConsoleMetrics> {
        try {
            const response = await this.searchconsole.searchanalytics.query({
                siteUrl,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: []
                }
            });

            const row = response.data.rows?.[0] || {};

            return {
                clicks: row.clicks || 0,
                impressions: row.impressions || 0,
                ctr: row.ctr || 0,
                position: row.position || 0
            };
        } catch (error: any) {
            console.error('[SearchConsoleClient] Error fetching overall metrics:', error);
            return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
        }
    }

    /**
     * Get top performing queries
     */
    private async getTopQueries(
        siteUrl: string,
        startDate: string,
        endDate: string,
        limit: number = 25
    ): Promise<SearchQuery[]> {
        try {
            const response = await this.searchconsole.searchanalytics.query({
                siteUrl,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['query'],
                    rowLimit: limit
                }
            });

            const rows = response.data.rows || [];

            return rows.map((row: any) => ({
                query: row.keys[0],
                clicks: row.clicks || 0,
                impressions: row.impressions || 0,
                ctr: row.ctr || 0,
                position: row.position || 0
            }));
        } catch (error: any) {
            console.error('[SearchConsoleClient] Error fetching queries:', error);
            return [];
        }
    }

    /**
     * Get top performing pages
     */
    private async getTopPages(
        siteUrl: string,
        startDate: string,
        endDate: string,
        limit: number = 25
    ): Promise<PagePerformance[]> {
        try {
            const response = await this.searchconsole.searchanalytics.query({
                siteUrl,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['page'],
                    rowLimit: limit
                }
            });

            const rows = response.data.rows || [];

            return rows.map((row: any) => ({
                page: row.keys[0],
                clicks: row.clicks || 0,
                impressions: row.impressions || 0,
                ctr: row.ctr || 0,
                position: row.position || 0
            }));
        } catch (error: any) {
            console.error('[SearchConsoleClient] Error fetching pages:', error);
            return [];
        }
    }

    /**
     * Get device breakdown
     */
    private async getDeviceBreakdown(
        siteUrl: string,
        startDate: string,
        endDate: string
    ): Promise<DeviceBreakdown> {
        try {
            const response = await this.searchconsole.searchanalytics.query({
                siteUrl,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['device']
                }
            });

            const rows = response.data.rows || [];

            const desktop = rows.find((r: any) => r.keys[0] === 'DESKTOP');
            const mobile = rows.find((r: any) => r.keys[0] === 'MOBILE');
            const tablet = rows.find((r: any) => r.keys[0] === 'TABLET');

            return {
                desktop: {
                    clicks: desktop?.clicks || 0,
                    impressions: desktop?.impressions || 0,
                    ctr: desktop?.ctr || 0,
                    position: desktop?.position || 0
                },
                mobile: {
                    clicks: mobile?.clicks || 0,
                    impressions: mobile?.impressions || 0,
                    ctr: mobile?.ctr || 0,
                    position: mobile?.position || 0
                },
                tablet: {
                    clicks: tablet?.clicks || 0,
                    impressions: tablet?.impressions || 0,
                    ctr: tablet?.ctr || 0,
                    position: tablet?.position || 0
                }
            };
        } catch (error: any) {
            console.error('[SearchConsoleClient] Error fetching device breakdown:', error);
            return {
                desktop: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
                mobile: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
                tablet: { clicks: 0, impressions: 0, ctr: 0, position: 0 }
            };
        }
    }

    /**
     * Get country breakdown
     */
    private async getCountryBreakdown(
        siteUrl: string,
        startDate: string,
        endDate: string,
        limit: number = 10
    ): Promise<CountryBreakdown[]> {
        try {
            const response = await this.searchconsole.searchanalytics.query({
                siteUrl,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['country'],
                    rowLimit: limit
                }
            });

            const rows = response.data.rows || [];

            return rows.map((row: any) => ({
                country: row.keys[0],
                clicks: row.clicks || 0,
                impressions: row.impressions || 0,
                ctr: row.ctr || 0,
                position: row.position || 0
            }));
        } catch (error: any) {
            console.error('[SearchConsoleClient] Error fetching country breakdown:', error);
            return [];
        }
    }

    /**
     * Normalize site URL for Search Console API
     */
    private normalizeSiteUrl(url: string): string {
        // If already prefixed, return as-is
        if (url.startsWith('sc-domain:') || url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // Add https:// prefix
        return `https://${url}`;
    }

    /**
     * Get date range for last N days
     */
    static getDateRange(days: number): { startDate: string; endDate: string } {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    /**
     * Get date range for last 28 days (default for Search Console)
     */
    static getDefault28DayRange(): { startDate: string; endDate: string } {
        return SearchConsoleClient.getDateRange(28);
    }

    /**
     * Get date range for last 90 days
     */
    static get90DayRange(): { startDate: string; endDate: string } {
        return SearchConsoleClient.getDateRange(90);
    }
}

/**
 * Create and export singleton instance
 */
let clientInstance: SearchConsoleClient | null = null;

export function getSearchConsoleClient(): SearchConsoleClient {
    if (!clientInstance) {
        clientInstance = new SearchConsoleClient();
    }
    return clientInstance;
}
