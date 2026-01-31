# GSD Framework: Commands Reference

## Quick Start

The GSD framework is integrated into Claude Code. Use these commands to plan and execute project phases.

## Phase Planning

### 1. Create Phase Requirements

When starting a new phase, create the requirements file:

```bash
# Location: .planning/phases/[phase-num]/

# Create PHASE-REQUIREMENTS.md with:
# - Phase overview
# - Task list (with estimated context %)
# - Tech stack constraints
# - File locations
# - Expected outcomes

# Example filename: .planning/phases/06-api-enhancement/PHASE-REQUIREMENTS.md
```

**Content template:**

```markdown
# Phase [num]: [Title]

## Overview

[Brief description]

## Requirements

### Task 1: [Name] ([X]% context)

[Description and requirements]

### Task 2: [Name] ([Y]% context)

[Description and requirements]

## Context Estimation

**Total Scope:** [X+Y]% context

[If >50%, framework will auto-split into multiple plans]

## Tech Stack

- Framework: [...]
- Database: [...]
- Language: [...]
```

### 2. Generate Plans with Layers 1-3

Once PHASE-REQUIREMENTS.md exists, Claude will automatically:

1. **Layer 1:** Extract CLAUDE.md constraints and inject them
2. **Layer 2:** Split if total context > 50%
3. **Layer 3:** Calculate complexity and assign models

Output files:

```
[phase]-01-PLAN.md          # Plan 1 (if split)
[phase]-02-PLAN.md          # Plan 2 (if needed)
[phase]-03-PLAN.md          # Plan 3 (if needed)
```

Each plan includes:

- ✅ Tech stack constraints (Layer 1)
- ✅ Context percentage (Layer 2)
- ✅ Model assignment + complexity (Layer 3)
- ✅ Detailed task breakdown
- ✅ Acceptance criteria

### 3. Run Validation (Layer 4)

Before executing, Claude will:

1. Generate validation reports:

```
[phase]-01-VALIDATION.md    # Plan 1 validation
[phase]-02-VALIDATION.md    # Plan 2 validation
```

2. Check:
   - ✅ All constraints enforced
   - ✅ Context budgets respected
   - ✅ Model routing correct
   - ✅ No integration conflicts

3. Report status:
   - PASS ✅ → Safe to execute
   - FAIL ❌ → Fix violations first

### 4. Execute Plans

Execute each plan in order:

```bash
# Execute Plan 1 with assigned model
Execute plan [phase]-01 with [model]

# Example:
Execute plan 06-01 with sonnet
```

Claude will:

- Load the plan from `[phase]-01-PLAN.md`
- Execute using the specified model
- Track implementation in `[phase]-01-SUMMARY.md`

### 5. Execute Next Plan (if split)

After Plan 1 completes:

```bash
# Execute Plan 2 (if it exists)
Execute plan [phase]-02 with [model]

# Example:
Execute plan 06-02 with haiku
```

## File Locations

All GSD files live in `.planning/`:

```
.planning/
├── phases/
│   ├── 06-api-enhancement/
│   │   ├── PHASE-REQUIREMENTS.md      ← Input (you create)
│   │   ├── 06-01-PLAN.md              ← Output (Claude creates)
│   │   ├── 06-02-PLAN.md              ← Output (if split)
│   │   ├── 06-01-VALIDATION.md        ← Output (Claude creates)
│   │   ├── 06-02-VALIDATION.md        ← Output (if split)
│   │   ├── 06-01-SUMMARY.md           ← Output (after execution)
│   │   └── 06-02-SUMMARY.md           ← Output (after execution)
│   ├── 07-next-phase/
│   │   └── PHASE-REQUIREMENTS.md
│   └── ...
├── codebase/
│   └── [Codebase analysis from map-codebase]
└── deferred-issues/
    └── [Issues awaiting fixing]
```

## Common Workflows

### Workflow 1: Plan a New Phase

```bash
# 1. Create requirements file
# File: .planning/phases/07-database-optimization/PHASE-REQUIREMENTS.md
# Content: Phase spec with tasks and context estimates

# 2. Claude runs Layers 1-3
# Claude generates: 07-01-PLAN.md (and 07-02-PLAN.md if split)

# 3. Claude runs Layer 4 validation
# Claude generates: 07-01-VALIDATION.md (reports PASS or FAIL)

# 4. Review validation
# Check the validation report - if PASS, ready to execute

# 5. Execute
Execute plan 07-01 with sonnet
Execute plan 07-02 with haiku  # (if split)

# 6. Push to main
push to main
```

