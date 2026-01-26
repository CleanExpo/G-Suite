/**
 * Migration Script: Phase 9 Tasks to Beads-Lite
 *
 * Migrates Phase 9 tasks from IMPLEMENTATION_PLAN.md to Beads-Lite
 * task management system.
 *
 * Usage:
 *   npx tsx scripts/migrate-phase9-to-beads.ts
 */

import { BeadsLite } from '../src/lib/beads-lite';
import path from 'path';

// ============================================================================
// PHASE 9 TASK DEFINITIONS
// ============================================================================

interface TaskDefinition {
  id: string;
  title: string;
  priority: 0 | 1 | 2 | 3;
  description: string;
  parent?: string;
  dependencies?: string[];
  assignee?: string;
  tags?: string[];
}

const PHASE_9_TASKS: TaskDefinition[] = [
  // ========================================================================
  // PHASE 9.0: STREAMING SOVEREIGNTY
  // ========================================================================
  {
    id: 'phase-9.0',
    title: 'Phase 9.0: Streaming Sovereignty',
    priority: 0,
    description: 'Migrate from custom streaming protocol to Vercel AI SDK standard. Replace LOG:/RESULT:/ERROR: protocol with streamText() and useChat() hooks.',
    assignee: 'mission-overseer',
    tags: ['phase-9', 'epic', 'streaming', 'high-priority']
  },
  {
    id: 'phase-9.0.1',
    title: 'Task 9.0.1: Vercel AI SDK Integration',
    priority: 0,
    description: 'Install Vercel AI SDK (already at v6.0.49). Test streamText() with Gemini 2.0 Flash. Verify token-level streaming works.',
    parent: 'phase-9.0',
    assignee: 'genesis-architect',
    tags: ['phase-9', 'task', 'backend', 'sdk']
  },
  {
    id: 'phase-9.0.2',
    title: 'Task 9.0.2: API Route Refactoring',
    priority: 0,
    description: 'Refactor src/app/api/agents/route.ts to use streamText(). Replace custom ReadableStream with result.toDataStreamResponse(). Inject Mission Overseer logs via experimental_transform.',
    parent: 'phase-9.0',
    dependencies: ['phase-9.0.1'],
    assignee: 'genesis-architect',
    tags: ['phase-9', 'task', 'backend', 'api']
  },
  {
    id: 'phase-9.0.3',
    title: 'Task 9.0.3: Client Component Migration',
    priority: 0,
    description: 'Migrate src/components/MissionModal.tsx to use useChat() hook. Remove custom fetch logic. Add typing indicators and progress states.',
    parent: 'phase-9.0',
    dependencies: ['phase-9.0.2'],
    assignee: 'content-orchestrator',
    tags: ['phase-9', 'task', 'frontend', 'react']
  },
  {
    id: 'phase-9.0.4',
    title: 'Task 9.0.4: Testing & Validation',
    priority: 1,
    description: 'Run full test suite. Add streaming tests. Verify latency <100ms. Ensure zero protocol errors in 100 test missions.',
    parent: 'phase-9.0',
    dependencies: ['phase-9.0.3'],
    assignee: 'independent-verifier',
    tags: ['phase-9', 'task', 'testing', 'qa']
  },
  {
    id: 'phase-9.0.5',
    title: 'Task 9.0.5: Documentation & Rollout',
    priority: 1,
    description: 'Update STREAMING.md with Vercel AI SDK patterns. Document useChat() API. Add migration guide. Deploy to production.',
    parent: 'phase-9.0',
    dependencies: ['phase-9.0.4'],
    assignee: 'content-orchestrator',
    tags: ['phase-9', 'task', 'documentation', 'deployment']
  },

  // ========================================================================
  // PHASE 9.1: VAULT HARDENING
  // ========================================================================
  {
    id: 'phase-9.1',
    title: 'Phase 9.1: Vault Hardening',
    priority: 0,
    description: 'Implement backend key rotation logic for Vault UI. Add AES-256-GCM key versioning, graceful migration, and audit logging.',
    dependencies: ['phase-9.0'],
    assignee: 'mission-overseer',
    tags: ['phase-9', 'epic', 'security', 'high-priority']
  },
  {
    id: 'phase-9.1.1',
    title: 'Task 9.1.1: Database Schema Migration',
    priority: 0,
    description: 'Add keyVersion field to UserProfile schema. Add keyRotationHistory JSON field. Create Prisma migration.',
    parent: 'phase-9.1',
    assignee: 'genesis-architect',
    tags: ['phase-9', 'task', 'database', 'prisma']
  },
  {
    id: 'phase-9.1.2',
    title: 'Task 9.1.2: Encryption Service Refactor',
    priority: 0,
    description: 'Implement rotateEncryptionKeys() in src/lib/encryption.ts. Add key versioning support. Implement graceful decryption (try all versions).',
    parent: 'phase-9.1',
    dependencies: ['phase-9.1.1'],
    assignee: 'genesis-architect',
    tags: ['phase-9', 'task', 'backend', 'crypto']
  },
  {
    id: 'phase-9.1.3',
    title: 'Task 9.1.3: Rotation API Endpoint',
    priority: 0,
    description: 'Create POST /api/vault/rotate endpoint. Implement rotation workflow with transaction safety. Add audit logging.',
    parent: 'phase-9.1',
    dependencies: ['phase-9.1.2'],
    assignee: 'genesis-architect',
    tags: ['phase-9', 'task', 'backend', 'api']
  },
  {
    id: 'phase-9.1.4',
    title: 'Task 9.1.4: Vault UI Integration',
    priority: 1,
    description: 'Update src/app/dashboard/vault/page.tsx to call real rotation API. Add loading states and error handling. Show rotation history.',
    parent: 'phase-9.1',
    dependencies: ['phase-9.1.3'],
    assignee: 'ui-auditor',
    tags: ['phase-9', 'task', 'frontend', 'ui']
  },
  {
    id: 'phase-9.1.5',
    title: 'Task 9.1.5: Security Testing',
    priority: 0,
    description: 'Test key rotation with existing data. Verify old keys can decrypt. Verify new data uses new keys. Test audit logging. Security review.',
    parent: 'phase-9.1',
    dependencies: ['phase-9.1.4'],
    assignee: 'independent-verifier',
    tags: ['phase-9', 'task', 'testing', 'security']
  },

  // ========================================================================
  // PHASE 9.2: GRANULAR TELEMETRY
  // ========================================================================
  {
    id: 'phase-9.2',
    title: 'Phase 9.2: Granular Telemetry',
    priority: 1,
    description: 'Implement per-agent token tracking and cost attribution. Add agentCosts JSON field to Mission model.',
    dependencies: ['phase-9.1'],
    assignee: 'mission-overseer',
    tags: ['phase-9', 'epic', 'analytics', 'medium-priority']
  },
  {
    id: 'phase-9.2.1',
    title: 'Task 9.2.1: Database Schema Extension',
    priority: 1,
    description: 'Add agentCosts JSON field to Mission model. Create Prisma migration.',
    parent: 'phase-9.2',
    assignee: 'genesis-architect',
    tags: ['phase-9', 'task', 'database', 'prisma']
  },
  {
    id: 'phase-9.2.2',
    title: 'Task 9.2.2: Mission Overseer Cost Tracking',
    priority: 1,
    description: 'Update src/agents/mission-overseer.ts to track per-agent costs. Store in agentCosts field: { agentName: { tokens, cost, duration } }',
    parent: 'phase-9.2',
    dependencies: ['phase-9.2.1'],
    assignee: 'genesis-architect',
    tags: ['phase-9', 'task', 'backend', 'orchestration']
  },
  {
    id: 'phase-9.2.3',
    title: 'Task 9.2.3: Cost Breakdown Query',
    priority: 1,
    description: 'Create getAgentCostBreakdown() server action in src/actions/mission-history.ts. Return aggregated per-agent statistics.',
    parent: 'phase-9.2',
    dependencies: ['phase-9.2.2'],
    assignee: 'genesis-architect',
    tags: ['phase-9', 'task', 'backend', 'api']
  },
  {
    id: 'phase-9.2.4',
    title: 'Task 9.2.4: Analytics Dashboard Component',
    priority: 2,
    description: 'Create AgentCostAnalytics component. Add pie chart showing cost distribution. Add table with per-agent breakdown.',
    parent: 'phase-9.2',
    dependencies: ['phase-9.2.3'],
    assignee: 'ui-auditor',
    tags: ['phase-9', 'task', 'frontend', 'analytics']
  },
  {
    id: 'phase-9.2.5',
    title: 'Task 9.2.5: Performance Testing',
    priority: 2,
    description: 'Verify tracking overhead <5%. Run 100 missions and measure impact. Ensure no memory leaks.',
    parent: 'phase-9.2',
    dependencies: ['phase-9.2.4'],
    assignee: 'independent-verifier',
    tags: ['phase-9', 'task', 'testing', 'performance']
  },

  // ========================================================================
  // PHASE 9.3: ADVANCED ORCHESTRATION
  // ========================================================================
  {
    id: 'phase-9.3',
    title: 'Phase 9.3: Advanced Orchestration',
    priority: 2,
    description: 'Implement parallel agent execution, dependency graphs, and conditional workflows. Enable DAG executor with Promise.all().',
    dependencies: ['phase-9.2'],
    assignee: 'mission-overseer',
    tags: ['phase-9', 'epic', 'orchestration', 'medium-priority']
  },
  {
    id: 'phase-9.3.1',
    title: 'Task 9.3.1: PlanStep Schema Extension',
    priority: 2,
    description: 'Add dependencies[] and condition fields to PlanStep interface in src/agents/base/agent-interface.ts',
    parent: 'phase-9.3',
    assignee: 'genesis-architect',
    tags: ['phase-9', 'task', 'backend', 'types']
  },
  {
    id: 'phase-9.3.2',
    title: 'Task 9.3.2: DAG Executor Implementation',
    priority: 2,
    description: 'Create DAG executor in src/graph/nodes.ts. Implement topological sort. Add parallel execution with Promise.all().',
    parent: 'phase-9.3',
    dependencies: ['phase-9.3.1'],
    assignee: 'genesis-architect',
    tags: ['phase-9', 'task', 'backend', 'algorithms']
  },
  {
    id: 'phase-9.3.3',
    title: 'Task 9.3.3: Conditional Routing Logic',
    priority: 2,
    description: 'Add condition evaluation to executor. Support if/else workflow logic. Add condition field to PlanStep.',
    parent: 'phase-9.3',
    dependencies: ['phase-9.3.2'],
    assignee: 'genesis-architect',
    tags: ['phase-9', 'task', 'backend', 'workflow']
  },
  {
    id: 'phase-9.3.4',
    title: 'Task 9.3.4: Mission Overseer Integration',
    priority: 2,
    description: 'Update Mission Overseer execute() to use DAG executor. Handle parallel logs. Update verification to check all parallel branches.',
    parent: 'phase-9.3',
    dependencies: ['phase-9.3.3'],
    assignee: 'genesis-architect',
    tags: ['phase-9', 'task', 'backend', 'orchestration']
  },
  {
    id: 'phase-9.3.5',
    title: 'Task 9.3.5: Workflow Visualization',
    priority: 3,
    description: 'Create WorkflowVisualization component using React Flow. Show DAG with parallel paths. Color-code by status.',
    parent: 'phase-9.3',
    dependencies: ['phase-9.3.4'],
    assignee: 'ui-auditor',
    tags: ['phase-9', 'task', 'frontend', 'visualization']
  },
  {
    id: 'phase-9.3.6',
    title: 'Task 9.3.6: Parallel Execution Testing',
    priority: 1,
    description: 'Test parallel execution with SEO + Marketing + Social agents. Verify 2-3x throughput improvement. Test error handling in parallel branches.',
    parent: 'phase-9.3',
    dependencies: ['phase-9.3.5'],
    assignee: 'independent-verifier',
    tags: ['phase-9', 'task', 'testing', 'performance']
  }
];

