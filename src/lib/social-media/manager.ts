/**
 * Social Media Manager
 *
 * Unified interface for publishing content across all social platforms.
 * Handles adapter selection, credential management, and error handling.
 */

import { InstagramAdapter } from './adapters/instagram';
import { TwitterAdapter } from './adapters/twitter';
import { BaseSocialMediaAdapter } from './base-adapter';
import {
    PublishOptions,
    PublishResult,
    SocialPlatform,
    PlatformCredentials,
    ValidationResult
} from './types';

export class SocialMediaManager {
    private adapters: Map<SocialPlatform, BaseSocialMediaAdapter>;
    private credentials: Map<string, PlatformCredentials>; // userId:platform -> credentials

    constructor() {
        this.adapters = new Map();
        this.credentials = new Map();

        // Register available adapters
        this.adapters.set('instagram', new InstagramAdapter());
        this.adapters.set('twitter', new TwitterAdapter());

        // Additional adapters would be registered here:
        // this.adapters.set('facebook', new FacebookAdapter());
        // this.adapters.set('linkedin', new LinkedInAdapter());
        // this.adapters.set('tiktok', new TikTokAdapter());
        // this.adapters.set('youtube', new YouTubeAdapter());
    }

    /**
     * Publish content to a social platform
     */
    async publish(options: PublishOptions): Promise<PublishResult> {
        const { platform } = options;

        // Get adapter for platform
        const adapter = this.adapters.get(platform);
        if (!adapter) {
            return {
                success: false,
                platform,
                error: {
                    code: 'PLATFORM_NOT_SUPPORTED',
                    message: `Platform "${platform}" is not yet supported`
                }
            };
        }

        // Validate content before publishing
        const validation = adapter.validate(options.content, options.postType);
        if (!validation.valid) {
            return {
                success: false,
                platform,
                error: {
                    code: 'VALIDATION_FAILED',
                    message: 'Content validation failed',
                    details: {
                        errors: validation.errors,
                        warnings: validation.warnings
                    }
                }
            };
        }

        // Publish using adapter
        return await adapter.publish(options);
    }

    /**
     * Publish to multiple platforms simultaneously
     */
    async publishMultiPlatform(
        platforms: SocialPlatform[],
        baseOptions: Omit<PublishOptions, 'platform' | 'accountId'>,
        accountMapping: Map<SocialPlatform, string>
    ): Promise<Map<SocialPlatform, PublishResult>> {
        const results = new Map<SocialPlatform, PublishResult>();

        // Publish to all platforms in parallel
        const publishPromises = platforms.map(async platform => {
            const accountId = accountMapping.get(platform);
            if (!accountId) {
                results.set(platform, {
                    success: false,
                    platform,
                    error: {
                        code: 'MISSING_ACCOUNT',
                        message: `No account ID provided for ${platform}`
                    }
                });
                return;
            }

            const result = await this.publish({
                ...baseOptions,
                platform,
                accountId
            });

            results.set(platform, result);
        });

        await Promise.all(publishPromises);

        return results;
    }

    /**
     * Validate content for a specific platform
     */
    validateContent(
        platform: SocialPlatform,
        content: PublishOptions['content'],
        postType: PublishOptions['postType']
    ): ValidationResult {
        const adapter = this.adapters.get(platform);
        if (!adapter) {
            return {
                valid: false,
                errors: [
                    {
                        field: 'platform',
                        code: 'PLATFORM_NOT_SUPPORTED',
                        message: `Platform "${platform}" is not supported`
                    }
                ],
                warnings: []
            };
        }

        return adapter.validate(content, postType);
    }

    /**
     * Get platform capabilities
     */
    getPlatformCapabilities(platform: SocialPlatform) {
        const adapter = this.adapters.get(platform);
        return adapter?.getCapabilities();
    }

    /**
     * Get all supported platforms
     */
    getSupportedPlatforms(): SocialPlatform[] {
        return Array.from(this.adapters.keys());
    }

    /**
     * Check if platform is supported
     */
    isPlatformSupported(platform: SocialPlatform): boolean {
        return this.adapters.has(platform);
    }

    /**
     * Store credentials for a user's platform account
     */
    setCredentials(userId: string, credentials: PlatformCredentials): void {
        const key = `${userId}:${credentials.platform}`;
        this.credentials.set(key, credentials);
    }

    /**
     * Get credentials for a user's platform account
     */
    getCredentials(userId: string, platform: SocialPlatform): PlatformCredentials | undefined {
        const key = `${userId}:${platform}`;
        return this.credentials.get(key);
    }

    /**
     * Remove credentials for a user's platform account
     */
    removeCredentials(userId: string, platform: SocialPlatform): boolean {
        const key = `${userId}:${platform}`;
        return this.credentials.delete(key);
    }

    /**
     * Get all platforms connected for a user
     */
    getConnectedPlatforms(userId: string): SocialPlatform[] {
        const platforms: SocialPlatform[] = [];
        for (const [key, _] of this.credentials) {
            if (key.startsWith(`${userId}:`)) {
                const platform = key.split(':')[1] as SocialPlatform;
                platforms.push(platform);
            }
        }
        return platforms;
    }
}

// Singleton instance
let managerInstance: SocialMediaManager | null = null;

export function getSocialMediaManager(): SocialMediaManager {
    if (!managerInstance) {
        managerInstance = new SocialMediaManager();
    }
    return managerInstance;
}
