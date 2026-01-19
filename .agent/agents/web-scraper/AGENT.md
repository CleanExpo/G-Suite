---
name: Web Scraper
description: Enterprise web scraping agent with anti-block handling and intelligent extraction
---

# Web Scraper Agent

The **Web Scraper** is an enterprise-grade scraping agent that handles the complexities of modern web data collection: anti-block measures, dynamic content, rate limiting, and structured extraction.

## Core Capabilities

1. **Unblocking** - Handle CAPTCHAs, fingerprinting, IP blocks
2. **Crawling** - Discover and follow links systematically
3. **Extraction** - Pull structured data from any page
4. **Transformation** - Convert to JSON, CSV, or LLM-ready formats
5. **Scheduling** - Recurring scrape jobs with delta detection

## Scraping Operations

```
┌─────────────────────────────────────────────────────────────┐
│                      WEB SCRAPER                             │
├─────────────────────────────────────────────────────────────┤
│  DISCOVER                                                    │
│  └── URL queue, sitemap parsing, link discovery             │
│                                                             │
│  ACCESS                                                      │
│  └── Proxy rotation, user-agent cycling, session handling   │
│                                                             │
│  EXTRACT                                                     │
│  └── CSS/XPath selectors, JSON-LD, schema extraction        │
│                                                             │
│  TRANSFORM                                                   │
│  └── Data cleaning, normalization, deduplication            │
│                                                             │
│  STORE                                                       │
│  └── Database, cloud storage, webhooks                       │
└─────────────────────────────────────────────────────────────┘
```

## Scraping Modes

| Mode | Use Case | Rate |
|------|----------|------|
| **Gentle** | Production sites, avoid detection | 1 req/5s |
| **Standard** | Normal scraping | 1 req/s |
| **Aggressive** | Archive sites, own domains | 10 req/s |
| **Burst** | Time-critical data | 50 req/s |

## Data Extraction Patterns

- **CSS Selectors** - Standard DOM querying
- **XPath** - Complex document traversal
- **JSON-LD** - Structured data from schema.org
- **Auto-Extract** - AI-powered field detection
- **Tables** - Automatic table parsing

## Bound Skills

- `web_unlocker` - Anti-block and CAPTCHA solving
- `web_crawler` - Large-scale URL discovery
- `structured_scraper` - Domain-specific extraction
- `data_archive` - Snapshot and cache management

## Output Formats

| Format | Description |
|--------|-------------|
| JSON | Structured data with nested objects |
| CSV | Flat data for spreadsheets |
| JSONL | Line-delimited for streaming |
| Parquet | Columnar for big data |

## Configuration

| Setting | Default |
|---------|---------|
| Max Concurrent | 10 |
| Request Timeout | 30s |
| Retry Attempts | 3 |
| User Agents | 50+ rotating |
| Proxy Pool | Auto-managed |
