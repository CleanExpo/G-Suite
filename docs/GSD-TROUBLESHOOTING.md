# GSD Framework: Troubleshooting Guide

## Validation Issues

### ❌ Validation Failed: Constraint Violation

**Error Message:**

```
Constraint Validation: FAIL ❌
Tech Stack: ❌ Uses [wrong-tool] instead of [required-tool]
```

**Causes:**

- Plan specifies wrong framework/library
- Files in wrong location
- Using custom patterns instead of existing ones
- Anti-patterns present (raw SQL, custom auth, etc.)

**Solutions:**

1. **Check CLAUDE.md for constraints:**

   ```bash
   # Review what's required
   grep "Frontend:" CLAUDE.md
   grep "Backend:" CLAUDE.md
   grep "Database:" CLAUDE.md
   ```

2. **Update plan to match constraints:**
   - Tech stack: Use frameworks listed in CLAUDE.md
   - File locations: Use directories from CLAUDE.md
   - Patterns: Reference existing implementations
   - Anti-patterns: Remove violations

3. **Re-validate:**
   ```
   # Review updated [phase]-0X-PLAN.md
   # Check corresponding [phase]-0X-VALIDATION.md
   # Should now show PASS ✅
   ```

**Example Fix:**

```diff
# In [phase]-0X-PLAN.md

❌ Before:
- Use Express.js for API routes
- Create new authentication system
- Store passwords in plain text

✅ After:
- Use FastAPI (per CLAUDE.md)
- Reference existing JWT auth from apps/backend/src/auth/jwt.py
- Use bcrypt for password hashing (existing pattern)
```

---

### ❌ Validation Failed: Context Budget Exceeded

**Error Message:**

```
Context Budget: FAIL ❌
Plan total: 65% context
Hard limit: 50%
```

**Causes:**

- Single plan includes too many tasks
- Tasks estimated too high
- Phase should have been split

**Solutions:**

1. **Check if splitting was applied:**

   ```
   # Look for multiple plan files
   ls .planning/phases/[phase-num]/[phase]-0*-PLAN.md

   # If only one file: splitting wasn't triggered
   # If multiple files: splitting was applied
   ```

2. **Apply splitting formula:**

   ```
   num_plans = ceil(total_context / 45%)

   Example: 65% context
   ceil(65 / 45) = ceil(1.44) = 2 plans

   Distribution:
   Plan 1: 35% ✅
   Plan 2: 30% ✅
   ```

3. **Redistribute tasks:**
   - Move tasks to different plan
   - Split task into smaller pieces
   - Reduce scope (move to Phase N+1)

**Example Fix:**

```
Phase 05 (65% context - TOO HIGH)

Original:
├─ Task 1 (25%)
├─ Task 2 (20%)
├─ Task 3 (20%)
└─ TOTAL: 65% ❌

After splitting (2 plans):
Plan 1 (45%):
├─ Task 1 (25%)
└─ Task 2 (20%)

Plan 2 (20%):
└─ Task 3 (20%)
```

---

### ❌ Validation Failed: Model Routing Incorrect

**Error Message:**

```
Model Routing: FAIL ❌
Complexity Score: 2.8
Expected Model: Sonnet
Assigned Model: Haiku
```

**Causes:**

- Complexity score calculated incorrectly
- Wrong routing rule applied
- Model mismatch with task complexity

**Solutions:**

1. **Check complexity calculation:**

   ```
   Score = (context% × domain_multiplier × risk_modifier) - pattern_reduction

   Example:
   - Context: 26% → 2.5 points
   - Domain: Moderate (filtering) → ×1.3
   - Risk: Medium (breaking change) → ×1
   - Pattern: Exists → -0.5
   - Score: (2.5 × 1.3 × 1) - 0.5 = 2.8 ✓ Correct
   ```

2. **Verify routing rule:**

   ```
   Score < 2.0     → Haiku ✓
   Score 2.0-5.0   → Sonnet ✓
   Score > 5.0     → Opus ✓

   Score 2.8 → 2.0-5.0 range → Sonnet (not Haiku)
   ```

3. **Update plan with correct model:**

   ```
   # In [phase]-0X-PLAN.md, update frontmatter:
   model: sonnet
   complexity_score: 2.8
   model_rationale: Complexity 2.8 (moderate work) routes to Sonnet
   ```

4. **Re-validate to confirm PASS ✅**

**Example Fix:**

