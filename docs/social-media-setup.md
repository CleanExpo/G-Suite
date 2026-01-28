## G-Pilot Social Media Publishing - Phase 1

### Overview

G-Pilot now supports multi-platform social media publishing with a unified API. This enables end-to-end marketing automation: content generation → video creation → social distribution.

### Currently Supported Platforms

**Phase 1 (Available Now)**:
- ✅ **Instagram** (posts, carousels, reels)
- ✅ **X/Twitter** (tweets, threads, media)

**Phase 2 (Coming Soon)**:
- 🔄 Facebook (posts, videos)
- 🔄 LinkedIn (posts, articles)
- 🔄 TikTok (videos)
- 🔄 YouTube (videos, shorts)

---

## API Reference

### POST /api/social/publish

Publish content to a social media platform.

**Request Body**:
```json
{
  "platform": "instagram" | "twitter",
  "accountId": "string",
  "postType": "text" | "image" | "images" | "video" | "reel",
  "content": {
    "text": "Your post content here",
    "media": [
      {
        "type": "image" | "video",
        "url": "https://storage.googleapis.com/video.mp4",
        "mimeType": "video/mp4"
      }
    ],
    "hashtags": ["marketing", "AI", "automation"],
    "mentions": ["username1", "username2"]
  },
  "credentials": {
    // Platform-specific credentials (see below)
  }
}
```

**Instagram Credentials**:
```json
{
  "accessToken": "your_instagram_access_token",
  "userId": "your_instagram_user_id",
  "businessAccountId": "your_business_account_id"
}
```

**Twitter Credentials**:
```json
{
  "accessToken": "your_twitter_access_token",
  "accessTokenSecret": "your_access_token_secret",
  "apiKey": "your_api_key",
  "apiSecret": "your_api_secret",
  "bearerToken": "your_bearer_token"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "platform": "instagram",
    "postId": "1234567890",
    "postUrl": "https://www.instagram.com/p/ABC123",
    "metadata": {
      "publishedAt": "2026-01-28T12:00:00.000Z",
      "platform": "instagram"
    }
  }
}
```

---

## Usage Examples

### Example 1: Publish Text Post to Instagram

```typescript
import { getSocialMediaManager } from '@/lib/social-media/manager';

const manager = getSocialMediaManager();

const result = await manager.publish({
  platform: 'instagram',
  accountId: 'your_instagram_account_id',
  postType: 'image',
  content: {
    text: 'Check out our latest product launch! 🚀',
    media: [{
      type: 'image',
      url: 'https://example.com/product.jpg',
      mimeType: 'image/jpeg'
    }],
    hashtags: ['product', 'launch', 'innovation']
  },
  platformSpecific: {
    credentials: {
      accessToken: 'your_access_token',
      userId: 'your_user_id'
    }
  }
});

console.log('Post URL:', result.postUrl);
```

### Example 2: Publish Instagram Reel (AI-Generated Video)

```typescript
import { veo31Generate } from '@/tools/googleAPISkills';
import { getSocialMediaManager } from '@/lib/social-media/manager';

// Step 1: Generate video with Veo 3.1
const videoResult = await veo31Generate(userId,
  'A product showcase with dynamic camera movements and cinematic lighting',
  {
    duration: 8,
    resolution: '1080p',
    aspectRatio: '9:16', // Instagram Reels aspect ratio
    generateAudio: true
  }
);

// Step 2: Publish to Instagram as Reel
const manager = getSocialMediaManager();

const publishResult = await manager.publish({
  platform: 'instagram',
  accountId: 'your_account_id',
  postType: 'reel',
  content: {
    text: 'Our AI-generated product showcase! 🎥✨',
    media: [{
      type: 'video',
      url: videoResult.videoUrl,
      mimeType: 'video/mp4',
      duration: 8
    }],
    hashtags: ['AI', 'ProductShowcase', 'Innovation']
  },
  platformSpecific: {
    credentials: { /* ... */ }
  }
});
```

### Example 3: Multi-Platform Publishing

