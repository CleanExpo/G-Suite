---
name: verification-protocol
version: 2.0.0
description: Independent Verification Protocol - Eliminates Self-Attestation
author: Claude Code Agent System
priority: 1
triggers:
  - "verify"
  - "verification"
  - "attestation"
  - "evidence"
  - "proof"
---

# Independent Verification Protocol

## Core Principle: No Self-Attestation

**CRITICAL**: Agents CANNOT verify their own work. All verification MUST be performed by an independent verifier agent.

```
┌─────────────────────────────────────────────────────────────┐
│                    OLD MODEL (BROKEN)                        │
│                                                              │
│  Agent A ──→ Does Work ──→ Verifies Own Work ──→ "Success!"  │
│                              ↑                               │
│                         SELF-ATTESTATION                     │
│                         (Always passes)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    NEW MODEL (CORRECT)                       │
│                                                              │
│  Agent A ──→ Does Work ──→ Reports Outputs                   │
│                               ↓                              │
│                      IndependentVerifier                     │
│                               ↓                              │
│                    Collects Evidence ──→ Pass/Fail           │
│                               ↓                              │
│                    Orchestrator Decides ──→ Complete/Retry   │
└─────────────────────────────────────────────────────────────┘
```

## The Problem with Self-Attestation

Self-attestation occurs when an agent verifies its own work. This is fundamentally broken because:

1. **Bias**: Agents naturally want to report success
2. **No Accountability**: No external validation of claims
3. **False Confidence**: "Works on my machine" syndrome
4. **Regression Blindness**: Can't catch what you don't test

### Signs of Self-Attestation (Anti-Patterns)

```python
# WRONG: Agent verifying its own output
class MyAgent:
    def execute(self, task):
        result = self.do_work(task)
        if self.verify_my_work(result):  # Self-attestation!
            return {"status": "complete", "verified": True}

# WRONG: Default success
def verify_build(self):
    return {"success": True}  # No actual verification!

# WRONG: Catching own errors as success
def verify_tests(self):
    try:
        self.run_tests()
        return {"success": True}
    except Exception:
        return {"success": True}  # Swallowing failure!
```

## Independent Verification Architecture

### Components

1. **IndependentVerifier** (`src/verification/independent_verifier.py`)
   - Unique verifier ID (never matches agent IDs)
   - Performs actual file/test/build checks
   - Collects evidence for every claim
   - Returns `verified: True` ONLY with proof

2. **BaseAgent** (`src/agents/base_agent.py`)
   - `verify_*()` methods now RAISE `SelfAttestationError`
   - New methods: `report_output()`, `add_completion_criterion()`
   - Agents report what they did, not whether it's correct

3. **Orchestrator** (`src/agents/orchestrator.py`)
   - Routes tasks to agents
   - Routes verification to IndependentVerifier
   - Blocks completion until verification passes
   - Escalates after 3 failed attempts

### Verification Types

```python
class VerificationType(str, Enum):
    FILE_EXISTS = "file_exists"
    FILE_NOT_EMPTY = "file_not_empty"
    NO_PLACEHOLDERS = "no_placeholders"
    CODE_COMPILES = "code_compiles"
    LINT_PASSES = "lint_passes"
    TESTS_PASS = "tests_pass"
    ENDPOINT_RESPONDS = "endpoint_responds"
    RESPONSE_TIME = "response_time"
    CONTENT_CONTAINS = "content_contains"
    CONTENT_NOT_CONTAINS = "content_not_contains"
```

### Evidence Collection

Every verification produces evidence:

```python
class VerificationEvidence:
    criterion: str          # What was checked
    verified: bool          # Did it pass?
    evidence_type: str      # file_content, test_output, http_response
    evidence_data: str      # Actual proof (truncated if large)
    timestamp: str          # When verified
    verifier_id: str        # Who verified (NOT the agent)
```

## Task Status Flow

```
PENDING
    ↓
IN_PROGRESS (agent executing)
    ↓
AWAITING_VERIFICATION (agent done, outputs reported)
    ↓
VERIFICATION_IN_PROGRESS (IndependentVerifier working)
    ↓
┌───────────────┬─────────────────────┐
│               │                     │
VERIFICATION_PASSED    VERIFICATION_FAILED
       ↓                      ↓
   COMPLETED            (retry loop)
                              ↓
                   [3 attempts max]
                              ↓
                    ESCALATED_TO_HUMAN
```

## Implementation Guide

### For Agents: Report, Don't Verify