### Workflow 2: Quick Phase (Under 50%)

```bash
# Same as above, but no splitting needed

# 1. Create PHASE-REQUIREMENTS.md (25-40% context)
# 2. Claude generates: 08-01-PLAN.md
# 3. Claude generates: 08-01-VALIDATION.md
# 4. Execute: Execute plan 08-01 with [model]
# 5. Push: push to main
```

### Workflow 3: Large Phase (Over 50%)

```bash
# Same process, framework auto-handles splitting

# 1. Create PHASE-REQUIREMENTS.md (60-100% context)
# 2. Claude detects > 50%, applies splitting formula
# 3. Claude generates: 09-01-PLAN.md, 09-02-PLAN.md (and maybe 09-03-PLAN.md)
# 4. Claude validates all plans
# 5. Execute each plan in order:
Execute plan 09-01 with sonnet
Execute plan 09-02 with haiku
Execute plan 09-03 with sonnet  # (if 3 plans)
# 6. Push: push to main
```

## Command Examples

### Create New Phase

```bash
# Start with PHASE-REQUIREMENTS.md
# Location: .planning/phases/10-search-optimization/PHASE-REQUIREMENTS.md

# Content:
---
# Phase 10: Search Optimization

## Overview
Improve search performance using indexed full-text search and caching.

## Requirements

### Task 1: Database Indexing (18% context)
Add database indexes for full-text search...

### Task 2: Query Optimization (22% context)
Optimize PostgreSQL queries...

### Task 3: Redis Caching (15% context)
Add result caching...

## Total Context: 55% (exceeds 50%, will split)
---

# Then request Claude to plan it:
# "Create GSD plans for Phase 10"
# (or just create the file and Claude will notice)
```

### Execute Single Plan

```bash
# Command: Execute plan 06-01 with sonnet
# This will:
# 1. Load .planning/phases/06-api-enhancement/06-01-PLAN.md
# 2. Execute using Sonnet model
# 3. Create files as needed
# 4. Create .planning/phases/06-api-enhancement/06-01-SUMMARY.md
```

### Execute Multi-Plan Phase

```bash
# For a 68% phase that splits into 2 plans:

Execute plan 06-01 with sonnet
# (Plan 1 completes)

Execute plan 06-02 with haiku
# (Plan 2 completes, depends on Plan 1)

# Then push both to main:
push to main
```

### Review Validation

```bash
# After Claude generates validation reports, review:
# .planning/phases/06-api-enhancement/06-01-VALIDATION.md
# .planning/phases/06-api-enhancement/06-02-VALIDATION.md

# Check for:
# - Constraint Compliance: PASS ✅
# - Context Budget: PASS ✅
# - Model Routing: PASS ✅
# - Integration: PASS ✅
# - Overall Status: PASS ✅ READY FOR EXECUTION
```

## Model Assignment Reference

When Claude assigns models, it uses complexity scoring:

```
Complexity < 2.0     → Haiku (simple components, straightforward logic)
Complexity 2.0-5.0   → Sonnet (standard features, moderate complexity)
Complexity > 5.0     → Opus (complex architecture, novel patterns)
```

### Haiku Tasks

- Simple React components (forms, displays)
- Configuration changes
- Documentation updates
- Straightforward logic (no novel algorithms)
- **Example:** Search UI component (0.44)

### Sonnet Tasks

- Standard backend features (API endpoints, CRUD)
- Moderate frontend work (complex forms, state management)
- Database schema additions
- Performance optimizations
- **Example:** Search endpoint + filtering (2.1-2.8)

### Opus Tasks

- Complex architecture changes (authentication systems)
- Novel algorithms (search ranking, recommendations)
- System integration (payment processing, external APIs)
- Major refactoring
- **Example:** Multi-provider AI integration system (5.2+)

## Validation Stages

Claude runs 4 validation stages (Layer 4) before execution:

### Stage 1: Constraint Compliance

```
✓ Tech stack matches CLAUDE.md
✓ File locations correct
✓ Patterns referenced properly
✓ No anti-patterns present
```

### Stage 2: Context Budget

```
✓ Plan total ≤ 50% hard limit
✓ All tasks in 15-30% range
✓ Distribution balanced
```

### Stage 3: Model Routing

```
✓ Complexity score calculated
✓ Score maps to correct model
✓ Rationale documented
```

### Stage 4: Integration

```
✓ Dependencies available
✓ No file conflicts
✓ Phase ordering correct
```

## Troubleshooting

### Plan Won't Execute - Validation Failed

**Issue:** Validation report shows FAIL ❌

