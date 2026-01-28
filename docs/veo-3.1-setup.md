# Veo 3.1 Video Generation Setup Guide

## Overview

G-Pilot now supports **real Veo 3.1 video generation** using Google's Vertex AI. This guide will help you configure Google Cloud to enable AI-powered video creation for your marketing campaigns.

## Prerequisites

- Google Cloud Platform account
- Billing enabled on your GCP project
- Node.js 18+ and npm installed
- G-Pilot repository cloned locally

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., `g-pilot-production`)
4. Note your **Project ID** (you'll need this later)
5. Click "Create"

---

## Step 2: Enable Required APIs

Enable the following APIs in your project:

1. Go to [API Library](https://console.cloud.google.com/apis/library)
2. Search for and enable each API:
   - **Vertex AI API** (required for Veo 3.1)
   - **Cloud Storage API** (for video storage)
   - **IAM Service Account Credentials API**

---

## Step 3: Create Service Account

1. Go to [IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Enter details:
   - **Name**: `g-pilot-veo-service`
   - **Description**: `Service account for G-Pilot Veo 3.1 video generation`
4. Click "Create and Continue"

### Grant Permissions

Add the following roles to your service account:

- **Vertex AI User** (`roles/aiplatform.user`)
- **Storage Object Creator** (`roles/storage.objectCreator`)
- **Storage Object Viewer** (`roles/storage.objectViewer`)

Click "Continue" → "Done"

---

## Step 4: Create Service Account Key

1. Click on your newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select **JSON** format
5. Click "Create"
6. Save the downloaded JSON file securely (you'll need the `client_email` and `private_key`)

**⚠️ Security Warning**: Never commit this JSON file to version control!

---

## Step 5: Create Cloud Storage Bucket (Optional)

If you want to store videos in Google Cloud Storage instead of receiving base64-encoded videos:

1. Go to [Cloud Storage](https://console.cloud.google.com/storage/browser)
2. Click "Create Bucket"
3. Enter bucket name (e.g., `g-pilot-videos-prod`)
4. Choose:
   - **Location**: `us-central1` (same as Vertex AI for lower latency)
   - **Storage class**: Standard
   - **Access control**: Uniform
5. Click "Create"

### Set Bucket Permissions

Grant your service account write access:

1. Click on your bucket
2. Go to "Permissions" tab
3. Click "Grant Access"
4. Add your service account email
5. Assign role: **Storage Object Creator**
6. Click "Save"

---

## Step 6: Configure Environment Variables

Edit your `.env.local` file and add the following:

```bash
# Google Cloud Project Configuration
GOOGLE_CLOUD_PROJECT=your-project-id-here    # From Step 1
VERTEX_AI_LOCATION=us-central1

# Google Service Account Credentials (from JSON file in Step 4)
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhki...\n-----END PRIVATE KEY-----"

# Optional: GCS bucket for video storage (from Step 5)
VEO_STORAGE_BUCKET=gs://g-pilot-videos-prod/
```

### Extracting Credentials from JSON

Open the downloaded JSON file and copy:

- `client_email` → `GOOGLE_CLIENT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY` (keep the `\n` newlines!)

**Important**: Wrap `GOOGLE_PRIVATE_KEY` in double quotes due to special characters.

---

## Step 7: Test Your Configuration

### Option 1: Using the API Endpoint

```bash
curl -X POST http://localhost:3000/api/veo/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "prompt": "A fast-tracking shot through a bustling dystopian sprawl with bright neon signs, flying cars and mist, night, lens flare, volumetric lighting",
    "duration": 8,
    "resolution": "720p",
    "aspectRatio": "16:9",
    "waitForCompletion": true
  }'
```

### Option 2: Using the TypeScript SDK

```typescript
import { veo31Generate } from '@/tools/googleAPISkills';

const result = await veo31Generate('user_id_here',
  'A lone cowboy rides his horse across an open plain at beautiful sunset',
  {
    duration: 8,
    resolution: '1080p',
    aspectRatio: '16:9',
    generateAudio: true,
    waitForCompletion: true
  }
);

if (result.success) {
  console.log('Video URL:', result.videoUrl);
  console.log('Generation time:', result.generationTime, 'ms');
} else {
  console.error('Error:', result.error);
}
```

---

## API Reference

### POST /api/veo/generate

Generate a video using Veo 3.1.

**Request Body**:

```json
{
  "prompt": "string (required, min 10 chars)",
  "duration": 4 | 6 | 8,
  "resolution": "720p" | "1080p" | "4k",
  "aspectRatio": "16:9" | "9:16" | "1:1",
  "referenceImage": {
    "base64": "string",
    "mimeType": "image/jpeg" | "image/png" | "image/webp"
  },
  "negativePrompt": "string (optional)",
  "seed": 0-4294967295,
  "personGeneration": "allow_adult" | "dont_allow" | "allow_all",
  "generateAudio": boolean,
  "waitForCompletion": boolean (default: true)
}
```

**Response (Success)**:

```json
{
  "success": true,
  "data": {
    "videoUrl": "gs://bucket/video.mp4",
    "operationName": "projects/.../operations/...",
    "metadata": {
      "duration": 8,
      "resolution": "720p",
      "aspectRatio": "16:9",
      "generationTime": 125340,
      "generatedAt": "2026-01-28T12:00:00.000Z"
    }
  }
}
```

### GET /api/veo/status/[operationId]

Check the status of an async video generation operation.

**Response**:

```json
{
  "success": true,
  "data": {
    "operationName": "projects/.../operations/abc123",
    "done": true,
    "videoUrls": ["gs://bucket/video.mp4"],
    "metadata": {
      "createTime": "2026-01-28T12:00:00.000Z",
      "updateTime": "2026-01-28T12:02:15.000Z"
    }
  }
}
```

---

## Video Generation Parameters

### Duration

- **4 seconds**: Quick clips for Instagram Stories, TikTok intro
- **6 seconds**: Standard social media content
- **8 seconds**: Longer storytelling, YouTube Shorts

### Resolution

- **720p**: Fast generation, good for social media (default)
- **1080p**: High quality for YouTube, Instagram
- **4k**: Premium quality (Veo 3.1 Preview models only)

### Aspect Ratio

- **16:9**: Landscape (YouTube, Facebook, LinkedIn)
- **9:16**: Portrait (Instagram Stories, TikTok, Reels)
- **1:1**: Square (Instagram Feed)

---

## Pricing

Veo 3.1 pricing (as of January 2026):

- **720p video**: ~$0.20 per 8-second video
- **1080p video**: ~$0.35 per 8-second video
- **4k video**: ~$0.70 per 8-second video

**Note**: Prices may vary. Check [Vertex AI Pricing](https://cloud.google.com/vertex-ai/pricing) for current rates.

---

## Troubleshooting

### Error: "Google Cloud not configured"

**Solution**: Ensure you've set `GOOGLE_CLOUD_PROJECT` in `.env.local` and it's not `your-project-id-here`.

### Error: "Failed to obtain access token"

**Solutions**:
1. Verify `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` are correctly copied
2. Ensure the private key includes the full `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` markers
3. Check that the service account has the required IAM roles

### Error: "Operation timeout"

**Solutions**:
1. Video generation can take 1-10 minutes depending on complexity
2. Use `waitForCompletion: false` and poll with `/api/veo/status/[operationId]` instead
3. Check [Vertex AI Status Dashboard](https://status.cloud.google.com/) for outages

### Error: "Quota exceeded"

**Solutions**:
1. Request quota increase in [Google Cloud Quotas](https://console.cloud.google.com/iam-admin/quotas)
2. Monitor usage in [Cloud Console → Billing](https://console.cloud.google.com/billing)
3. Implement rate limiting in your application

---

## Best Practices

### 1. Prompt Engineering

**Good prompts**:
- ✅ "A fast-tracking shot through a bustling dystopian sprawl with bright neon signs, flying cars and mist, night, lens flare, volumetric lighting"
- ✅ "Timelapse of the northern lights dancing across the Arctic sky, stars twinkling, snow-covered landscape"

**Bad prompts**:
- ❌ "Make a video"
- ❌ "Car driving"

**Tips**:
- Include camera movement (tracking shot, timelapse, close-up)
- Specify lighting (volumetric lighting, soft light, lens flare)
- Add atmospheric details (mist, rain, snow)
- Describe mood and style (cinematic, futuristic, warm colors)

### 2. Cost Optimization

- Use **720p** for social media drafts (70% cheaper than 4k)
- Set **duration: 6** instead of 8 for shorter videos
- Use `negativePrompt` to avoid re-generation (e.g., "blurry, low quality")
- Cache reference images instead of re-uploading

### 3. Performance

- Set `waitForCompletion: false` for long-running operations
- Implement client-side polling with `/api/veo/status/[operationId]`
- Use webhooks for batch video generation (advanced)

### 4. Security

- **Never expose** service account credentials in client-side code
- Always authenticate API requests with Clerk or similar
- Rotate service account keys every 90 days
- Use GCS signed URLs for video sharing instead of public buckets

---

## Integration with G-Pilot Agents

### Marketing Strategist Agent

```typescript
import { veo31Generate } from '@/tools/googleAPISkills';

// In your agent's execute() method:
const videoResult = await veo31Generate(userId,
  `${campaignTheme} promotional video with ${brandColors} and ${targetAudience} appeal`,
  {
    duration: 8,
    resolution: '1080p',
    aspectRatio: '16:9',
    generateAudio: true
  }
);
```

### Social Commander Agent

Automatically generate videos for multi-platform campaigns:

```typescript
const platforms = ['instagram-reels', 'tiktok', 'youtube-shorts'];

for (const platform of platforms) {
  const aspectRatio = platform === 'youtube-shorts' ? '9:16' : '9:16';

  const video = await veo31Generate(userId, prompt, {
    aspectRatio,
    duration: 6,
    resolution: '1080p'
  });

  // Upload to social platform...
}
```

---

## Support

For issues or questions:

- **G-Pilot Issues**: https://github.com/your-org/g-pilot/issues
- **Google Cloud Support**: https://cloud.google.com/support
- **Vertex AI Documentation**: https://cloud.google.com/vertex-ai/docs

---

## Next Steps

After configuring Veo 3.1:

1. ✅ Integrate with **Social Media Publishing** (Priority #2)
2. ✅ Add **SEO optimization** for video metadata (Priority #3)
3. ✅ Build **Mission Template Library** with video generation templates
4. ✅ Create **Analytics Dashboard** to track video performance

**Congratulations!** You've successfully integrated Veo 3.1 video generation into G-Pilot. 🎥✨
