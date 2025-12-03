# Copywriting & Business Consistency Framework Implementation Plan

**Generated:** 2025-12-03
**Status:** PENDING APPROVAL

---

## Executive Summary

This plan implements two interconnected systems as permanent structures within the SaaS project:

1. **Research-Driven Copywriting System** - Audience research, competitor analysis, and conversion-focused copy generation using real customer language
2. **Business Consistency Framework** - NAP consistency, citation management, schema markup, and GEO optimization for AI search visibility

Both systems follow established codebase patterns: compact skills (80-100 lines) + detailed scaffolds (YAML/templates).

---

## Part 1: Copywriting Framework

### 1.1 Core Concept (From User Prompts)

**Prompt 1 - Audience Research:**
- Find exact customer words from message boards, reviews, forums
- Capture: Pain points, Symptoms, Dream outcomes, Failed solutions, Buying decisions
- Use actual quotes, not summaries
- Highlight patterns that appear 3+ times = GOLD

**Prompt 2 - Competitor Analysis:**
- Analyze top companies nationwide (not just local)
- Document page-by-page: Homepage, About, Services, Contact
- List sections and their order
- Identify unique features to potentially add

**Prompt 3 - Copy Generation:**
- Follow conversion structures: Hero, Problem, Value Props, Proof, Process, FAQ, CTA
- Weave customer quotes naturally (never as literal quotes)
- Ultra-clear, conversational, human tone
- No jargon, clichés, unverified claims
- Output only final copy, no explanations

### 1.2 Skill File: `skills/marketing/COPYWRITING.md`

```markdown
---
name: research-driven-copywriting
version: "1.0"
priority: 2
triggers:
  - copywriting
  - website copy
  - landing page
  - conversion copy
  - audience research
  - customer research
  - competitor analysis
  - pain points
  - value proposition
  - hero section
  - CTA
  - voice of customer
  - VOC
---

# Research-Driven Copywriting

Real customer words > Marketing speak. Write like a human, not a corporation.

## The 3-Phase System

| Phase | Focus | Output |
|-------|-------|--------|
| 1 | Audience Research | Exact customer quotes by category |
| 2 | Competitor Analysis | Proven page structures |
| 3 | Copy Generation | Conversion-focused pages |

## Voice of Customer Categories

| Category | What to Capture | Gold If |
|----------|-----------------|---------|
| Pain Points | Problems, frustrations | 3+ mentions |
| Symptoms | Day-to-day manifestations | Vivid details |
| Dream Outcomes | What they want most | Emotional |
| Failed Solutions | What didn't work | Specific |
| Buying Decisions | How they decide | Triggers |

## Page Structure (Conversion Pattern)

1. **Hero** - Dream outcome headline, pain point subhead
2. **Problem** - Show you understand (use their words)
3. **Value Props** - 3-5 benefits with "because"
4. **Social Proof** - Video testimonials > Written
5. **Process** - 3-5 simple steps (their experience)
6. **FAQ** - Real objections from research
7. **CTA** - Clear next action

## Copy Rules

**DO:**
- Use customer's exact words
- Write like talking to a friend
- Short sentences, short paragraphs
- Verified claims only

**DON'T:**
- Industry jargon
- Corporate phrasing
- Clichés (solutions, leverage, synergy)
- Made-up stats
- AI-sounding language

## Research Sources

| Source | Type | Value |
|--------|------|-------|
| Reddit subreddits | Forums | Raw frustrations |
| Google Reviews | Reviews | Decision language |
| Facebook Groups | Community | Casual complaints |
| Industry Forums | Niche | Technical issues |

## Pattern Detection

- **3+ mentions** = Use in headlines
- **5+ mentions** = Core messaging pillar
- **Emotional adjectives** = Voice/tone guide

See: `.copywriting/`, `research/`, `competitor/`, `copy/`
```

### 1.3 Scaffold: `.copywriting/`

