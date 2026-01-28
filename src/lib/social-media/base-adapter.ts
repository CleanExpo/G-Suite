/**
 * Social Media Base Adapter
 *
 * Abstract base class that all platform adapters must implement.
 * Provides unified interface for publishing content across social platforms.
 */

import {
    PublishOptions,
    PublishResult,
    PlatformCapabilities,
    ValidationResult,
    SocialMediaContent,
    PostType,
    RateLimitInfo,
    PostAnalytics
} from './types';

export abstract class BaseSocialMediaAdapter {
    protected abstract platformName: string;

    /**
     * Get platform capabilities (max lengths, supported features, etc.)
     */
    abstract getCapabilities(): PlatformCapabilities;

    /**
     * Validate content before publishing
     */
    abstract validate(
        content: SocialMediaContent,
        postType: PostType
    ): ValidationResult;

    /**
     * Publish content to the platform
     */
    abstract publish(options: PublishOptions): Promise<PublishResult>;

    /**
     * Delete a published post
     */
    abstract deletePost(postId: string, accountId: string): Promise<boolean>;

    /**
     * Get post analytics (if supported)
     */
    abstract getAnalytics(
        postId: string,
        accountId: string
    ): Promise<PostAnalytics | null>;

    /**
     * Check rate limit status
     */
    abstract getRateLimitInfo(accountId: string): Promise<RateLimitInfo>;

    /**
     * Refresh access token if needed (optional - override if platform supports it)
     */
    async refreshAccessToken?(
        refreshToken: string
    ): Promise<{ accessToken: string; expiresAt: Date }> {
        throw new Error('Token refresh not implemented for this platform');
    }

    /**
     * Common validation helper: text length
     */
    protected validateTextLength(
        text: string,
        maxLength: number
    ): { valid: boolean; message?: string } {
        if (!text) {
            return { valid: false, message: 'Text content is required' };
        }

        if (text.length > maxLength) {
            return {
                valid: false,
                message: `Text exceeds maximum length of ${maxLength} characters (current: ${text.length})`
            };
        }

        return { valid: true };
    }

    /**
     * Common validation helper: media count
     */
    protected validateMediaCount(
        mediaCount: number,
        maxCount: number
    ): { valid: boolean; message?: string } {
        if (mediaCount > maxCount) {
            return {
                valid: false,
                message: `Too many media attachments (max: ${maxCount}, current: ${mediaCount})`
            };
        }

        return { valid: true };
    }

    /**
     * Common validation helper: media type
     */
    protected validateMediaTypes(
        mimeTypes: string[],
        supportedTypes: string[]
    ): { valid: boolean; message?: string } {
        const unsupported = mimeTypes.filter(
            type => !supportedTypes.some(supported => type.startsWith(supported))
        );

        if (unsupported.length > 0) {
            return {
                valid: false,
                message: `Unsupported media types: ${unsupported.join(', ')}`
            };
        }

        return { valid: true };
    }

    /**
     * Common helper: extract hashtags from text
     */
    protected extractHashtags(text: string): string[] {
        const hashtagRegex = /#[\w\u00C0-\u017F]+/g;
        const matches = text.match(hashtagRegex);
        return matches ? matches.map(tag => tag.substring(1)) : [];
    }

    /**
     * Common helper: extract mentions from text
     */
    protected extractMentions(text: string): string[] {
        const mentionRegex = /@[\w\u00C0-\u017F]+/g;
        const matches = text.match(mentionRegex);
        return matches ? matches.map(mention => mention.substring(1)) : [];
    }

    /**
     * Common helper: truncate text to fit platform limits
     */
    protected truncateText(text: string, maxLength: number, suffix: string = '...'): string {
        if (text.length <= maxLength) {
            return text;
        }

        const truncateLength = maxLength - suffix.length;
        return text.substring(0, truncateLength).trim() + suffix;
    }

    /**
     * Common helper: format text with hashtags
     */
    protected formatTextWithHashtags(text: string, hashtags: string[]): string {
        if (!hashtags || hashtags.length === 0) {
            return text;
        }

        const formattedHashtags = hashtags
            .map(tag => (tag.startsWith('#') ? tag : `#${tag}`))
            .join(' ');

        return `${text}\n\n${formattedHashtags}`.trim();
    }

    /**
     * Common error handler
     */
    protected handleError(error: any, context: string): PublishResult {
        console.error(`[${this.platformName}] ${context}:`, error);

        return {
            success: false,
            platform: this.platformName as any,
            error: {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || 'An unexpected error occurred',
                details: error.response?.data || error.details,
                retryable: this.isRetryableError(error)
            }
        };
    }

    /**
     * Determine if error is retryable
     */
    protected isRetryableError(error: any): boolean {
        // Common retryable error codes
        const retryableCodes = [
            'ECONNRESET',
            'ETIMEDOUT',
            'ECONNREFUSED',
            'RATE_LIMIT_EXCEEDED',
            'SERVICE_UNAVAILABLE',
            'INTERNAL_SERVER_ERROR'
        ];

        if (retryableCodes.includes(error.code)) {
            return true;
        }

        // HTTP status codes that indicate temporary issues
        const retryableStatuses = [408, 429, 500, 502, 503, 504];
        if (error.status && retryableStatuses.includes(error.status)) {
            return true;
        }

        return false;
    }

    /**
     * Wait for async operation with timeout
     */
    protected async waitWithTimeout<T>(
        promise: Promise<T>,
        timeoutMs: number,
        errorMessage: string = 'Operation timed out'
    ): Promise<T> {
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
        );

        return Promise.race([promise, timeout]);
    }
}
