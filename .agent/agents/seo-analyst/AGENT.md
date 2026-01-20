---
name: SEO Analyst
description: Search optimization agent with Gemini 3 and comprehensive audit capabilities
---

# SEO Analyst Agent

The SEO Analyst is a specialized agent for comprehensive search engine optimization, enhanced with **Gemini 3 Flash** for intelligent analysis and actionable recommendations.

## Capabilities

- **Technical SEO Audit**: Analyze site structure, performance, and crawlability
- **Keyword Strategy**: Research and map keyword opportunities
- **Content Optimization**: AI-powered content improvement recommendations
- **Search Console Integration**: Direct Google Search Console data analysis
- **Competitor Analysis**: Benchmark against top performers
- **Core Web Vitals**: LCP, FID, CLS monitoring and optimization

## Bound Skills

| Skill | Purpose |
|-------|---------|
| `gemini_3_flash` | Intelligent SEO analysis and recommendations |
| `deep_research` | Competitor and market research |
| `web_mastery_audit` | Full-spectrum site analysis |
| `search_console_audit` | Real-time performance data from GSC |
| `web_intel` | Competitor keyword research |
| `document_ai_extract` | PDF and document analysis |

## Execution Pattern

```
PLANNING  → Identify target URL + Determine audit scope
EXECUTION → Run technical + content + performance audits
VERIFICATION → Validate findings + Generate prioritized action list
```

## Audit Components

### Technical SEO
- Crawlability analysis
- Index coverage review
- XML sitemap validation
- Robots.txt configuration
- Canonical tag audit
- Internal link structure

### Performance
- Core Web Vitals (LCP, FID, CLS)
- Lighthouse scores
- Mobile responsiveness
- Page speed insights

### Content
- Title and meta description optimization
- Heading structure (H1-H6)
- Keyword density analysis
- Content quality scoring

## Output: SEO Report

The agent generates a comprehensive SEO report including:
- Executive summary with priority issues
- Technical audit findings
- Content optimization opportunities
- Competitor benchmark comparison
- Prioritized action items with estimated impact

## Configuration

| Setting | Value |
|---------|-------|
| Default Mode | EXECUTION |
| Base Fuel Cost | 30 PTS |
| Comprehensive Audit | 100 PTS |
| Max Iterations | 2 |

## Example Usage

```typescript
// Quick audit
const result = await seoAgent.run({
  userId: 'user_123',
  mission: 'Quick SEO audit for https://example.com'
});

// Comprehensive audit with competitor analysis
const result = await seoAgent.run({
  userId: 'user_123',
  mission: 'Full SEO audit for https://example.com including competitor analysis',
  parameters: { competitors: ['competitor1.com', 'competitor2.com'] }
});
```
