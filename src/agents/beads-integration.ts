/**
 * Beads Integration for Mission Overseer
 *
 * Extends Mission Overseer with Beads-Lite task management capabilities:
 * - Automatic task creation from mission plans
 * - Progress tracking across mission lifecycle
 * - Dependency-aware workflow
 * - Persistent mission history
 */

import { BeadsLite, BeadsTask, TaskPriority } from '@/lib/beads-lite';
import { MissionContext, PlanStep, ExecutionResult } from './base/agent-interface';

// ============================================================================
// TYPES
// ============================================================================

export interface BeadsMissionContext extends MissionContext {
  beadsTaskId?: string;           // Associated Beads task ID
  beadsAutoTrack?: boolean;       // Enable auto-tracking (default: true)
}

export interface MissionTaskMapping {
  missionId: string;              // G-Pilot mission ID
  beadsTaskId: string;            // Beads task ID
  planSteps: PlanStepMapping[];   // Step-to-task mappings
}

export interface PlanStepMapping {
  stepIndex: number;              // Index in plan.steps array
  beadsTaskId: string;            // Beads task ID for this step
}

// ============================================================================
// BEADS MISSION TRACKER
// ============================================================================

export class BeadsMissionTracker {
  private beads: BeadsLite;
  private mappings: Map<string, MissionTaskMapping>;

  constructor(beads: BeadsLite) {
    this.beads = beads;
    this.mappings = new Map();
  }

  /**
   * Create Beads task from mission context
   */
  async trackMission(context: BeadsMissionContext): Promise<string> {
    if (context.beadsAutoTrack === false) {
      return ''; // Skip tracking
    }

    // Create main mission task
    const missionTask = await this.beads.create({
      title: this.truncate(context.mission, 80),
      description: context.mission,
      priority: this.inferPriority(context),
      assignee: 'mission-overseer',
      tags: ['mission', context.userId || 'api-user']
    });

    return missionTask.id;
  }

  /**
   * Create Beads tasks from plan steps
   */
  async trackPlan(
    missionId: string,
    parentTaskId: string,
    steps: PlanStep[]
  ): Promise<MissionTaskMapping> {
    const stepMappings: PlanStepMapping[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Infer dependencies from step order
      const dependencies: string[] = [];
      if (i > 0 && !this.isParallelizable(step)) {
        // Depend on previous step
        dependencies.push(stepMappings[i - 1].beadsTaskId);
      }

      const stepTask = await this.beads.create({
        title: `${step.agent}: ${this.truncate(step.description, 60)}`,
        description: step.description,
        parent: parentTaskId,
        dependencies,
        priority: this.mapStepPriority(step),
        assignee: step.agent,
        tags: ['plan-step', missionId]
      });

      stepMappings.push({
        stepIndex: i,
        beadsTaskId: stepTask.id
      });
    }

    const mapping: MissionTaskMapping = {
      missionId,
      beadsTaskId: parentTaskId,
      planSteps: stepMappings
    };

    this.mappings.set(missionId, mapping);
    return mapping;
  }

  /**
   * Update step task status during execution
   */
  async updateStepProgress(
    missionId: string,
    stepIndex: number,
    status: 'in_progress' | 'completed' | 'blocked'
  ): Promise<void> {
    const mapping = this.mappings.get(missionId);
    if (!mapping) {
      console.warn(`No mapping found for mission: ${missionId}`);
      return;
    }

    const stepMapping = mapping.planSteps[stepIndex];
    if (!stepMapping) {
      console.warn(`No step mapping found for index: ${stepIndex}`);
      return;
    }

    if (status === 'completed') {
      await this.beads.complete(stepMapping.beadsTaskId);
    } else {
      await this.beads.update(stepMapping.beadsTaskId, { status });
    }
  }

  /**
   * Complete mission task
   */
  async completeMission(
    missionId: string,
    result: ExecutionResult
  ): Promise<void> {
    const mapping = this.mappings.get(missionId);
    if (!mapping) {
      console.warn(`No mapping found for mission: ${missionId}`);
      return;
    }

    // Update main task with result metadata
    await this.beads.update(mapping.beadsTaskId, {
      metadata: {
        success: result.success,
        duration: result.duration,
        cost: result.cost,
        artifacts: result.artifacts?.length || 0
      }
    });

    // Complete main task
    await this.beads.complete(mapping.beadsTaskId);

    // Clean up mapping
    this.mappings.delete(missionId);
  }

  /**
   * Get ready tasks for a specific agent
   */
  async getReadyTasksForAgent(agentName: string): Promise<BeadsTask[]> {
    const readyTasks = this.beads.getReady();
    return readyTasks.filter(t => t.assignee === agentName);
  }

  /**
   * Get all mission tasks
   */
  getMissionTasks(): BeadsTask[] {
    return this.beads.getByTag('mission');
  }

  /**
   * Get task hierarchy for mission
   */
  getMissionHierarchy(beadsTaskId: string): BeadsTask[] {
    return this.beads.getHierarchy(beadsTaskId);
  }

