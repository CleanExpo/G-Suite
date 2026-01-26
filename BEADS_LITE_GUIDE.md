# Beads-Lite Integration Guide

## Overview

**Beads-Lite** is a lightweight task management system inspired by the [Beads methodology](https://github.com/steveyegge/beads.git), implemented in TypeScript for the G-Pilot multi-agent orchestration platform.

### What is Beads-Lite?

Beads-Lite provides:
- **Git-backed task storage**: Tasks stored as JSONL in `.beads/issues.jsonl`
- **Dependency-aware workflows**: Automatic status updates based on task dependencies
- **Hierarchical task IDs**: Epic.Task.Subtask naming (e.g., `bd-g5jnov.1`)
- **JSON-first API**: Designed for AI agent consumption
- **Auto-sync with Git**: Automatic commits with 30-second debouncing
- **Mission Overseer integration**: Seamless integration with G-Pilot's orchestration system

### Why Beads-Lite?

**Before Beads-Lite:**
- Tasks tracked in markdown (IMPLEMENTATION_PLAN.md)
- No persistent memory across missions
- Manual dependency management
- No git-native workflow
- Flat task structure

**After Beads-Lite:**
- Tasks stored in `.beads/issues.jsonl`
- Persistent tracking across sessions
- Automatic dependency resolution
- Git-backed with auto-sync
- Hierarchical task organization

---

## Quick Start

### 1. Initialize Beads-Lite

```bash
# Run migration to populate with Phase 9 tasks
npx tsx scripts/migrate-phase9-to-beads.ts
```

This creates:
- `.beads/` directory
- `.beads/issues.jsonl` with 25 Phase 9 tasks
- Adds `.beads/` to `.gitignore`

### 2. View Tasks

```typescript
import { getBeadsLite } from '@/lib/beads-lite';

const beads = getBeadsLite();
await beads.init();

// Get all ready tasks
const ready = beads.getReady();
console.log(`Ready tasks: ${ready.length}`);

// Get tasks by assignee
const architectTasks = beads.getByAssignee('genesis-architect');

// Get project stats
const stats = beads.getStats();
console.log(stats);
```

### 3. Complete a Task

```typescript
// Complete task bd-g5jnov.1
await beads.complete('bd-g5jnov.1');

// Dependent task bd-g5jnov.2 automatically becomes "ready"
```

---

## Architecture

### Directory Structure

```
G-Pilot/
├── .beads/
│   └── issues.jsonl           # JSONL task storage (git-tracked)
├── src/
│   ├── lib/
│   │   └── beads-lite.ts      # Core Beads-Lite implementation
│   └── agents/
│       └── beads-integration.ts # Mission Overseer integration
└── scripts/
    └── migrate-phase9-to-beads.ts # Migration script
```

### Task Data Model

```typescript
interface BeadsTask {
  id: string;                    // e.g., "bd-g5jnov" or "bd-g5jnov.1"
  title: string;                 // Short description
  status: TaskStatus;            // pending|ready|in_progress|blocked|completed
  priority: 0 | 1 | 2 | 3;       // 0=Urgent, 1=High, 2=Medium, 3=Low
  description?: string;          // Detailed description
  parent?: string;               // Parent task ID (for hierarchy)
  dependencies?: string[];       // Tasks that must complete first
  assignee?: string;             // Agent or user assigned
  tags?: string[];               // Tags for filtering
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  completedAt?: string;          // ISO timestamp
  metadata?: Record<string, any>; // Additional data
}
```

### Status Workflow

```
pending → ready → in_progress → completed
    ↓
  blocked (if dependencies not met)
```

**Automatic Status Updates:**
- Task created with no dependencies → `ready`
- Task created with dependencies → `blocked`
- All dependencies completed → `blocked` → `ready`
- Task completed → dependent tasks re-evaluated

---

## API Reference

### BeadsLite Class

#### Initialization

```typescript
import { BeadsLite, getBeadsLite, initBeads } from '@/lib/beads-lite';

// Option 1: Singleton instance
const beads = getBeadsLite();
await beads.init();

// Option 2: New instance
const beads = new BeadsLite('/path/to/repo');
await beads.init();

// Option 3: Init helper
const beads = await initBeads('/path/to/repo');
```

#### CRUD Operations

```typescript
// Create task
const task = await beads.create({
  title: 'Implement feature X',
  priority: 1,
  description: 'Add new authentication flow',
  assignee: 'genesis-architect',
  tags: ['feature', 'auth']
});

// Create child task
const subtask = await beads.create({
  title: 'Write tests for feature X',
  parent: task.id,
  dependencies: [task.id],
  assignee: 'independent-verifier'
});

// Update task
await beads.update(task.id, {
  status: 'in_progress',
  metadata: { startedAt: new Date().toISOString() }
});

// Complete task
await beads.complete(task.id);

// Delete task
await beads.delete(task.id);
```

#### Query Operations

```typescript
// Get all tasks
const all = beads.getAll();

// Get task by ID
const task = beads.get('bd-g5jnov');

// Get ready tasks (sorted by priority)
const ready = beads.getReady();

// Get by status
const inProgress = beads.getByStatus('in_progress');
const completed = beads.getByStatus('completed');

// Get by assignee
const myTasks = beads.getByAssignee('genesis-architect');

// Get by tag
const phaseTasks = beads.getByTag('phase-9');

// Get children
const subtasks = beads.getChildren('bd-g5jnov');

// Get full hierarchy (task + all descendants)
const hierarchy = beads.getHierarchy('bd-g5jnov');
```

#### Utilities

```typescript
// Get project statistics
const stats = beads.getStats();
console.log(stats);
// {
//   total: 25,
//   byStatus: { pending: 0, ready: 5, in_progress: 0, blocked: 20, completed: 0, cancelled: 0 },
//   byPriority: { urgent: 10, high: 6, medium: 7, low: 2 }
// }

// Export as JSON
const json = beads.exportJSON();
console.log(json);

// Manual Git sync
beads.syncToGit();

// Check for circular dependencies
const hasCircle = beads.hasCircularDependency('bd-g5jnov.1');
```

---

## Mission Overseer Integration

### Setup

```typescript
import { createBeadsOverseerIntegration } from '@/agents/beads-integration';

// Create integration
const beadsIntegration = await createBeadsOverseerIntegration();
```

### Track Missions

```typescript
import { MissionOverseer } from '@/agents/mission-overseer';
import { createBeadsOverseerIntegration } from '@/agents/beads-integration';

class EnhancedMissionOverseer extends MissionOverseer {
  private beadsIntegration?: any;

  async initialize() {
    this.beadsIntegration = await createBeadsOverseerIntegration();
  }

  async plan(context: MissionContext): Promise<Plan> {
    // Create Beads task for mission
    const beadsTaskId = await this.beadsIntegration.tracker.trackMission(context);

    // Generate plan
    const plan = await super.plan(context);

    // Create Beads tasks for plan steps
    const missionId = context.userId + '-' + Date.now();
    await this.beadsIntegration.tracker.trackPlan(missionId, beadsTaskId, plan.steps);

    return plan;
  }

  async execute(plan: Plan, context: MissionContext): Promise<ExecutionResult> {
    const missionId = context.userId + '-' + Date.now();

    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];

      // Mark step as in progress
      await this.beadsIntegration.tracker.updateStepProgress(missionId, i, 'in_progress');

      // Execute step
      const result = await this.executeStep(step, context);

      // Mark step as completed
      await this.beadsIntegration.tracker.updateStepProgress(missionId, i, 'completed');
    }

    return result;
  }

  async verify(result: ExecutionResult, context: MissionContext): Promise<Verification> {
    const verification = await super.verify(result, context);
    const missionId = context.userId + '-' + Date.now();

    // Complete mission task
    await this.beadsIntegration.tracker.completeMission(missionId, result);

    return verification;
  }
}
```

### Query Ready Tasks

```typescript
// Get ready tasks for specific agent
const readyForArchitect = await beadsIntegration.tracker.getReadyTasksForAgent('genesis-architect');

// Get all mission tasks
const missions = beadsIntegration.tracker.getMissionTasks();

// Get mission hierarchy
const hierarchy = beadsIntegration.tracker.getMissionHierarchy('bd-g5jnov');
```

---

## CLI Usage (Manual)

### BeadsCLI Class

```typescript
import { createBeadsCLI } from '@/agents/beads-integration';

const cli = await createBeadsCLI();

// Initialize
await cli.cmdInit();

// Create task
await cli.cmdCreate('Fix bug in login', {
  priority: 0,
  assignee: 'genesis-architect',
  description: 'Login fails with OAuth'
});

// Show ready tasks
await cli.cmdReady();
// Output:
// 📋 Ready Tasks (5):
//   [P0] bd-g5jnov: Phase 9.0: Streaming Sovereignty
//   [P0] bd-g5jnov.1: Task 9.0.1: Vercel AI SDK Integration
//   ...

// Show project status
await cli.cmdStatus();
// Output:
// 📊 Project Status:
//   Total Tasks: 25
//   By Status:
//     Pending:     0
//     Ready:       5
//     In Progress: 0
//     Blocked:     20
//     Completed:   0
//     Cancelled:   0
//   ...

// Complete task
await cli.cmdComplete('bd-g5jnov.1');

// Sync to Git
await cli.cmdSync();

// Export as JSON
const json = await cli.cmdExport();
```

---

## Phase 9 Task Structure

### Current Tasks (25 total)

```
bd-g5jnov: Phase 9.0: Streaming Sovereignty [P0, ready]
├── bd-g5jnov.1: Task 9.0.1: Vercel AI SDK Integration [P0, ready]
├── bd-g5jnov.2: Task 9.0.2: API Route Refactoring [P0, blocked]
├── bd-g5jnov.3: Task 9.0.3: Client Component Migration [P0, blocked]
├── bd-g5jnov.4: Task 9.0.4: Testing & Validation [P1, blocked]
└── bd-g5jnov.5: Task 9.0.5: Documentation & Rollout [P1, blocked]

bd-maskaw: Phase 9.1: Vault Hardening [P0, blocked]
├── bd-maskaw.1: Task 9.1.1: Database Schema Migration [P0, ready]
├── bd-maskaw.2: Task 9.1.2: Encryption Service Refactor [P0, blocked]
├── bd-maskaw.3: Task 9.1.3: Rotation API Endpoint [P0, blocked]
├── bd-maskaw.4: Task 9.1.4: Vault UI Integration [P1, blocked]
└── bd-maskaw.5: Task 9.1.5: Security Testing [P0, blocked]

bd-asmgl6: Phase 9.2: Granular Telemetry [P1, blocked]
├── bd-asmgl6.1: Task 9.2.1: Database Schema Extension [P1, ready]
├── bd-asmgl6.2: Task 9.2.2: Mission Overseer Cost Tracking [P1, blocked]
├── bd-asmgl6.3: Task 9.2.3: Cost Breakdown Query [P1, blocked]
├── bd-asmgl6.4: Task 9.2.4: Analytics Dashboard Component [P2, blocked]
└── bd-asmgl6.5: Task 9.2.5: Performance Testing [P2, blocked]

bd-ta4w9g: Phase 9.3: Advanced Orchestration [P2, blocked]
├── bd-ta4w9g.1: Task 9.3.1: PlanStep Schema Extension [P2, ready]
├── bd-ta4w9g.2: Task 9.3.2: DAG Executor Implementation [P2, blocked]
├── bd-ta4w9g.3: Task 9.3.3: Conditional Routing Logic [P2, blocked]
├── bd-ta4w9g.4: Task 9.3.4: Mission Overseer Integration [P2, blocked]
├── bd-ta4w9g.5: Task 9.3.5: Workflow Visualization [P3, blocked]
└── bd-ta4w9g.6: Task 9.3.6: Parallel Execution Testing [P1, blocked]
```

### Ready to Start (5 tasks)

1. **bd-g5jnov** - Phase 9.0: Streaming Sovereignty [P0]
2. **bd-g5jnov.1** - Task 9.0.1: Vercel AI SDK Integration [P0]
3. **bd-maskaw.1** - Task 9.1.1: Database Schema Migration [P0]
4. **bd-asmgl6.1** - Task 9.2.1: Database Schema Extension [P1]
5. **bd-ta4w9g.1** - Task 9.3.1: PlanStep Schema Extension [P2]

---

## File Format

### .beads/issues.jsonl

Each line is a JSON object representing a task:

```json
{"id":"bd-g5jnov","title":"Phase 9.0: Streaming Sovereignty","status":"ready","priority":0,"description":"Migrate from custom streaming protocol to Vercel AI SDK standard. Replace LOG:/RESULT:/ERROR: protocol with streamText() and useChat() hooks.","dependencies":[],"assignee":"mission-overseer","tags":["phase-9","epic","streaming","high-priority"],"createdAt":"2026-01-27T21:46:34.567Z","updatedAt":"2026-01-27T21:46:34.567Z"}
{"id":"bd-g5jnov.1","title":"Task 9.0.1: Vercel AI SDK Integration","status":"ready","priority":0,"description":"Install Vercel AI SDK (already at v6.0.49). Test streamText() with Gemini 2.0 Flash. Verify token-level streaming works.","parent":"bd-g5jnov","dependencies":[],"assignee":"genesis-architect","tags":["phase-9","task","backend","sdk"],"createdAt":"2026-01-27T21:46:34.568Z","updatedAt":"2026-01-27T21:46:34.568Z"}
...
```

**JSONL Benefits:**
- Line-oriented (merge-friendly)
- Easy to grep/filter
- Append-only for new tasks
- Human-readable

---

## Git Workflow

### Auto-Sync

Beads-Lite automatically commits changes to `.beads/issues.jsonl`:

```bash
# After any task update
git add .beads/
git commit -m "chore: update task tracking (beads-lite auto-sync)"
```

**Debouncing**: Changes are batched with a 30-second window to avoid excessive commits.

### Manual Sync

```typescript
const beads = getBeadsLite();
beads.syncToGit();
```

### Best Practices

1. **Commit before major work**: Ensure `.beads/` is synced before starting tasks
2. **Pull regularly**: Keep local task state in sync with remote
3. **Review .beads/ changes**: Use `git diff .beads/` to see task updates
4. **Merge conflicts**: Rare (hash-based IDs), but resolve manually if needed

---

## Comparison: Beads vs Beads-Lite

| Feature | Full Beads (Go) | Beads-Lite (TypeScript) |
|---------|----------------|-------------------------|
| **Installation** | Requires Go 1.24+ | No dependencies (pure TS) |
| **CLI** | `bd` command | BeadsCLI class |
| **Storage** | `.beads/issues.jsonl` | `.beads/issues.jsonl` |
| **Git Integration** | Auto-sync with daemon | Auto-sync with timer |
| **Dependency Graphs** | ✅ Yes | ✅ Yes |
| **Hierarchical IDs** | ✅ Yes | ✅ Yes |
| **Semantic Compaction** | ✅ Yes | ❌ No (future) |
| **Remote Sync** | ✅ Yes | ❌ No (future) |
| **Agent Integration** | JSON API | Native TypeScript API |
| **Performance** | High (compiled Go) | Good (Node.js) |
| **Ease of Setup** | Requires install | Instant (pure TS) |

---

## Roadmap

### v1.0 (Current)
- ✅ JSONL task storage
- ✅ Dependency-aware workflows
- ✅ Hierarchical task IDs
- ✅ Auto-sync with Git
- ✅ Mission Overseer integration
- ✅ Phase 9 migration script

### v1.1 (Next)
- [ ] Semantic compaction (reduce context window usage)
- [ ] Remote sync (push/pull from remote repos)
- [ ] Advanced queries (filter by date range, metadata)
- [ ] Task comments and history
- [ ] CLI command-line interface (bd-lite command)

### v1.2 (Future)
- [ ] Web UI for task visualization
- [ ] Integration with GitHub Issues
- [ ] Export to other formats (Markdown, CSV, Jira)
- [ ] Team collaboration features

---

## Troubleshooting

### Tasks not updating

```typescript
// Force reload from disk
await beads.load();
```

### Git sync not working

```bash
# Check git status
cd C:\G-Pilot
git status .beads/

# Manual sync
npx tsx -e "
import { getBeadsLite } from './src/lib/beads-lite.js';
const b = getBeadsLite();
await b.init();
b.syncToGit();
"
```

### Circular dependencies detected

```typescript
// Check for cycles
const hasCycle = beads.hasCircularDependency('bd-g5jnov.1');
if (hasCycle) {
  console.error('Circular dependency detected!');
}
```

### Reset all tasks

```bash
# Delete .beads directory
rm -rf .beads/

# Re-run migration
npx tsx scripts/migrate-phase9-to-beads.ts
```

---

## Contributing

### Adding New Tasks

```typescript
const task = await beads.create({
  title: 'Your task title',
  priority: 1,
  description: 'Detailed description',
  assignee: 'agent-name',
  tags: ['feature', 'phase-10']
});
```

### Creating Migrations

```typescript
// scripts/migrate-custom-tasks.ts
import { BeadsLite } from '../src/lib/beads-lite';

const tasks = [
  { id: 'custom-1', title: 'Task 1', priority: 0, description: '...' },
  { id: 'custom-2', title: 'Task 2', priority: 1, parent: 'custom-1', description: '...' }
];

const beads = new BeadsLite();
await beads.init();

for (const task of tasks) {
  await beads.create(task);
}
```

---

## References

- **Original Beads**: https://github.com/steveyegge/beads.git
- **Beads Proposal**: C:\G-Pilot\BEADS_INTEGRATION_PROPOSAL.md
- **Implementation Plan**: C:\G-Pilot\IMPLEMENTATION_PLAN.md
- **Phase 9 Spec**: C:\G-Pilot\PHASE_9_SPEC.md

---

## Support

For issues or questions:
1. Check `.beads/issues.jsonl` for task data
2. Run `beads.getStats()` for project overview
3. Review `BEADS_INTEGRATION_PROPOSAL.md` for design rationale
4. Open GitHub issue in G-Pilot repository

---

**Last Updated**: 2026-01-27
**Version**: 1.0.0
**Status**: Production Ready ✅