```
.copywriting/
├── MASTER-INDEX.yaml
├── README.md
├── research/
│   ├── audience-research.yaml      # VOC framework
│   ├── data-sources.yaml           # Where to find quotes
│   └── quote-collection.yaml       # How to capture
├── competitor/
│   ├── analysis-framework.yaml     # Page-by-page
│   ├── page-sections.yaml          # What sections work
│   └── unique-features.yaml        # Standout elements
├── copy/
│   ├── conversion-structures.yaml  # Proven layouts
│   ├── section-formulas.yaml       # Hero, Problem, etc.
│   ├── voice-tone.yaml             # Clear, conversational
│   └── anti-patterns.yaml          # What to avoid
├── pages/
│   ├── homepage.yaml
│   ├── services.yaml
│   ├── about.yaml
│   └── contact.yaml
├── _templates/
│   ├── audience-research.template.yaml
│   ├── competitor-analysis.template.yaml
│   └── page-copy.template.yaml
└── validation/
    └── copy-validator.ts
```

---

## Part 2: Business Consistency Framework

### 2.1 Core Concept (From User JSON)

**Why Consistency Matters:**
- Businesses with consistent NAP are 40% more likely to appear in local pack
- Google Business Profile = 32% of local pack ranking
- AI systems (ChatGPT, Perplexity, Gemini) pull from multiple sources
- One minor variation can split citation equity

**Key Elements:**
- Tier 1 Critical: Business name, address, phone (EXACTLY identical everywhere)
- Tier 2 Essential: Website URL, email, hours, categories
- Tier 3 Important: Description, service areas, payment methods, social links
- Tier 4 Australia-Specific: ABN, ACN, license numbers

### 2.2 Skill File: `skills/marketing/BUSINESS-CONSISTENCY.md`

```markdown
---
name: business-consistency-framework
version: "1.0"
priority: 2
triggers:
  - NAP consistency
  - business listings
  - local SEO
  - GEO optimization
  - citation building
  - Google Business Profile
  - schema markup
  - directory listings
  - AI search optimization
  - Bing Places
  - Apple Maps
---

# Business Consistency Framework

Consistent NAP = 40% more likely to appear in local pack. One variation = split equity.

## Local Pack Ranking Factors

| Factor | Weight | Action |
|--------|--------|--------|
| GBP Signals | 32% | Optimize Google Business Profile |
| On-Page | 19% | NAP on website matches GBP |
| Reviews | 16% | Quantity, velocity, response |
| Links | 11% | Local backlinks |
| Citations | 8% | NAP consistency |

## NAP Consistency Tiers

| Tier | Elements | Rule |
|------|----------|------|
| 1 Critical | Name, Address, Phone | EXACTLY identical everywhere |
| 2 Essential | URL, Email, Hours, Category | Consistent format |
| 3 Important | Description, Service Areas, Social | Align messaging |
| 4 Australia | ABN, ACN, Licenses | Include where required |

## Platform Priority

| Tier | Platforms | Priority |
|------|-----------|----------|
| 1 | GBP, Bing, Apple Maps, Facebook | MANDATORY |
| 2 | Yellow Pages, True Local, Yelp | HIGH (Australia) |
| 3 | LinkedIn, Instagram, YouTube | MEDIUM |
| 4 | StartLocal, dLook, WOMO | BUILD OUT |
| 5 | Oneflare, hipages (trades) | INDUSTRY |

## Common Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Adding keywords to name | Suspension risk | Legal name only |
| Different phone formats | Split citations | One format everywhere |
| St vs Street | Different entities | Pick one, stick to it |
| Missing Pty Ltd | Inconsistency | Include or exclude consistently |

## Schema Markup (JSON-LD)

Required: @type, name, address, telephone, url
Recommended: geo, openingHours, sameAs, areaServed

## GEO (AI Search) Notes

- AI pulls from multiple sources - consistency critical
- Schema helps AI understand your business
- Entity consistency = better AI recognition
- Voice assistants rely on citation data

See: `.business-consistency/`, `nap/`, `platforms/`, `schema/`, `geo/`
```