```diff
# In [phase]-0X-PLAN.md

❌ Before:
model: haiku
complexity_score: 2.8

✅ After:
model: sonnet
complexity_score: 2.8
```

---

### ❌ Validation Failed: Integration Conflict

**Error Message:**

```
Integration: FAIL ❌
Conflict: Task modifies apps/web/components/auth/Login.tsx
Status: File has pending changes from Phase 04
```

**Causes:**

- Multiple plans modify the same file
- Task depends on incomplete previous phase
- Circular dependencies between plans

**Solutions:**

1. **Check for file conflicts:**

   ```bash
   # See what files are being modified
   grep -r "modifies\|creates" [phase]-0X-PLAN.md

   # Check if any files appear in multiple plans
   # Should have ≤1 plan modifying each file
   ```

2. **Resolve conflicts:**
   - **Option 1:** Move task to earlier plan
   - **Option 2:** Combine conflicting tasks into one plan
   - **Option 3:** Refactor task to different files
   - **Option 4:** Wait for previous phase to complete

3. **Check dependencies:**

   ```
   # In [phase]-0X-PLAN.md, verify:
   - All dependencies listed
   - Dependencies are in earlier plans/phases
   - No circular dependencies
   ```

4. **Re-validate to confirm PASS ✅**

**Example Scenarios:**

```
❌ Conflict: Two plans modify same file
[phase]-01-PLAN.md modifies apps/web/components/auth/Login.tsx
[phase]-02-PLAN.md modifies apps/web/components/auth/Login.tsx
→ Combine into single plan OR refactor to different files

❌ Dependency Issue: Task depends on incomplete phase
[phase]-02-PLAN.md depends on Phase 04 API endpoints
But Phase 04 hasn't been executed yet
→ Wait for Phase 04 to complete, then execute Phase [current]

✅ Correct: Clean dependencies
Plan 1: Creates database schema
Plan 2: Creates API endpoints (depends on Plan 1)
Plan 3: Creates frontend (depends on Plan 1 and 2)
→ Execute in order: Plan 1 → Plan 2 → Plan 3
```

---

## Execution Issues

### ❌ Execution Failed: Constraint Violation During Implementation

**Error Message:**

```
Implementation Error: Constraint violated
Issue: Uses raw SQL instead of SQLAlchemy ORM
Location: apps/backend/src/api/routes/search.py:45
```

**Causes:**

- Layer 4 validation missed a violation
- Implementation changed from plan
- CLAUDE.md constraint not understood

**Solutions:**

1. **Fix the violation:**
   - Replace raw SQL with SQLAlchemy ORM
   - Move file to correct location
   - Use existing pattern instead of custom one

2. **Understand the constraint:**

   ```bash
   # Check CLAUDE.md for the constraint
   grep -i "raw sql\|orm\|sqlalchemy" CLAUDE.md

   # Read the constraint explanation
   # Understand why it matters
   ```

3. **Verify fix is correct:**
   - Run `pnpm turbo run type-check` to verify
   - Check code follows existing patterns
   - Commit with explanation

**Example Fix:**

```python
# ❌ Wrong - Raw SQL
db.execute("SELECT * FROM documents WHERE user_id = ?", user_id)

# ✅ Correct - SQLAlchemy ORM
await db.execute(
    select(Document).where(Document.user_id == user_id)
)
```

---

### ⚠️ Execution Slow - Performance Degradation

**Issue:** Implementation taking too long, quality dropping

**Possible Causes:**

- Context window usage too high
- Model overpowered for task
- Task more complex than estimated

**Solutions:**

1. **Check context usage:**

   ```bash
   # Review current context in Claude Code
   # Should not exceed 50% of available context

   # If approaching limit:
   # - Save work
   # - Commit to main
   # - Start fresh session for next plan
   ```

2. **Check model assignment:**

   ```
   # If task is simple (forms, displays):
   # Using Sonnet when should use Haiku → Waste

   # If task is complex (architecture, algorithms):
   # Using Haiku when should use Sonnet → Poor quality

   # Check [phase]-0X-PLAN.md for model assignment
   # Verify complexity score justifies chosen model
   ```

3. **Re-estimate complexity:**
   ```
   If implementation is struggling:
   - Complexity may be higher than estimated
   - May need to split task further
   - May need different model
   ```

---

## Planning Issues

### ❌ Phase Won't Generate Plans

**Issue:** Created PHASE-REQUIREMENTS.md but Claude didn't generate plans

