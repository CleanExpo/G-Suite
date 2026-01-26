# Architectural Strengthening Plan: Independent Verification & Advanced Orchestration

## 🎯 Objective
Upgrade the G-Pilot agent architecture by adopting the "Independent Verification" and "Advanced Orchestration" patterns from the `NodeJS-Starter-V1` reference implementation. This ensures agents cannot "grade their own homework" and establishes a more robust, stateful orchestration loop.

## 🏗️ Core Architectural Upgrades

### 1. Independent Verification Pattern
**Current State:** Agents verify their own work via `agent.verify()`.
**New State:** A dedicated `IndependentVerifier` agent validates all task outputs against defined completion criteria.

- **New Agent:** `src/agents/independent-verifier.ts`
- **Capabilities:**
  - `file_verification`: Check file existence, content, and syntax.
  - `test_verification`: Run specific test suites.
  - `visual_verification`: Verify UI components (delegated to UI Auditor if needed).
  - `endpoint_verification`: Check API health and responses.

### 2. Advanced Orchestration Loop
**Current State:** Linear execution (Plan → Execute → Verify).
**New State:** Stateful loop with rigorous quality gates.

- **Loop Logic:**
  1. `PENDING` → Route to Agent
  2. `IN_PROGRESS` → Agent Executes (produces `TaskOutput` + `CompletionCriteria`)
  3. `AWAITING_VERIFICATION` → Route to IndependentVerifier
  4. `VERIFIED` → Mark Complete
  5. `FAILED` → Retry / Escalate / Self-Correct

### 3. Base Agent Refactoring
**Current State:** `BaseAgent` handles distinct plan/execute/verify phases.
**New State:** `BaseAgent` becomes a "Worker" that submits proof of work.

- **New Methods:**
  - `reportOutput(type, path, description)`: Register an artifact to be verified.
  - `addCompletionCriterion(type, target, expected)`: Define how success should be measured.
  - `self_review()`: A pre-verification sanity check.

## 🗺️ Implementation Roadmap

1.  **Phase 1: Foundation (The Verifier)**
    - Create `src/agents/independent-verifier.ts`.
    - Implement verification logic for files and tests.

2.  **Phase 2: Protocol Update (The Interface)**
    - Update `src/agents/base.ts` to include `TaskOutput` and `CompletionCriterion` types.
    - Add helper methods (`reportOutput`) to `BaseAgent`.

3.  **Phase 3: Integration (The Overseer)**
    - Update `MissionOverseer` to instantiate the `IndependentVerifier`.
    - Modify the execution loop to enforce the verification gate.

## 💡 Reference (from NodeJS-Starter-V1)

Why this works:
> "Agents can NO LONGER verify their own work - the orchestrator routes verification to the IndependentVerifier agent. Tasks cannot be marked complete without passing verification."

## ✅ Success Criteria
- [ ] `IndependentVerifier` exists and is registered.
- [ ] `MissionOverseer` fails a mission if `IndependentVerifier` rejects the output, *even if* the worker agent says "Success".
- [ ] All agents utilize `reportOutput` instead of just returning loose JSON.