### 2.3 Scaffold: `.business-consistency/`

```
.business-consistency/
├── MASTER-INDEX.yaml
├── README.md
├── nap/
│   ├── consistency-rules.yaml      # Tier 1-4 elements
│   ├── format-standards.yaml       # Exact formats (AU)
│   └── common-mistakes.yaml        # Anti-patterns
├── platforms/
│   ├── tier-1-mandatory.yaml       # GBP, Bing, Apple, FB
│   ├── tier-2-australia.yaml       # Yellow Pages, True Local
│   ├── tier-3-social.yaml          # LinkedIn, Instagram, YouTube
│   ├── tier-4-directories.yaml     # StartLocal, dLook, etc.
│   └── tier-5-industry.yaml        # Oneflare, hipages
├── schema/
│   ├── localbusiness-schema.yaml   # Required + recommended
│   ├── organization-schema.yaml    # Brand entity
│   └── examples/
│       ├── plumber.json
│       ├── electrician.json
│       └── general-trade.json
├── geo/
│   ├── ai-optimization.yaml        # ChatGPT, Perplexity, Gemini
│   ├── entity-consistency.yaml     # AI entity recognition
│   └── content-structure.yaml      # AI-parseable content
├── audit/
│   ├── checklist.yaml              # Phase 1-4 audit
│   ├── monitoring-schedule.yaml    # Weekly/monthly/quarterly
│   └── success-metrics.yaml        # What to measure
├── master-document/
│   └── consistency-template.yaml   # Single source of truth
├── implementation/
│   ├── week-1-foundation.yaml
│   ├── week-2-expansion.yaml
│   └── ongoing-maintenance.yaml
└── _templates/
    ├── business-profile.template.yaml
    ├── platform-listing.template.yaml
    └── audit-report.template.yaml
```

---

## Part 3: Database Schema

### 3.1 New Migration: `00000000000005_copywriting_consistency.sql`

