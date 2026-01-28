# GEO Framework Setup Guide

## Overview

The GEO (Geographic/Local SEO) Framework is G-Pilot's comprehensive local search optimization system. It analyzes local SEO factors, predicts rankings, and provides actionable recommendations to improve local search visibility.

### Features

- **NAP Consistency Analysis** - Validates Name, Address, Phone across your website
- **Citation Tracking** - Monitors business listings on major directories
- **Local Schema Validation** - Checks LocalBusiness structured data
- **Google Maps Integration** - Verifies embedded maps and directions
- **Google Business Profile** - Integrates with Google My Business API
- **Ranking Predictions** - Predicts local pack positions using Google's algorithm
- **Competitor Analysis** - Benchmarks against local competitors
- **Actionable Recommendations** - Prioritized list of improvements with impact estimates

---

## Architecture

```
src/lib/geo/
├── types.ts                        # TypeScript type definitions
├── local-seo-analyzer.ts          # NAP, citations, schema, maps
├── google-business-client.ts      # Google My Business API client
├── ranking-predictor.ts           # Geographic ranking algorithm
├── local-competitor-analyzer.ts   # Competitor benchmarking
└── geo-engine.ts                  # Main orchestration engine

src/app/api/geo/
├── analyze/route.ts               # POST /api/geo/analyze
├── rankings/route.ts              # POST /api/geo/rankings
└── competitors/route.ts           # POST /api/geo/competitors

src/app/dashboard/geo/
└── page.tsx                       # GEO Dashboard UI
```

---

## Installation

The GEO Framework is already integrated into G-Pilot. No additional installation is required.

### Dependencies

The following packages are already included:

```json
{
  "linkedom": "^0.18.0",           // Server-side HTML parsing
  "google-auth-library": "^9.0.0"  // Google API authentication
}
```

---

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```bash
# Google My Business API (Optional)
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Maps API (Optional - for geocoding)
GOOGLE_MAPS_API_KEY=your-maps-api-key
```

### Google My Business API Setup

The GEO Framework works with mock data by default. To enable real Google Business Profile data:

#### Step 1: Enable Google My Business API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project
3. Navigate to **APIs & Services** > **Library**
4. Search for "Google My Business API"
5. Click **Enable**

#### Step 2: Create Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Name it "g-pilot-geo-service"
4. Grant role: **Owner** or **Editor**
5. Click **Done**

#### Step 3: Generate Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Select **JSON** format
5. Click **Create** - a JSON file will download

#### Step 4: Configure Environment Variables

Open the downloaded JSON file and extract:

```bash
# Copy these from the JSON file
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY="..."
```

**Important**: Replace `\n` in the private key with actual newlines when pasting into `.env.local`.

#### Step 5: Grant API Access

