---
name: long-running-agents
version: "1.0"
triggers:
  - long running
  - multi session
  - context window
  - incremental progress
  - feature tracking
priority: 9
---

# Long-Running Agent Harness

Enables agents to work effectively across many context windows.

## The Problem

Agents face challenges working across multiple context windows:
1. Each new session begins with no memory of what came before
2. Agents tend to try to one-shot complex tasks
3. Agents may declare victory prematurely
4. Environment often left in broken state

## The Solution

A two-part harness inspired by effective human engineering practices:

```
Session 1 (Initialization)           Session 2+ (Incremental)
┌─────────────────────────────┐     ┌─────────────────────────────┐
│     InitializerAgent        │     │       CodingAgent           │
│                             │     │                             │
│  1. Analyze specification   │     │  1. Read progress files     │
│  2. Generate feature list   │     │  2. Run health check        │
│  3. Create init.sh          │     │  3. Select ONE feature      │
│  4. Create progress file    │     │  4. Implement & test        │
│  5. Initial git commit      │     │  5. Commit & document       │
└─────────────────────────────┘     └─────────────────────────────┘
            │                                    │
            ▼                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Shared Artifacts                            │
│                                                                 │
│  claude-progress.txt  │  feature_list.json  │  init.sh  │ git  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Files

### claude-progress.txt

Session-by-session progress notes:

```json
{
  "project_name": "chat-app",
  "total_sessions": 5,
  "current_focus": "user-authentication",
  "next_steps": [
    "Add password reset",
    "Add remember me checkbox"
  ],
  "sessions": [
    {
      "session_id": "session_20241201_143022",
      "agent_type": "coding",
      "features_completed": ["new-chat", "send-message"],
      "commits_made": ["abc123: Implement chat UI"],
      "notes": "Completed basic chat flow"
    }
  ]
}
```

### feature_list.json

Structured feature requirements (JSON to prevent unwanted edits):

```json
{
  "features": [
    {
      "id": "new-chat-button",
      "category": "functional",
      "priority": "critical",
      "description": "New chat button creates a fresh conversation",
      "steps": [
        "Navigate to main interface",
        "Click the 'New Chat' button",
        "Verify a new conversation is created"
      ],
      "passes": false,
      "last_tested": null
    }
  ]
}
```

### init.sh

Environment setup script:

```bash
#!/bin/bash
pnpm install
pnpm dev &
sleep 5
echo 'Dev server started on http://localhost:3000'
```

## Usage

### Via Orchestrator

```python
from src.agents.orchestrator import OrchestratorAgent

orchestrator = OrchestratorAgent()

# Create harness for a new project
harness = orchestrator.create_long_running_harness(
    project_path="/projects/chat-app",
    project_name="chat-app",
    specification="Build a clone of claude.ai",
)

# Run a session (auto-detects init vs coding)
result = await harness.run_session()

# Check progress
print(orchestrator.get_project_progress("/projects/chat-app"))
```

### Direct Usage

```python
from src.agents.long_running import (
    LongRunningAgentHarness,
    SessionRunner,
)

# Option 1: Full harness
harness = LongRunningAgentHarness(
    project_path="/projects/chat-app",
    project_name="chat-app",
    specification="Build a clone of claude.ai",
)
result = await harness.run_session()

# Option 2: Simple runner
runner = SessionRunner("/projects/chat-app")
result = await runner.run("Build a clone of claude.ai")

# Option 3: Run until complete (with caution!)
results = await harness.run_until_complete(max_sessions=50)
```

## Session Workflow

### Initializer Agent (First Run)

1. **Analyze Specification**
   - Parse high-level project description
   - Identify required features

2. **Generate Feature List**
   - Create comprehensive feature_list.json
   - All features marked as `"passes": false`
   - Features organized by priority

3. **Create Init Script**
   - Write init.sh for environment setup
   - Include dev server startup

4. **Create Progress File**
   - Initialize claude-progress.txt
   - Document initial state

5. **Git Commit**
   - Create initial commit
   - Establish version control baseline

### Coding Agent (Subsequent Runs)

1. **Get Bearings**
   ```
   pwd                          # Check working directory
   git log --oneline -10        # Recent commits
   Read claude-progress.txt     # What was done
   Read feature_list.json       # What needs work
   ```

2. **Health Check**
   - Run init.sh to start dev server
   - Verify basic functionality works
   - Fix any existing bugs first

3. **Select Feature**
   - Pick highest priority failing feature
   - Check dependencies are met
   - Check no blockers

4. **Implement & Test**
   - Work on ONE feature at a time
   - Test end-to-end before marking complete
   - Use browser automation for UI testing

5. **Commit & Document**
   - Commit with descriptive message
   - Update progress file
   - Note next steps for next session

## Best Practices

### Incremental Progress

```python
# GOOD: Work on one feature at a time
feature = features.get_next_feature()
await implement_feature(feature)
await test_feature(feature)  # End-to-end!
features.mark_passing(feature.id)

