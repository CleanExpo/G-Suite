# GEO Framework Implementation Plan

## Overview

The GEO (Geographic/Local SEO) Framework is Priority #4 in the G-Pilot backlog. It focuses on local search optimization, Google Business Profile integration, and geographic ranking predictions.

## Architecture

```
src/lib/geo/
├── types.ts                        # GEO-specific types
├── local-seo-analyzer.ts          # NAP, citations, local schema
├── google-business-client.ts      # Google My Business API
├── ranking-predictor.ts           # Geographic ranking predictions
├── local-competitor-analyzer.ts   # Local competition analysis
└── geo-engine.ts                  # Main orchestration

src/app/api/geo/
├── analyze/route.ts               # Local SEO analysis endpoint
├── rankings/route.ts              # Ranking prediction endpoint
└── competitors/route.ts           # Local competitor analysis

src/app/dashboard/geo/
└── page.tsx                       # GEO Dashboard UI
```

## Core Features

### 1. Local SEO Analyzer

**Analysis Components**:
- **NAP Consistency** (Name, Address, Phone)
  - Check consistency across website
  - Validate structured data
  - Detect formatting issues

- **Local Citations**
  - Detect existing citations
  - Check citation consistency
  - Identify missing citations
  - Major directories: Google, Yelp, Facebook, Apple Maps

- **Local Schema Markup**
  - LocalBusiness schema detection
  - Hours of operation
  - Service area
  - Reviews/ratings schema
  - Event schema

- **Google Maps Integration**
  - Embedded maps detection
  - Directions functionality
  - Store locator implementation

### 2. Google Business Profile Integration

**Google My Business API Features**:
- Profile information retrieval
- Reviews management
- Posts creation/management
- Q&A monitoring
- Insights and analytics
- Photo management
- Service area updates

**API Endpoints**:
- `GET /api/geo/profile/{locationId}` - Get GBP data
- `POST /api/geo/profile/{locationId}/posts` - Create post
- `GET /api/geo/profile/{locationId}/reviews` - Get reviews
- `GET /api/geo/profile/{locationId}/insights` - Get analytics

### 3. Geographic Ranking Predictor

**Ranking Factors**:
- Distance from searcher
- Relevance (keywords, categories)
- Prominence (reviews, ratings, citations)
- GBP completeness score
- Local link signals
- On-page optimization

**Prediction Model**:
```typescript
interface RankingPrediction {
    keyword: string;
    location: string;
    predictedPosition: number;
    confidence: number; // 0-100
    factors: {
        distance: number;
        relevance: number;
        prominence: number;
        optimization: number;
    };
    improvements: string[];
}
```

### 4. Local Competitor Analyzer

**Analysis Features**:
- Identify local competitors (same city/radius)
- Compare GBP profiles
- Review count and rating comparison
- Citation gap analysis
- Local keyword overlap
- Backlink comparison

### 5. Multi-Location Support

For businesses with multiple locations:
- Bulk location analysis
- Location-specific recommendations
- Regional performance comparison
- Franchise optimization

---

## Implementation Steps

### Phase 1: Core Types & Local SEO Analyzer

**Files to Create**:
1. `src/lib/geo/types.ts` (400 lines)
   - GEOAnalysisRequest
   - GEOAnalysisResult
   - NAPAnalysis
   - CitationAnalysis
   - LocalSchemaAnalysis
   - RankingPrediction
   - CompetitorComparison

2. `src/lib/geo/local-seo-analyzer.ts` (500 lines)
   - analyzeNAP() - Extract and validate NAP
   - analyzeCitations() - Find existing citations
   - analyzeLocalSchema() - Validate local structured data
   - checkGoogleMapsIntegration()
   - calculateLocalScore()

### Phase 2: Google Business Profile Integration

**Files to Create**:
3. `src/lib/geo/google-business-client.ts` (400 lines)
   - getLocationProfile() - Fetch GBP data
   - getReviews() - Fetch reviews
   - getInsights() - Fetch analytics
   - createPost() - Create GBP post
   - manageQA() - Q&A management

**API Requirements**:
- Google My Business API credentials
- OAuth 2.0 for user authorization
- Scopes: `business.manage`, `plus.business.manage`

### Phase 3: Ranking Predictor

**Files to Create**:
4. `src/lib/geo/ranking-predictor.ts` (350 lines)
   - predictRanking() - Calculate predicted position
   - analyzeRankingFactors() - Score each factor
   - generateImprovements() - Suggest improvements
   - compareWithCompetitors() - Benchmark

**Ranking Algorithm**:
```typescript
function predictRanking(params: {
    keyword: string;
    location: string;
    businessData: BusinessData;
    competitors: Competitor[];
}): RankingPrediction {
    // 1. Calculate distance score (0-100)
    // 2. Calculate relevance score (keyword match, categories)
    // 3. Calculate prominence score (reviews, ratings, citations)
    // 4. Calculate optimization score (on-page, schema)
    // 5. Weighted average with local pack algorithm
    // 6. Position prediction based on score
}
```

### Phase 4: Local Competitor Analyzer

**Files to Create**:
5. `src/lib/geo/local-competitor-analyzer.ts` (450 lines)
   - findLocalCompetitors() - Identify competitors
   - compareGBPProfiles() - Profile comparison
   - analyzeCitationGap() - Citation differences
   - compareReviews() - Review analysis
   - identifyKeywordGaps() - Keyword opportunities

### Phase 5: GEO Engine & API

**Files to Create**:
6. `src/lib/geo/geo-engine.ts` (300 lines)
   - Main orchestration engine
   - Coordinates all analyzers
   - Generates comprehensive report

