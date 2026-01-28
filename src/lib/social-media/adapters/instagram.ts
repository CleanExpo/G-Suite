/**
 * Instagram Graph API Adapter
 *
 * Supports:
 * - Single image posts
 * - Multiple image posts (carousel)
 * - Video posts
 * - Reels
 * - Stories (24h)
 */

import { BaseSocialMediaAdapter } from '../base-adapter';
import {
    PublishOptions,
    PublishResult,
    PlatformCapabilities,
    ValidationResult,
    SocialMediaContent,
    PostType,
    RateLimitInfo,
    PostAnalytics,
    InstagramCredentials
} from '../types';

export class InstagramAdapter extends BaseSocialMediaAdapter {
    protected platformName = 'instagram';
    private baseUrl = 'https://graph.facebook.com/v19.0';

    getCapabilities(): PlatformCapabilities {
        return {
            platform: 'instagram',
            supportedPostTypes: ['image', 'images', 'video', 'reel', 'story'],
            maxTextLength: 2200,
            maxMediaCount: 10, // Carousel max
            maxVideoSize: 100 * 1024 * 1024, // 100 MB
            maxVideoDuration: 60, // 60 seconds for feed videos
            maxImageSize: 8 * 1024 * 1024, // 8 MB
            supportedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
            supportedAspectRatios: ['1:1', '4:5', '1.91:1', '9:16'],
            supportsScheduling: false, // Instagram doesn't support scheduled posts via API
            supportsHashtags: true,
            supportsMentions: true,
            supportsLocation: true,
            supportsTargeting: false,
            maxHashtags: 30
        };
    }

