# CLAUDE.md - Unite-Group AI Architecture

> **Australian-First Monorepo**: Next.js 15 + FastAPI/LangGraph + Supabase

## Quick Routing

**Frontend**: React/Next.js/Tailwind → `.claude/agents/frontend-specialist/`
**Backend**: FastAPI/LangGraph/Agents → `.claude/agents/backend-specialist/`
**Database**: Supabase/Migrations/RLS → `.claude/agents/database-specialist/`
**SEO**: Search dominance/GEO → `.claude/agents/seo-intelligence/`
**Content**: Truth verification → `.claude/agents/truth-finder/`

## Context Loading

**Rules**: `.claude/rules/` auto-load based on file paths
**Agents**: `.claude/agents/` loaded on-demand by orchestrator
**Skills**: `skills/` loaded by agent type
**Hooks**: `.claude/hooks/` triggered automatically
**Data**: `.claude/data/` for trusted sources, design tokens

## Australian Defaults (en-AU)

**Language**: Australian English ALWAYS (unless explicit override)
**Currency**: AUD ($)
**Date**: DD/MM/YYYY
**Regulations**: Privacy Act 1988, WCAG 2.1 AA, AU standards

## Modern Design (2025-2026)

**Aesthetic**: Bento grids, glassmorphism, micro-interactions
**Icons**: AI-generated custom (NO Lucide - deprecated)
**Tokens**: Locked in `.claude/data/design-tokens.json`

## Commands

`pnpm dev` - All services
`pnpm turbo run type-check lint test` - Pre-commit validation
`.claude/commands/` - bootstrap, audit, verify, new-feature, fix-types

## Orchestration

**Entry**: `.claude/agents/orchestrator/` routes to specialists
**Verification**: Independent, evidence-based, no self-attestation
**Progress**: `PROGRESS.md` dashboard

## Truth-First Publishing

**NO** content without verification
**Sources**: 4-tier hierarchy (`.claude/data/trusted-sources.yaml`)
**Confidence**: Explicit scoring, citations required

---

See `.claude/README.md` for complete architecture documentation.