```sql
-- ============================================================================
-- Business Core Data (Single Source of Truth for NAP)
-- ============================================================================

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tier 1 Critical (must be identical everywhere)
  legal_name TEXT NOT NULL,
  trading_name TEXT,
  street_address TEXT NOT NULL,
  suburb TEXT NOT NULL,
  state TEXT NOT NULL,
  postcode TEXT NOT NULL,
  country TEXT DEFAULT 'Australia',
  primary_phone TEXT NOT NULL,
  phone_format TEXT,

  -- Tier 2 Essential
  website_url TEXT,
  primary_email TEXT,
  business_hours JSONB,
  primary_category TEXT,
  secondary_categories TEXT[],

  -- Tier 3 Important
  short_description TEXT,    -- 50 words
  medium_description TEXT,   -- 100 words
  long_description TEXT,     -- 250 words
  service_areas TEXT[],
  payment_methods TEXT[],

  -- Australia Specific (Tier 4)
  abn TEXT,
  acn TEXT,
  license_numbers JSONB,

  -- Geo Coordinates
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Platform Listings
-- ============================================================================

CREATE TABLE platform_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL,
  platform_tier INTEGER NOT NULL,
  listing_url TEXT,
  listing_status TEXT CHECK (listing_status IN (
    'not_started', 'pending', 'claimed', 'verified', 'needs_update'
  )),
  name_matches BOOLEAN,
  address_matches BOOLEAN,
  phone_matches BOOLEAN,
  last_verified_at TIMESTAMPTZ,
  issues JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Consistency Audits
-- ============================================================================

CREATE TABLE consistency_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  audit_type TEXT CHECK (audit_type IN ('full', 'nap_only', 'schema_only', 'platform_check')),
  overall_score INTEGER,
  platforms_checked INTEGER,
  platforms_consistent INTEGER,
  issues JSONB,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Audience Research (Voice of Customer)
-- ============================================================================

CREATE TABLE audience_research (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  research_source TEXT NOT NULL,
  source_url TEXT,
  category TEXT CHECK (category IN (
    'pain_point', 'symptom', 'dream_outcome', 'failed_solution', 'buying_decision'
  )),
  quote TEXT NOT NULL,
  context TEXT,
  frequency INTEGER DEFAULT 1,
  tags TEXT[],
  is_gold BOOLEAN DEFAULT FALSE,      -- 3+ mentions
  is_critical BOOLEAN DEFAULT FALSE,  -- 5+ mentions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Competitor Analysis
-- ============================================================================

CREATE TABLE competitor_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  competitor_url TEXT NOT NULL,
  page_type TEXT CHECK (page_type IN ('homepage', 'about', 'services', 'contact', 'other')),
  sections JSONB,
  unique_features JSONB,
  notes TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Content Pieces (Generated Copy)
-- ============================================================================

CREATE TABLE content_pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  content_type TEXT CHECK (content_type IN (
    'homepage', 'about', 'services', 'contact',
    'hero', 'problem', 'value_props', 'social_proof',
    'process', 'faq', 'cta', 'custom'
  )),
  title TEXT,
  content TEXT NOT NULL,
  quotes_used TEXT[],
  verified_claims JSONB,
  status TEXT CHECK (status IN ('draft', 'review', 'approved', 'published')) DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Brand Guidelines
-- ============================================================================

CREATE TABLE brand_guidelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  voice_tone TEXT,
  tone_descriptors TEXT[],
  words_to_use TEXT[],
  words_to_avoid TEXT[],
  value_propositions JSONB,
  target_audience TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Row Level Security + Indexes
-- ============================================================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consistency_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own businesses" ON businesses FOR ALL USING (auth.uid() = user_id);
-- ... policies for all tables

CREATE INDEX idx_businesses_user ON businesses(user_id);
CREATE INDEX idx_audience_research_category ON audience_research(category);
CREATE INDEX idx_audience_research_frequency ON audience_research(frequency DESC);
CREATE INDEX idx_content_pieces_type ON content_pieces(content_type);
```

---

## Part 4: Backend Agents

### 4.1 CopywritingAgent

**File:** `apps/backend/src/agents/copywriting_agent.py`

```python
class CopywritingAgent(BaseAgent):
    """Agent for copywriting research and generation."""

    def __init__(self) -> None:
        super().__init__(
            name="copywriting",
            capabilities=[
                "copywriting", "audience research", "customer research",
                "competitor analysis", "landing page", "website copy",
                "conversion copy", "value proposition", "hero section",
                "VOC", "pain points"
            ],
        )
```

### 4.2 BusinessConsistencyAgent

**File:** `apps/backend/src/agents/consistency_agent.py`

```python
class BusinessConsistencyAgent(BaseAgent):
    """Agent for NAP consistency and citation management."""

    def __init__(self) -> None:
        super().__init__(
            name="consistency",
            capabilities=[
                "NAP consistency", "business listings", "local SEO",
                "GEO optimization", "citation", "Google Business Profile",
                "schema markup", "directory listings", "Bing Places"
            ],
        )
```

---

## Part 5: New Tools

### 5.1 Copywriting Tools

| Tool | Purpose |
|------|---------|
| `copywriting.research_audience` | Research pain points from real sources |
| `copywriting.analyze_competitor` | Page-by-page competitor analysis |
| `copywriting.generate_copy` | Generate conversion copy from research |
| `copywriting.validate_copy` | Check for jargon, clichés, unverified claims |

### 5.2 Consistency Tools

