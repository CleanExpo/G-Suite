# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Monorepo: Next.js 15 frontend + FastAPI/LangGraph backend + Supabase. Dual orchestration via SKILL.md files and Python agents.

## Commands

```bash
pnpm dev                          # All services
pnpm dev --filter=web             # Frontend
cd apps/backend && uv run uvicorn src.api.main:app --reload  # Backend
pnpm turbo run test               # All tests
cd apps/backend && uv run pytest -k "name"  # Single Python test
pnpm turbo run type-check lint    # Checks
supabase db push                  # Apply migrations
```

## Architecture

| Layer | Path | Stack |
|-------|------|-------|
| Frontend | `apps/web/` | Next.js 15, React 19, Tailwind v4, shadcn/ui |
| Backend | `apps/backend/src/` | FastAPI, LangGraph, Pydantic |
| Database | `supabase/` | PostgreSQL, pgvector, RLS |

**Backend modules:** `agents/` (orchestrator, long_running/, base_agent), `tools/` (registry, search, programmatic), `verification/`, `graphs/`, `skills/`

## Key Systems

- **Orchestrator** (`agents/orchestrator.py`): Routes tasks, enforces independent verification, integrates tool use + long-running harness
- **Advanced Tools** (`tools/`): Tool Search (85% context reduction), Programmatic Calling, defer_loading
- **Long-Running** (`agents/long_running/`): InitializerAgent + CodingAgent for multi-session work via `claude-progress.txt` and `feature_list.json`
- **Verification** (`verification/`): No self-attestation, evidence collection, human escalation

## Rules

**Frontend layers:** Components → Hooks → API Routes → Services → Repositories → DB. No cross-imports. Explicit return types. No `any`.

**Patterns:** API routes use try/catch + validate + service. Components handle loading/error/empty states.

**Naming:** React `PascalCase.tsx`, utils `kebab-case.ts`, Python `snake_case.py`, skills `SCREAMING-KEBAB.md`

**Python:** Type hints, Pydantic, async/await, PEP 8

## Skills

`/skills/*.md` define agent behaviors with YAML frontmatter (name, triggers, priority). Key: `ORCHESTRATOR.md`, `core/VERIFICATION.md`, `backend/ADVANCED-TOOL-USE.md`, `backend/LONG-RUNNING-AGENTS.md`

## Env

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
BACKEND_URL=http://localhost:8000
```

## New Agent

Extend `BaseAgent` in `agents/`, register in `AgentRegistry`, add SKILL.md. Use `start_task()`, `report_output()`, `get_task_output()`.

---

## AGENTS.md Hierarchy

This repo uses a hierarchical AGENTS.md system (nearest-wins):

| Package | AGENTS.md | Purpose |
|---------|-----------|---------|
| Root | `AGENTS.md` | Universal commands, JIT index |
| Frontend | `apps/web/AGENTS.md` | Components, design system, patterns |
| Backend | `apps/backend/AGENTS.md` | FastAPI, agents, verification |
| Database | `supabase/AGENTS.md` | Migrations, RLS, pgvector |
| Skills | `skills/AGENTS.md` | Skill format, routing, priorities |

---

## Best Practices (Anthropic Recommended)

### Explore, Plan, Code, Commit

1. **Explore**: Read relevant files, understand patterns. Use subagents for complex investigation.
2. **Plan**: Use "think" / "think hard" / "ultrathink" for deeper reasoning. Document plan before coding.
3. **Code**: Implement solution, verify as you go.
4. **Commit**: Create descriptive commit message, update docs if needed.

### Test-Driven Development

1. Write tests based on expected input/output (don't mock implementations)
2. Confirm tests fail (no implementation code yet)
3. Commit tests
4. Write code to pass tests (don't modify tests)
5. Iterate until all tests pass
6. Commit code

### Effective Prompting

**Be specific** - reduces course corrections:
```
❌ "add tests for foo.py"
✅ "write a new test case for foo.py, covering the edge case where the user is logged out. avoid mocks"

❌ "add a calendar widget"
✅ "look at how existing widgets are implemented (see HotDogWidget.php). follow the pattern to implement a calendar widget with month selection and year pagination. build from scratch without new libraries."
```

### Working with Claude Code

- **Images**: Drag-drop, paste screenshots, or provide file paths
- **URLs**: Paste URLs directly in prompts; add domains to allowlist with `/permissions`
- **Course correct**: Press `Escape` to interrupt; double-tap to edit previous prompt
- **Use `/clear`**: Reset context between tasks to maintain focus
- **Checklists**: For large tasks, have Claude use a Markdown file as a working scratchpad

### Extended Thinking Triggers

| Phrase | Budget Level |
|--------|--------------|
| "think" | Low |
| "think hard" | Medium |
| "think harder" | High |
| "ultrathink" | Maximum |

### Verification First

IMPORTANT: Always verify before marking complete:
- Run the actual build/tests
- Check actual output
- Confirm expected behavior
- Never assume - VERIFY EVERYTHING

### Multi-Claude Workflows

- **Review Pattern**: One Claude writes code, another reviews
- **Git Worktrees**: Multiple checkouts for parallel independent tasks
- **Headless Mode**: `claude -p "prompt"` for CI/automation

### Common Slash Commands

```bash
/init              # Generate CLAUDE.md
/permissions       # Manage tool allowlist
/clear             # Reset context
#                  # Add instruction to CLAUDE.md
```

### Pre-PR Checklist

```bash
# Single command - all checks
pnpm turbo run type-check lint test && echo "✅ Ready for PR"
```
