# G-Pilot SEO Optimization Engine

## Overview

The G-Pilot SEO Optimization Engine provides comprehensive, automated SEO analysis and recommendations powered by industry-leading APIs like SEMrush and Google PageSpeed Insights.

## Features

### Core Capabilities

**On-Page SEO Analysis**:
- Title tag optimization (length, keyword placement)
- Meta description analysis (length, keyword presence, call-to-action)
- Heading structure (H1-H6 hierarchy)
- Image optimization (alt text, dimensions, modern formats)
- Internal/external link analysis
- Open Graph & Twitter Card validation

**Technical SEO**:
- Core Web Vitals (LCP, FCP, TTI, TBT, CLS)
- Mobile-friendliness testing
- HTTPS & security validation
- Structured data (JSON-LD) detection
- Crawlability (robots.txt, sitemap, canonical tags)

**Content Analysis**:
- Word count and reading time
- Flesch reading ease score
- Keyword density calculation
- Content quality assessment
- Duplicate content detection

**Keyword Analysis** (SEMrush API):
- Search volume data
- Keyword difficulty scoring
- CPC (Cost-Per-Click) metrics
- Trend analysis (rising/stable/declining)
- Semantic keyword suggestions
- LSI (Latent Semantic Indexing) keywords
- Low-competition opportunity identification

**Recommendations Engine**:
- Prioritized action items (critical/high/medium/low)
- Impact vs. effort scoring
- Specific implementation steps
- Before/after examples

---

## Setup

### 1. Environment Variables

Add the following to your `.env.local`:

```bash
# Google API Key (for PageSpeed Insights)
GOOGLE_API_KEY=your-google-api-key-here

# SEMrush API Key (for keyword research)
SEMRUSH_API_KEY=your-semrush-api-key-here
```

### 2. Get SEMrush API Key

1. Sign up at https://www.semrush.com/
2. Navigate to **Settings** → **API & Integrations**
3. Generate an API key
4. Copy the key to your `.env.local`

**Pricing**: SEMrush API requires a paid subscription. Free trial available.

### 3. Get Google API Key (Optional)

For performance metrics via Google PageSpeed Insights:

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new API key
3. Enable **PageSpeed Insights API**
4. Copy the key to your `.env.local`

**Note**: Performance analysis works without API key but provides limited data.

---

## API Reference

### POST /api/seo/analyze

Performs comprehensive SEO analysis on a URL.

**Request Body**:
```json
{
  "url": "https://example.com",
  "html": "<html>...</html>",  // Optional: provide HTML directly
  "keywords": ["seo optimization", "digital marketing"],
  "includePerformance": true,  // Optional: fetch Core Web Vitals
  "includeBacklinks": false    // Optional: analyze backlinks (not yet implemented)
}
```

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "analyzedAt": "2026-01-28T12:00:00.000Z",
    "overallScore": 78,
    "scores": {
      "onPage": 82,
      "technical": 75,
      "content": 70,
      "mobile": 88,
      "performance": 65
    },
    "onPageSEO": {
      "title": {
        "content": "Example Domain - Your Trusted Partner",
        "length": 37,
        "score": 85,
        "issues": [],
        "recommendations": ["Move primary keyword closer to beginning"],
        "hasKeyword": true,
        "keywordPosition": 15
      },
      "metaDescription": { ... },
      "headings": { ... },
      "images": { ... },
      "links": { ... },
      "canonicalUrl": "https://example.com",
      "robots": "index, follow",
      "openGraph": { ... },
      "twitterCard": { ... }
    },
    "technicalSEO": {
      "performance": {
        "loadTime": 2450,
        "firstContentfulPaint": 1200,
        "largestContentfulPaint": 2100,
        "timeToInteractive": 2450,
        "totalBlockingTime": 150,
        "cumulativeLayoutShift": 0.08,
        "speedIndex": 1800,
        "score": 82,
        "issues": []
      },
      "mobile": { ... },
      "security": { ... },
      "structured": { ... },
      "crawlability": { ... },
      "score": 75
    },
    "contentAnalysis": {
      "wordCount": 1245,
      "readingLevel": {
        "fleschScore": 65,
        "grade": 8,
        "interpretation": "Standard (8th-9th grade)"
      },
      "readingTime": 6,
      "keywordDensity": [
        {
          "keyword": "seo optimization",
          "count": 12,
          "density": 0.96,
          "prominence": 85,
          "inTitle": true,
          "inDescription": true,
          "inH1": true
        }
      ],
      "contentQuality": { ... },
      "uniqueness": 100,
      "score": 70
    },
    "keywordAnalysis": {
      "primaryKeyword": "seo optimization",
      "keywords": [
        {
          "keyword": "seo optimization",
          "volume": 8100,
          "difficulty": 45,
          "cpc": 12.50,
          "competition": 0.52,
          "trend": "rising",
          "inContent": true,
          "density": 0.96,
          "prominence": 85
        }
      ],
      "semanticKeywords": ["search engine optimization", "on-page seo", ...],
      "lsiKeywords": ["best seo optimization", "seo optimization guide", ...],
      "score": 82,
      "opportunities": [
        {
          "keyword": "seo audit tools",
          "reason": "low difficulty, good search volume, trending upward",
          "potentialTraffic": 2400,
          "difficulty": 32,
          "priority": "high"
        }
      ]
    },
    "recommendations": [
      {
        "category": "title",
        "priority": "critical",
        "title": "Optimize Title Tag",
        "description": "Title is too long (72 characters, optimal: 50-60)",
        "impact": 25,
        "effort": "low",
        "implementation": "Shorten title to 50-60 characters to avoid truncation in search results",
        "beforeAfter": {
          "before": "Example Domain - Your Trusted Partner for All Your Business Needs Online",
          "after": "Example Domain - Trusted Business Partner (50 chars)"
        }
      }
    ],
    "issues": [
      {
        "severity": "warning",
        "category": "title",
        "title": "Title Tag Needs Optimization",
        "description": "Title exceeds optimal length of 60 characters",
        "affectedElements": ["Example Domain - Your Trusted Partner..."],
        "fixInstructions": "Reduce title length to 50-60 characters while maintaining keyword",
        "impact": "Reduced click-through rate and keyword relevance"
      }
    ]
  },
  "meta": {
    "version": "v1",
    "timestamp": "2026-01-28T12:00:00.000Z",
    "duration": "3245ms",
    "userId": "user_xxx"
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": {
    "code": "FETCH_FAILED",
    "message": "Failed to fetch URL. Please check if the URL is accessible.",
    "details": "getaddrinfo ENOTFOUND example.invalid"
  },
  "meta": {
    "version": "v1",
    "timestamp": "2026-01-28T12:00:00.000Z"
  }
}
```

---

## Usage Examples

### Example 1: Analyze Website SEO

```typescript
const response = await fetch('/api/seo/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://mywebsite.com',
    keywords: ['digital marketing', 'seo services'],
    includePerformance: true
  })
});

