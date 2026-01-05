# .claude/ Architecture - Unite-Group AI

## Overview

This folder contains the complete AI agent orchestration system for Unite-Group projects, implementing an Australian-first, truth-verified, SEO-dominant architecture.

## Structure

```
.claude/
├── agents/              # 19 specialized agents
│   ├── orchestrator/    # Master coordinator (routes all tasks)
│   ├── standards/       # Australian context & design guardian
│   ├── verification/    # Independent quality gatekeeper
│   ├── truth-finder/    # Fact verification & source validation
│   ├── seo-intelligence/# Search dominance strategy
│   ├── spec-builder/    # 6-phase requirements interview
│   ├── rank-tracker/    # 24/7 ranking monitoring
│   ├── env-wizard/      # Environment setup
│   └── [11 more...]     # Specialist agents
├── skills/ (root)       # 35+ reusable skills
│   ├── australian/      # en-AU context, regulations
│   ├── context/         # Orchestration, project knowledge
│   ├── design/          # Design system, foundation-first
│   ├── verification/    # Truth Finder, verification-first
│   ├── search-dominance/# SEO, Blue Ocean, GEO
│   ├── backend/         # FastAPI, LangGraph, agents
│   ├── frontend/        # Next.js, React, components
│   ├── database/        # Supabase, migrations
│   └── workflow/        # Feature development, bug fixing
├── hooks/               # 10 automatic triggers
│   ├── pre-response     # Load AU context (every response)
│   ├── pre-publish      # Truth verification (BLOCKING)
│   ├── pre-deploy       # E2E/security/Lighthouse (BLOCKING)
│   └── [7 more...]      # See hooks/ folder
├── data/                # Configuration data
│   ├── trusted-sources.yaml   # 4-tier source hierarchy
│   ├── design-tokens.json     # 2025-2026 aesthetic
│   └── verified-claims.json   # Claim cache
├── rules/               # Path-specific auto-loading (PRESERVED)
│   ├── backend/         # FastAPI, LangGraph patterns
│   ├── database/        # Supabase, migrations
│   ├── frontend/        # Next.js patterns
│   ├── development/     # Workflow conventions
│   └── skills/          # Orchestration rules
├── commands/            # Executable commands (PRESERVED)
│   ├── bootstrap.md     # Full foundation setup
│   ├── audit.md         # Architecture audit
│   ├── verify.md        # Foundation verification
│   ├── new-feature.md   # Feature scaffolding
│   └── fix-types.md     # Regenerate DB types
└── primers.backup/      # Original primers (backed up)
```

## Key Principles

### 1. Lean Router Pattern
- `CLAUDE.md` is max 54 lines (down from 159)
- Routes to agents, doesn't contain logic
- All context loaded on-demand from this folder

### 2. Agent-Skill Separation
- **Agents** = Specialists with responsibilities (19 total)
- **Skills** = Reusable procedures agents can use (35+ total)
- Multiple agents can use the same skill

### 3. Hook System
- Hooks fire automatically at trigger points
- Ensure consistency (AU context, design system)
- Enforce quality (verification, truth checking)
- 2 blocking hooks (pre-publish, pre-deploy)

### 4. Australian First
- All defaults are Australian (en-AU)
- Spelling, regulations, locations
- Never American unless explicitly requested
- Enforced by `pre-response` hook + `standards` agent

### 5. Truth First
- NO content publishes without verification
- All claims need sources
- Confidence scores on everything
- `pre-publish` hook BLOCKS unverified content

### 6. Modern Design (2025-2026)
- Bento grids, glassmorphism, micro-interactions
- NO Lucide icons (deprecated) - AI-generated only
- Soft colored shadows (NEVER pure black)
- Locked design tokens in `data/design-tokens.json`

## Orchestration Flow

```
1. User request arrives
   ↓
2. pre-response.hook fires (loads AU context)
   ↓
3. CLAUDE.md routes to domain (frontend/backend/database/seo/content)
   ↓
4. orchestrator agent analyzes task
   ↓
5. Orchestrator dispatches to specialist agent(s)
   ↓
6. Agent loads required skills
   ↓
7. Work executes with verification
   ↓
8. Appropriate post-hooks fire (post-code, post-verification, post-session)
   ↓
9. PROGRESS.md updated (if applicable)
```

## Agent System

### Priority Agents (8 - Full Implementation)