**Causes:**

- File format incorrect
- Missing required sections
- File in wrong location

**Solutions:**

1. **Check file location:**

   ```
   ✓ Correct: .planning/phases/[phase-num]/PHASE-REQUIREMENTS.md
   ✗ Wrong:  .planning/PHASE-REQUIREMENTS.md
   ✗ Wrong:  docs/PHASE-REQUIREMENTS.md
   ```

2. **Check file content:**

   ```markdown
   ✓ Has title: # Phase [num]: [Title]
   ✓ Has Overview section
   ✓ Has Requirements section
   ✓ Has Task breakdown with context %
   ✓ Has Total Context line
   ✓ Has Expected Outcomes

   ✗ Missing any of above
   ```

3. **Trigger plan generation:**
   ```bash
   # After creating/fixing PHASE-REQUIREMENTS.md
   # Request Claude to create plans:
   # "Create GSD plans for [phase]"
   # or just mention the phase file
   ```

**Example Template:**

```markdown
# Phase 07: Performance Optimization

## Overview

Optimize database queries and add caching layer.

## Requirements

### Task 1: Query Optimization (24% context)

Add database indexes and optimize PostgreSQL queries...

### Task 2: Redis Caching (20% context)

Implement result caching...

## Total Context: 44% (within 50% limit)

## Expected Outcomes

- Database indexes created
- Queries optimized
- Caching layer functional
```

---

### ❌ Plans Generated But Wrong Model Assigned

**Issue:** Plan assigned to wrong model (too weak or too strong)

**Solutions:**

1. **Understand the complexity:**

   ```
   Score = (context% × domain_multiplier × risk_modifier) - pattern_reduction

   Review the calculation in [phase]-0X-PLAN.md
   - Is context% correct?
   - Is domain_multiplier appropriate? (1.0=standard, 1.3=moderate, 1.5=complex)
   - Is risk_modifier right? (0.8=low, 1.0=medium, 1.2=high)
   - Is pattern_reduction realistic? (1.0=exact, 0.5=exists, 0=none)
   ```

2. **Adjust if needed:**
   - If complexity seems high → Update domain/risk factors
   - If complexity seems low → Check for missing patterns
   - If very wrong → Update task scope in plan

3. **Re-validate:**
   ```
   Update [phase]-0X-PLAN.md
   Claude will re-generate [phase]-0X-VALIDATION.md
   Verify model assignment now correct
   ```

---

### ❌ Tasks Split Incorrectly

**Issue:** Framework split phase into wrong number of plans or wrong distribution

**Causes:**

- Context estimates inaccurate
- Splitting formula applied incorrectly
- Task dependencies not considered

**Solutions:**

1. **Check splitting formula:**

   ```
   num_plans = ceil(total_context / 45%)

   Example: 68% context
   ceil(68 / 45) = ceil(1.51) = 2 plans ✓

   Example: 100% context
   ceil(100 / 45) = ceil(2.22) = 3 plans ✓
   ```

2. **Verify distribution:**

   ```
   Each plan should be:
   - ≤ 50% context
   - Aim for 40-48% (leaves headroom)
   - Related tasks grouped together
   - Dependencies minimized
   ```

3. **Adjust if needed:**
   - Move tasks between plans
   - Re-estimate context for accuracy
   - Request Claude to re-split manually

**Example:**

```
Original (incorrect split):
Total: 68%
Plan 1: 60% (too high - over 50% limit)
Plan 2: 8%  (too low - unbalanced)

Corrected:
Total: 68%
Plan 1: 48% (search + filtering)
Plan 2: 20% (frontend UI)
```

---

## Framework Issues

### ❌ Constraint Definition Unclear

**Issue:** Not sure what a constraint means or why it matters

**Solution:**

1. **Check CLAUDE.md for explanation:**

   ```bash
   # Find the constraint
   grep "FastAPI\|PostgreSQL\|JWT" CLAUDE.md

   # Read the context around it
   # Should explain what/why
   ```

2. **See reference docs:**
   - `docs/gsd-layers/constraint-extraction.md` - Detailed constraint info
   - `docs/gsd-layers/layer-1-example.md` - Real constraint examples

3. **Ask for clarification:**
   - If still unclear, request explanation
   - Constraints should be unambiguous

---

### ❌ Context Budget Too Strict

**Issue:** Phase is important but exceeds 50% context