const result = await response.json();

if (result.success) {
  console.log('Overall SEO Score:', result.data.overallScore);
  console.log('Critical Issues:', result.data.recommendations.filter(r => r.priority === 'critical'));
}
```

### Example 2: Programmatic SEO Analysis

```typescript
import { getSEOEngine } from '@/lib/seo/engine';

const engine = getSEOEngine();

const analysis = await engine.analyze({
  url: 'https://example.com',
  keywords: ['seo optimization', 'content marketing'],
  includePerformance: true
});

console.log('On-Page Score:', analysis.scores.onPage);
console.log('Technical Score:', analysis.scores.technical);
console.log('Content Score:', analysis.scores.content);

// Get top 5 recommendations
const topRecommendations = analysis.recommendations
  .filter(r => r.priority === 'critical' || r.priority === 'high')
  .slice(0, 5);

topRecommendations.forEach(rec => {
  console.log(`[${rec.priority.toUpperCase()}] ${rec.title}`);
  console.log(`  Impact: ${rec.impact}/100 | Effort: ${rec.effort}`);
  console.log(`  ${rec.implementation}`);
});
```

### Example 3: Keyword Opportunity Discovery

```typescript
import { getKeywordAnalyzer } from '@/lib/seo/analyzers/keyword';

const keywordAnalyzer = getKeywordAnalyzer();

const analysis = await keywordAnalyzer.analyze(
  'https://example.com',
  ['seo', 'content marketing', 'digital marketing', 'link building']
);

// Find high-priority opportunities
const highPriorityOpportunities = analysis.opportunities
  .filter(opp => opp.priority === 'high')
  .sort((a, b) => b.potentialTraffic - a.potentialTraffic);

console.log('Top Keyword Opportunities:');
highPriorityOpportunities.forEach(opp => {
  console.log(`- ${opp.keyword}`);
  console.log(`  Reason: ${opp.reason}`);
  console.log(`  Potential Traffic: ${opp.potentialTraffic} visits/month`);
  console.log(`  Difficulty: ${opp.difficulty}/100`);
});
```

### Example 4: On-Page SEO Only

```typescript
import { getOnPageAnalyzer } from '@/lib/seo/analyzers/on-page';

const html = `
<!DOCTYPE html>
<html>
<head>
  <title>SEO Best Practices Guide</title>
  <meta name="description" content="Learn the best SEO practices for 2026.">
</head>
<body>
  <h1>Complete SEO Guide</h1>
  <p>Your content here...</p>
</body>
</html>
`;

const analyzer = getOnPageAnalyzer();
const analysis = await analyzer.analyze(html, 'https://example.com', ['seo best practices']);