| Tool | Purpose |
|------|---------|
| `consistency.audit_nap` | Audit NAP across platforms |
| `consistency.generate_schema` | Generate JSON-LD schema |
| `consistency.check_platform` | Verify specific platform listing |
| `consistency.export_master` | Export consistency master document |

---

## Part 6: Frontend Pages

### 6.1 Business Management

```
apps/web/app/(dashboard)/business/
├── page.tsx              # Business profile (single source of truth)
├── listings/page.tsx     # Platform listings dashboard
└── audit/page.tsx        # Consistency audit results
```

### 6.2 Copywriting Workflow

```
apps/web/app/(dashboard)/copywriting/
├── page.tsx              # Dashboard
├── research/page.tsx     # Audience research
├── competitors/page.tsx  # Competitor analysis
└── generate/page.tsx     # Copy generation
```

---

## Part 7: Integration Points

### 7.1 Foundation-First Integration

- Copy targets specific journey stages
- Pain points align with persona frustrations
- CTAs match journey next steps
- Psychology principles (Cialdini) inform copy placement

### 7.2 Visual Content Integration

- Hero images support hero copy claims
- Testimonial videos near social proof sections
- Before/after photos with problem/solution copy
- Real photos (Tier 1) support authenticity claims

### 7.3 Cross-System Integration

- Schema markup uses business consistency data
- Copy claims verified against master business document
- GEO optimization supports copy discoverability

---

## Implementation Phases

### Phase 1: Scaffolds & Skills (No code changes)

| Step | Action |
|------|--------|
| 1 | Create `.copywriting/` scaffold (~15 files) |
| 2 | Create `.business-consistency/` scaffold (~20 files) |
| 3 | Create `skills/marketing/COPYWRITING.md` |
| 4 | Create `skills/marketing/BUSINESS-CONSISTENCY.md` |

### Phase 2: Database

| Step | Action |
|------|--------|
| 5 | Create migration `00000000000005_copywriting_consistency.sql` |
| 6 | Apply migration |

### Phase 3: Backend

| Step | Action |
|------|--------|
| 7 | Create `CopywritingAgent` |
| 8 | Create `BusinessConsistencyAgent` |
| 9 | Register agents in registry |
| 10 | Create copywriting tools |
| 11 | Create consistency tools |
| 12 | Register tools |

### Phase 4: Frontend

| Step | Action |
|------|--------|
| 13 | Create business profile pages |
| 14 | Create copywriting dashboard |
| 15 | Create components |

### Phase 5: Validation

| Step | Action |
|------|--------|
| 16 | Create validation scripts |
| 17 | Test workflows |
| 18 | Integration testing |

---

## Files to Create

| Category | Count | Examples |
|----------|-------|----------|
| Skills | 2 | `COPYWRITING.md`, `BUSINESS-CONSISTENCY.md` |
| Copywriting Scaffold | ~15 | YAML files, templates |
| Consistency Scaffold | ~20 | YAML files, templates, examples |
| Database | 1 | Migration SQL |
| Backend Agents | 2 | Python agent classes |
| Backend Tools | 2 | Python tool modules |
| Frontend Pages | ~8 | TSX pages |
| Frontend Components | ~10 | TSX components |

**Total: ~60 new files**

---

## Success Criteria

### Copywriting System
- [ ] Can capture real customer quotes with categorization
- [ ] Can analyze competitor pages systematically
- [ ] Generates copy that uses customer language naturally
- [ ] No jargon, clichés, or unverified claims in output
- [ ] Copy follows proven conversion structures

### Business Consistency System
- [ ] Single source of truth for business data
- [ ] Can track listings across 20+ platforms
- [ ] Generates valid LocalBusiness schema
- [ ] Audit identifies inconsistencies automatically
- [ ] 40% improvement in local pack visibility

### Integration
- [ ] Copy aligns with journey stages
- [ ] Visual content supports copy claims
- [ ] Schema validates against consistency data

---

## Status: AWAITING APPROVAL

Ready to implement upon user confirmation.
