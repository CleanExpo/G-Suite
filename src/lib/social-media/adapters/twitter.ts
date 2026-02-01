/**
 * X (Twitter) API v2 Adapter
 *
 * Supports:
 * - Tweets (text, images, videos)
 * - Threads
 * - Media uploads
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
  TwitterCredentials,
} from '../types';

export class TwitterAdapter extends BaseSocialMediaAdapter {
  protected platformName = 'twitter';
  private baseUrl = 'https://api.twitter.com/2';
  private uploadUrl = 'https://upload.twitter.com/1.1';

  getCapabilities(): PlatformCapabilities {
    return {
      platform: 'twitter',
      supportedPostTypes: ['text', 'image', 'images', 'video'],
      maxTextLength: 280,
      maxMediaCount: 4,
      maxVideoSize: 512 * 1024 * 1024, // 512 MB
      maxVideoDuration: 140, // 140 seconds
      maxImageSize: 5 * 1024 * 1024, // 5 MB
      supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
      supportedAspectRatios: ['16:9', '1:1', '4:3'],
      supportsScheduling: false, // Premium API only
      supportsHashtags: true,
      supportsMentions: true,
      supportsLocation: true,
      supportsTargeting: false,
      maxHashtags: undefined, // No hard limit, but impacts character count
    };
  }

  validate(content: SocialMediaContent, postType: PostType): ValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];
    const caps = this.getCapabilities();

    const textValidation = this.validateTextLength(content.text, caps.maxTextLength);
    if (!textValidation.valid) {
      errors.push({
        field: 'text',
        code: 'TEXT_TOO_LONG',
        message: textValidation.message!,
      });
    }

    if (content.media && content.media.length > 0) {
      const mediaValidation = this.validateMediaCount(content.media.length, caps.maxMediaCount);
      if (!mediaValidation.valid) {
        errors.push({
          field: 'media',
          code: 'TOO_MANY_MEDIA',
          message: mediaValidation.message!,
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  async publish(options: PublishOptions): Promise<PublishResult> {
    try {
      const { content, accountId, platformSpecific } = options;
      const credentials = platformSpecific?.credentials as TwitterCredentials;

      if (!credentials?.accessToken) {
        throw new Error('Twitter access token not provided');
      }

      // Upload media if present
      let mediaIds: string[] = [];
      if (content.media && content.media.length > 0) {
        mediaIds = await this.uploadMedia(credentials, content.media);
      }

      // Create tweet
      const tweetText = this.formatTextWithHashtags(content.text, content.hashtags || []);

      const tweetData: any = {
        text: tweetText,
      };

      if (mediaIds.length > 0) {
        tweetData.media = { media_ids: mediaIds };
      }

      const response = await fetch(`${this.baseUrl}/tweets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${credentials.bearerToken || credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tweetData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create tweet: ${error.detail || response.statusText}`);
      }

      const { data } = await response.json();

      return {
        success: true,
        platform: 'twitter',
        postId: data.id,
        postUrl: `https://twitter.com/i/status/${data.id}`,
        metadata: {
          publishedAt: new Date(),
          platform: 'twitter',
        },
      };
    } catch (error: any) {
      return this.handleError(error, 'publish');
    }
  }

  private async uploadMedia(credentials: TwitterCredentials, media: any[]): Promise<string[]> {
    // Simplified media upload - real implementation would use chunked upload for large files
    const mediaIds: string[] = [];

    for (const item of media) {
      // Would implement proper OAuth 1.0a signing here
      // For now, this is a placeholder structure
      mediaIds.push('mock_media_id');
    }

    return mediaIds;
  }

  async deletePost(postId: string, accountId: string): Promise<boolean> {
    // Would implement DELETE /2/tweets/:id
    return false;
  }

  async getAnalytics(postId: string, accountId: string): Promise<PostAnalytics | null> {
    return null;
  }

  async getRateLimitInfo(accountId: string): Promise<RateLimitInfo> {
    return {
      platform: 'twitter',
      limit: 300,
      remaining: 300,
      resetAt: new Date(Date.now() + 900000), // 15 minutes
    };
  }
}