**Solution:**

1. Review validation report (`[phase]-0X-VALIDATION.md`)
2. Identify which stage failed (Constraints/Budget/Routing/Integration)
3. Update `[phase]-0X-PLAN.md` to fix violations
4. Request Claude to re-validate
5. Execute when PASS ✅

**Example:**

```
If Constraint violated:
→ Update plan to use correct tech stack
→ Move files to correct location
→ Reference existing patterns

If Budget exceeded:
→ Split task further
→ Move to different plan
→ Reduce scope
```

### Context Too High - Phase Won't Split Correctly

**Issue:** Phase total is very high (100%+)

**Solution:** Framework automatically applies splitting formula

```
num_plans = ceil(total_context / 45%)

100% → ceil(100/45) = 3 plans
200% → ceil(200/45) = 5 plans
```

Each plan will be ≤50% context. This is automatic.

### Model Assignment Seems Wrong

**Issue:** Plan assigned to Haiku but seems complex

**Solution:** Check complexity score calculation

```
Score = (context% × domain_multiplier × risk_modifier) - pattern_reduction

If score seems wrong:
1. Review complexity calculation in plan
2. Check if domain_multiplier is appropriate
3. Check if pattern_reduction is correct
4. Update plan with correct scoring
5. Re-validate
```

## Best Practices

### 1. Realistic Context Estimates

When creating PHASE-REQUIREMENTS.md, estimate honestly:

```
✓ 20% for simple component (form, list, display)
✓ 22-26% for backend feature (API endpoint, filtering)
✓ 30% for complex feature (authentication, integration)

✗ Don't over-estimate simple work
✗ Don't under-estimate complex work
```

### 2. Small Focused Tasks

Keep tasks focused (15-30% context each):

```
✓ "Search endpoint with full-text search" (22%)
✓ "Filtering and pagination layer" (26%)

✗ "Complete search system" (68% - too big)
```

### 3. Reference Existing Constraints

Always check CLAUDE.md before writing requirements:

```
✓ "Use FastAPI (required per CLAUDE.md)"
✓ "Use existing JWT auth from apps/backend/src/auth/jwt.py"
✓ "Use shadcn/ui components (project standard)"

✗ "Use Express.js"
✗ "Create custom authentication"
✗ "Use Material-UI"
```

### 4. Plan Dependencies

For split phases, order tasks by dependencies:

```
Phase 06 (68% → 2 plans):

Plan 1: Backend APIs (48%)
├─ Search endpoint (required for Plan 2)
└─ Filtering endpoints (required for Plan 2)

Plan 2: Frontend UI (20%)
├─ Depends on: Plan 1 API endpoints
└─ Reuses: Existing API client
```

## File Format Reference

### PHASE-REQUIREMENTS.md

```markdown
# Phase [num]: [Title]

## Overview

[Describe phase goal]

## Requirements

### Task 1: [Name] ([X]% context)

[Describe what needs to be built]

**Tech Stack to Use:**

- [Framework/Library]
- [Database/Service]

**File Locations:**

- [Code location]
- [Config location]

### Task 2: [Name] ([Y]% context)

[Describe...]

## Context Estimation

**Total Scope:** [X+Y]%

[Breakdown by task]

## Expected Outcomes

[What should be complete at end]
```

### [phase]-0X-PLAN.md

(Claude generates this with embedded front-matter)

```markdown
---
phase: [phase-num]
plan: [01/02/03...]
type: execute
model: [haiku/sonnet/opus]
context_percentage: [XX]
complexity_score: [X.XX]
model_rationale: |
  Why this model was chosen
---

# Plan [num]: [Title]

## Task [X]: [Name] ([Y]% context)

[Requirements and implementation details]
```

### [phase]-0X-VALIDATION.md

(Claude generates this)

```markdown
---
phase: [phase-num]
plan: [num]
validation_timestamp: [timestamp]
validator: Claude
validation_status: PASS ✅
---

# Validation Report: Plan [num]

## Constraint Compliance

[Checks for CLAUDE.md compliance]

## Context Budget Compliance

[Checks for ≤50% limit]

## Model Routing Compliance

[Checks for correct model assignment]

## Overall Status

✅ PASS - Ready for execution
```

---

## Next Steps

1. Create `PHASE-REQUIREMENTS.md` for your next phase
2. Claude will generate plans and validation
3. Review validation report
4. Execute plans with assigned models
5. Push to main when complete

For detailed information on how the framework works, see [GSD-HOW-IT-WORKS.md](GSD-HOW-IT-WORKS.md).