```python
class MyAgent(BaseAgent):
    async def execute(self, task_description: str, context: dict):
        task_id = f"my_{uuid.uuid4().hex[:8]}"
        self.start_task(task_id)

        # Do the actual work
        file_path = await self.create_component(task_description)

        # REPORT what you did (don't verify it)
        self.report_output(
            output_type="file",
            path=file_path,
            description="Created React component"
        )

        # Add criteria for independent verification
        self.add_completion_criterion(
            criterion_type="file_exists",
            target=file_path
        )
        self.add_completion_criterion(
            criterion_type="no_placeholders",
            target=file_path
        )
        self.add_completion_criterion(
            criterion_type="code_compiles",
            target="pnpm type-check"
        )

        # Return for verification (NOT marked as complete)
        return {
            "status": "pending_verification",
            "task_output": self.get_task_output().model_dump()
        }
```

### For Orchestrator: Use IndependentVerifier

```python
class OrchestratorAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="orchestrator", capabilities=[...])
        self.verifier = IndependentVerifier()  # Independent!

    async def run(self, task, context):
        # ... route task to agent ...

        # Agent returns, now verify independently
        if task.status == TaskStatus.AWAITING_VERIFICATION:
            verification = await self.verifier.verify(
                VerificationRequest(
                    task_id=task.task_id,
                    claimed_outputs=task.task_output.outputs,
                    completion_criteria=task.task_output.completion_criteria,
                    requesting_agent_id=task.assigned_agent_id,  # Different!
                )
            )

            if verification.verified:
                task.status = TaskStatus.COMPLETED
            else:
                task.status = TaskStatus.VERIFICATION_FAILED
                # Handle retry or escalation
```

## Placeholder Detection

The verifier actively scans for placeholder patterns:

```
PLACEHOLDER_PATTERNS = [
    "TODO",
    "FIXME",
    "XXX",
    "IMPLEMENT",
    "PLACEHOLDER",
    "...",
    "pass  # TODO",
    "// TODO:",
    "/* TODO */",
    "raise NotImplementedError",
    "throw new Error('Not implemented')",
]
```

Files containing these patterns FAIL the `no_placeholders` check.

## Escalation Protocol

After 3 failed verification attempts:

1. Task status → `ESCALATED_TO_HUMAN`
2. Full error history attached
3. All verification attempts logged
4. Human review required

```python
def _escalate_to_human(self, state: OrchestratorState) -> OrchestratorState:
    task = state.current_task
    task.status = TaskStatus.ESCALATED_TO_HUMAN

    logger.warning(
        "ESCALATING TO HUMAN REVIEW",
        task_id=task.task_id,
        attempts=task.attempts,
        verification_attempts=len(task.verification_attempts),
        reason="Max verification attempts exceeded",
    )

    state.escalated_tasks.append(task)
    return state
```

## Health Check Integration

Verification status exposed via health endpoints:

- `GET /api/health` - Basic health
- `GET /api/health/deep` - Full dependency check
- `GET /api/health/routes` - API route verification

## Testing the Verification System

```bash
# Run verification tests
cd apps/backend
uv run pytest tests/test_verification.py -v

# Check that self-attestation is blocked
uv run python -c "
from src.agents.base_agent import FrontendAgent
agent = FrontendAgent()
try:
    agent.verify_build()
except Exception as e:
    print(f'BLOCKED: {e}')
"

# Should output:
# BLOCKED: SELF-ATTESTATION BLOCKED: Agent 'frontend' cannot call verify_build()
# on itself. Use IndependentVerifier for all verification.
```

## Migration Checklist

For existing code using old verification:

- [ ] Replace `agent.verify_build()` → `IndependentVerifier.verify()`
- [ ] Replace `agent.verify_tests()` → `IndependentVerifier.verify()`
- [ ] Replace `agent.verify_functionality()` → `IndependentVerifier.verify()`
- [ ] Add `report_output()` calls in agent execution
- [ ] Add `add_completion_criterion()` for each output
- [ ] Update orchestrator to route verification
- [ ] Add escalation handling for repeated failures

## Summary

| Old Way | New Way |
|---------|---------|
| Agent verifies itself | IndependentVerifier verifies |
| `success: True` by default | Evidence required for `verified: True` |
| No proof required | Evidence collected for every check |
| Silent failures | Explicit failure with reasons |
| No retry mechanism | 3 attempts then escalate |
| "Trust the agent" | "Verify the output" |
