# BEADS WORKFLOW INTEGRATION PROPOSAL
**Adopting Agent-Optimized Task Management for G-Pilot**

> Comprehensive proposal to integrate Beads methodology for superior AI agent workflow management

**Created**: 2026-01-27
**Status**: PROPOSAL
**Priority**: HIGH
**Requires Approval**: YES

---

## EXECUTIVE SUMMARY

**Beads** (https://github.com/steveyegge/beads) is a distributed, git-backed graph issue tracker specifically designed for AI agents. After analyzing the repository, I've identified key workflow methodologies that would significantly improve G-Pilot's development process, particularly for multi-agent coordination and Phase 9 execution.

### Key Value Propositions

1. **Persistent Structured Memory**: Replace messy markdown plans with dependency-aware graphs
2. **Git-Native**: Issues stored as JSONL, versioned and branched like code
3. **Zero Merge Conflicts**: Hash-based IDs prevent collisions in multi-agent workflows
4. **Agent-Optimized**: JSON output, auto-ready task detection, semantic memory decay
5. **Mandatory Completion**: "Landing the plane" workflow ensures work is never stranded

### Recommended Action

**HYBRID APPROACH**: Integrate Beads concepts into G-Pilot without replacing existing systems.

---

## TABLE OF CONTENTS

1. [What is Beads?](#what-is-beads)
2. [Why G-Pilot Needs This](#why-g-pilot-needs-this)
3. [Key Concepts from Beads](#key-concepts-from-beads)
4. [Integration Proposal](#integration-proposal)
5. [Implementation Plan](#implementation-plan)
6. [Comparison: Current vs. Proposed](#comparison-current-vs-proposed)
7. [Risk Analysis](#risk-analysis)
8. [Approval & Next Steps](#approval--next-steps)

---

## WHAT IS BEADS?

### Overview

**Beads (bd)** is a distributed, git-backed graph issue tracker for AI agents, written in Go by Steve Yegge (ex-Google, ex-Amazon).

**Core Features**:
- **Git as Database**: Issues stored as JSONL in `.beads/` directory
- **Dependency Graphs**: Tasks can block, depend on, or relate to other tasks
- **Agent-Optimized**: JSON output, structured format, automatic ready-task detection
- **Zero Conflict**: Hash-based IDs (`bd-a1b2`) prevent merge collisions
- **Auto-Sync**: Background daemon with export/import/commit/push automation
- **Compaction**: Semantic "memory decay" summarizes old closed tasks to save context

### Example Workflow

```bash
# Initialize (once)
bd init

# Create tasks
bd create "Implement streaming API" -p 0 --json
# Output: {"id": "bd-a3f8", "title": "Implement streaming API", ...}

# Create sub-task with dependency
bd create "Add Vercel AI SDK" -p 0 --parent bd-a3f8 --json
# Output: {"id": "bd-a3f8.1", ...}

# List ready tasks (no blockers)
bd ready --json
# Output: [{"id": "bd-a3f8.1", "title": "Add Vercel AI SDK", "blockers": []}]

# Update status
bd update bd-a3f8.1 --status in_progress --json

# Close task
bd close bd-a3f8.1 --reason "Completed Vercel AI SDK integration" --json

# Auto-sync to git
bd sync
```

### File Structure

```
.beads/
├── issues.jsonl          # All issues (append-only log)
├── config.yaml           # Beads configuration
├── beads.db              # SQLite cache (auto-generated)
└── README.md             # Beads guide
```

### Issue Format (JSONL)

```json
{
  "id": "bd-a3f8",
  "title": "Implement streaming API",
  "description": "Migrate from custom protocol to Vercel AI SDK",
  "status": "in_progress",
  "priority": 0,
  "issue_type": "task",
  "created_at": "2026-01-27T10:00:00Z",
  "updated_at": "2026-01-27T10:30:00Z",
  "dependencies": [
    {"issue_id": "bd-a3f8", "depends_on_id": "bd-xyz", "type": "blocks"}
  ]
}
```

---

## WHY G-PILOT NEEDS THIS

### Current State Problems

#### Problem 1: No Persistent Task Tracking
**Current**: Tasks defined in markdown files (IMPLEMENTATION_PLAN.md, PHASE_9_SPEC.md)
- ❌ No automatic status tracking
- ❌ Markdown files become stale quickly
- ❌ No dependency management
- ❌ Hard to query (what's ready to work on?)

**Impact**: Mission Overseer cannot autonomously pick next tasks

#### Problem 2: Context Loss Between Sessions
**Current**: No session handoff mechanism
- ❌ Agents don't know what was completed
- ❌ No "ready" task list
- ❌ Work gets duplicated or forgotten

**Impact**: Poor multi-agent coordination

#### Problem 3: No Git-Native Workflow
**Current**: Manual git commits, no structured workflow
- ❌ Easy to forget to push changes
- ❌ No "landing the plane" enforcement
- ❌ Work stranded in local branches

**Impact**: Multi-agent workflows break (rebase conflicts, lost work)

#### Problem 4: No Dependency Graph
**Current**: Dependencies mentioned in text, not enforced
- ❌ Can't automatically find "ready" tasks
- ❌ No blocker detection
- ❌ Manual tracking of what's blocked

**Impact**: Inefficient task selection

#### Problem 5: Flat Task Structure
**Current**: No hierarchical organization (Epic → Task → Subtask)
- ❌ Hard to track progress on large features
- ❌ No automatic rollup of subtask status

**Impact**: Poor visibility into Phase 9 progress

---

## KEY CONCEPTS FROM BEADS

### 1. Git-Backed Storage

**Concept**: Issues stored as JSONL in `.beads/issues.jsonl`, committed to git

**Benefits**:
- ✅ Versioned with code
- ✅ Branched with code
- ✅ Merged with code
- ✅ Full audit trail
- ✅ Works offline

**Application to G-Pilot**:
```
.gpilot/
├── tasks.jsonl           # All Phase 9 tasks
├── config.yaml           # G-Pilot task config
└── README.md             # Task tracking guide
```

### 2. Dependency Graphs

**Concept**: Tasks have explicit dependencies (blocks, depends-on, parent-child)

**Example**:
```json
{
  "id": "task-9.0.2",
  "title": "API Route Refactoring",
  "dependencies": [
    {"issue_id": "task-9.0.2", "depends_on_id": "task-9.0.1", "type": "blocks"}
  ]
}
```

**Benefits**:
- ✅ Automatic "ready" task detection
- ✅ Blocker visibility
- ✅ Critical path identification

**Application to G-Pilot**:
```bash
# Mission Overseer can query:
gpilot ready --json
# Returns: [{"id": "task-9.0.1", "title": "SDK Integration", "blockers": []}]
```

### 3. Hierarchical IDs

**Concept**: Epic.Task.Subtask structure

**Example**:
```
phase-9.0                    # Epic: Streaming Sovereignty
├── phase-9.0.1              # Task: SDK Integration
├── phase-9.0.2              # Task: API Refactoring
│   ├── phase-9.0.2.1        # Subtask: Update route.ts
│   └── phase-9.0.2.2        # Subtask: Add streaming tests
└── phase-9.0.3              # Task: Client Migration
```

**Benefits**:
- ✅ Clear structure
- ✅ Easy to find all tasks in a phase
- ✅ Automatic progress rollup

### 4. JSON-First Interface

**Concept**: All commands support `--json` flag for agent consumption

**Example**:
```bash
# Human-readable
bd ready
○ bd-a3f8 - Implement streaming API (P0)

# Agent-readable
bd ready --json
[{"id": "bd-a3f8", "title": "Implement streaming API", "priority": 0}]
```

**Application to G-Pilot**:
```typescript
// Mission Overseer can parse JSON directly
const readyTasks = await execSync('gpilot ready --json');
const tasks = JSON.parse(readyTasks);

for (const task of tasks) {
  await executeTask(task);
}
```

### 5. "Landing the Plane" Workflow

**Concept**: Mandatory completion checklist at end of session

**Steps**:
1. File issues for remaining work
2. Run quality gates (tests, linters)
3. Update issue status
4. **Push to remote** (mandatory)
5. Clean up git state
6. Verify everything pushed
7. Provide next session context

**Critical Rule**: Work is NOT complete until `git push` succeeds

**Application to G-Pilot**:
```bash
# Mission Overseer end-of-session
gpilot land
# Runs:
# - gpilot sync (export tasks, commit)
# - git push
# - gpilot verify (check all pushed)
# - gpilot next (suggest next task)
```

### 6. Auto-Sync with Debouncing

**Concept**: Automatic export/import with 30-second batching window

**Mechanism**:
- Changes debounced for 30 seconds (batch operations)
- Auto-export to JSONL after batch window
- Auto-import after `git pull`
- Auto-commit/push every 5 seconds (optional)

**Benefits**:
- ✅ No manual export/import
- ✅ Batch operations avoid commit spam
- ✅ Always in sync with remote

### 7. Ready Task Detection

**Concept**: `bd ready` shows tasks with no open blockers

**Algorithm**:
```
FOR each open task:
  IF all dependencies are closed:
    AND no parent is blocked:
    AND status != blocked:
      THEN task is ready
```

**Application to G-Pilot**:
```typescript
// Mission Overseer starts day
const readyTasks = await getReadyTasks();
console.log(`Found ${readyTasks.length} ready tasks`);

// Pick highest priority
const nextTask = readyTasks.sort((a, b) => a.priority - b.priority)[0];
await executeTask(nextTask);
```

### 8. Semantic Compaction

**Concept**: Summarize old closed tasks to save context window

**Process**:
- Closed tasks older than 30 days
- Summarized by LLM
- Original tasks converted to "tombstones"
- Summary stored in issues.jsonl

**Benefits**:
- ✅ Keeps context window manageable
- ✅ Preserves historical context
- ✅ Automatic cleanup

---

## INTEGRATION PROPOSAL

### Recommended Approach: HYBRID MODEL

**Don't replace existing tools** - instead, integrate Beads concepts into G-Pilot workflow.

### Option A: Full Beads Integration (Recommended)

**Install Beads as dependency**:
```bash
cd C:\G-Pilot
bd init

# Create Phase 9 epic
bd create "Phase 9: Streaming, Vault, Telemetry, Orchestration" -p 0 --json

# Create Phase 9.0 tasks from IMPLEMENTATION_PLAN.md
bd create "Task 9.0.1: Vercel AI SDK Integration" -p 0 --parent phase-9 --json
bd create "Task 9.0.2: API Route Refactoring" -p 0 --parent phase-9 --json
# ... more tasks
```

**Pros**:
- ✅ Battle-tested tool (used in production by Steve Yegge's teams)
- ✅ Active development (1,194 files, frequent commits)
- ✅ Zero implementation cost (just install and use)
- ✅ Rich feature set (compaction, auto-sync, daemon)
- ✅ Go binary (fast, no runtime dependencies)

**Cons**:
- ❌ External dependency
- ❌ Learning curve for team
- ❌ Go tool (not TypeScript native)

### Option B: Custom Implementation (G-Pilot Tasks)

**Build custom system inspired by Beads**:
```
.gpilot/
├── tasks.jsonl           # Task storage (JSONL format)
├── gpilot-cli.ts         # CLI tool (TypeScript)
└── README.md
```

**Commands**:
```bash
npx gpilot create "Task title" -p 0 --json
npx gpilot ready --json
npx gpilot update task-123 --status in_progress
npx gpilot close task-123 --reason "Completed"
npx gpilot sync  # Export, commit, push
npx gpilot land  # End-of-session workflow
```

**Pros**:
- ✅ Full control
- ✅ TypeScript native
- ✅ Customized for G-Pilot
- ✅ No external dependencies

**Cons**:
- ❌ Implementation cost (2-3 weeks)
- ❌ Maintenance burden
- ❌ Reinventing the wheel
- ❌ Not battle-tested

### Option C: Lightweight Integration (Minimal)

**Just adopt the concepts, not the tool**:

1. **Git-Native Tasks**: Store tasks in `.gpilot/tasks.jsonl`
2. **JSON Format**: Use structured format (not markdown)
3. **Landing the Plane**: Add end-of-session checklist to agent instructions
4. **Dependency Tracking**: Add `blockedBy` field to tasks

**Pros**:
- ✅ Minimal implementation
- ✅ No external tools
- ✅ Adopts best practices

**Cons**:
- ❌ Manual implementation of each feature
- ❌ No auto-sync
- ❌ No ready task detection

---

## IMPLEMENTATION PLAN

### Recommended: Option A (Full Beads Integration)

**Timeline**: 1-2 days

#### Step 1: Install Beads (30 minutes)

```bash
# Install bd CLI
cd C:\G-Pilot
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Or use npm
npm install -g @beads/bd

# Verify installation
bd version
```

#### Step 2: Initialize Beads in G-Pilot (15 minutes)

```bash
cd C:\G-Pilot
bd init

# Configure for G-Pilot
bd config set prefix "gpilot"

# Create .gitignore entry for beads cache
echo ".beads/beads.db" >> .gitignore
echo ".beads/*.lock" >> .gitignore

# Commit beads directory
git add .beads/
git commit -m "feat: initialize Beads task tracking for G-Pilot"
git push
```

#### Step 3: Migrate Phase 9 Tasks to Beads (2-3 hours)

**Create script**: `scripts/migrate-tasks-to-beads.ts`

```typescript
// scripts/migrate-tasks-to-beads.ts

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

interface Task {
  id: string;
  title: string;
  priority: number;
  parent?: string;
  dependencies?: string[];
  description?: string;
}

// Parse IMPLEMENTATION_PLAN.md
const tasks: Task[] = [
  // Phase 9.0
  {
    id: 'phase-9.0',
    title: 'Phase 9.0: Streaming Sovereignty',
    priority: 0,
    description: 'Migrate from custom protocol to Vercel AI SDK'
  },
  {
    id: 'phase-9.0.1',
    title: 'Task 9.0.1: Vercel AI SDK Integration',
    priority: 0,
    parent: 'phase-9.0',
    description: 'Install and test Vercel AI SDK with Gemini'
  },
  {
    id: 'phase-9.0.2',
    title: 'Task 9.0.2: API Route Refactoring',
    priority: 0,
    parent: 'phase-9.0',
    dependencies: ['phase-9.0.1'],
    description: 'Replace custom streaming with streamText()'
  },
  // ... more tasks
];

// Create tasks in Beads
for (const task of tasks) {
  const cmd = [
    'bd create',
    `"${task.title}"`,
    `-p ${task.priority}`,
    task.parent ? `--parent ${task.parent}` : '',
    '--json'
  ].filter(Boolean).join(' ');

  const result = execSync(cmd, { encoding: 'utf-8' });
  const created = JSON.parse(result);

  console.log(`✅ Created: ${created.id} - ${created.title}`);

  // Add dependencies
  if (task.dependencies) {
    for (const dep of task.dependencies) {
      execSync(`bd dep add ${created.id} ${dep}`);
      console.log(`  ↳ Depends on: ${dep}`);
    }
  }
}

console.log('✅ Migration complete!');
```

**Run migration**:
```bash
npx tsx scripts/migrate-tasks-to-beads.ts
```

#### Step 4: Update Agent Instructions (30 minutes)

**Create**: `AGENT_WORKFLOW.md`

```markdown
# Agent Workflow with Beads

## Starting a Session

1. **Check ready tasks**:
   ```bash
   bd ready --json
   ```

2. **Pick highest priority task**:
   ```bash
   bd show <task-id> --json
   ```

3. **Mark as in-progress**:
   ```bash
   bd update <task-id> --status in_progress --json
   ```

## During Work

1. **Create sub-tasks as needed**:
   ```bash
   bd create "Sub-task title" -p 0 --parent <task-id> --json
   ```

2. **Update progress**:
   ```bash
   bd update <task-id> --notes "Completed API refactoring" --json
   ```

## Landing the Plane

**MANDATORY at end of session**:

```bash
# 1. File remaining work
bd create "Follow-up: Add integration tests" -p 1 --json

# 2. Close completed tasks
bd close <task-id> --reason "Completed implementation" --json

# 3. Sync to git (export, commit, push)
bd sync

# 4. Verify push succeeded
git status  # MUST show "up to date with origin/main"

# 5. Check next ready tasks
bd ready --json
```

**CRITICAL**: Work is NOT complete until `git push` succeeds!
```

**Update**: `AGENTS.md`

```markdown
# G-Pilot Agent Instructions

## Task Management

G-Pilot uses **Beads** for persistent task tracking.

**Essential Commands**:
- `bd ready --json` - List tasks ready to work on
- `bd update <id> --status in_progress` - Start working
- `bd close <id> --reason "Completed"` - Finish task
- `bd sync` - Commit and push changes

See [AGENT_WORKFLOW.md](AGENT_WORKFLOW.md) for complete workflow.
```

#### Step 5: Integrate with Mission Overseer (4-6 hours)

**Update**: `src/agents/mission-overseer.ts`

```typescript
// src/agents/mission-overseer.ts

import { execSync } from 'child_process';

interface BeadsTask {
  id: string;
  title: string;
  description: string;
  priority: number;
  status: string;
  dependencies: Array<{ depends_on_id: string; type: string }>;
}

export class MissionOverseerAgent extends BaseAgent {
  // ... existing code

  /**
   * Get ready tasks from Beads
   */
  async getReadyTasks(): Promise<BeadsTask[]> {
    try {
      const output = execSync('bd ready --json', { encoding: 'utf-8' });
      const tasks: BeadsTask[] = JSON.parse(output);

      // Filter by priority (P0 and P1 only)
      return tasks.filter(t => t.priority <= 1);
    } catch (error) {
      console.error('Failed to get ready tasks from Beads:', error);
      return [];
    }
  }

  /**
   * Auto-select next task
   */
  async selectNextTask(): Promise<BeadsTask | null> {
    const readyTasks = await this.getReadyTasks();

    if (readyTasks.length === 0) {
      console.log('No ready tasks available');
      return null;
    }

    // Sort by priority (P0 first)
    readyTasks.sort((a, b) => a.priority - b.priority);

    return readyTasks[0];
  }

  /**
   * Mark task as in-progress
   */
  async startTask(taskId: string): Promise<void> {
    execSync(`bd update ${taskId} --status in_progress --json`);
    console.log(`Started task: ${taskId}`);
  }

  /**
   * Complete task
   */
  async completeTask(taskId: string, reason: string): Promise<void> {
    execSync(`bd close ${taskId} --reason "${reason}" --json`);
    console.log(`Completed task: ${taskId}`);
  }

  /**
   * Land the plane (end of session)
   */
  async landThePlane(): Promise<void> {
    console.log('Landing the plane...');

    // 1. Sync to git
    execSync('bd sync');

    // 2. Verify push succeeded
    const status = execSync('git status', { encoding: 'utf-8' });
    if (!status.includes('up to date')) {
      throw new Error('Failed to push changes! Plane NOT landed.');
    }

    // 3. Get next ready tasks
    const readyTasks = await this.getReadyTasks();

    console.log('✅ Plane landed successfully!');
    console.log(`Next ready tasks: ${readyTasks.length}`);

    return readyTasks;
  }
}
```

#### Step 6: Update Dashboard UI (Optional - 2-3 hours)

**Create**: `src/components/BeadsTaskList.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { execSync } from 'child_process';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: number;
}

export function BeadsTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      // Call API route that wraps `bd ready --json`
      const response = await fetch('/api/beads/ready');
      const data = await response.json();
      setTasks(data.tasks);
      setLoading(false);
    }
    loadTasks();
  }, []);

  if (loading) return <Spinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ready Tasks</CardTitle>
        <CardDescription>Tasks ready to work on (no blockers)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-mono">{task.id}</TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  <Badge variant={task.priority === 0 ? 'destructive' : 'default'}>
                    P{task.priority}
                  </Badge>
                </TableCell>
                <TableCell>{task.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

#### Step 7: Test & Validate (2-3 hours)

**Test Checklist**:
- [ ] `bd ready` shows correct tasks
- [ ] `bd update` changes status
- [ ] `bd close` marks tasks complete
- [ ] `bd sync` commits and pushes
- [ ] Mission Overseer can query tasks
- [ ] Dashboard displays task list
- [ ] Multi-agent workflow works (no conflicts)

---

## COMPARISON: CURRENT VS. PROPOSED

| Feature | Current (Markdown) | Proposed (Beads) |
|---------|-------------------|------------------|
| **Task Storage** | IMPLEMENTATION_PLAN.md | `.beads/issues.jsonl` |
| **Format** | Markdown tables | JSONL (structured) |
| **Versioning** | Git (manual) | Git (auto-sync) |
| **Dependencies** | Text mention | Explicit graph |
| **Ready Tasks** | Manual inspection | `bd ready --json` |
| **Status Tracking** | Manual checkboxes | Automated |
| **Multi-Agent** | Conflicts likely | Zero conflicts |
| **Query API** | None | JSON output |
| **Hierarchy** | Flat | Epic.Task.Subtask |
| **Auto-Sync** | Manual git | 30s debounce + daemon |
| **Landing Plane** | No enforcement | Mandatory workflow |
| **Context Window** | Grows unbounded | Semantic compaction |

---

## RISK ANALYSIS

### Risk 1: External Dependency
**Probability**: Low | **Impact**: Medium

**Mitigation**:
- Beads is open-source (MIT license)
- Go binary (no runtime dependencies)
- Can fork if needed
- Fallback: Option C (lightweight integration)

### Risk 2: Learning Curve
**Probability**: Medium | **Impact**: Low

**Mitigation**:
- Simple CLI (10 core commands)
- Comprehensive documentation
- Agent-friendly (JSON output)
- Training session for team

### Risk 3: Tool Adoption Resistance
**Probability**: Medium | **Impact**: Low

**Mitigation**:
- Start with Phase 9 only (pilot)
- Show value quickly (ready tasks, auto-sync)
- Optional for manual work (markdown still works)
- Easy to uninstall if doesn't work

### Risk 4: Integration Complexity
**Probability**: Low | **Impact**: Low

**Mitigation**:
- Simple integration (execSync wrapper)
- No database changes needed
- Mission Overseer owns integration
- Gradual rollout

---

## APPROVAL & NEXT STEPS

### Stakeholder Sign-Off Required

- [ ] **Product Owner**: Approve workflow changes
- [ ] **Tech Lead**: Approve technical approach
- [ ] **Backend Team**: Review Mission Overseer integration
- [ ] **DevOps**: Review git workflow changes
- [ ] **Security**: Review external dependency (Beads)

### Approval Criteria

**Must Answer**:
1. Does this solve our task tracking problems? (Yes/No)
2. Is Option A (Full Beads) better than Option B (Custom)? (Yes/No)
3. Is the implementation timeline acceptable? (1-2 days)
4. Are risks acceptable and mitigations sufficient? (Yes/No)
5. Should we proceed with pilot for Phase 9? (Yes/No)

### Immediate Next Steps (After Approval)

**Day 1**:
1. Install Beads CLI in G-Pilot repo
2. Initialize `.beads/` directory
3. Migrate Phase 9 tasks from IMPLEMENTATION_PLAN.md
4. Update AGENTS.md with workflow instructions
5. Commit and push to GitHub

**Day 2**:
6. Integrate with Mission Overseer (task selection)
7. Create "land the plane" workflow
8. Test multi-agent coordination
9. Update Phase 9 documentation
10. Train team on new workflow

**Week 1**:
- Pilot with Phase 9.0 (Streaming Sovereignty)
- Gather feedback
- Iterate on workflow
- Decide: rollout to all phases or rollback

---

## RECOMMENDED DECISION

**Approve Option A: Full Beads Integration**

**Rationale**:
1. ✅ Solves all current problems (context loss, no dependencies, manual git)
2. ✅ Zero implementation cost (just install and use)
3. ✅ Battle-tested by Steve Yegge's teams
4. ✅ Perfect fit for AI agents (JSON-first, auto-sync)
5. ✅ Low risk (can uninstall if doesn't work)
6. ✅ High reward (better multi-agent coordination)

**Timeline**: 1-2 days (vs. 2-3 weeks for custom implementation)

**Cost**: $0 (open-source tool)

**ROI**: High (immediate improvement in workflow efficiency)

---

## APPENDIX A: Beads Command Reference

### Core Commands

```bash
# Create task
bd create "Title" -p <0-3> --json
bd create "Sub-task" --parent <id> --json

# List tasks
bd list --json                    # All open tasks
bd ready --json                   # Ready tasks (no blockers)
bd list --status in_progress      # Tasks in progress

# Show task details
bd show <id> --json

# Update task
bd update <id> --status <status> --json
bd update <id> --description "New description"
bd update <id> --notes "Progress notes"

# Dependencies
bd dep add <child-id> <parent-id>        # Blocks
bd dep remove <child-id> <parent-id>

# Close task
bd close <id> --reason "Completed" --json

# Sync to git
bd sync                           # Export, commit, push
```

### Status Values
- `open` (default)
- `in_progress`
- `blocked`
- `closed`

### Priority Values
- `0` (P0 - Critical)
- `1` (P1 - High)
- `2` (P2 - Medium)
- `3` (P3 - Low)

---

## APPENDIX B: Sample Migration Script Output

```bash
$ npx tsx scripts/migrate-tasks-to-beads.ts

Migrating Phase 9 tasks to Beads...

✅ Created: gpilot-9.0 - Phase 9.0: Streaming Sovereignty
✅ Created: gpilot-9.0.1 - Task 9.0.1: Vercel AI SDK Integration
  ↳ Parent: gpilot-9.0
✅ Created: gpilot-9.0.2 - Task 9.0.2: API Route Refactoring
  ↳ Parent: gpilot-9.0
  ↳ Depends on: gpilot-9.0.1
✅ Created: gpilot-9.0.3 - Task 9.0.3: Client Component Migration
  ↳ Parent: gpilot-9.0
  ↳ Depends on: gpilot-9.0.2
✅ Created: gpilot-9.0.4 - Task 9.0.4: Testing & Validation
  ↳ Parent: gpilot-9.0
  ↳ Depends on: gpilot-9.0.3
✅ Created: gpilot-9.0.5 - Task 9.0.5: Documentation & Rollout
  ↳ Parent: gpilot-9.0
  ↳ Depends on: gpilot-9.0.4

✅ Created: gpilot-9.1 - Phase 9.1: Vault Hardening
✅ Created: gpilot-9.1.1 - Task 9.1.1: Database Schema Migration
  ↳ Parent: gpilot-9.1
... (more tasks)

✅ Migration complete! Created 47 tasks.

Next steps:
1. Run: bd ready --json
2. Pick a task and start: bd update <id> --status in_progress
3. When done: bd close <id> --reason "Completed"
4. Sync: bd sync
```

---

**END OF PROPOSAL**

**Next Action**: Review and approve this proposal, then proceed with Day 1 implementation.

---

*Generated with comprehensive analysis of https://github.com/steveyegge/beads*
*Proposal Author: Mission Overseer Agent*
*Date: 2026-01-27*