// ============================================================================
// MIGRATION SCRIPT
// ============================================================================

async function migrate() {
  console.log('🔗 Beads-Lite Migration: Phase 9 Tasks');
  console.log('=====================================\n');

  const repoRoot = path.resolve(__dirname, '..');
  const beads = new BeadsLite(repoRoot);

  try {
    // Initialize Beads
    console.log('📦 Initializing Beads-Lite...');
    await beads.init();

    // Create tasks with ID mapping
    console.log(`\n📝 Creating ${PHASE_9_TASKS.length} tasks...\n`);
    let created = 0;
    const idMap = new Map<string, string>(); // hierarchical ID -> actual Beads ID

    for (const taskDef of PHASE_9_TASKS) {
      try {
        // Map parent ID if needed
        const parentId = taskDef.parent ? idMap.get(taskDef.parent) : undefined;

        // Map dependency IDs if needed
        const dependencies = taskDef.dependencies?.map(depId => idMap.get(depId) || depId);

        const task = await beads.create({
          title: taskDef.title,
          priority: taskDef.priority,
          description: taskDef.description,
          parent: parentId,
          dependencies,
          assignee: taskDef.assignee,
          tags: taskDef.tags
        });

        // Store mapping
        idMap.set(taskDef.id, task.id);

        console.log(`  ✅ ${task.id}: ${task.title}`);
        created++;
      } catch (error: any) {
        console.error(`  ❌ Failed to create ${taskDef.id}: ${error.message}`);
      }
    }

    console.log(`\n✅ Created ${created}/${PHASE_9_TASKS.length} tasks`);

    // Show statistics
    console.log('\n📊 Project Statistics:');
    const stats = beads.getStats();
    console.log(`  Total Tasks: ${stats.total}`);
    console.log(`  Ready Tasks: ${stats.byStatus.ready}`);
    console.log(`  Blocked Tasks: ${stats.byStatus.blocked}`);

    // Show ready tasks
    console.log('\n📋 Ready to Start:');
    const ready = beads.getReady();
    ready.slice(0, 5).forEach(task => {
      console.log(`  [P${task.priority}] ${task.id}: ${task.title}`);
    });

    if (ready.length > 5) {
      console.log(`  ... and ${ready.length - 5} more`);
    }

    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('  1. Review tasks in .beads/issues.jsonl');
    console.log('  2. Integrate with Mission Overseer using beads-integration.ts');
    console.log('  3. Start with phase-9.0.1 (Vercel AI SDK Integration)');
    console.log('');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrate().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { migrate };