**orchestrator** (Priority 1)
- Master coordinator
- Routes tasks to specialists
- Manages multi-agent workflows
- Enforces verification (NO self-attestation)
- Preserves 605 lines of logic from ORCHESTRATOR_PRIMER.md

**standards** (Priority 1)
- Australian English (en-AU) enforcer
- Design system guardian (2025-2026 aesthetic)
- NO Lucide icons (blocks usage)
- Voice & tone validator

**verification** (Priority 1)
- Independent quality gatekeeper
- Evidence-based verification
- Honest failure reporting
- NO self-attestation enforcement
- Philosophy: Prove It Works, Root Cause First, One Fix at a Time

**truth-finder** (Priority 2)
- Fact verification before publication
- 4-tier source hierarchy (.gov.au = 100%, universities = 80-94%, industry = 60-79%, news = 40-59%)
- Confidence scoring (blocks <40%)
- Citation generation (marketing, blog, technical, legal)
- Integrates with `pre-publish` hook (BLOCKING)

**seo-intelligence** (Priority 2)
- Search market domination (Australia → NZ → Global)
- GEO optimization (AI search)
- Blue Ocean discovery
- Competitive gap analysis
- Australian market focus (Brisbane, Sydney, Melbourne)

**spec-builder** (Priority 3)
- 6-phase requirements interview
- Vision, Users, Technical, Design, Business, Implementation
- Links to FOUNDATION-FIRST philosophy

**env-wizard** (Priority 3)
- 5-step environment setup (Detect, Guide, Test, Write, Verify)
- API key validation
- Security rules (NEVER commit keys)

**rank-tracker** (Priority 3)
- 24/7 Australian SERP monitoring
- Competitor tracking
- Alert system (CRITICAL/WARNING/INFO)

### Specialist Agents (11 - Stubs for Future)
- frontend-specialist, backend-specialist, database-specialist
- test-engineer, deploy-guardian, docs-writer
- code-reviewer, refactor-specialist, bug-hunter
- performance-optimizer, security-auditor

## Hook System

### Blocking Hooks (2)
**pre-publish.hook** - BLOCKS content without Truth Finder verification (confidence <75%)
**pre-deploy.hook** - BLOCKS deployment without E2E/Lighthouse/security passing

### Non-Blocking Hooks (8)
- **pre-response** - Loads AU context every response
- **post-code** - Type check, lint after code generation
- **pre-commit** - Verification before git commit
- **post-skill-load** - Load dependent skills
- **pre-agent-dispatch** - Context partitioning
- **post-verification** - Evidence collection
- **pre-seo-task** - Load AU market context
- **post-session** - Update PROGRESS.md

## Australian Context System

### Enforced Defaults
- **Language**: en-AU (colour, organisation, licence, centre)
- **Currency**: AUD ($1,234.56, GST 10%)
- **Date**: DD/MM/YYYY
- **Phone**: 04XX XXX XXX (mobile), (0X) XXXX XXXX (landline)
- **Address**: Street, Suburb STATE POSTCODE
- **States**: QLD, NSW, VIC, SA, WA, TAS, NT, ACT

### Regulations
- Privacy Act 1988
- WCAG 2.1 AA
- National Construction Code (NCC)
- Australian Standards (AS/NZS)
- Work Health and Safety Act 2011

### Default Locations
1. Brisbane, QLD (primary)
2. Sydney, NSW
3. Melbourne, VIC

## Truth Finder System

### 4-Tier Source Hierarchy

**Tier 1 (95-100%)**: Government (.gov.au), Courts, Standards (AS/NZS), Peer-reviewed
**Tier 2 (80-94%)**: Industry bodies, Universities (.edu.au), Professional bodies
**Tier 3 (60-79%)**: TED Talks (verified), Industry publications, Manufacturer docs
**Tier 4 (40-59%)**: News media (ABC), Wikipedia (leads only)

**NEVER USE**: AI-generated without verification, unattributed statistics, social media rumors

### Confidence Scoring
```
Base Score = Source Tier Score
+ Multiple sources: +10% per source (max +30%)
+ Primary source: +15%
+ Recent data (<1 year): +10%
+ Peer-reviewed: +15%
+ Expert author: +10%
- Single source: -20%
- Outdated (>3 years): -15% to -30%
- Known bias: -25%
- Contradicting sources: -15%
- Unverifiable: -50%
```

