# Phase 06: API Enhancement & Search Features

## Overview

Enhance the API with new search, filtering, and pagination capabilities while maintaining the existing architecture patterns.

## Requirements

### 1. Search Endpoint (22% context)

Create a new `/api/search` endpoint that:

- Accepts search query parameter
- Uses PostgreSQL full-text search
- Returns paginated results with highlights
- Filters by document type (optional)
- Respects user permissions

**Tech Stack to Use:**

- Framework: FastAPI (backend)
- Database: PostgreSQL with pgvector
- ORM: SQLAlchemy 2.0
- Authentication: Existing JWT pattern from apps/backend/src/auth/jwt.py

**File Locations:**

- API route: `apps/backend/src/api/routes/search.py`
- Models: `apps/backend/src/db/models.py`
- Dependencies: `apps/backend/src/api/dependencies.py`

### 2. Filter & Pagination (26% context)

Add filtering and pagination to existing endpoints:

- Add filter parameters (type, date range, author)
- Implement cursor-based pagination
- Add sorting options
- Cache results with Redis

**Constraints:**

- Use existing pagination pattern from other endpoints
- Don't create new auth from scratch (use apps/backend/src/auth/jwt.py)
- All queries must use SQLAlchemy ORM (no raw SQL)
- Async/await only in FastAPI routes (no sync functions)

### 3. Frontend Search UI (20% context) [Optional - may move to next phase]

Create search interface:

- Search input component (NextJS)
- Results display with pagination
- Filter controls
- Loading states

**Constraints:**

- Use existing API client from `apps/web/lib/api/client.ts`
- Component in `apps/web/components/search/`
- Follow shadcn/ui patterns
- TypeScript required

---

## Context Estimation

**Total Scope:** 68% context

**Breakdown:**

- Search endpoint: 22%
- Filter & pagination: 26%
- Frontend UI: 20%
- **Total: 68%**

**Planning Challenge:** 68% exceeds 50% hard limit, needs splitting

---

## Expected Outcomes

After planning phase (Layers 1-3):

- Phase split into 2 plans (to respect 50% limit)
- Each plan properly constrained (Layer 1)
- Each plan constrained to ≤50% context (Layer 2)
- Each plan routed to appropriate model (Layer 3)

After execution (Layer 4):

- Plans validated before execution
- Constraints verified
- Violations caught and reported
- Clean execution without rework

---

## Complexity Indicators

### Complexity Factors:

**Search Endpoint (Task 1):**

- Context: 22% → 2 points
- Domain: Moderate (search + filtering) → ×1.3
- Risk: Medium (affects query performance) → ×1
- Pattern: Similar patterns exist (existing search in codebase) → -0.5
- **Estimated Complexity: (2 × 1.3 × 1) - 0.5 = 2.1 → Sonnet**

**Filter & Pagination (Task 2):**

- Context: 26% → 2.5 points
- Domain: Moderate (business logic) → ×1.3
- Risk: Medium (breaking change to endpoints) → ×1
- Pattern: Similar patterns exist → -0.5
- **Estimated Complexity: (2.5 × 1.3 × 1) - 0.5 = 2.8 → Sonnet**

**Frontend UI (Task 3):**

- Context: 20% → 1.8 points
- Domain: Standard (CRUD form) → ×1
- Risk: Low (isolated component) → ×0.8
- Pattern: Exact pattern exists (shadcn/ui forms) → -1
- **Estimated Complexity: (1.8 × 1 × 0.8) - 1 = 0.44 → Haiku**

---

## Testing the Framework

This phase will demonstrate:

1. **Layer 1: Constraint Injection**
   - Extract tech stack from CLAUDE.md
   - Enforce file locations
   - Reference existing patterns
   - Example: "Use FastAPI not Express"

2. **Layer 2: Context Budgeting**
   - Total 68% exceeds 50% limit
   - Need to split into 2 plans
   - Formula: ceil(68/45%) = 2 plans
   - Distribute tasks across plans

3. **Layer 3: Model Routing**
   - Calculate complexity for each plan
   - Route Plan 1 (Search): Sonnet (2.1)
   - Route Plan 2 (Pagination/Frontend): Sonnet/Haiku mix

4. **Layer 4: Pre-Execution Validation**
   - Validate constraints before execution
   - Catch violations early
   - Prevent wasted tokens on rework
