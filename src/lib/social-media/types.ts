/**
 * Social Media Publishing - Type Definitions
 *
 * Unified types for multi-platform social media publishing across:
 * - Instagram (posts, stories, reels)
 * - Facebook (posts, videos)
 * - X/Twitter (tweets, threads, media)
 * - LinkedIn (posts, articles)
 * - TikTok (videos)
 * - YouTube (videos, shorts)
 */

// ============================================================================
// Platform Identifiers
// ============================================================================

export type SocialPlatform =
    | 'instagram'
    | 'facebook'
    | 'twitter' // X
    | 'linkedin'
    | 'tiktok'
    | 'youtube';

export type PostType =
    | 'text' // Plain text post
    | 'image' // Single image
    | 'images' // Multiple images (carousel)
    | 'video' // Video post
    | 'link' // Link preview post
    | 'story' // Story/status (24h)
    | 'reel' // Short-form video (Instagram Reels, YouTube Shorts, TikTok)
    | 'article' // Long-form content (LinkedIn Articles);

// ============================================================================
// Content Types
// ============================================================================

export interface SocialMediaContent {
    text: string;
    media?: MediaAttachment[];
    link?: LinkAttachment;
    hashtags?: string[];
    mentions?: string[];
    location?: LocationTag;
}

export interface MediaAttachment {
    type: 'image' | 'video' | 'gif';
    url?: string; // URL to media file
    base64?: string; // Base64-encoded media
    buffer?: Buffer; // Raw buffer (Node.js only)
    mimeType: string; // e.g., 'image/jpeg', 'video/mp4'
    altText?: string; // Accessibility description
    thumbnail?: string; // Video thumbnail URL/base64
    duration?: number; // Video duration in seconds
    width?: number;
    height?: number;
}

export interface LinkAttachment {
    url: string;
    title?: string;
    description?: string;
    imageUrl?: string;
}

export interface LocationTag {
    name: string;
    lat?: number;
    lng?: number;
    placeId?: string; // Platform-specific location ID
}

// ============================================================================
// Publishing Options
// ============================================================================

export interface PublishOptions {
    platform: SocialPlatform;
    accountId: string; // Platform-specific account identifier
    content: SocialMediaContent;
    postType: PostType;
    scheduledTime?: Date; // Schedule for future publication
    targetAudience?: TargetAudience;
    privacySettings?: PrivacySettings;
    platformSpecific?: Record<string, unknown>; // Platform-specific options
}

export interface TargetAudience {
    ageMin?: number;
    ageMax?: number;
    genders?: ('male' | 'female' | 'non-binary')[];
    locations?: string[]; // Country codes or city names
    interests?: string[];
    languages?: string[];
}

export interface PrivacySettings {
    visibility: 'public' | 'private' | 'friends' | 'followers' | 'unlisted';
    allowComments?: boolean;
    allowSharing?: boolean;
    allowDownload?: boolean;
}

// ============================================================================
// Publishing Results
// ============================================================================

export interface PublishResult {
    success: boolean;
    platform: SocialPlatform;
    postId?: string; // Platform's post/tweet/video ID
    postUrl?: string; // Public URL to the post
    scheduledFor?: Date; // If scheduled
    error?: PublishError;
    metadata?: PublishMetadata;
}

export interface PublishError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    retryable?: boolean;
}

export interface PublishMetadata {
    publishedAt?: Date;
    reachEstimate?: number;
    impressionsEstimate?: number;
    platform: SocialPlatform;
    accountHandle?: string;
}

// ============================================================================
// Platform Credentials
// ============================================================================

export interface PlatformCredentials {
    platform: SocialPlatform;
    accountId: string;
    accountName?: string;
    accountHandle?: string;
    credentials: InstagramCredentials | FacebookCredentials | TwitterCredentials | LinkedInCredentials | TikTokCredentials | YouTubeCredentials;
    expiresAt?: Date;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface InstagramCredentials {
    accessToken: string;
    userId: string;
    businessAccountId?: string;
}

export interface FacebookCredentials {
    accessToken: string;
    pageId: string;
    userId: string;
}

export interface TwitterCredentials {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    bearerToken?: string;
}

export interface LinkedInCredentials {
    accessToken: string;
    userId: string;
    organizationId?: string;
}

export interface TikTokCredentials {
    accessToken: string;
    openId: string;
}

export interface YouTubeCredentials {
    accessToken: string;
    refreshToken: string;
    channelId: string;
}

// ============================================================================
// Platform Capabilities
// ============================================================================

export interface PlatformCapabilities {
    platform: SocialPlatform;
    supportedPostTypes: PostType[];
    maxTextLength: number;
    maxMediaCount: number;
    maxVideoSize: number; // bytes
    maxVideoDuration: number; // seconds
    maxImageSize: number; // bytes
    supportedMediaTypes: string[]; // MIME types
    supportedAspectRatios: string[]; // e.g., '16:9', '9:16', '1:1'
    supportsScheduling: boolean;
    supportsHashtags: boolean;
    supportsMentions: boolean;
    supportsLocation: boolean;
    supportsTargeting: boolean;
    maxHashtags?: number;
}

// ============================================================================
// Content Validation
// ============================================================================

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    field: string;
    code: string;
    message: string;
}

export interface ValidationWarning {
    field: string;
    code: string;
    message: string;
    suggestion?: string;
}

// ============================================================================
// Scheduling
// ============================================================================

export interface ScheduledPost {
    id: string;
    userId: string;
    platform: SocialPlatform;
    accountId: string;
    content: SocialMediaContent;
    postType: PostType;
    scheduledTime: Date;
    status: 'pending' | 'processing' | 'published' | 'failed' | 'cancelled';
    publishResult?: PublishResult;
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================================
// Analytics
// ============================================================================

export interface PostAnalytics {
    postId: string;
    platform: SocialPlatform;
    impressions: number;
    reach: number;
    engagement: number;
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
    clicks?: number;
    videoViews?: number;
    profileVisits?: number;
    followerGrowth?: number;
    timestamp: Date;
}

// ============================================================================
// Rate Limiting
// ============================================================================

export interface RateLimitInfo {
    platform: SocialPlatform;
    limit: number;
    remaining: number;
    resetAt: Date;
}

// ============================================================================
// Platform-Specific Types
// ============================================================================

// Instagram-specific
export interface InstagramStoryOptions {
    duration?: number; // seconds (default: 5)
    link?: string; // Swipe-up link (requires verification)
    stickers?: InstagramSticker[];
}

export interface InstagramSticker {
    type: 'mention' | 'hashtag' | 'location' | 'poll' | 'question' | 'countdown';
    value: string;
    x?: number; // Position 0-1
    y?: number; // Position 0-1
}

// X/Twitter-specific
export interface TwitterThreadOptions {
    tweets: string[];
    allowReplies?: 'all' | 'following' | 'mentioned' | 'none';
}

// LinkedIn-specific
export interface LinkedInArticleOptions {
    title: string;
    content: string;
    coverImage?: string;
    tags?: string[];
}

// TikTok-specific
export interface TikTokVideoOptions {
    duetEnabled?: boolean;
    stitchEnabled?: boolean;
    commentDisabled?: boolean;
    maxVideoPostSeconds?: number;
}

// YouTube-specific
export interface YouTubeVideoOptions {
    title: string;
    description: string;
    categoryId?: string;
    tags?: string[];
    privacyStatus: 'public' | 'private' | 'unlisted';
    madeForKids?: boolean;
    notifySubscribers?: boolean;
    playlist?: string;
}