7. `src/app/api/geo/analyze/route.ts` (150 lines)
   - POST endpoint for GEO analysis
   - Input validation
   - Error handling

8. `src/app/api/geo/rankings/route.ts` (120 lines)
   - Ranking prediction endpoint

9. `src/app/api/geo/competitors/route.ts` (140 lines)
   - Local competitor analysis endpoint

### Phase 6: GEO Dashboard UI

**Files to Create**:
10. `src/app/dashboard/geo/page.tsx` (700 lines)
    - Business information form
    - NAP consistency display
    - Citation tracker
    - Local schema validator
    - GBP profile viewer
    - Ranking predictor interface
    - Competitor comparison table
    - Local recommendations

---

## Data Sources

### Required APIs

1. **Google My Business API**
   - Business profile data
   - Reviews and ratings
   - Insights and analytics
   - Posts management

2. **Google Maps API**
   - Geocoding
   - Place details
   - Nearby search
   - Distance matrix

3. **BrightLocal API** (Optional)
   - Citation tracking
   - Local rank checking
   - Review monitoring
   - Competitor analysis

4. **Whitespark API** (Optional)
   - Citation building
   - Local link opportunities

### Free Alternatives

- Google Places API (basic data)
- Manual citation checks
- SERP scraping for rankings (use with caution)
- Review aggregation from multiple sources

---

## Environment Variables

```bash
# Google My Business API
GOOGLE_MY_BUSINESS_API_KEY=your-api-key
GMB_CLIENT_ID=your-client-id
GMB_CLIENT_SECRET=your-client-secret

# Google Maps API
GOOGLE_MAPS_API_KEY=your-maps-api-key

# BrightLocal API (Optional)
BRIGHTLOCAL_API_KEY=your-brightlocal-key

# Whitespark API (Optional)
WHITESPARK_API_KEY=your-whitespark-key
```

---

## Example Usage

### Local SEO Analysis

```typescript
import { getGEOEngine } from '@/lib/geo/geo-engine';

const engine = getGEOEngine();

const analysis = await engine.analyze({
    url: 'https://example-bakery.com',
    businessName: 'Example Bakery',
    address: '123 Main St, New York, NY 10001',
    phone: '(555) 123-4567',
    targetKeywords: ['bakery near me', 'fresh bread nyc'],
    targetLocation: 'New York, NY'
});

console.log('NAP Consistency:', analysis.napAnalysis.score);
console.log('Citations Found:', analysis.citationAnalysis.total);
console.log('Local Schema:', analysis.localSchema.hasLocalBusiness);
console.log('Predicted Ranking:', analysis.rankingPrediction.predictedPosition);
```

### Ranking Prediction

```typescript
import { getRankingPredictor } from '@/lib/geo/ranking-predictor';

const predictor = getRankingPredictor();

const prediction = await predictor.predictRanking({
    keyword: 'bakery near me',
    location: 'New York, NY',
    businessData: {
        name: 'Example Bakery',
        address: '123 Main St, New York, NY 10001',
        categories: ['Bakery', 'Cafe'],
        rating: 4.5,
        reviewCount: 250
    },
    competitors: [
        // Competitor data from Google Places API
    ]
});

console.log('Predicted Position:', prediction.predictedPosition);
console.log('Confidence:', prediction.confidence);
console.log('Top Improvement:', prediction.improvements[0]);
```

---

## Testing Strategy

1. **Unit Tests**
   - NAP extraction accuracy
   - Citation detection
   - Schema validation
   - Ranking algorithm accuracy

2. **Integration Tests**
   - Google My Business API calls
   - Google Maps API integration
   - End-to-end analysis workflow

3. **Real-World Testing**
   - Test with actual business data
   - Validate ranking predictions
   - Compare with manual audits

---

## Metrics & Success Criteria

### Performance Metrics
- Analysis completion time < 30 seconds
- Ranking prediction accuracy > 70%
- Citation detection rate > 90%

### Quality Metrics
- NAP extraction accuracy > 95%
- Schema validation false positive rate < 5%
- User satisfaction score > 4.5/5

---

## Future Enhancements

1. **Voice Search Optimization**
   - Featured snippet analysis
   - Question-based keyword targeting
   - Conversational query optimization

2. **Local Link Building**
   - Identify local link opportunities
   - Track local backlinks
   - Monitor competitor links

3. **Reputation Management**
   - Review response automation
   - Sentiment analysis
   - Review generation tools

4. **Multi-Language Support**
   - International local SEO
   - Language-specific optimizations
   - Regional search differences

5. **AI-Powered Insights**
   - Automated improvement suggestions
   - Predictive analytics
   - Trend identification

---

## Resources

- Google My Business API Docs: https://developers.google.com/my-business
- Google Maps Platform: https://developers.google.com/maps
- Local SEO Best Practices: https://moz.com/learn/seo/local
- Schema.org LocalBusiness: https://schema.org/LocalBusiness
- BrightLocal API: https://www.brightlocal.com/api-documentation/

---

## Next Steps

1. Review and approve this plan
2. Create `src/lib/geo/types.ts` with comprehensive type definitions
3. Implement `local-seo-analyzer.ts` for NAP and citation analysis
4. Set up Google My Business API credentials
5. Implement `google-business-client.ts` for GBP integration
6. Build ranking predictor with local pack algorithm
7. Create GEO Dashboard UI
8. Test with real business data
9. Document API endpoints and usage examples
10. Deploy and monitor performance

---

**Estimated Implementation Time**: 2-3 weeks for full implementation
**Priority**: High (directly impacts local business visibility)
**Complexity**: High (multiple API integrations, complex algorithms)