  /**
   * Get project statistics
   */
  getStats() {
    return this.beads.getStats();
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  private inferPriority(context: BeadsMissionContext): TaskPriority {
    // Check for priority hints in config
    if (context.config?.priority !== undefined) {
      return context.config.priority as TaskPriority;
    }

    // Default to medium
    return 2;
  }

  private mapStepPriority(step: PlanStep): TaskPriority {
    // Map step to priority based on agent type
    const criticalAgents = ['independent-verifier', 'genesis-architect'];
    if (criticalAgents.includes(step.agent)) {
      return 0; // Urgent
    }

    return 2; // Medium
  }

  private isParallelizable(step: PlanStep): boolean {
    // Some agents can run in parallel (SEO, Marketing, Social)
    const parallelAgents = ['seo-analyst', 'marketing-strategist', 'social-commander'];
    return parallelAgents.includes(step.agent);
  }
}

// ============================================================================
// MISSION OVERSEER INTEGRATION
// ============================================================================

/**
 * Enhanced Mission Overseer with Beads tracking
 *
 * Usage in mission-overseer.ts:
 *
 * ```typescript
 * import { createBeadsOverseerIntegration } from './beads-integration';
 *
 * const beadsIntegration = await createBeadsOverseerIntegration();
 *
 * async plan(context: MissionContext): Promise<Plan> {
 *   // Create Beads task for mission
 *   const beadsTaskId = await beadsIntegration.tracker.trackMission(context);
 *
 *   // Generate plan
 *   const plan = await this.originalPlan(context);
 *
 *   // Create Beads tasks for plan steps
 *   await beadsIntegration.tracker.trackPlan(missionId, beadsTaskId, plan.steps);
 *
 *   return plan;
 * }
 *
 * async execute(plan: Plan, context: MissionContext): Promise<ExecutionResult> {
 *   for (let i = 0; i < plan.steps.length; i++) {
 *     const step = plan.steps[i];
 *
 *     // Mark step as in progress
 *     await beadsIntegration.tracker.updateStepProgress(missionId, i, 'in_progress');
 *
 *     // Execute step
 *     const result = await this.executeStep(step, context);
 *
 *     // Mark step as completed
 *     await beadsIntegration.tracker.updateStepProgress(missionId, i, 'completed');
 *   }
 *
 *   return result;
 * }
 *
 * async verify(result: ExecutionResult, context: MissionContext): Promise<Verification> {
 *   const verification = await this.originalVerify(result, context);
 *
 *   // Complete mission task
 *   await beadsIntegration.tracker.completeMission(missionId, result);
 *
 *   return verification;
 * }
 * ```
 */

export interface BeadsOverseerIntegration {
  beads: BeadsLite;
  tracker: BeadsMissionTracker;
}

/**
 * Create Beads integration for Mission Overseer
 */
export async function createBeadsOverseerIntegration(
  repoRoot?: string
): Promise<BeadsOverseerIntegration> {
  const beads = new BeadsLite(repoRoot);
  await beads.init();

  const tracker = new BeadsMissionTracker(beads);

  return { beads, tracker };
}

// ============================================================================
// CLI COMMANDS (for manual usage)
// ============================================================================

/**
 * CLI command handlers for Beads-Lite
 */
export class BeadsCLI {
  private beads: BeadsLite;

  constructor(beads: BeadsLite) {
    this.beads = beads;
  }

  /**
   * bd init - Initialize Beads in repository
   */
  async cmdInit(): Promise<void> {
    await this.beads.init();
    console.log('✅ Beads-Lite initialized');
  }

  /**
   * bd create <title> - Create new task
   */
  async cmdCreate(title: string, options: {
    priority?: TaskPriority;
    description?: string;
    parent?: string;
    assignee?: string;
  } = {}): Promise<BeadsTask> {
    const task = await this.beads.create({
      title,
      ...options
    });
    console.log(`✅ Created: ${task.id} - ${task.title}`);
    return task;
  }

  /**
   * bd ready - Show ready tasks
   */
  async cmdReady(): Promise<BeadsTask[]> {
    const ready = this.beads.getReady();
    console.log(`\n📋 Ready Tasks (${ready.length}):\n`);
    for (const task of ready) {
      console.log(`  [P${task.priority}] ${task.id}: ${task.title}`);
      if (task.assignee) {
        console.log(`      Assigned to: ${task.assignee}`);
      }
    }
    return ready;
  }

  /**
   * bd status - Show project status
   */
  async cmdStatus(): Promise<void> {
    const stats = this.beads.getStats();
    console.log('\n📊 Project Status:\n');
    console.log(`  Total Tasks: ${stats.total}`);
    console.log('\n  By Status:');
    console.log(`    Pending:     ${stats.byStatus.pending}`);
    console.log(`    Ready:       ${stats.byStatus.ready}`);
    console.log(`    In Progress: ${stats.byStatus.in_progress}`);
    console.log(`    Blocked:     ${stats.byStatus.blocked}`);
    console.log(`    Completed:   ${stats.byStatus.completed}`);
    console.log(`    Cancelled:   ${stats.byStatus.cancelled}`);
    console.log('\n  By Priority:');
    console.log(`    Urgent:  ${stats.byPriority.urgent}`);
    console.log(`    High:    ${stats.byPriority.high}`);
    console.log(`    Medium:  ${stats.byPriority.medium}`);
    console.log(`    Low:     ${stats.byPriority.low}`);
    console.log('');
  }

  /**
   * bd complete <id> - Complete a task
   */
  async cmdComplete(id: string): Promise<void> {
    await this.beads.complete(id);
    console.log(`✅ Completed: ${id}`);
  }

  /**
   * bd sync - Sync to Git
   */
  async cmdSync(): Promise<void> {
    this.beads.syncToGit();
  }

  /**
   * bd export - Export tasks as JSON
   */
  async cmdExport(): Promise<string> {
    const json = this.beads.exportJSON();
    console.log(json);
    return json;
  }
}

/**
 * Create BeadsCLI instance
 */
export async function createBeadsCLI(repoRoot?: string): Promise<BeadsCLI> {
  const beads = new BeadsLite(repoRoot);
  await beads.init();
  return new BeadsCLI(beads);
}