### Publishing Thresholds
- **95%+**: Publish with "Verified" badge
- **80-94%**: Publish with standard citations
- **60-79%**: Publish with disclaimer
- **40-59%**: Human review required
- **<40%**: DO NOT PUBLISH (pre-publish hook BLOCKS)

## SEO Intelligence System

### Mission
Complete search market dominance. TAKEOVER is the only acceptable outcome.

### GEO Optimization (Generative Engine Optimization)
- Question-answer format (direct answers first)
- Clear definitions (quotable)
- Structured data (tables, lists, schema)
- FAQ & HowTo schema
- E-E-A-T signals (Expertise, Authority, Trust)

### Blue Ocean Discovery
Heat signature scanning:
- Adjacent problems (what do people search before/after?)
- Question mining (Reddit, Quora, PAA)
- Emerging trends (Google Trends)
- Underserved segments (strata, property managers)
- Format gaps (video where others do text)

Opportunity scoring: `(Volume × Growth × Gap) / Competition`
- 80+: IMMEDIATE ACTION
- 60-79: HIGH PRIORITY
- 40-59: QUEUE
- <40: MONITOR

### Territory Expansion
1. Brisbane Metro, Ipswich, Logan, Gold Coast
2. Queensland (Sunshine Coast, Toowoomba, regional)
3. Eastern Seaboard (Sydney, Melbourne, Newcastle)
4. National (Adelaide, Perth, Hobart, Darwin)
5. Trans-Tasman (NZ)
6. Global (Japan, UK, Europe, Americas)

## Design System (2025-2026)

### Locked Values (Cannot Deviate)
- **Primary Color**: #0D9488 (teal)
- **Fonts**: Inter (sans), Cal Sans (heading), JetBrains Mono (mono)
- **Spacing**: 8px base, 0.25rem unit
- **Border Radius**: 6px (sm), 8px (md), 12px (lg), 16px (xl), 24px (2xl)
- **Shadows**: Soft colored (NEVER pure black) - rgba(13, 148, 136, 0.1)

### Aesthetic Requirements
- Bento grids (modular, varying card sizes)
- Glassmorphism (frosted glass, backdrop blur)
- Micro-interactions (hover states, transitions)
- Generous whitespace

### Forbidden
- Flat gray boxes
- Generic Lucide icons (deprecated)
- Pure black shadows
- Bootstrap aesthetic
- Static, lifeless UI

## Preserved Strengths

### .claude/rules/ (Path-Specific Auto-Loading)
Auto-loads based on files being worked on:
- `apps/web/**/*.{ts,tsx}` → frontend/nextjs.md
- `apps/backend/src/**/*.py` → backend/fastapi-agents.md
- `supabase/**/*.sql` → database/supabase-migrations.md

### .claude/commands/ (Executable Commands)
- **bootstrap**: Full foundation setup (run ONCE on new project)
- **audit**: Architecture audit workflow
- **verify**: Foundation verification
- **new-feature**: Feature scaffolding
- **fix-types**: Regenerate DB types

### .claude/settings.json (Configuration System)
- Permission management
- Command definitions
- Model selection

## Quick Commands

### Load an Agent
```
See .claude/agents/[agent-name]/agent.md
```

### Load a Skill
```
See skills/[category]/[skill-name].skill.md
```

### Check a Hook
```
See .claude/hooks/[hook-name].hook.md
```

### View Progress
```
See PROGRESS.md in project root
```

## Memory Hierarchy

1. Enterprise Policy (org-wide)
2. Project Memory (.claude/README.md - this file)
3. Path-Specific Rules (.claude/rules/)
4. User Memory (~/.claude/CLAUDE.md)
5. Project Local (./CLAUDE.local.md)

Higher levels override lower levels.

## Success Metrics

- **Architecture**: 6 primers → 19 agents (8 full, 11 stubs)
- **CLAUDE.md**: 159 → 54 lines (66% reduction)
- **Skills**: 27 → 35+ with .skill.md extension
- **Hooks**: 10 created (2 blocking)
- **Australian Context**: Enforced everywhere
- **Truth Finder**: 4-tier sources, confidence scoring
- **SEO**: Australian market domination strategy

---

🦘 **Australian-first. Truth-first. SEO-dominant.**

For implementation details, see individual agent/skill/hook files.
