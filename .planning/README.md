# .planning/ Directory Guide

## Structure

```
.planning/
├── README.md                    ← You are here
├── phases/                      ← Phase storage
│   ├── README.md
│   ├── 00-example/              ← Template to copy
│   └── [phase-num]/             ← Your phases
├── codebase/                    ← map-codebase output
└── deferred-issues/             ← Issue tracking
```

## File Types

### PHASE-REQUIREMENTS.md (You create)

- Phase overview
- Task breakdown with context estimates
- Tech stack constraints
- Expected outcomes

### [phase]-0X-PLAN.md (Claude generates)

- Detailed implementation plan
- Tech stack constraints enforced
- Context percentage (≤50%)
- Model assignment (Haiku/Sonnet/Opus)

### [phase]-0X-VALIDATION.md (Claude generates)

- Constraint compliance check
- Context budget check
- Model routing check
- Overall status (PASS ✅ / FAIL ❌)

### [phase]-0X-SUMMARY.md (After execution)

- What was implemented
- Files created/modified
- Verification results

## Workflow

1. Create PHASE-REQUIREMENTS.md
2. Request Claude to generate plans
3. Review validation reports
4. Execute plans in order
5. Verify summary files
6. Push to version control

## Best Practices

- **One phase at a time:** Complete Phase N before starting Phase N+1
- **Accurate estimates:** Context percentages should reflect actual work
- **Clear constraints:** Reference CLAUDE.md tech stack
- **Validation first:** Always check PASS ✅ before executing

## See Also

- phases/README.md - Phase management guide
- docs/GSD-COMMANDS.md - Command reference
- docs/GSD-HOW-IT-WORKS.md - Framework explanation