```typescript
const manager = getSocialMediaManager();

const platforms: SocialPlatform[] = ['instagram', 'twitter'];
const accountMapping = new Map([
  ['instagram', 'instagram_account_id'],
  ['twitter', 'twitter_account_id']
]);

const results = await manager.publishMultiPlatform(
  platforms,
  {
    postType: 'image',
    content: {
      text: 'Exciting news coming soon! 🎉',
      media: [{
        type: 'image',
        url: 'https://example.com/teaser.jpg',
        mimeType: 'image/jpeg'
      }],
      hashtags: ['announcement', 'comingsoon']
    }
  },
  accountMapping
);

// Check results for each platform
for (const [platform, result] of results) {
  console.log(`${platform}:`, result.success ? result.postUrl : result.error?.message);
}
```

---

## Platform Capabilities

### Instagram

**Supported Post Types**: image, images (carousel), video, reel
**Max Text Length**: 2,200 characters
**Max Media**: 10 (carousel)
**Max Video Duration**: 60 seconds (feed), 90 seconds (reels)
**Max Hashtags**: 30 (recommended)

**Special Requirements**:
- Stories require special API permissions
- Reels must be 9:16 aspect ratio
- Business account required for API access

### X/Twitter

**Supported Post Types**: text, image, images, video
**Max Text Length**: 280 characters
**Max Media**: 4 images or 1 video
**Max Video Duration**: 140 seconds (2:20)

**Special Requirements**:
- Elevated API access required for media uploads
- OAuth 1.0a for uploads, OAuth 2.0 for tweets

---

## Integration with G-Pilot Agents

### Marketing Strategist Agent

```typescript
// In your agent's execute() method:
const videoResult = await veo31Generate(userId, campaignPrompt, options);

const socialMediaManager = getSocialMediaManager();

// Publish to Instagram and Twitter
const results = await socialMediaManager.publishMultiPlatform(
  ['instagram', 'twitter'],
  {
    postType: 'reel',
    content: {
      text: generatedCaption,
      media: [{ type: 'video', url: videoResult.videoUrl, mimeType: 'video/mp4' }],
      hashtags: extractedHashtags
    }
  },
  accountMapping
);
```

### Social Commander Agent

Automatically publish content across multiple platforms based on campaign strategy:

```typescript
const campaignPlan = {
  platforms: ['instagram', 'twitter', 'facebook'],
  content: generatedContent,
  schedule: [
    { platform: 'instagram', time: '09:00', postType: 'reel' },
    { platform: 'twitter', time: '12:00', postType: 'image' },
    { platform: 'facebook', time: '18:00', postType: 'video' }
  ]
};
```

---

## Platform Credentials Setup

### Instagram

1. Create a Facebook App at https://developers.facebook.com/
2. Add Instagram Graph API product
3. Get User Access Token with permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
4. Get Instagram Business Account ID

### X/Twitter

1. Create Twitter App at https://developer.twitter.com/
2. Apply for Elevated access (required for media uploads)
3. Generate OAuth 1.0a credentials (API Key, API Secret)
4. Get User Access Token & Secret via OAuth flow
5. Generate OAuth 2.0 Bearer Token for tweet creation

---

## Limitations & Notes

- **Instagram**: No scheduled posts via API (publish immediately only)
- **Twitter**: Media uploads require OAuth 1.0a authentication
- **Rate Limits**: Instagram (200 calls/hour), Twitter (300 calls/15min)
- **Video Processing**: Large videos may take 30-60 seconds to process

---

## Next Steps (Phase 2)

**Facebook Adapter**: Page posts, video uploads, targeting
**LinkedIn Adapter**: Posts, articles, company pages
**TikTok Adapter**: Video uploads, duet/stitch settings
**YouTube Adapter**: Video uploads, shorts, playlists

---

## Troubleshooting

**Error: "PLATFORM_NOT_SUPPORTED"**
- Solution: Platform not yet implemented in Phase 1. Check supported platforms list.

**Error: "VALIDATION_FAILED" - Text too long**
- Solution: Text exceeds platform limits. Truncate or use thread format (Twitter).

**Error: "Instagram access token not provided"**
- Solution: Ensure credentials are passed in `platformSpecific.credentials`.

**Error: "Container processing timeout"**
- Solution: Large video taking too long to process. Try smaller file or lower resolution.

---

## Support

For issues or questions:
- **G-Pilot Issues**: https://github.com/your-org/g-pilot/issues
- **Instagram API Docs**: https://developers.facebook.com/docs/instagram-api
- **Twitter API Docs**: https://developer.twitter.com/en/docs/twitter-api