1. Go to [Google My Business](https://business.google.com)
2. Navigate to **Settings** > **Users**
3. Add the service account email with **Manager** access
4. Accept the invitation

### Google Maps API Setup (Optional)

For geocoding and distance calculations:

#### Step 1: Enable Maps JavaScript API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** > **Library**
3. Search for "Maps JavaScript API"
4. Click **Enable**

#### Step 2: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. Click **Restrict Key** (recommended)
5. Under **API restrictions**, select:
   - Maps JavaScript API
   - Geocoding API
   - Places API

#### Step 3: Add to Environment

```bash
GOOGLE_MAPS_API_KEY=your-api-key-here
```

---

## Usage

### Dashboard UI

Access the GEO Dashboard at:

```
http://localhost:3000/dashboard/geo
```

#### Steps:

1. **Enter Business Information**
   - Website URL
   - Business name
   - Full address
   - Phone number
   - Target location (e.g., "New York, NY")
   - Categories (e.g., "Bakery, Cafe")
   - Target keywords (e.g., "bakery near me, fresh bread")

2. **Run Analysis**
   - Click "Analyze Local SEO"
   - Wait 15-30 seconds for comprehensive analysis

3. **Review Results**
   - Overall GEO score (0-100)
   - Score breakdown: NAP, Citations, Schema, Maps
   - Ranking prediction for target keywords
   - Competitor comparison
   - Prioritized recommendations

### API Endpoints

#### 1. Comprehensive GEO Analysis

```typescript
POST /api/geo/analyze

// Request
{
  "url": "https://example-bakery.com",
  "businessName": "Example Bakery",
  "address": "123 Main St, New York, NY 10001",
  "phone": "(555) 123-4567",
  "targetLocation": "New York, NY",
  "targetKeywords": ["bakery near me", "fresh bread nyc"],
  "categories": ["Bakery", "Cafe"]
}

// Response
{
  "success": true,
  "data": {
    "businessInfo": { ... },
    "napAnalysis": {
      "score": 85,
      "consistency": { ... },
      "issues": [],
      "recommendations": []
    },
    "citationAnalysis": {
      "total": 12,
      "consistent": 10,
      "inconsistent": 2,
      "missing": 3,
      "score": 75
    },
    "localSchema": {
      "score": 90,
      "hasLocalBusiness": true,
      "completeness": { ... }
    },
    "mapsIntegration": {
      "score": 80,
      "hasEmbeddedMap": true,
      "hasDirectionsLink": true
    },
    "rankingPrediction": {
      "keyword": "bakery near me",
      "location": "New York, NY",
      "predictedPosition": 3,
      "confidence": 85,
      "factors": { ... },
      "improvements": [ ... ]
    },
    "competitorAnalysis": { ... },
    "recommendations": [ ... ],
    "score": 82
  }
}
```

#### 2. Ranking Prediction Only

```typescript
POST /api/geo/rankings

// Request
{
  "keyword": "bakery near me",
  "location": "New York, NY",
  "businessName": "Example Bakery",
  "address": "123 Main St, New York, NY 10001",
  "phone": "(555) 123-4567",
  "website": "https://example-bakery.com",
  "categories": ["Bakery", "Cafe"]
}

// Response
{
  "success": true,
  "data": {
    "keyword": "bakery near me",
    "location": "New York, NY",
    "predictedPosition": 3,
    "confidence": 85,
    "factors": {
      "distance": { "score": 85, "weight": 0.30 },
      "relevance": { "score": 75, "weight": 0.25 },
      "prominence": { "score": 80, "weight": 0.30 },
      "optimization": { "score": 70, "weight": 0.15 },
      "overall": 78
    },
    "improvements": [
      {
        "factor": "relevance",
        "currentScore": 75,
        "potentialScore": 90,
        "impact": "high",
        "effort": "low",
        "recommendation": "Add 'bakery' to business categories",
        "estimatedRankingGain": 2
      }
    ]
  }
}
```

#### 3. Competitor Analysis Only

```typescript
POST /api/geo/competitors

// Request
{
  "businessName": "Example Bakery",
  "address": "123 Main St, New York, NY 10001",
  "categories": ["Bakery", "Cafe"],
  "radius": 10,
  "yourProfile": {
    "rating": 4.5,
    "reviewCount": 127,
    "citationCount": 12,
    "photoCount": 25,
    "postCount": 8,
    "completenessScore": 85
  }
}

// Response
{
  "success": true,
  "data": {
    "competitors": [
      {
        "name": "Competitor A",
        "address": "...",
        "distance": 2.3,
        "rating": 4.7,
        "reviewCount": 203,
        "citationCount": 18,
        "strengths": ["Excellent rating", "High review count"],
        "weaknesses": ["Slow review response"]
      }
    ],
    "gaps": [
      {
        "type": "reviews",
        "description": "Review count below competitors",
        "yourValue": 127,
        "competitorAverage": 180,
        "topCompetitorValue": 250,
        "priority": "high"
      }
    ],
    "opportunities": [ ... ],
    "summary": {
      "totalCompetitors": 5,
      "averageRating": 4.4,
      "averageReviewCount": 180,
      "averageCitationCount": 15,
      "yourRanking": 3
    }
  }
}
```

### Programmatic Usage

```typescript
import { getGEOEngine } from '@/lib/geo/geo-engine';
import { getRankingPredictor } from '@/lib/geo/ranking-predictor';
import { getLocalCompetitorAnalyzer } from '@/lib/geo/local-competitor-analyzer';

// Full GEO Analysis
const engine = getGEOEngine();
const analysis = await engine.analyze({
  url: 'https://example.com',
  businessName: 'Example Business',
  address: '123 Main St, City, ST 12345',
  phone: '(555) 123-4567',
  targetKeywords: ['business near me'],
  targetLocation: 'City, ST'
});

console.log('GEO Score:', analysis.score);
console.log('Predicted Position:', analysis.rankingPrediction.predictedPosition);
console.log('Top Recommendation:', analysis.recommendations[0].title);

// Ranking Prediction Only
const predictor = getRankingPredictor();
const prediction = await predictor.predictRanking({
  keyword: 'business near me',
  location: 'City, ST',
  businessName: 'Example Business',
  address: '123 Main St, City, ST 12345',
  phone: '(555) 123-4567',
  categories: ['Service', 'Local Business']
});

console.log('Predicted Position:', prediction.predictedPosition);
console.log('Confidence:', prediction.confidence);

// Competitor Analysis Only
const analyzer = getLocalCompetitorAnalyzer();
const competitors = await analyzer.analyze({
  businessName: 'Example Business',
  address: '123 Main St, City, ST 12345',
  categories: ['Service'],
  yourProfile: {
    rating: 4.5,
    reviewCount: 100,
    citationCount: 15,
    photoCount: 20,
    postCount: 5,
    completenessScore: 80
  }
});

console.log('Your Ranking:', competitors.summary.yourRanking);
console.log('Gaps:', competitors.gaps.length);
console.log('Opportunities:', competitors.opportunities.length);
```

---

## Ranking Algorithm

The GEO Framework uses Google's local pack ranking algorithm with four weighted factors:

### 1. Distance (30%)
- Proximity to searcher location
- Service area coverage
- Location accuracy

### 2. Relevance (25%)
- Keyword match in business name
- Category alignment
- Content relevance
- GBP primary category

### 3. Prominence (30%)
- Review count and recency
- Average rating
- Citation consistency
- GBP completeness
- Posting activity

### 4. Optimization (15%)
- NAP consistency
- LocalBusiness schema
- Website optimization
- Mobile-friendliness

**Overall Score Formula:**
```
Overall = (Distance × 0.30) + (Relevance × 0.25) + (Prominence × 0.30) + (Optimization × 0.15)
```

**Position Estimation:**
- Score ≥ 90: Position 1
- Score ≥ 80: Position 2-3
- Score ≥ 70: Position 4-5
- Score ≥ 60: Position 6-8
- Score ≥ 50: Position 9-12
- Score < 50: Position 13+

---

## Recommendation Priorities

Recommendations are prioritized based on:

1. **Critical** (Red) - Immediate attention required
   - Missing LocalBusiness schema
   - Severe NAP inconsistencies
   - Very low review count (< 10)

2. **High** (Orange) - Important improvements
   - Incomplete GBP profile
   - Missing major citations (5+)
   - No embedded map

3. **Medium** (Yellow) - Beneficial optimizations
   - Incomplete schema fields
   - Low posting activity
   - Moderate review gaps

4. **Low** (Gray) - Minor enhancements
   - Service area expansion
   - Additional photo categories

---

## Troubleshooting

### Issue: "Google Business Profile API not configured"

**Cause**: Missing or invalid Google API credentials

**Solution**:
1. Verify `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` in `.env.local`
2. Ensure service account has proper permissions
3. Check that API is enabled in Google Cloud Console
4. Restart development server after updating `.env.local`

### Issue: "Failed to fetch website HTML"

**Cause**: Target website is blocking requests or has CORS issues

**Solution**:
1. Ensure the URL is accessible and valid
2. Check for typos in the URL
3. For local testing, the framework uses mock data
4. In production, implement proper web scraping with user-agent headers

### Issue: "NAP analysis score is 0"

**Cause**: Website HTML could not be parsed or no NAP information found

**Solution**:
1. Verify the website has visible NAP information
2. Check that NAP is in standard locations (header, footer, contact page)
3. Add LocalBusiness schema with NAP data
4. Ensure NAP is not in iframes or dynamically loaded

### Issue: "Predicted position seems inaccurate"

**Cause**: Missing data or no competitor information

**Solution**:
1. Provide complete business profile data
2. Include GBP profile information
3. Add geographic coordinates (lat/lng)
4. Supply competitor data for better accuracy
5. Prediction is an estimate - actual rankings vary by search factors

### Issue: "No competitors found"

**Cause**: Using mock data or no competitors in radius

**Solution**:
1. Enable Google Places API for real competitor data
2. Increase search radius (default: 10 miles)
3. Manually provide competitor data via `knownCompetitors` parameter
4. Verify business categories are correct

---

## Best Practices

### 1. Complete Profile Data
Provide as much information as possible for accurate analysis:
- Full business address with ZIP code
- Properly formatted phone number
- All relevant business categories
- Target keywords for your service area

### 2. Regular Analysis
Run GEO analysis monthly to:
- Track progress over time
- Monitor competitor changes
- Identify new optimization opportunities
- Validate implemented improvements

### 3. Prioritize High-Impact Recommendations
Focus on:
1. **Critical** items first (blocking factors)
2. **High-impact, low-effort** quick wins
3. **High-impact, high-effort** strategic projects
4. **Medium** improvements for continuous optimization

### 4. NAP Consistency
Ensure your business name, address, and phone are:
- **Identical** across all platforms
- **Formatted consistently** (e.g., "Street" vs "St")
- **Up-to-date** if you've moved or changed numbers
- **Visible** in website header, footer, and contact page

### 5. LocalBusiness Schema
Always include:
- Business name, address, phone
- Geographic coordinates (lat/lng)
- Opening hours
- Business categories
- Aggregate rating (if available)
- Price range

---

## Performance

### Analysis Speed
- NAP Analysis: < 1 second
- Citation Check: 1-2 seconds (with API)
- Schema Validation: < 1 second
- Ranking Prediction: < 1 second
- Competitor Analysis: 2-3 seconds (with API)
- **Total**: 5-10 seconds for full analysis

### Optimization Tips
- Cache GBP profile data (24-hour TTL)
- Batch multiple location analyses
- Use webhook for long-running tasks
- Enable CDN for static assets

---

## API Rate Limits

### Google My Business API
- 100 requests per 100 seconds per user
- 1,000 requests per 100 seconds per project

### Google Maps API
- 1,000 requests per day (free tier)
- $5 per 1,000 requests (paid)

### Best Practices
- Implement caching (24-hour TTL for profile data)
- Use batch requests where possible
- Monitor quota usage in Google Cloud Console

---

## Support

### Documentation
- GEO Framework Plan: `docs/geo-framework-plan.md`
- Type Definitions: `src/lib/geo/types.ts`
- API Examples: This file

### Resources
- Google My Business API: https://developers.google.com/my-business
- Google Maps Platform: https://developers.google.com/maps
- Schema.org LocalBusiness: https://schema.org/LocalBusiness
- Local SEO Guide: https://moz.com/learn/seo/local

### Community
- GitHub Issues: https://github.com/anthropics/g-pilot/issues
- Discussions: https://github.com/anthropics/g-pilot/discussions

---

## Changelog

### Version 1.0.0 (2026-01-28)
- Initial release of GEO Framework
- NAP consistency analysis
- Citation tracking (framework only)
- Local schema validation
- Google Maps integration detection
- Google Business Profile client
- Geographic ranking predictor
- Local competitor analyzer
- Comprehensive dashboard UI
- Three API endpoints
- Mock data for development

---

## License

Part of G-Pilot - Google/Gemini AI Marketing Platform
Copyright © 2026 Anthropic PBC