    validate(content: SocialMediaContent, postType: PostType): ValidationResult {
        const errors: any[] = [];
        const warnings: any[] = [];
        const caps = this.getCapabilities();

        // Validate text length
        if (content.text) {
            const textValidation = this.validateTextLength(content.text, caps.maxTextLength);
            if (!textValidation.valid) {
                errors.push({
                    field: 'text',
                    code: 'TEXT_TOO_LONG',
                    message: textValidation.message!
                });
            }
        }

        // Validate media
        if (content.media && content.media.length > 0) {
            const mediaValidation = this.validateMediaCount(
                content.media.length,
                caps.maxMediaCount
            );
            if (!mediaValidation.valid) {
                errors.push({
                    field: 'media',
                    code: 'TOO_MANY_MEDIA',
                    message: mediaValidation.message!
                });
            }

            // Validate media types
            const mimeTypes = content.media.map(m => m.mimeType);
            const typeValidation = this.validateMediaTypes(mimeTypes, caps.supportedMediaTypes);
            if (!typeValidation.valid) {
                errors.push({
                    field: 'media',
                    code: 'UNSUPPORTED_MEDIA_TYPE',
                    message: typeValidation.message!
                });
            }
        }

        // Validate hashtags
        if (content.hashtags && content.hashtags.length > caps.maxHashtags!) {
            warnings.push({
                field: 'hashtags',
                code: 'TOO_MANY_HASHTAGS',
                message: `Instagram recommends max ${caps.maxHashtags} hashtags (current: ${content.hashtags.length})`,
                suggestion: `Consider reducing to ${caps.maxHashtags} most relevant hashtags`
            });
        }

        // Post type specific validations
        if (postType === 'reel') {
            if (!content.media || content.media.length === 0 || content.media[0].type !== 'video') {
                errors.push({
                    field: 'media',
                    code: 'REEL_REQUIRES_VIDEO',
                    message: 'Reels must include a video'
                });
            }

            const videoDuration = content.media?.[0]?.duration || 0;
            if (videoDuration > 90) {
                errors.push({
                    field: 'media',
                    code: 'REEL_TOO_LONG',
                    message: 'Reels must be 90 seconds or less'
                });
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    async publish(options: PublishOptions): Promise<PublishResult> {
        try {
            const { content, postType, accountId, platformSpecific } = options;
            const credentials = platformSpecific?.credentials as InstagramCredentials;

            if (!credentials?.accessToken) {
                throw new Error('Instagram access token not provided');
            }

            // Validate content
            const validation = this.validate(content, postType);
            if (!validation.valid) {
                return {
                    success: false,
                    platform: 'instagram',
                    error: {
                        code: 'VALIDATION_FAILED',
                        message: 'Content validation failed',
                        details: { errors: validation.errors }
                    }
                };
            }

            // Route to appropriate publishing method based on post type
            switch (postType) {
                case 'image':
                    return await this.publishSingleImage(credentials, accountId, content);
                case 'images':
                    return await this.publishCarousel(credentials, accountId, content);
                case 'video':
                    return await this.publishVideo(credentials, accountId, content);
                case 'reel':
                    return await this.publishReel(credentials, accountId, content);
                case 'story':
                    return await this.publishStory(credentials, accountId, content);
                default:
                    throw new Error(`Unsupported post type: ${postType}`);
            }
        } catch (error: any) {
            return this.handleError(error, 'publish');
        }
    }

    private async publishSingleImage(
        credentials: InstagramCredentials,
        accountId: string,
        content: SocialMediaContent
    ): Promise<PublishResult> {
        const { accessToken } = credentials;
        const imageUrl = content.media![0].url;

        // Format caption with hashtags
        const caption = this.formatTextWithHashtags(content.text, content.hashtags || []);

        // Step 1: Create media container
        const containerParams = new URLSearchParams({
            image_url: imageUrl!,
            caption: caption,
            access_token: accessToken
        });

        if (content.location?.placeId) {
            containerParams.append('location_id', content.location.placeId);
        }

        const containerResponse = await fetch(
            `${this.baseUrl}/${accountId}/media`,
            {
                method: 'POST',
                body: containerParams
            }
        );

        if (!containerResponse.ok) {
            const error = await containerResponse.json();
            throw new Error(`Failed to create media container: ${error.error?.message || containerResponse.statusText}`);
        }

        const { id: containerId } = await containerResponse.json();

        // Step 2: Publish the container
        const publishResponse = await fetch(
            `${this.baseUrl}/${accountId}/media_publish`,
            {
                method: 'POST',
                body: new URLSearchParams({
                    creation_id: containerId,
                    access_token: accessToken
                })
            }
        );

        if (!publishResponse.ok) {
            const error = await publishResponse.json();
            throw new Error(`Failed to publish media: ${error.error?.message || publishResponse.statusText}`);
        }

        const { id: mediaId } = await publishResponse.json();

        return {
            success: true,
            platform: 'instagram',
            postId: mediaId,
            postUrl: `https://www.instagram.com/p/${this.getShortcodeFromId(mediaId)}`,
            metadata: {
                publishedAt: new Date(),
                platform: 'instagram'
            }
        };
    }

    private async publishCarousel(
        credentials: InstagramCredentials,
        accountId: string,
        content: SocialMediaContent
    ): Promise<PublishResult> {
        const { accessToken } = credentials;

        // Step 1: Create container for each media item
        const childContainerIds: string[] = [];

        for (const media of content.media!) {
            const params = new URLSearchParams({
                access_token: accessToken
            });

            if (media.type === 'image') {
                params.append('image_url', media.url!);
                params.append('is_carousel_item', 'true');
            } else if (media.type === 'video') {
                params.append('video_url', media.url!);
                params.append('media_type', 'VIDEO');
                params.append('is_carousel_item', 'true');
            }

            const response = await fetch(
                `${this.baseUrl}/${accountId}/media`,
                {
                    method: 'POST',
                    body: params
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to create carousel item: ${error.error?.message}`);
            }

            const { id } = await response.json();
            childContainerIds.push(id);
        }

        // Step 2: Create carousel container
        const caption = this.formatTextWithHashtags(content.text, content.hashtags || []);

        const carouselParams = new URLSearchParams({
            media_type: 'CAROUSEL',
            caption: caption,
            children: childContainerIds.join(','),
            access_token: accessToken
        });

        const carouselResponse = await fetch(
            `${this.baseUrl}/${accountId}/media`,
            {
                method: 'POST',
                body: carouselParams
            }
        );

        if (!carouselResponse.ok) {
            const error = await carouselResponse.json();
            throw new Error(`Failed to create carousel container: ${error.error?.message}`);
        }

        const { id: carouselId } = await carouselResponse.json();

        // Step 3: Publish carousel
        const publishResponse = await fetch(
            `${this.baseUrl}/${accountId}/media_publish`,
            {
                method: 'POST',
                body: new URLSearchParams({
                    creation_id: carouselId,
                    access_token: accessToken
                })
            }
        );

        if (!publishResponse.ok) {
            const error = await publishResponse.json();
            throw new Error(`Failed to publish carousel: ${error.error?.message}`);
        }

        const { id: mediaId } = await publishResponse.json();

        return {
            success: true,
            platform: 'instagram',
            postId: mediaId,
            postUrl: `https://www.instagram.com/p/${this.getShortcodeFromId(mediaId)}`,
            metadata: {
                publishedAt: new Date(),
                platform: 'instagram'
            }
        };
    }

    private async publishReel(
        credentials: InstagramCredentials,
        accountId: string,
        content: SocialMediaContent
    ): Promise<PublishResult> {
        const { accessToken } = credentials;
        const videoUrl = content.media![0].url;
        const caption = this.formatTextWithHashtags(content.text, content.hashtags || []);

        // Step 1: Create reel container
        const containerParams = new URLSearchParams({
            media_type: 'REELS',
            video_url: videoUrl!,
            caption: caption,
            access_token: accessToken
        });

        if (content.media![0].thumbnail) {
            containerParams.append('thumb_offset', '0'); // Use first frame as thumbnail
        }

        const containerResponse = await fetch(
            `${this.baseUrl}/${accountId}/media`,
            {
                method: 'POST',
                body: containerParams
            }
        );

        if (!containerResponse.ok) {
            const error = await containerResponse.json();
            throw new Error(`Failed to create reel container: ${error.error?.message}`);
        }

        const { id: containerId } = await containerResponse.json();

        // Step 2: Poll container status until ready
        await this.waitForContainerReady(accountId, containerId, accessToken);

        // Step 3: Publish reel
        const publishResponse = await fetch(
            `${this.baseUrl}/${accountId}/media_publish`,
            {
                method: 'POST',
                body: new URLSearchParams({
                    creation_id: containerId,
                    access_token: accessToken
                })
            }
        );

        if (!publishResponse.ok) {
            const error = await publishResponse.json();
            throw new Error(`Failed to publish reel: ${error.error?.message}`);
        }

        const { id: mediaId } = await publishResponse.json();

        return {
            success: true,
            platform: 'instagram',
            postId: mediaId,
            postUrl: `https://www.instagram.com/reel/${this.getShortcodeFromId(mediaId)}`,
            metadata: {
                publishedAt: new Date(),
                platform: 'instagram'
            }
        };
    }

    private async publishVideo(
        credentials: InstagramCredentials,
        accountId: string,
        content: SocialMediaContent
    ): Promise<PublishResult> {
        const { accessToken } = credentials;
        const videoUrl = content.media![0].url;
        const caption = this.formatTextWithHashtags(content.text, content.hashtags || []);

        // Similar to publishReel but with VIDEO media_type
        const containerParams = new URLSearchParams({
            media_type: 'VIDEO',
            video_url: videoUrl!,
            caption: caption,
            access_token: accessToken
        });

        const containerResponse = await fetch(
            `${this.baseUrl}/${accountId}/media`,
            {
                method: 'POST',
                body: containerParams
            }
        );

        if (!containerResponse.ok) {
            const error = await containerResponse.json();
            throw new Error(`Failed to create video container: ${error.error?.message}`);
        }

        const { id: containerId } = await containerResponse.json();

        await this.waitForContainerReady(accountId, containerId, accessToken);

        const publishResponse = await fetch(
            `${this.baseUrl}/${accountId}/media_publish`,
            {
                method: 'POST',
                body: new URLSearchParams({
                    creation_id: containerId,
                    access_token: accessToken
                })
            }
        );

        if (!publishResponse.ok) {
            const error = await publishResponse.json();
            throw new Error(`Failed to publish video: ${error.error?.message}`);
        }

        const { id: mediaId } = await publishResponse.json();

        return {
            success: true,
            platform: 'instagram',
            postId: mediaId,
            postUrl: `https://www.instagram.com/p/${this.getShortcodeFromId(mediaId)}`,
            metadata: {
                publishedAt: new Date(),
                platform: 'instagram'
            }
        };
    }

    private async publishStory(
        credentials: InstagramCredentials,
        accountId: string,
        content: SocialMediaContent
    ): Promise<PublishResult> {
        // Note: Stories API requires special permissions and is limited
        throw new Error('Instagram Stories publishing requires Instagram Graph API review and special permissions');
    }

    private async waitForContainerReady(
        accountId: string,
        containerId: string,
        accessToken: string,
        maxAttempts: number = 30
    ): Promise<void> {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const statusResponse = await fetch(
                `${this.baseUrl}/${containerId}?fields=status_code,status&access_token=${accessToken}`
            );

            if (!statusResponse.ok) {
                throw new Error('Failed to check container status');
            }

            const { status_code, status } = await statusResponse.json();

            if (status_code === 'FINISHED') {
                return;
            }

            if (status_code === 'ERROR') {
                throw new Error(`Container processing failed: ${status}`);
            }

            // Wait 5 seconds before next check
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        throw new Error('Container processing timeout');
    }

    private getShortcodeFromId(mediaId: string): string {
        // Convert Instagram media ID to shortcode for URL
        // This is a simplified version - real implementation would need base64 encoding
        return mediaId.split('_')[0];
    }

    async deletePost(postId: string, accountId: string): Promise<boolean> {
        // Instagram doesn't provide API to delete posts
        // Users must delete manually from the app
        return false;
    }

    async getAnalytics(postId: string, accountId: string): Promise<PostAnalytics | null> {
        // Would implement Instagram Insights API here
        return null;
    }

    async getRateLimitInfo(accountId: string): Promise<RateLimitInfo> {
        // Instagram uses per-user rate limits (200 calls per hour per user)
        return {
            platform: 'instagram',
            limit: 200,
            remaining: 200, // Would track this in Redis/memory
            resetAt: new Date(Date.now() + 3600000) // 1 hour
        };
    }
}