# BAD: Try to do everything at once
for feature in features.get_all():
    implement_feature(feature)  # Will run out of context
```

### Clean State

```python
# Always leave environment clean
git add .
git commit -m "✅ feature-id: Description"

progress.end_session(
    notes="What was accomplished",
    next_steps=["What to do next"],
)
```

### End-to-End Testing

```python
# GOOD: Test as a user would
await browser.navigate("/")
await browser.click("#new-chat")
await browser.type("#input", "Hello")
await browser.click("#send")
assert await browser.wait_for(".response")

# BAD: Only check code
assert file_exists("component.tsx")  # Not enough!
```

### Feature List Discipline

```python
# NEVER remove or edit feature definitions
# ONLY change: passes, last_tested, tested_by_session, notes

# GOOD
features.mark_passing("feature-id")

# BAD
feature.description = "Changed requirement"  # Don't do this!
```

## Configuration

```python
HarnessConfig(
    project_path="/projects/app",
    project_name="my-app",
    specification="Build X",

    # Session limits
    max_sessions=100,
    session_timeout_seconds=3600,

    # Feature handling
    max_features_per_session=1,  # Stay incremental
    require_e2e_testing=True,

    # Environment
    run_health_check=True,
    auto_commit=True,
    browser_testing=True,
    dev_server_url="http://localhost:3000",
)
```

## Failure Mode Solutions

| Problem | Solution |
|---------|----------|
| Agent declares victory early | Feature list with all requirements marked failing |
| Environment left broken | Health check at session start, fix before continuing |
| Features marked complete prematurely | Require end-to-end testing before marking passing |
| Agent doesn't know what was done | Read progress file and git log at session start |
| Agent tries to do too much | Work on ONE feature per session |

## API Reference

### LongRunningAgentHarness

```python
harness = LongRunningAgentHarness(
    project_path: str,
    project_name: str,
    specification: str,
    config: Optional[HarnessConfig] = None,
)

# Methods
await harness.run_session() -> SessionResult
await harness.run_until_complete(max_sessions=50) -> list[SessionResult]
harness.get_state() -> HarnessState
harness.get_progress_summary() -> str
harness.get_feature_summary() -> str
harness.is_complete() -> bool
```

### SessionRunner

```python
runner = SessionRunner(project_path, project_name)

# Methods
await runner.run(specification: Optional[str]) -> dict
runner.is_initialized() -> bool
runner.get_progress() -> str
runner.get_features() -> str
```

### ProgressTracker

```python
tracker = ProgressTracker(project_path)

tracker.initialize(project_name)
tracker.start_session("coding")
tracker.record_feature_work(feature_id)
tracker.record_feature_complete(feature_id)
tracker.record_commit(hash, message)
tracker.end_session(notes, next_steps)
tracker.get_summary_for_context() -> str
```

### FeatureManager

```python
manager = FeatureManager(project_path)

manager.initialize(project_name, features)
manager.get_next_feature() -> Optional[Feature]
manager.get_failing_features() -> list[Feature]
manager.mark_passing(feature_id, session_id)
manager.mark_failing(feature_id, notes)
manager.get_stats() -> dict
manager.get_summary_for_context() -> str
```

## Related Skills

- `core/VERIFICATION.md` - Independent verification system
- `backend/ADVANCED-TOOL-USE.md` - Tool search and programmatic calling
- `ORCHESTRATOR.md` - Master orchestration

## References

- [Anthropic Blog: Effective harnesses for long-running agents](https://www.anthropic.com/research/long-running-agents)
- Claude Agent SDK Quickstart
