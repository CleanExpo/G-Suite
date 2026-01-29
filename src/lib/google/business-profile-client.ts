/**
 * Google Business Profile (GBP) API Client
 * 
 * Integration for managing local business locations, reviews,
 * posts, and insights.
 */

import { google } from 'googleapis';

export interface BusinessLocation {
    name: string;
    title: string;
    address: string;
    phone?: string;
    website?: string;
    categories?: string[];
    rating?: number;
    reviewCount?: number;
}

export class BusinessProfileClient {
    private mybusiness: any;

    constructor(auth: any) {
        // Note: mybusinessbusinessinformation v1 is the current standard
        this.mybusiness = google.mybusinessbusinessinformation({
            version: 'v1',
            auth
        });
    }

    /**
     * List locations for an account
     */
    async listLocations(accountId: string): Promise<BusinessLocation[]> {
        try {
            const res = await this.mybusiness.accounts.locations.list({
                parent: `accounts/${accountId}`,
                readMask: 'name,title,storefrontAddress,regularPhoneNumbers,websiteUri,categories,metadata'
            });

            return res.data.locations?.map((loc: any) => ({
                name: loc.name,
                title: loc.title,
                address: this.formatAddress(loc.storefrontAddress),
                phone: loc.regularPhoneNumbers?.[0]?.phoneNumber,
                website: loc.websiteUri,
                categories: loc.categories?.primaryCategory?.displayName ? [loc.categories.primaryCategory.displayName] : []
            })) || [];
        } catch (error: any) {
            console.error('[GBP] Error listing locations:', error.message);
            throw error;
        }
    }

    /**
     * Get location insights (Search views, direction requests, etc.)
     */
    async getLocationInsights(locationName: string) {
        // This usually requires the mybusinessqanda or mybusinesslodging API depending on requirements
        // For general insights, use the performance API
        const performanceApi = (google as any).mybusinessperformance({
            version: 'v1',
            auth: this.mybusiness.context._options.auth
        });

        const res = await performanceApi.locations.fetchMultiDailyMetricsTimeSeries({
            location: locationName,
            dailyMetrics: [
                'WEBSITE_CLICKS',
                'CALL_CLICKS',
                'DIRECTION_CLICK',
                'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
                'BUSINESS_IMPRESSIONS_MOBILE_MAPS'
            ],
            timeRange: {
                startTime: { year: 2024, month: 1, day: 1 },
                endTime: { year: 2024, month: 12, day: 31 }
            }
        });

        return res.data;
    }

    private formatAddress(addr: any): string {
        if (!addr) return '';
        const lines = addr.addressLines || [];
        return `${lines.join(', ')}, ${addr.locality}, ${addr.administrativeArea} ${addr.postalCode}`;
    }
}

// Factory function
export async function getBusinessProfileClient() {
    // In production, we'd use a service account or OAuth2 token
    // For now, we'll use the environment configured auth
    const auth = new google.auth.GoogleAuth({
        scopes: [
            'https://www.googleapis.com/auth/business.manage'
        ]
    });

    const authClient = await auth.getClient();
    return new BusinessProfileClient(authClient);
}
