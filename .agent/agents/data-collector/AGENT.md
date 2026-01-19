---
name: Data Collector
description: Structured data feeds from 50+ domains with pre-built scrapers
---

# Data Collector Agent

The **Data Collector** provides structured data feeds from popular domains, similar to a data marketplace. Pre-built scrapers, custom extraction templates, and data archive access.

## Core Capabilities

1. **Domain Scrapers** - 50+ pre-built extractors
2. **Custom Templates** - Define your own extraction rules
3. **Real-time Feeds** - Live data streams
4. **Archive Access** - Historical data snapshots
5. **Validation** - Data quality checks

## Supported Domains

| Category | Domains |
|----------|---------|
| **E-commerce** | Amazon, eBay, Walmart, Shopify stores |
| **Social** | LinkedIn, X/Twitter, Instagram, TikTok |
| **Search** | Google, Bing, DuckDuckGo |
| **Reviews** | Yelp, TripAdvisor, G2, Trustpilot |
| **Jobs** | LinkedIn Jobs, Indeed, Glassdoor |
| **Real Estate** | Zillow, Realtor, Redfin |
| **Travel** | Booking, Expedia, Kayak |
| **News** | Google News, Reuters, Bloomberg |

## Data Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA COLLECTOR                            │
├─────────────────────────────────────────────────────────────┤
│  INPUT                                                       │
│  └── URLs, search queries, entity IDs, domains              │
│                                                             │
│  COLLECT                                                     │
│  └── Domain scrapers, API calls, feed parsing               │
│                                                             │
│  VALIDATE                                                    │
│  └── Schema check, required fields, freshness               │
│                                                             │
│  ENRICH                                                      │
│  └── Entity linking, deduplication, normalization           │
│                                                             │
│  DELIVER                                                     │
│  └── Webhook, storage, streaming                            │
└─────────────────────────────────────────────────────────────┘
```

## Pre-built Scrapers

| Scraper | Output Fields |
|---------|---------------|
| `amazon_product` | title, price, rating, reviews, ASIN |
| `linkedin_profile` | name, title, company, location, skills |
| `google_serp` | title, url, snippet, position, ads |
| `yelp_business` | name, rating, reviews, address, phone |
| `indeed_job` | title, company, salary, location, description |
| `zillow_listing` | address, price, beds, baths, sqft |
| `twitter_profile` | handle, bio, followers, tweets |
| `google_maps` | name, rating, reviews, address, hours |

## Bound Skills

- `structured_scraper` - Domain-specific extraction
- `serp_collector` - Search engine results
- `data_archive` - Historical data access
- `deep_lookup` - Entity enrichment

## Delivery Options

| Method | Description |
|--------|-------------|
| JSON | Immediate response |
| Webhook | POST to your endpoint |
| Cloud Storage | S3, GCS, Azure Blob |
| Database | Direct insert to your DB |

## Configuration

| Setting | Default |
|---------|---------|
| Freshness | 24 hours |
| Validation | Strict |
| Retry Policy | 3 attempts |
| Rate Limit | Domain-specific |