**Note:** 50% is a HARD LIMIT for quality reasons

**Solutions:**

1. **Accept the split:**
   - Framework will split into multiple plans
   - This is correct behavior
   - Run plans sequentially

2. **Reduce scope:**
   - Move some tasks to Phase N+1
   - Reduce task complexity
   - Break into smaller phases

3. **Don't bypass:**
   - Do NOT create single 68% plan
   - Do NOT disable the limit
   - Splitting improves quality (95% vs 60%)

**Why 50%?**

```
Context degradation pattern:
- 0-50% context: Peak quality ✓
- 50-75% context: Quality drops 15-20% ❌
- 75%+ context: Quality drops 40-60% ❌

Solution: Split into multiple plans
Each plan stays fresh, stays at peak quality
```

---

### ❌ Model Assignment Not Optimal

**Issue:** Saved tokens, but quality is lower than expected

**Possible Causes:**

- Model too weak for actual complexity
- Underestimated task difficulty
- Complexity calculation off

**Solutions:**

1. **Check model assignment:**

   ```
   Haiku:  0.44 complexity - Simple components ✓
   Sonnet: 2.5 complexity - Standard features ✓
   Opus:   6.2 complexity - Complex architecture ✓
   ```

2. **Upgrade if needed:**
   - If Haiku struggles: Switch to Sonnet
   - If Sonnet struggles: Switch to Opus
   - Always choose quality over tokens saved

3. **Update complexity estimate:**
   - Review actual implementation difficulty
   - Adjust complexity calculation for future phases
   - Document findings

---

## Best Practices to Avoid Issues

### 1. Realistic Context Estimates

```
✓ Accurate estimates
├─ Simple form component: 15-20%
├─ API endpoint + filtering: 22-26%
├─ Complex authentication: 30-40%
└─ Database schema redesign: 25-35%

✗ Inaccurate estimates
├─ Everything is "5%"
├─ Everything is "50%"
├─ Wildly off from actual work
```

### 2. Clear Constraints in PHASE-REQUIREMENTS.md

```markdown
✓ Clear:
"Use FastAPI (per CLAUDE.md) with PostgreSQL ORM"
"File location: apps/backend/src/api/routes/"
"Reference existing JWT auth from apps/backend/src/auth/jwt.py"

✗ Vague:
"Use whatever framework you think is best"
"Put code somewhere sensible"
"Do authentication however"
```

### 3. Follow Existing Patterns

```
✓ Good:
"Use existing API client pattern from apps/web/lib/api/client.ts"
"Follow shadcn/ui component structure"
"Use existing pagination pattern from other endpoints"

✗ Bad:
"Create your own API client wrapper"
"Design new UI library"
"Invent new pagination approach"
```

### 4. Validate Before Executing

```
✓ Always validate:
1. Create PHASE-REQUIREMENTS.md
2. Claude generates plans
3. Claude generates validations (check PASS ✅)
4. Execute plans
5. Push to main

✗ Never skip:
- "Looks good, let's execute" (validation might fail)
- "Constraints don't matter" (they do!)
- "Context limits are soft" (they're hard)
```

---

## Getting Help

**If stuck:**

1. **Check this troubleshooting guide** - Most issues documented
2. **Review validation report** - Shows exactly what failed
3. **Check GSD-HOW-IT-WORKS.md** - Understand framework
4. **Check GSD-COMMANDS.md** - Correct command syntax
5. **Read constraint docs** - Understand CLAUDE.md requirements

**If still stuck:**

- Review similar completed phases (.planning/phases/[num]/)
- Check what previous plans did correctly
- Request help with specific error message

---

## Summary

| Issue                            | Cause                      | Fix                              |
| -------------------------------- | -------------------------- | -------------------------------- |
| Validation: Constraint violation | Wrong tech stack/location  | Update plan to match CLAUDE.md   |
| Validation: Context exceeded     | Tasks too large            | Split into multiple plans        |
| Validation: Model wrong          | Complexity misscored       | Recalculate and fix              |
| Validation: Integration conflict | File conflict              | Move task or combine plans       |
| Execution: Performance degrading | Context too high           | Commit work, start fresh session |
| Planning: Phase won't generate   | Wrong file format/location | Fix file format and location     |
| Planning: Model assignment weak  | Complexity underestimated  | Upgrade model, accept tokens     |

**Most Common Fix:** Review the validation report and follow its recommendations. It tells you exactly what to fix.
