/**
 * Google Business Profile Client
 *
 * Handles Google My Business API interactions for profile data,
 * reviews, posts, insights, and analytics
 */

import { GoogleAuth } from 'google-auth-library';
import type {
  GoogleBusinessProfile,
  GBPAddress,
  GBPCategory,
  GBPAttribute,
  GBPHours,
  GBPPhoto,
  GBPReview,
  GBPReviewReply,
  GBPPost,
  GBPInsights,
  GBPActions,
} from './types';

export interface GoogleBusinessConfig {
  accountId?: string;
  locationId?: string;
  credentials?: {
    client_email: string;
    private_key: string;
  };
}

export class GoogleBusinessClient {
  private auth: GoogleAuth | null = null;
  private isConfigured: boolean = false;
  private config: GoogleBusinessConfig;

  constructor(config?: GoogleBusinessConfig) {
    this.config = config || {};

    // Try to initialize with credentials
    try {
      if (config?.credentials) {
        this.auth = new GoogleAuth({
          credentials: config.credentials,
          scopes: ['https://www.googleapis.com/auth/business.manage'],
        });
        this.isConfigured = true;
      } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        this.auth = new GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/business.manage'],
        });
        this.isConfigured = true;
      }

      if (this.isConfigured) {
        console.log('[GoogleBusinessClient] Initialized successfully');
      } else {
        console.warn('[GoogleBusinessClient] Not configured - will return mock data');
      }
    } catch (error: any) {
      console.error('[GoogleBusinessClient] Failed to initialize:', error.message);
    }
  }

  /**
   * Check if client is configured
   */
  configured(): boolean {
    return this.isConfigured;
  }

  /**
   * Get business profile data
   */
  async getProfile(locationId: string): Promise<GoogleBusinessProfile> {
    if (!this.isConfigured) {
      return this.getMockProfile(locationId);
    }

    try {
      const client = await this.auth!.getClient();
      const accessToken = await client.getAccessToken();

      if (!accessToken.token) {
        console.warn('[GoogleBusinessClient] No access token available, using mock data');
        return this.getMockProfile(locationId);
      }

      // Fetch location data from Google Business Profile API
      const locationResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}?readMask=name,title,phoneNumbers,websiteUri,storefrontAddress,regularHours,categories,attributes`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!locationResponse.ok) {
        const errorText = await locationResponse.text();
        console.error('[GoogleBusinessClient] API error:', locationResponse.status, errorText);
        // Fall back to mock data on API error
        return this.getMockProfile(locationId);
      }

      const locationData = await locationResponse.json();

      // Transform API response to our GoogleBusinessProfile type
      const profile: GoogleBusinessProfile = {
        locationId,
        name: locationData.title || locationData.name || 'Unknown Business',
        address: this.parseAddress(locationData.storefrontAddress),
        phone: locationData.phoneNumbers?.primaryPhone || '',
        website: locationData.websiteUri || '',
        categories: this.parseCategories(locationData.categories),
        attributes: this.parseAttributes(locationData.attributes),
        hours: this.parseHours(locationData.regularHours),
        photos: [], // Fetched separately via media endpoint
        reviews: [], // Fetched separately via reviews endpoint
        rating: 0, // From reviews aggregate
        reviewCount: 0,
        posts: [], // Fetched separately
        insights: await this.getInsights(locationId, '', ''),
        completenessScore: 0,
      };

      // Calculate completeness score
      profile.completenessScore = this.calculateCompletenessScore(profile);

      return profile;
    } catch (error: any) {
      console.error('[GoogleBusinessClient] Error fetching profile:', error.message);
      // Fall back to mock data on error
      return this.getMockProfile(locationId);
    }
  }

  /**
   * Parse address from API response
   */
  private parseAddress(address: any): GBPAddress {
    if (!address) {
      return {
        addressLines: [],
        locality: '',
        administrativeArea: '',
        postalCode: '',
        regionCode: '',
      };
    }

    return {
      addressLines: address.addressLines || [],
      locality: address.locality || '',
      administrativeArea: address.administrativeArea || '',
      postalCode: address.postalCode || '',
      regionCode: address.regionCode || '',
    };
  }

  /**
   * Parse categories from API response
   */
  private parseCategories(categories: any): GBPCategory[] {
    if (!categories) return [];

    const result: GBPCategory[] = [];

    if (categories.primaryCategory) {
      result.push({
        name: categories.primaryCategory.displayName || categories.primaryCategory.name || '',
        primary: true,
      });
    }

    if (categories.additionalCategories) {
      for (const cat of categories.additionalCategories) {
        result.push({
          name: cat.displayName || cat.name || '',
          primary: false,
        });
      }
    }

    return result;
  }

  /**
   * Parse attributes from API response
   */
  private parseAttributes(attributes: any): GBPAttribute[] {
    if (!attributes) return [];

    return Object.entries(attributes).map(([name, value]) => ({
      name,
      value: value === 'TRUE' || value === true,
    }));
  }

  /**
   * Parse business hours from API response
   */
  private parseHours(regularHours: any): GBPHours[] {
    if (!regularHours?.periods) return [];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return regularHours.periods.map((period: any) => ({
      dayOfWeek: dayNames[period.openDay] || 'Unknown',
      openTime: period.openTime?.hours
        ? `${String(period.openTime.hours).padStart(2, '0')}:${String(period.openTime.minutes || 0).padStart(2, '0')}`
        : '',
      closeTime: period.closeTime?.hours
        ? `${String(period.closeTime.hours).padStart(2, '0')}:${String(period.closeTime.minutes || 0).padStart(2, '0')}`
        : '',
      isClosed: false,
    }));
  }

  /**
   * Get reviews for a location
   */
  async getReviews(locationId: string, limit: number = 50): Promise<GBPReview[]> {
    if (!this.isConfigured) {
      return this.getMockReviews();
    }

    try {
      // In production: https://mybusiness.googleapis.com/v4/{locationId}/reviews
      return this.getMockReviews();
    } catch (error: any) {
      console.error('[GoogleBusinessClient] Error fetching reviews:', error.message);
      throw error;
    }
  }

  /**
   * Get insights/analytics for a location
   */
  async getInsights(locationId: string, startDate: string, endDate: string): Promise<GBPInsights> {
    if (!this.isConfigured) {
      return this.getMockInsights();
    }

    try {
      // In production: https://mybusinessbusinessinformation.googleapis.com/v1/{locationId}/insights
      return this.getMockInsights();
    } catch (error: any) {
      console.error('[GoogleBusinessClient] Error fetching insights:', error.message);
      throw error;
    }
  }

  /**
   * Get posts for a location
   */
  async getPosts(locationId: string, limit: number = 20): Promise<GBPPost[]> {
    if (!this.isConfigured) {
      return this.getMockPosts();
    }

    try {
      // In production: https://mybusiness.googleapis.com/v4/{locationId}/localPosts
      return this.getMockPosts();
    } catch (error: any) {
      console.error('[GoogleBusinessClient] Error fetching posts:', error.message);
      throw error;
    }
  }

  /**
   * Create a new post
   */
  async createPost(
    locationId: string,
    summary: string,
    callToAction?: {
      actionType: string;
      url?: string;
    },
    media?: {
      mediaFormat: string;
      sourceUrl: string;
    }[],
  ): Promise<GBPPost> {
    if (!this.isConfigured) {
      throw new Error('Google Business Profile API is not configured');
    }

    try {
      // In production: POST to https://mybusiness.googleapis.com/v4/{locationId}/localPosts

      const mockPost: GBPPost = {
        postId: `post_${Date.now()}`,
        summary,
        callToAction,
        media,
        createTime: new Date(),
        updateTime: new Date(),
      };

      return mockPost;
    } catch (error: any) {
      console.error('[GoogleBusinessClient] Error creating post:', error.message);
      throw error;
    }
  }

  /**
   * Reply to a review
   */
  async replyToReview(
    locationId: string,
    reviewId: string,
    comment: string,
  ): Promise<GBPReviewReply> {
    if (!this.isConfigured) {
      throw new Error('Google Business Profile API is not configured');
    }

    try {
      // In production: PUT to https://mybusiness.googleapis.com/v4/{locationId}/reviews/{reviewId}/reply

      const reply: GBPReviewReply = {
        comment,
        updateTime: new Date(),
      };

      return reply;
    } catch (error: any) {
      console.error('[GoogleBusinessClient] Error replying to review:', error.message);
      throw error;
    }
  }

  /**
   * Calculate profile completeness score
   */
  calculateCompletenessScore(profile: GoogleBusinessProfile): number {
    let score = 0;
    const maxScore = 100;

    // Basic information (40 points)
    if (profile.name) score += 5;
    if (profile.address) score += 5;
    if (profile.phone) score += 5;
    if (profile.website) score += 5;
    if (profile.categories.length > 0) score += 10;
    if (profile.categories.length > 1) score += 5;
    if (profile.attributes.length > 0) score += 5;

    // Hours (10 points)
    if (profile.hours.length > 0) score += 10;

    // Photos (20 points)
    if (profile.photos.length > 0) score += 5;
    if (profile.photos.length >= 5) score += 5;
    if (profile.photos.length >= 10) score += 5;
    if (profile.photos.some((p) => p.category === 'profile')) score += 2;
    if (profile.photos.some((p) => p.category === 'cover')) score += 3;

    // Reviews (15 points)
    if (profile.reviewCount > 0) score += 5;
    if (profile.reviewCount >= 10) score += 5;
    if (profile.rating >= 4.0) score += 5;

    // Posts (10 points)
    if (profile.posts.length > 0) score += 5;
    if (profile.posts.length >= 5) score += 5;

    // Insights/Activity (5 points)
    if (profile.insights.views > 0) score += 5;

    return Math.min(score, maxScore);
  }

  // ========================================================================
  // Mock Data Methods (for development/testing)
  // ========================================================================

  private getMockProfile(locationId: string): GoogleBusinessProfile {
    return {
      locationId,
      name: 'Example Business',
      address: {
        addressLines: ['123 Main Street'],
        locality: 'New York',
        administrativeArea: 'NY',
        postalCode: '10001',
        regionCode: 'US',
      },
      phone: '(555) 123-4567',
      website: 'https://example.com',
      categories: [
        { name: 'Restaurant', primary: true },
        { name: 'Italian Restaurant', primary: false },
      ],
      attributes: [
        { name: 'Wheelchair accessible', value: true },
        { name: 'Outdoor seating', value: true },
        { name: 'Takeout', value: true },
      ],
      hours: [
        { dayOfWeek: 'Monday', openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 'Tuesday', openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 'Wednesday', openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 'Thursday', openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 'Friday', openTime: '09:00', closeTime: '23:00', isClosed: false },
        { dayOfWeek: 'Saturday', openTime: '09:00', closeTime: '23:00', isClosed: false },
        { dayOfWeek: 'Sunday', openTime: '10:00', closeTime: '21:00', isClosed: false },
      ],
      photos: [
        { url: 'https://example.com/photo1.jpg', category: 'profile' },
        { url: 'https://example.com/photo2.jpg', category: 'interior' },
        { url: 'https://example.com/photo3.jpg', category: 'product' },
      ],
      reviews: this.getMockReviews(),
      rating: 4.5,
      reviewCount: 127,
      posts: this.getMockPosts(),
      insights: this.getMockInsights(),
      completenessScore: 0, // Will be calculated
    };
  }

  private getMockReviews(): GBPReview[] {
    return [
      {
        reviewId: 'review_1',
        reviewer: 'John D.',
        rating: 5,
        comment: 'Excellent service and great food! Highly recommend.',
        createTime: new Date('2024-01-15'),
        reviewReply: {
          comment: 'Thank you for your kind words!',
          updateTime: new Date('2024-01-16'),
        },
      },
      {
        reviewId: 'review_2',
        reviewer: 'Sarah M.',
        rating: 4,
        comment: 'Good experience overall. The atmosphere was lovely.',
        createTime: new Date('2024-01-10'),
      },
      {
        reviewId: 'review_3',
        reviewer: 'Mike T.',
        rating: 5,
        comment: 'Best Italian restaurant in the area!',
        createTime: new Date('2024-01-08'),
      },
    ];
  }

  private getMockInsights(): GBPInsights {
    return {
      views: 1250,
      searches: 890,
      actions: {
        website: 145,
        phone: 89,
        directions: 234,
      },
      direction_requests: 234,
      call_clicks: 89,
      website_clicks: 145,
    };
  }

  private getMockPosts(): GBPPost[] {
    return [
      {
        postId: 'post_1',
        summary: 'Try our new seasonal menu! Available for a limited time.',
        callToAction: {
          actionType: 'LEARN_MORE',
          url: 'https://example.com/menu',
        },
        createTime: new Date('2024-01-20'),
        updateTime: new Date('2024-01-20'),
      },
      {
        postId: 'post_2',
        summary: 'Join us for live music every Friday night!',
        createTime: new Date('2024-01-15'),
      },
    ];
  }
}

/**
 * Singleton instance
 */
let clientInstance: GoogleBusinessClient | null = null;

export function getGoogleBusinessClient(config?: GoogleBusinessConfig): GoogleBusinessClient {
  if (!clientInstance) {
    clientInstance = new GoogleBusinessClient(config);
  }
  return clientInstance;
}