console.log('Title Score:', analysis.title.score);
console.log('Title Issues:', analysis.title.issues);
console.log('Heading Structure:', analysis.headings.structure);
```

---

## Score Interpretation

### Overall Score Ranges

- **90-100**: Excellent - Site follows all SEO best practices
- **75-89**: Good - Minor improvements recommended
- **60-74**: Fair - Multiple optimization opportunities
- **40-59**: Poor - Significant issues need attention
- **0-39**: Critical - Major SEO problems affecting rankings

### Component Scores

**On-Page SEO** (25% weight):
- Title tag optimization
- Meta descriptions
- Heading structure
- Image optimization
- Internal linking

**Technical SEO** (25% weight):
- Performance metrics
- Mobile friendliness
- Security (HTTPS)
- Structured data
- Crawlability

**Content Quality** (20% weight):
- Word count
- Readability
- Keyword usage
- Content uniqueness

**Mobile Experience** (15% weight):
- Viewport configuration
- Touch target sizing
- Font sizes

**Performance** (15% weight):
- Core Web Vitals
- Load times
- Interactivity

---

## Recommendation Priorities

### Critical (Fix Immediately)
- No HTTPS (security issue)
- Page has noindex directive
- Missing title tag
- Severe performance issues (LCP > 4s)

### High (Fix This Week)
- Title/meta description optimization
- Missing H1 or multiple H1s
- Poor mobile experience
- No robots.txt or sitemap

### Medium (Fix This Month)
- Image optimization
- Internal linking improvements
- Structured data implementation
- Content length expansion

### Low (Nice to Have)
- Social meta tags (Open Graph, Twitter Card)
- Minor content improvements
- Additional semantic keywords

---

## API Rate Limits

### SEMrush API
- **Free tier**: 10 requests/day
- **Pro**: 3,000 requests/day
- **Guru**: 5,000 requests/day
- **Business**: 10,000 requests/day

### Google PageSpeed Insights API
- **Default**: 400 queries/day (no API key)
- **With API key**: 25,000 queries/day
- **Quota increase**: Available on request

---

## Troubleshooting

### Error: "SEMRUSH_API_KEY not found"

**Solution**: Add your SEMrush API key to `.env.local`:
```bash
SEMRUSH_API_KEY=your-api-key-here
```

**Fallback**: Keyword analysis will use mock data if no API key is present.

### Error: "Failed to fetch URL"

**Causes**:
- URL is not accessible (404, 500 errors)
- Site blocks bot user agents
- Network timeout

**Solution**:
- Verify URL is publicly accessible
- Ensure site allows crawlers
- Try providing HTML directly instead of URL

### Error: "Performance analysis requires API key"

**Solution**: Add Google API key to `.env.local`:
```bash
GOOGLE_API_KEY=your-google-api-key-here
```

**Fallback**: Analysis will continue with neutral performance score.

### Low Scores Despite Good Content

**Common Issues**:
- Missing viewport meta tag (mobile score)
- No structured data (technical score)
- Short title/meta description (on-page score)
- Poor content-to-code ratio (content score)

**Solution**: Address recommendations in priority order (critical → high → medium → low).

---

## Best Practices

### 1. Analyze Regularly

Run SEO audits:
- **Weekly**: For actively updated pages
- **Monthly**: For established content
- **Quarterly**: For static pages

### 2. Focus on Quick Wins

Prioritize:
1. Critical issues (security, indexability)
2. Title/meta optimization (high impact, low effort)
3. Mobile viewport (one-line fix)
4. Image alt text (accessibility + SEO)

### 3. Track Progress Over Time

Store analysis results and compare:
- Overall score trend
- Individual metric improvements
- Keyword ranking changes

### 4. Competitive Analysis

Analyze competitor pages to:
- Identify content gaps
- Discover keyword opportunities
- Benchmark performance

---

## Integration with G-Pilot Agents

### Marketing Strategist Agent

```typescript
// Integrate SEO analysis into content strategy
const seoAnalysis = await getSEOEngine().analyze({
  url: landingPageUrl,
  keywords: campaignKeywords,
  includePerformance: true
});

// Prioritize content based on keyword opportunities
const topOpportunities = seoAnalysis.keywordAnalysis.opportunities
  .filter(opp => opp.priority === 'high');

// Generate content optimized for opportunities
for (const opportunity of topOpportunities) {
  await generateContentForKeyword(opportunity.keyword);
}
```

### SEO Improvement Agent (Future)

Automated implementation of recommendations:
- Update meta tags
- Optimize images
- Fix heading hierarchy
- Generate structured data
- Create internal links

---

## Support

For issues or questions:
- **G-Pilot Issues**: https://github.com/your-org/g-pilot/issues
- **SEMrush API Docs**: https://www.semrush.com/api-documentation/
- **PageSpeed Insights Docs**: https://developers.google.com/speed/docs/insights/v5/about
